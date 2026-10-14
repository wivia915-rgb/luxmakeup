import { adminMessages } from "@/lib/admin-copy";
import { deskIsOpen } from "@/lib/admin-gate";
import { getLocale } from "@/lib/get-locale";
import { listPrivateReviews } from "@/lib/product-reviews";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Private customer reviews on the atelier desk.",
};

export default async function AdminReviewsPage() {
  if (!(await deskIsOpen())) return null;
  const copy = adminMessages[await getLocale()];
  const desk = await listPrivateReviews();

  return (
    <main id="main" className="px-5 py-8 md:px-8 md:py-10">
      <p className="type-eyebrow">{copy.reviews.eyebrow}</p>
      <h1 className="type-headline mt-4">{copy.reviews.title}</h1>
      <p className="type-lead mt-4 max-w-xl">{copy.reviews.lead}</p>
      {!desk.connected ? <p className="type-body mt-8">{copy.reviews.waiting}</p> : null}
      {desk.connected && desk.reviews.length === 0 ? <p className="type-body mt-8 text-foreground/75">{copy.reviews.empty}</p> : null}
      {desk.reviews.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {desk.reviews.map((review) => {
            const date = new Date(review.createdAt).toLocaleDateString(copy.dateLocale, { day: "numeric", month: "short", year: "numeric" });
            return (
              <li key={review.id} className="border border-gold/25 bg-card px-4 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="type-caption text-gold-bright">{review.sentiment === "held" ? copy.reviews.held : copy.reviews.negative}</span>
                  <span className="type-nav text-foreground">{review.productTitle}</span>
                  <span className="type-caption text-foreground/70">{copy.reviews.stars.replace("{count}", String(review.stars))}</span>
                </div>
                <p className="mt-3 text-sm text-foreground">{review.authorName}</p>
                <p className="type-body mt-2 text-foreground/85">{review.body}</p>
                {review.imageUrl ? <img src={review.imageUrl} alt="" className="mt-3 h-28 w-24 border border-gold/20 object-cover" /> : null}
                {review.note ? <p className="type-caption mt-3 text-foreground/60">{review.note}</p> : null}
                <p className="type-caption mt-2 text-foreground/50">{date}</p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
