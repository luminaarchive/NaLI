"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Leaf,
  BookOpen,
  Search,
  Archive,
  Compass,
  TreePine,
  ScrollText,
  Microscope,
} from "lucide-react";
import { NaliMark } from "@/components/brand/NaliMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearch, SearchTrigger } from "@/components/search/GlobalSearch";
import { SandTransitionImage } from "@/components/landing/SandTransitionImage";

export type Chapter = {
  name: string;
  image: string;
  href: string;
  meta: string;
};

type Props = {
  chapters: Chapter[];
  navLinks: { href: string; label: string }[];
  featured: { title: string; subtitle: string; href: string; label: string; sources: string };
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const letterBlock = {
  initial: { y: 120, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.2, ease: EASE },
  },
};

const PILLS = [
  { icon: Leaf, label: "Alam", href: "/alam" },
  { icon: ScrollText, label: "Sejarah", href: "/sejarah" },
  { icon: Search, label: "Investigasi", href: "/investigasi" },
  { icon: Archive, label: "Arsip Sumber", href: "/arsip-sumber" },
  { icon: BookOpen, label: "Metodologi", href: "/metodologi" },
];

export function NeoMuseum({ chapters, navLinks, featured }: Props) {
  const [showVideo, setShowVideo] = useState(false);
  const [activeChapter, setActiveChapter] = useState(
    chapters.length > 2 ? 2 : 0
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowVideo(true), 2800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (chapters.length < 2) return;
    const id = setInterval(() => {
      setActiveChapter((prev) => (prev + 1) % chapters.length);
    }, 3500);
    return () => clearInterval(id);
  }, [chapters.length]);

  const active = chapters[activeChapter] ?? chapters[0];

  return (
    <div className="font-inter w-full overflow-x-hidden bg-paper text-ink-black">
      {/* ============================ SECTION 1: HERO ============================ */}
      <section className="relative flex min-h-screen w-full flex-col overflow-hidden">
        {/* 1D background video, fades in after delay */}
        <AnimatePresence>
          {showVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 z-0"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover opacity-[0.18] dark:opacity-30"
              >
                <source src="/videos/hero.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/10 to-paper" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1A + 1B header */}
        <motion.header
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          }}
          className="relative z-20 px-6 pt-6 md:px-16"
        >
          <div className="flex items-start justify-between gap-4">
            {/* brand: emblem + animated NaLI wordmark */}
            <motion.div
              variants={{
                initial: { scale: 1.03 },
                animate: {
                  scale: 1,
                  transition: { staggerChildren: 0.06, delayChildren: 0.1 },
                },
              }}
              className="flex items-end gap-3 md:gap-5"
            >
              <motion.span variants={letterBlock} className="block">
                <NaliMark className="h-14 w-auto text-ink-black md:h-20" />
              </motion.span>
              <span className="flex select-none overflow-hidden font-display text-[16vw] font-semibold leading-[0.8] tracking-tighter text-ink-black md:text-[8rem]">
                {"NaLI".split("").map((c, i) => (
                  <span key={i} className="inline-block overflow-hidden">
                    <motion.span variants={letterBlock} className="inline-block">
                      {c}
                    </motion.span>
                  </span>
                ))}
              </span>
            </motion.div>

            {/* hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="group relative z-[60] mt-3 flex flex-col items-end gap-[6px] md:hidden"
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <span
                className={`h-[1.5px] bg-ink-black transition-all duration-300 ${
                  isMobileMenuOpen ? "w-8 translate-y-[7.5px] rotate-45" : "w-8 group-hover:w-6"
                }`}
              />
              <span
                className={`h-[1.5px] bg-ink-black transition-all duration-300 ${
                  isMobileMenuOpen ? "w-8 -translate-y-[1.5px] -rotate-45" : "w-8 group-hover:w-10"
                }`}
              />
            </button>
          </div>

          {/* sub-nav bar */}
          <motion.div
            variants={{ ...fadeUp, animate: { ...fadeUp.animate, transition: { duration: 0.8, ease: "easeOut" } } }}
            className="mt-8 flex items-start justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-gray md:text-[11px]"
          >
            <div className="hidden w-[15%] leading-relaxed text-ink/70 md:block">
              <p>Nature</p>
              <p>Life</p>
              <p>Intelligence</p>
            </div>

            <ArrowRight size={14} strokeWidth={1} className="mt-1 hidden w-[5%] text-gray-light md:block" />

            <p className="flex-1 leading-relaxed text-ink/80 md:w-[30%] md:flex-none">
              Jurnal riset terbuka tentang alam, sejarah, dan investigasi
              Indonesia. Tiap klaim membawa sumber, label keyakinan, dan batasan.
            </p>

            <ArrowRight size={14} strokeWidth={1} className="mt-1 hidden w-[5%] text-gray-light md:block" />

            <div className="hidden w-[15%] flex-col items-start gap-2 md:flex">
              {navLinks.slice(0, 5).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-ink/80 transition-colors hover:text-ink-black hover:underline"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-1 flex items-center gap-2">
                <SearchTrigger />
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        </motion.header>

        {/* 1C mobile menu overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-x-0 top-[5.5rem] z-50 border-b border-rule bg-paper px-6 py-8 shadow-xl md:hidden"
            >
              <ul className="space-y-6 font-mono text-sm uppercase tracking-[0.2em] text-ink-black">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={() => setIsMobileMenuOpen(false)} className="block">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-3">
                <SearchTrigger />
                <ThemeToggle />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1E left sidebar */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } } }}
          className="relative z-10 mt-20 w-full max-w-[340px] px-6 sm:mt-28 sm:px-10 md:mt-32 md:px-16"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 font-mono text-xs text-ink/60">
            <span>01</span>
            <span className="h-[1.5px] w-16 bg-ink/20" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="mt-5 font-display text-[2.5rem] font-normal leading-[1] tracking-tight text-ink-black sm:text-[3.25rem] md:text-[5rem]"
          >
            BUKTI
            <br />
            NUSANTARA
          </motion.h2>

          <motion.p variants={fadeUp} className="mt-5 w-[240px] text-[13px] leading-[1.6] text-gray md:text-[14px]">
            Masuki alam, sejarah, dan investigasi Indonesia, dibaca ulang dari
            sumber yang bisa kamu lacak sampai ke aslinya.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8">
            <Link
              href="/articles"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md border border-navy bg-navy px-6 py-3.5 shadow-sm transition-all duration-300 hover:-translate-y-[0.5px] hover:shadow-[3px_3px_0px_rgba(14,58,92,0.45)] active:translate-y-0 active:shadow-none"
            >
              <span className="absolute inset-0 -translate-x-[101%] bg-paper transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
              <Leaf
                size={17}
                className="relative z-10 text-white transition-all duration-300 group-hover:-translate-y-1 group-hover:-rotate-12 group-hover:scale-110 group-hover:text-ink-black"
              />
              <span className="relative z-10 text-[15px] font-medium text-white transition-colors duration-300 group-hover:text-ink-black">
                Jelajahi
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* 1F right sidebar (featured specimen) */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15, delayChildren: 0.9 } } }}
          className="absolute right-16 top-[21rem] z-10 hidden w-[210px] md:flex md:flex-col md:gap-8"
        >
          <motion.div variants={fadeUp}>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-light">Sorotan</p>
            <p className="mt-2 font-mono text-[10px] font-bold uppercase leading-snug tracking-widest text-ink-black line-clamp-3">
              {featured.title}
            </p>
            <p className="mt-2 text-[12px] leading-[1.6] text-gray line-clamp-3">{featured.subtitle}</p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-light">Label</p>
              <p className="mt-1 text-[13px] font-medium text-ink-black">{featured.label}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-light">Sumber</p>
              <p className="mt-1 text-[13px] font-medium text-ink-black">{featured.sources}</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Link href={featured.href} className="group flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-light transition-colors group-hover:border-navy group-hover:bg-navy">
                <Plus size={16} strokeWidth={1.5} className="text-ink-black transition-colors group-hover:text-white" />
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-black">
                Baca tulisan
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* 1G scroll to explore */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
          className="absolute bottom-10 left-10 z-10 hidden items-center gap-3 md:left-16 md:flex"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-rule">
            <span className="flex gap-[4px]">
              <span className="h-[12px] w-px bg-gray" />
              <span className="h-[12px] w-px bg-gray" />
            </span>
          </span>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gray-light">
            Gulir untuk menjelajah
          </span>
        </motion.div>
      </section>

      {/* ===================== SECTION 2: EXPLORE OUR WORLD ===================== */}
      <section className="relative z-20 flex min-h-[75vh] w-full flex-col items-center bg-paper pt-24 text-center md:min-h-screen md:pt-32">
        <p className="mb-12 font-mono text-[10px] tracking-[0.2em] md:text-[11px]">
          <span className="text-gray-light">[ 02 ]</span>{" "}
          <span className="font-bold uppercase text-ink-black">Jelajahi Dunia Kami</span>
        </p>

        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="max-w-[1000px] px-6 text-[2.2rem] font-medium leading-[1.1] tracking-tight text-ink-black md:text-[3.5rem] lg:text-[4.2rem]"
        >
          Bongkar cerita planet kita lewat jurnal, arsip, dan dokumen
          <span className="hidden md:inline">
            <br />
          </span>{" "}
          yang bisa kamu lacak sampai ke aslinya.
        </motion.h2>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
          className="mb-10 mt-12 flex flex-wrap justify-center gap-3 px-6 md:mb-24 md:gap-4"
        >
          {PILLS.map(({ icon: Icon, label, href }) => (
            <motion.div key={label} variants={fadeUp}>
              <Link
                href={href}
                className="group inline-flex items-center gap-2 rounded-full border border-rule bg-paper/50 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray backdrop-blur-sm transition-colors hover:border-navy hover:bg-navy hover:text-white"
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="min-h-[120px] w-full md:min-h-[260px]" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between px-8 pb-8 md:flex md:px-16 md:pb-12">
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-gray-light">
            Kami tidak sekadar bercerita.
          </p>
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-gray-light">
            NaLI · Nature Life Intelligence · 2026
          </p>
        </div>
      </section>

      {/* ===================== SECTION 3: ANCIENT COLLECTION ==================== */}
      <section className="relative z-30 flex w-full flex-col bg-navy-deep text-white">
        {/* 3A overlapping gunungan motif */}
        <motion.div
          initial={{ y: "-55%", opacity: 0 }}
          whileInView={{ y: "-62%", opacity: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-0 z-0 w-[110vw] -translate-x-1/2 md:w-[640px]"
        >
          <NaliMark variant="white" className="mx-auto h-auto w-[55%] opacity-[0.07]" />
        </motion.div>

        {/* 3B heading area */}
        <div className="relative z-10 mb-16 px-8 pt-32 md:px-16 md:pt-48">
          <div className="flex flex-col justify-between gap-10 xl:flex-row">
            <h2 className="text-[1.8rem] font-medium leading-[1.15] tracking-tight text-white md:text-[3rem] lg:text-[3.8rem] xl:text-[4rem]">
              Disusun dari ribuan sumber
              <span className="mx-2 inline-flex translate-y-[-4px] gap-2 align-middle md:mx-4 md:gap-3">
                {[Leaf, ScrollText, Microscope].map((Icon, i) => (
                  <span
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-navy text-white/50 transition-colors hover:border-white hover:bg-white hover:text-navy-deep md:h-14 md:w-14"
                  >
                    <Icon size={22} />
                  </span>
                ))}
              </span>
              dan arsip terbuka.
            </h2>

            <div className="shrink-0 xl:w-[260px]">
              <p className="mb-6 font-mono text-[9px] uppercase leading-relaxed tracking-widest text-white/50 md:text-[10px]">
                Kami tidak memajang fosil,
                <br />
                kami berbagi cara melacak bukti.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Terlacak", "Berlabel", "Diperbarui"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/20 px-5 py-2 font-mono text-[9px] uppercase tracking-widest text-white/70 transition-colors hover:border-white hover:bg-white hover:text-navy-deep"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3C two-column panel */}
        <div className="relative z-10 h-px w-full bg-white/15" />
        <div className="relative z-10 flex flex-col md:flex-row">
          {/* left panel */}
          <div className="flex min-h-[400px] flex-col border-b border-white/15 p-8 md:min-h-[500px] md:w-[35%] md:border-b-0 md:border-r">
            <p className="text-xl tracking-[0.3em] text-white/40">* * *</p>
            <div className="relative flex-1">
              <AnimatePresence mode="wait">
                {active && (
                  <SandTransitionImage
                    key={active.href}
                    src={active.image}
                    alt={active.name}
                    className="absolute inset-0 m-auto flex h-[80%] w-[80%] items-center justify-center mix-blend-lighten"
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#7e94ad]">
              <span className="relative inline-block h-4 w-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeChapter}
                    initial={{ y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -14, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="absolute inset-0"
                  >
                    {String(activeChapter + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-white/25">/</span>
              <span>{String(chapters.length).padStart(2, "0")}</span>
            </div>
          </div>

          {/* right panel */}
          <div className="md:w-[65%]">
            <div className="flex items-center justify-between border-b border-white/15 p-8 font-mono text-[10px] uppercase tracking-widest text-white/50">
              <span>Pahami masa lalu. Baca masa kini.</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeChapter}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.4 }}
                  className="text-white"
                >
                  Bab {String(activeChapter + 1).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>

            <ul>
              {chapters.map((ch, i) => {
                const isActive = i === activeChapter;
                return (
                  <li key={ch.href} className="border-b border-white/10">
                    <Link
                      href={ch.href}
                      onMouseEnter={() => setActiveChapter(i)}
                      className={`flex items-center justify-between gap-4 px-8 py-8 transition-colors ${
                        isActive ? "text-white" : "text-[#4a5a6e] hover:text-[#9fb2c4]"
                      }`}
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-mono text-[11px] text-white/30">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-2xl font-medium tracking-tight md:text-[2rem]">
                          {ch.name}
                        </span>
                      </span>
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowUpRight size={22} strokeWidth={1} className="text-white/60" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 3D footer */}
        <div className="h-px w-full bg-white/15" />
        <div className="flex items-center justify-between gap-4 bg-navy-deep px-8 py-8 font-mono text-[10px] uppercase tracking-widest text-white/50">
          <span className="flex items-center gap-2">
            <Compass size={14} strokeWidth={1.5} /> Menggali masa lalu Indonesia
          </span>
          <Link href="/ruang-kendali" className="flex items-center gap-2 transition-colors hover:text-white">
            Ruang Kendali <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      <GlobalSearch />
    </div>
  );
}
