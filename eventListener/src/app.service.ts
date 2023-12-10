// contract-listener.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import {MinterAbi} from './abis/Minter';

@Injectable()
export class ContractListenerService implements OnModuleInit {
  
  private readonly mantleProvider: ethers.providers.JsonRpcProvider;
  private readonly scrollListener: ethers.providers.JsonRpcProvider;

  private readonly contractAddress: string = '0x2e3bD83CAe006A14BcDd2b79e2b8Ac50962C78dE';
  // private readonly abi: any = []; // Replace with your contract ABI
  private mantleLatestBlock: number;
  private mantleStartBlock: number;

  private eventsBatchSize: number;
  private mantleContract: ethers.Contract;
  private chainIdToRPC;

  constructor() {
    console.log("service started....");
    this.mantleProvider = new ethers.providers.JsonRpcProvider(process.env.MANTLE_RPC);
    this.eventsBatchSize = Number(process.env["EVENTS_BATCH_SIZE"]);

    this.mantleContract = new ethers.Contract(this.contractAddress, MinterAbi, this.mantleProvider);

    this.chainIdToRPC = {
      '534351': 'https://sepolia-rpc.scroll.io',
      '5001': 'https://rpc.testnet.mantle.xyz',
      '23011913': `https://stylus-testnet.arbitrum.io/rpc`,
      '44787' : `https://alfajores-forno.celo-testnet.org`
    }
    setInterval(this.fetchOrderEvents, 2000);
  }

  async onModuleInit() {
      this.mantleStartBlock = await this.mantleProvider.getBlockNumber();
      // this.mantleStartBlock = 27082975;
  }

  fetchOrderEvents = async () => {
    try {
      this.mantleProvider.getBlockNumber().then((result)=>{
        this.mantleLatestBlock = result;
        for(let fromBlock = this.mantleStartBlock; fromBlock <= this.mantleLatestBlock; fromBlock+=this.eventsBatchSize){
          const toBlock = Math.min(fromBlock + this.eventsBatchSize - 1, this.mantleLatestBlock);

          this.mantleContract.queryFilter(this.mantleContract.filters.CreateMintRequest(), fromBlock, toBlock).then((eventData)=>{
            this.handleEvent(eventData);
            if(eventData.length > 0){
              console.log("Fetched Events " + eventData.length + " from " + fromBlock + " to " + toBlock + " blocks ");
            }
          })
        }
        this.mantleStartBlock = this.mantleLatestBlock+1;
      })
    } catch (error) {
      console.log("Error while fetching update order events from order book.", error);
    }
  }

  async handleEvent(eventData: any) {
    // console.log('Event data from Mantle:', eventData);
    for(let i =0; i < eventData.length; i++){
      const event = eventData[i];
      console.log("-----------------------------");
      // console.log(event.args);
      const destinationChain = event.args.destinationChain.toString(); 
      const destinationRpc = this.chainIdToRPC[destinationChain];
      console.log("destinationRpc is", destinationRpc);
      const destProvider = new ethers.providers.JsonRpcProvider(destinationRpc);
      const signer = new ethers.Wallet(process.env["MANAGER_WALLET_PRIVATE_KEY"], destProvider);
      const destinationContract =  new ethers.Contract(this.contractAddress, MinterAbi, signer);

      const tx = await destinationContract.mintItem(
        event.args.name,
        event.args.avatarStyle,
        event.args.topType,
        event.args.hairColor,
        event.args.eyebrowType,
        event.args.eyeType,
        event.args.accessoriesType,
        event.args.mouthType,
        event.args.facialHairType,
        event.args.clotheType,
        event.args.mintFor,
      );
      console.log("transaction done: hash is ", tx.hash);
    }
  }
}
