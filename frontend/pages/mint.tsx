import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import Avatar from "avataaars";
import type { NextPage } from "next";
import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { NimbusAbi } from "~~/abi/nibus.abi";
import { Pallette } from "~~/components/editAvatar/Pallette";
import { appChains } from "~~/services/web3/wagmiConnectors";
import { IAvatar } from "~~/types/custom";
import { notification } from "~~/utils/scaffold-eth";

const Mint: NextPage = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [destinationChain, setDestinationChain] = useState(5001);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    //@ts-ignore
    function handleClickOutside(event) {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const [avatar, setAvatar] = useState<IAvatar>({
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
  });
  const [name, setName] = useState("");
  const { config: requestMintConfig } = usePrepareContractWrite({
    address: "0x2e3bD83CAe006A14BcDd2b79e2b8Ac50962C78dE",
    abi: NimbusAbi,
    functionName: "createMintRequest",
    args: [
      name,
      avatar.avatarStyle,
      avatar.topType,
      avatar.hairColor,
      avatar.eyebrowType,
      avatar.eyeType,
      avatar.accessoriesType,
      avatar.mouthType,
      avatar.facialHairType,
      avatar.clotheType,
      avatar.clotheColor,
      avatar.graphicType,
      destinationChain,
      1,
      address,
    ],
    chainId: chain?.id ?? 5001,
  });
  const { config: mintConfig, error } = usePrepareContractWrite({
    address: "0x2e3bD83CAe006A14BcDd2b79e2b8Ac50962C78dE",
    abi: NimbusAbi,
    functionName: "mintItem",
    args: [
      name,
      avatar.avatarStyle,
      avatar.topType,
      avatar.hairColor,
      avatar.eyebrowType,
      avatar.eyeType,
      avatar.accessoriesType,
      avatar.mouthType,
      avatar.facialHairType,
      avatar.clotheType,
      address,
    ],
    chainId: chain?.id ?? 5001,
  });

  const { write: w1, status } = useContractWrite(chain?.id !== destinationChain ? requestMintConfig : mintConfig);

  if (status === "success") {
    router.push("/");
  }

  const chainObj = appChains.chains.find(c => c.id === destinationChain);

  return (
    <>
      <Head>
        <title>NIMBUS: Mint</title>
        <meta name="description" content="Create your very own NFT Avatars" />
        <link rel="shortcut icon" href="/pixters.png" />
      </Head>

      <div className="flex flex-col items-center w-full">
        <div className="mt-6">
          <Avatar {...avatar} />
        </div>
        <div className="mt-6 flex gap-2">
          <div>
            <input
              type="text"
              placeholder="Enter Name"
              className="input input-bordered w-full max-w-xs"
              value={name}
              onChange={e => {
                setName(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <div
            onClick={() => {
              setOpen(!open);
            }}
            className="flex gap-4 justify-center items-center relative"
          >
            <div>Receiving on</div>
            {chainObj ? (
              <div className="flex relative w-8 h-8">
                <Image alt="SE2 logo" className="cursor-pointer rounded-full" fill src={chainObj?.image} />
              </div>
            ) : (
              ""
            )}
            {!open ? (
              ""
            ) : (
              <div ref={dropdownRef} className="absolute top-12 left-0 w-40">
                {appChains.chains.map(c => (
                  <div
                    onClick={() => {
                      setDestinationChain(c.id);
                      setOpen(false);
                    }}
                    key={c.id}
                    className="flex cursor-pointer justify-start items-center gap-2 hover:bg-gray-600 bg-gray-700 p-2"
                  >
                    <div className="flex relative w-6 h-6">
                      <Image alt="SE2 logo" className="cursor-pointer rounded-full" fill src={c?.image} />
                    </div>
                    <div>{c.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          className="btn btn-secondary mt-4"
          onClick={() => {
            if (name === "") {
              notification.error("Avatar name not entered!");
            } else {
              w1?.();
            }
          }}
        >
          ✨ Mint ✨
        </button>
        <div className="mt-6 px-3 w-full">
          <Pallette avatar={avatar} setAvatar={setAvatar as Dispatch<SetStateAction<IAvatar | undefined>>} />
        </div>
      </div>
    </>
  );
};

export default Mint;
