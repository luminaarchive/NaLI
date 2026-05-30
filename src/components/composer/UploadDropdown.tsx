"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Paperclip, Camera, Cloud } from "lucide-react";

interface UploadDropdownProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadDropdown({ onFileSelected, disabled }: UploadDropdownProps) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleLocalFile() {
    setOpen(false);
    fileInputRef.current?.click();
  }

  const menuItems = [
    {
      icon: <Paperclip size={15} />,
      label: "Unggah file lokal",
      sublabel: "PDF, gambar, teks -- maks 10MB",
      action: handleLocalFile,
      disabled: false,
    },
    {
      icon: <Camera size={15} />,
      label: "Foto / tangkap layar",
      sublabel: "Segera hadir",
      action: null,
      disabled: true,
    },
    {
      icon: <Cloud size={15} />,
      label: "Google Drive",
      sublabel: "Segera hadir",
      action: null,
      disabled: true,
    },
  ];

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.csv,.md,image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 10 * 1024 * 1024) {
            alert("Ukuran file maksimal 10MB");
            return;
          }
          onFileSelected(file);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        title="Lampirkan file"
        style={{
          background: open ? "rgba(0,255,179,0.12)" : "none",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          padding: "6px",
          borderRadius: "6px",
          color: disabled
            ? "rgba(255,255,255,0.25)"
            : open
              ? "#00FFB3"
              : "rgba(255,255,255,0.55)",
          display: "flex",
          alignItems: "center",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!disabled && !open)
            (e.currentTarget as HTMLElement).style.color = "#00FFB3";
        }}
        onMouseLeave={(e) => {
          if (!open)
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
        }}
      >
        <Plus size={18} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            width: "240px",
            background: "#0d1f1b",
            border: "1px solid rgba(0,255,179,0.15)",
            borderRadius: "12px",
            padding: "6px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            zIndex: 100,
          }}
        >
          {menuItems.map((item, i) => (
            <button
              key={i}
              type="button"
              disabled={item.disabled}
              onClick={item.action ?? undefined}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                width: "100%",
                background: "none",
                border: "none",
                borderRadius: "8px",
                padding: "9px 12px",
                cursor: item.disabled ? "default" : "pointer",
                color: item.disabled
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(255,255,255,0.85)",
                textAlign: "left",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!item.disabled)
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "none";
              }}
            >
              <span
                style={{
                  marginTop: "1px",
                  color: item.disabled ? "rgba(255,255,255,0.25)" : "#00FFB3",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>
              <span>
                <div style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "11px", opacity: 0.5, marginTop: "1px" }}>
                  {item.sublabel}
                </div>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
