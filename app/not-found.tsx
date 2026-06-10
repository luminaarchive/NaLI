import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-read flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="label text-teal-dark">404</p>
      <h1 className="mt-4 font-display text-4xl text-ink-black sm:text-5xl">
        Jejak ini buntu.
      </h1>
      <p className="mt-4 max-w-md text-gray">
        Halaman yang kamu cari tidak ada — mungkin sudah dipindah, atau belum
        pernah ada. Kembali dan telusuri dari awal.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-ink-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-dark"
      >
        Ke beranda
      </Link>
    </div>
  );
}
