'use client'
import { useState } from "react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useRouter } from "next/navigation";
import ShadowBtn from "../ShadowBtn";
import SettingIcon from "@/app/assets/settingIcon";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import EditIcon from "@/app/assets/editIcon";
import { MenuItems } from "@/app/lib/stack";
import { signOut } from "next-auth/react";

type MenuItem = {
  id: string;
  label: string;
  subItems: {
    id: string;
    label: string;
    disable: boolean;
  }[];
};

const MobileDropDownMenu = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MenuItems);
  const handleSetting = () => {
    router.push("/userSetting");
  }

  const handleLogout = () => {
    signOut();
  }

  const handleItemClick = (itemId: string) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        checked: item.id === itemId,
      }))
    );
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger className="bg-transparent border-none focus:outline-none hover:bg-transparent hover:outline-none p-0">
        <ShadowBtn
          className="rounded-md"
          mainClassName="rounded-md border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white p-2 flex items-center justify-center gap-2"
        >
          {
            isOpen ?
              <IoClose size={18} /> :
              <>
                <SettingIcon />
              </>
          }
        </ShadowBtn>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-inputBg sm:mt-[14px] sm:w-[200px] w-screen max-sm:h-screen border-secondaryBorder -mt-[67px]"
        align="end"
      >
        {/* <div className="block sm:hidden">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className={`flex items-center justify-between h-10 py-0 text-base transition-all duration-300 hover:bg-buttonBg text-mainFont ${item.disable ? "opacity-50" : ""}`}
              onClick={() => {
                handleItemClick(item.id);
                router.push(`/${item.id}`);
              }}
              disabled={item.disable}
            >
              {item.label}
              <FaCheck
                className={`${item.checked ? "visible" : "invisible"} w-4 h-4`}
              />
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="block sm:hidden bg-[#FFFFFF]/10" /> */}
        <div className="flex w-full justify-between px-3 py-4 items-center sm:hidden">
          <span className="text-mainFont text-base">Settings</span>
          <ShadowBtn
            className="rounded-md"
            mainClassName="rounded-md border-[#2C2B30] border bg-[#292929] shadow-btn-google text-white p-2 flex items-center justify-center gap-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <IoClose size={18} />
          </ShadowBtn>
        </div>
        <DropdownMenuSub>
          <DropdownMenuItem
            className="h-10 py-0 text-base transition-all duration-300 hover:bg-buttonBg text-mainFont max-sm:hidden"
            onClick={() => router.push("/changeLog")}
          >
            Change Log
          </DropdownMenuItem>
          {/* <DropdownMenuItem className="h-10 py-0 text-base transition-all duration-300 hover:bg-buttonBg text-mainFont hover:">
            Quests
          </DropdownMenuItem> */}
          {/* <DropdownMenuItem className="h-10 py-0 text-base transition-all duration-300 hover:bg-buttonBg text-mainFont hover:">
            AI Agents
          </DropdownMenuItem> */}
          <DropdownMenuItem
            className="h-10 py-0 text-base transition-all duration-300 hover:bg-buttonBg text-mainFont max-sm:hidden"
            onClick={() => window.open("https://docs.edithx.ai", "_blank")}
          >
            Docs
          </DropdownMenuItem>
        </DropdownMenuSub>
        <DropdownMenuSeparator className="bg-[#FFFFFF]/10 max-sm:mx-3" />
        <div className="w-full py-[50px] flex flex-col items-center justify-center sm:hidden">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-fit">
              {
                user?.avatar ? (
                  <Image src={user?.avatar} alt="avatar" className="h-[80px] w-[80px] rounded-full" width={80} height={80} />
                ) : (
                  <Image src="/image/default-avatar.png" alt="avatar" className="!h-[80px] !w-auto max-w-[80px]" width={80} height={80} />
                )
              }
              <div className="absolute -right-1 -bottom-1">
                <ShadowBtn
                  className="bg-btn-new-chat rounded-full"
                  mainClassName="bg-gradient-to-b from-[#DFDFDF] to-[#BFBFBF] rounded-full p-[6px]"
                  onClick={handleSetting}
                >
                  <EditIcon />
                </ShadowBtn>
              </div>
            </div>
            <div className="text-mainFont text-base">
              {user?.name}
            </div>
          </div>
        </div>
        <DropdownMenuItem
          className="max-sm:hidden flex items-center justify-between h-10 py-0 text-base transition-all duration-300 hover:bg-buttonBg text-mainFont hover:"
          onClick={handleSetting}
        >
          Setting
          <FiSettings className="!w-5 !h-5" />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-10 py-0 text-base transition-all duration-300 hover:bg-buttonBg text-mainFont sm:hidden border-b rounded-none border-[#29292B]"
          onClick={() => router.push("/changeLog")}
        >
          Change Log
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-10 py-0 text-base transition-all duration-300 hover:bg-buttonBg text-mainFont sm:hidden border-b rounded-none border-[#29292B]"
          onClick={() => window.open("https://docs.edithx.ai", "_blank")}
        >
          Docs
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center justify-start text-red-500 h-10 py-0 text-base transition-all duration-300 hover:bg-buttonBg hover:"
          onClick={handleLogout}
        >
          <FiLogOut className="!w-5 !h-5" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MobileDropDownMenu;
