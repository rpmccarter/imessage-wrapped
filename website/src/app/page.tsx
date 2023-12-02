import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <h1 className="text-4xl">see your year through texts</h1>
      <Link href='/getting-started' className="border px-4 py-2 text-sky-600 bg-sky-600/20 rounded-full border-sky-600">get started</Link>
    </main>
  )
}
