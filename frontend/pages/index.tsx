import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Avatar from "avataaars";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useAccount, useNetwork } from "wagmi";
import { ArrowTopRightOnSquareIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { NimbusAbi } from "~~/abi/nibus.abi";
import { useNetworkSupported } from "~~/hooks/scaffold-eth/useNetworkSupported";
import scaffoldConfig from "~~/scaffold.config";
import { appChains } from "~~/services/web3/wagmiConnectors";
import { IAvatar, IOldAvatarDetails, TAvatarProperties } from "~~/types/custom";
import { notification } from "~~/utils/scaffold-eth";
import { contracts } from "~~/utils/scaffold-eth/contract";

interface AvatarMap {
  chain: string;
  id: number;
  avatars: IOldAvatarDetails[];
}

const Home: NextPage = () => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const [avatarMap, setAvatarMap] = useState<AvatarMap[]>();
  const [loading, setLoading] = useState(false);

  // const provider = new ethers.providers.JsonRpcProvider("https://rpc.testnet.mantle.xyz");
  // const providerContract = new ethers.Contract("0x2e3bD83CAe006A14BcDd2b79e2b8Ac50962C78dE", NimbusAbi, provider);

  const isWalletReady = useNetworkSupported();

  const openseaBaseURL =
    "https://opensea.io/assets/matic/" +
    contracts?.[scaffoldConfig.targetNetwork.id][0]["contracts"]["Pixters"]["address"] +
    "/";

  const getAvatars = async () => {
    try {
      setLoading(true);
      const map: AvatarMap[] = [];
      for (const chainConfig of appChains.chains) {
        const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrls.default.http[0]);
        const providerContract = new ethers.Contract("0x2e3bD83CAe006A14BcDd2b79e2b8Ac50962C78dE", NimbusAbi, provider);
        const ids = await providerContract.myAvatars(address);
        const newAvatars = [];

        for (const id in ids) {
          const newAvatar: IOldAvatarDetails = { id: undefined, name: undefined, avatar: undefined };
          newAvatar["id"] = parseInt(ids[id]).toString();
          const rawData = await providerContract.tokenURI(newAvatar["id"]);
          const data = JSON.parse(atob(rawData.substring(29)));
          newAvatar["name"] = data["name"];
          const obj: IAvatar = {
            avatarStyle: "Transparent",
            skinColor: "Light",
            topType: "NoHair",
            hatColor: "Black",
            hairColor: "BrownDark",
            eyebrowType: "Default",
            eyeType: "Default",
            accessoriesType: "Blank",
            mouthType: "Default",
            facialHairType: "Blank",
            facialHairColor: "BrownDark",
            clotheType: "ShirtCrewNeck",
            clotheColor: "Black",
            graphicType: "Bat",
          };
          data["attributes"].map((attribute: { trait_type: string; value: string }) => {
            obj[attribute["trait_type"] as TAvatarProperties] = attribute["value"];
          });
          newAvatar["avatar"] = obj;
          newAvatars.push(newAvatar);
        }
        map.push({ chain: chainConfig.name, avatars: newAvatars, id: chainConfig.id });
      }
      setAvatarMap(map);
      // setAvatars(newAvatars);
      setLoading(false);
    } catch (error) {
      console.error(error);
      notification.error("Something went wrong in fetching your avatars!");
    }
  };

  useEffect(() => {
    if (isWalletReady) {
      getAvatars();
    }
  }, [isWalletReady]);

  const handleTweet = (id: string | undefined) => {
    const link1 = `${openseaBaseURL + id}`;
    const link2 = "https://pixters.vercel.app/";
    const text = `Checkout my new avatar ✨: ${link1}\n\nMint yours at ${link2}`;

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

    window.open(tweetUrl, "_blank");
  };

  return (
    <>
      <Head>
        <title>Pixters: Home</title>
        <meta name="description" content="Create your very own NFT Avatars" />
        <link rel="shortcut icon" href="/pixters.png" />
      </Head>

      {!isWalletReady ? (
        <button className="mt-8 mx-auto btn btn-secondary" disabled>
          Mint New Avatar ✨
        </button>
      ) : (
        <Link href="/mint" className="mt-8 mx-auto">
          <button className="btn btn-secondary">Mint New Avatar ✨</button>
        </Link>
      )}
      <br />
      <br />
      {!isWalletReady ? (
        ""
      ) : (
        <>
          <div className="flex flex-row flex-wrap justify-center mb-10">
            {!loading ? (
              <div className="flex flex-col flex-wrap justify-center mb-10">
                {avatarMap?.map(map => (
                  <div className="flex flex-col flex-wrap justify-center mb-10">
                    <div className="text-lg">{map.chain}</div>
                    <div className="flex flex-row flex-wrap justify-center mb-10">
                      {map.avatars?.map((avatar, index) => {
                        return (
                          <div className="mx-auto my-0 mt-10 lg:mx-4" key={index}>
                            <div className="card card-compact w-80 bg-base-100 shadow-xl p-3 items-center lg:m-0">
                              <Avatar {...(avatar["avatar"] as IAvatar)} />
                              <h2 className="text-2xl font-bold mt-4">{avatar["name"]}</h2>
                              <div className="my-2 w-full flex justify-evenly">
                                <a target="_blank" href={`${openseaBaseURL + avatar["id"]}`}>
                                  <button className="btn btn-outline btn-info flex flex-nowrap">
                                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                    <p className="m-0 ml-2">Opensea</p>
                                  </button>
                                </a>
                                <Link href={{ pathname: `/edit/${avatar["id"]}`, query: { chain: map.id } }}>
                                  <button className="btn btn-outline btn-success flex flex-nowrap">
                                    <PencilSquareIcon className="h-3 w-3" />
                                    <p className="m-0 ml-2">Edit</p>
                                  </button>
                                </Link>
                                <button
                                  onClick={() => {
                                    handleTweet(avatar["id"]);
                                  }}
                                  className="btn btn-outline"
                                >
                                  <Image width={25} height={25} src={"/twitter.png"} alt="twitter logo"></Image>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className=" mx-auto my-0 mt-10 lg:mx-4">
                  <div className="card card-compact w-80 bg-base-100 shadow-xl p-3 items-center ml-3 lg:m-0">
                    <div className="animate-pulse bg-[#7f7f7f30] rounded-2xl h-[256px] w-[224px] mt-[22px]"></div>
                    <div className="mt-4 animate-pulse bg-[#7f7f7f30] rounded-2xl h-[40px] w-[124px]"></div>
                    <div className="my-2 w-full flex justify-evenly">
                      <div className="mt-2 animate-pulse bg-[#7f7f7f30] rounded-full h-[46px] w-[104px]"></div>
                      <div className="mt-2 animate-pulse bg-[#7f7f7f30] rounded-full h-[46px] w-[84px]"></div>
                      <div className="mt-2 animate-pulse bg-[#7f7f7f30] rounded-full h-[46px] w-[60px]"></div>
                    </div>
                  </div>
                </div>
                <div className=" mx-auto my-0 mt-10 lg:mx-4">
                  <div className="card card-compact w-80 bg-base-100 shadow-xl p-3 items-center ml-3 lg:m-0">
                    <div className="animate-pulse bg-[#7f7f7f30] rounded-2xl h-[256px] w-[224px] mt-[22px]"></div>
                    <div className="mt-4 animate-pulse bg-[#7f7f7f30] rounded-2xl h-[40px] w-[124px]"></div>
                    <div className="my-2 w-full flex justify-evenly">
                      <div className="mt-2 animate-pulse bg-[#7f7f7f30] rounded-full h-[46px] w-[104px]"></div>
                      <div className="mt-2 animate-pulse bg-[#7f7f7f30] rounded-full h-[46px] w-[84px]"></div>
                      <div className="mt-2 animate-pulse bg-[#7f7f7f30] rounded-full h-[46px] w-[60px]"></div>
                    </div>
                  </div>
                </div>
                <div className=" mx-auto my-0 mt-10 lg:mx-4">
                  <div className="card card-compact w-80 bg-base-100 shadow-xl p-3 items-center ml-3 lg:m-0">
                    <div className="animate-pulse bg-[#7f7f7f30] rounded-2xl h-[256px] w-[224px] mt-[22px]"></div>
                    <div className="mt-4 animate-pulse bg-[#7f7f7f30] rounded-2xl h-[40px] w-[124px]"></div>
                    <div className="my-2 w-full flex justify-evenly">
                      <div className="mt-2 animate-pulse bg-[#7f7f7f30] rounded-full h-[46px] w-[104px]"></div>
                      <div className="mt-2 animate-pulse bg-[#7f7f7f30] rounded-full h-[46px] w-[84px]"></div>
                      <div className="mt-2 animate-pulse bg-[#7f7f7f30] rounded-full h-[46px] w-[60px]"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Home;
