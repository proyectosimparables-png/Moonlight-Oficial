"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const SearchInput = ({ placeholder = "Buscar productos..." }) => {
  const [query, setQuery] = useState("");
  const router = useRouter();


  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim().length >= 3) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }, 600); // espera 0.6s tras escribir

    return () => clearTimeout(delay);
  }, [query, router]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aaa]" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 w-full bg-white border border-[#ccc] rounded-md text-sm"
        />
      </div>
    </div>
  );
};
