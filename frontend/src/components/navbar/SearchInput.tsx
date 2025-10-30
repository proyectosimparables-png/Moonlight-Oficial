"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const SearchInput = ({ placeholder = "Buscar productos..." }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#aaa]" />
    <Input
      type="search"
      placeholder={placeholder}
      className="pl-10 w-full bg-white border border-[#ccc] rounded-md text-sm"
      aria-label={placeholder}
    />
  </div>
);
