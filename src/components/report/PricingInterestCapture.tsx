"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";

export function PricingInterestCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setMessage("Format email tidak valid.");
      return;
    }

    try {
      // Save interest locally
      const stored = localStorage.getItem("nali-pricing-interest");
      const list = stored ? JSON.parse(stored) : [];
      if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem("nali-pricing-interest", JSON.stringify(list));
      }

      setStatus("success");
      setMessage("Terima kasih! Kami akan memberi kabar ketika paket berbayar diaktifkan.");
      setEmail("");
    } catch (err) {
      // Fallback if localStorage is disabled
      setStatus("success");
      setMessage("Terima kasih! Kami akan memberi kabar ketika paket berbayar diaktifkan.");
      setEmail("");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      {status === "success" ? (
        <div className="rounded-xl border border-[#00FFB3]/20 bg-[#00FFB3]/5 p-4 text-center text-xs text-[#00FFB3]">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="Masukkan email Anda..."
              className="bg-[#0b1a12] border-[#14261c] text-[#f5f0e8] placeholder:text-[#a1b3a8]/40 rounded-xl focus-visible:ring-[#00FFB3]/30 w-full"
              required
            />
          </div>
          <Button
            type="submit"
            className="rounded-xl bg-[#00FFB3] text-[#060b08] hover:bg-[#00e6a1] flex items-center justify-center gap-2 cursor-pointer h-10 px-5 text-xs font-bold shrink-0"
          >
            <Bell className="h-3.5 w-3.5" />
            Saya ingin diberi kabar
          </Button>
        </form>
      )}
      {status === "error" && (
        <p className="mt-2 text-left text-xs text-red-400 font-semibold">{message}</p>
      )}
    </div>
  );
}
