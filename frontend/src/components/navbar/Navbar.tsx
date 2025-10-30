"use client";
import TopBanner from "./TopBanner";
import { NavbarDesktop } from "./NavbarDesktop";
import { NavbarMobile } from "./NavbarMobile";

const Navbar = () => {
  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm">
      <TopBanner />
      <NavbarDesktop />
      <NavbarMobile />
    </header>
  );
};

export default Navbar;
