"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SettingsIcon from "tsconfig.json/assets/icons/SettingsIcon`";
import Pabs from "tsconfig.json/assets/icons/Pabs`";

const DashboardItems = ({ pathname, sidebarItems }: any) => {
  return (
    <>
      {sidebarItems?.length > 0 &&
        sidebarItems.map((item: any) => {
          if (item && item.href) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-[15px] flex items-center pl-[27px] border-l-[4px] hover:bg-[#F6F6F6] hover:border-[#0592C6] ${
                  pathname === `${item.href}`
                    ? "border-[#0592C6] bg-[#F6F6F6]"
                    : "border-pureWhite"
                }`}
              >
                <span className="py-[10px]">{item.icon}</span>
                <span className="pl-[10px] py-[17.5px]">{item.name}</span>
              </Link>
            );
          } else {
            return null;
          }
        })}
    </>
  );
};

const Sidebar = () => {
  const pathname = usePathname();
  const [sidebarItems, setSidebarItems] = useState<any>([
    { name: "Setting", href: "/setting", icon: <SettingsIcon /> },
  ]);

  return (
    <>
      <div className="w-[15vw] flex flex-col justify-between border-r border-[#E6E6E6] lg:h-screen text-darkCharcoal overflow-y-none overflow-x-hidden">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-start font-bold text-xl border-b border-[#E6E6E6] h-[51px] pl-5">
            <Pabs height="36" />
          </div>
          <div>
            <DashboardItems pathname={pathname} sidebarItems={sidebarItems} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
