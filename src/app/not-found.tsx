import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="px-5 py-24 md:px-10">
      <p className="type-eyebrow">Lux Makeup</p>
      <h1 className="type-headline mt-4">This piece has left the atelier</h1>
      <p className="type-body mt-6 max-w-md">The formula you asked for is not in the current collection.</p>
      <Link href="/#edit" className="type-nav mt-10 inline-flex text-gold-bright">
        Return to the collection
      </Link>
    </main>
  );
}
