"use client";

import { submitProductReview, type ReviewDraft } from "@/app/actions/submit-review";
import { PiecePhoto } from "@/components/piece-photo";
import type { Dictionary } from "@/lib/messages";
import type { Locale } from "@/lib/locale";
import type { Motif } from "@/lib/products";
import type { PublicReview } from "@/lib/product-reviews";
import { Star } from "lucide-react";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";

const dateLocales: Record<Locale, string> = { ar: "ar-MA", fr: "fr-FR", en: "en-GB" };

export function ProductReviews({
  slug,
  name,
  image,
  motif,
  reviews,
  locale,
  copy,
}: {
  slug: string;
  name: string;
  image: string;
  motif: Motif;
  reviews: PublicReview[];
  locale: Locale;
  copy: Dictionary["product"];
}) {
  const [items, setItems] = useState(reviews);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [stars, setStars] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(reviews);
  }, [reviews]);

  function choosePhoto(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1_000_000) {
      setError(copy.reviewPhotoInvalid);
      return;
    }
    setError("");
    setPhoto(file);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  function clearPhoto() {
    setPhoto(null);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    if (photoRef.current) photoRef.current.value = "";
  }

  function publish(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    if (stars < 1) {
      setError(copy.reviewNeedStars);
      return;
    }
    if (author.trim().length < 2) {
      setError(copy.reviewNeedName);
      return;
    }
    if (body.trim().length < 2) {
      setError(copy.reviewNeedBody);
      return;
    }
    setError("");
    const data = new FormData();
    data.set("slug", slug);
    data.set("name", author);
    data.set("stars", String(stars));
    data.set("body", body);
    if (photo) data.set("image", photo);
    startTransition(async () => {
      const result = await submitProductReview(data);
      if (!result.ok) {
        setError(result.error === "name" ? copy.reviewNeedName : result.error === "body" ? copy.reviewNeedBody : result.error === "stars" ? copy.reviewNeedStars : result.error === "photo" ? copy.reviewPhotoInvalid : copy.reviewFailed);
        return;
      }
      if (result.published) {
        setItems((current) => [result.review, ...current.filter((item) => item.id !== result.review.id)]);
      }
      setBody("");
      setStars(0);
      clearPhoto();
      setNotice(result.published ? copy.reviewThanks : copy.reviewReceived);
    });
  }

  return (
    <section className="mt-16 border-t border-gold/20 pt-12 md:mt-20">
      <p className="type-eyebrow">{copy.reviews}</p>
      <h2 className="type-headline mt-4">{copy.reviewsTitle}</h2>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="aspect-[4/5] overflow-hidden border border-gold/20 bg-background">
          <PiecePhoto src={image} name={name} motif={motif} />
        </div>
        <form onSubmit={publish} className="border border-gold/25 bg-card px-4 py-4 sm:px-5">
          <label className="block">
            <span className="type-eyebrow">{copy.reviewName}</span>
            <input
              value={author}
              maxLength={40}
              onChange={(event) => setAuthor(event.target.value)}
              className="mt-2 w-full border border-gold/30 bg-background px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-gold-bright"
            />
          </label>
          <fieldset className="mt-5">
            <legend className="type-eyebrow">{copy.reviewStars}</legend>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = value <= stars;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={copy.reviewStar.replace("{count}", String(value))}
                    onClick={() => setStars(value)}
                    className={`inline-flex size-11 items-center justify-center border ${selected ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-[#D4AF37]/35"}`}
                  >
                    <Star size={18} strokeWidth={1.25} className={selected ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D4AF37]/50"} />
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="mt-5 block">
            <span className="type-eyebrow">{copy.reviewBody}</span>
            <textarea
              value={body}
              maxLength={400}
              rows={4}
              onChange={(event) => setBody(event.target.value)}
              className="mt-2 w-full resize-y border border-gold/30 bg-background px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-gold-bright"
            />
          </label>
          <div className="mt-5">
            <span className="type-eyebrow">{copy.reviewPhoto}</span>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {preview ? <img src={preview} alt="" className="size-16 border border-[#D4AF37]/40 object-cover" /> : null}
              <button type="button" onClick={() => photoRef.current?.click()} className="border border-gold/30 px-4 py-3 text-sm text-foreground hover:border-gold-bright">
                {copy.reviewPhotoAdd}
              </button>
              {photo ? (
                <button type="button" onClick={clearPhoto} className="type-caption text-foreground/70 underline-offset-4 hover:underline">
                  {copy.reviewPhotoRemove}
                </button>
              ) : null}
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => choosePhoto(event.target.files?.[0])}
            />
          </div>
          {error ? <p className="type-caption mt-3 text-[#E7B4A8]">{error}</p> : null}
          {notice ? <p className="type-caption mt-3 text-gold-bright">{notice}</p> : null}
          <button type="submit" disabled={pending} className="type-nav mt-5 bg-[#E2187A] px-6 py-3 text-white hover:bg-[#FF4D9A] disabled:opacity-40">
            {pending ? copy.reviewSending : copy.reviewSend}
          </button>
        </form>
      </div>
      {items.length === 0 ? (
        <p className="type-body mt-8 text-foreground/75">{copy.reviewEmpty}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((review) => (
            <ReviewCard key={review.id} review={review} locale={locale} image={image} name={name} motif={motif} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewCard({
  review,
  locale,
  image,
  name,
  motif,
}: {
  review: ReviewDraft;
  locale: Locale;
  image: string;
  name: string;
  motif: Motif;
}) {
  const date = new Date(review.createdAt).toLocaleDateString(dateLocales[locale], { day: "numeric", month: "short", year: "numeric" });
  return (
    <li className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border border-gold/20 bg-card p-4">
      <div className="aspect-[4/5] overflow-hidden border border-gold/20 bg-background">
        {review.imageUrl ? <img src={review.imageUrl} alt="" className="size-full object-cover" /> : <PiecePhoto src={image} name={name} motif={motif} />}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex" aria-label={`${review.stars}/5`}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Star key={value} size={14} strokeWidth={1.25} className={value <= review.stars ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D4AF37]/40"} />
            ))}
          </span>
          <span className="text-sm text-foreground">{review.authorName}</span>
          <span className="type-caption text-foreground/60">{date}</span>
        </div>
        <p className="type-body mt-3 text-foreground/85">{review.body}</p>
      </div>
    </li>
  );
}
