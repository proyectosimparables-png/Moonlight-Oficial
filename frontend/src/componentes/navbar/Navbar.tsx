"use client";
import TopBanner from "./TopBanner";
import { NavbarDesktop } from "./NavbarDesktop";
import { NavbarMobile } from "./NavbarMobile";

const Navbar = () => {
  return (
    <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <TopBanner />
      <div className="relative">
        <NavbarDesktop />
        <NavbarMobile />
      </div>
    </header>
  );
};

export default Navbar;
