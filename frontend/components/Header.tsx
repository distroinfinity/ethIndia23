import React, { ReactElement, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { appChains } from "~~/services/web3/wagmiConnectors";

/**
 * Site header
 */
export const Header = () => {
  const { chain } = useNetwork();
  const [open, setOpen] = useState(false);
  const chainObj = appChains.chains.find(c => c.id === chain?.id);
  const { switchNetwork } = useSwitchNetwork();
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

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md">
      <div className="navbar-start w-auto">
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6">
          <div className="flex relative w-10 h-10">
            {/* <Image alt="SE2 logo" className="cursor-pointer" fill src="/pixters.png" /> */}
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">NIMBUSS</span>
          </div>
        </Link>
      </div>
      <div className="navbar-end flex-grow lg:mr-4">
        {chainObj ? (
          <div className="flex relative w-10 h-10">
            <Image
              onClick={() => {
                setOpen(!open);
              }}
              alt="SE2 logo"
              className="cursor-pointer rounded-full"
              fill
              src={chainObj?.image}
            />
            {!open ? (
              ""
            ) : (
              <div ref={dropdownRef} className="absolute top-12 left-0 w-40">
                {appChains.chains.map(c => (
                  <div
                    onClick={() => {
                      switchNetwork?.(c.id);
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
        ) : (
          ""
        )}
        <RainbowKitCustomConnectButton />
        {/* <FaucetButton /> */}
      </div>
    </div>
  );
};
