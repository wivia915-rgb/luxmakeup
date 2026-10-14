"use client";

import { placeCodOrder } from "@/app/actions/place-cod-order";
import { CouponField, type AppliedCoupon } from "@/components/coupon-field";
import { defaultShippingRates, deliveryFee, filterCities, resolveCity, validateCod, type CodFields, type ShippingRates } from "@/lib/cod";
import { trackCommerce } from "@/lib/meta";
import type { Dictionary } from "@/lib/messages";
import { formatDh } from "@/lib/products";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const fieldClass =
  "mt-2 w-full border bg-background px-3 py-3 text-[0.95rem] text-foreground outline-none transition-colors placeholder:text-foreground/35 focus:border-gold-bright";

type CodLine = {
  productId: string;
  shadeId: string;
  quantity: number;
  name: string;
  detail: string;
  merchandise: number;
  couponCode?: string;
  discountDh?: number;
};

export type CodDrawerProps = {
  open: boolean;
  line: CodLine;
  onClose: () => void;
  shippingRates?: ShippingRates;
  copy: Dictionary["checkout"];
};

const emptyFields: CodFields = { name: "", phone: "", city: "", address: "" };

export function CodDrawer({ open, line, onClose, shippingRates = defaultShippingRates, copy }: CodDrawerProps) {
  const titleId = useId();
  const listId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  const [fields, setFields] = useState<CodFields>(emptyFields);
  const [touched, setTouched] = useState<Partial<Record<keyof CodFields, boolean>>>({});
  const [cityOpen, setCityOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placed, setPlaced] = useState<CodFields | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(
    line.couponCode && line.discountDh ? { code: line.couponCode, discountDh: line.discountDh } : null,
  );
  onCloseRef.current = onClose;

  const goods = Math.max(0, line.merchandise - (coupon?.discountDh ?? 0));

  useEffect(() => {
    setCoupon(line.couponCode && line.discountDh ? { code: line.couponCode, discountDh: line.discountDh } : null);
  }, [line.couponCode, line.discountDh, line.productId]);

  const suggestions = useMemo(() => filterCities(fields.city), [fields.city]);
  const check = validateCod(fields);
  const resolvedCity = resolveCity(fields.city);
  const fee = resolvedCity ? deliveryFee(resolvedCity, goods, shippingRates) : null;
  const freeByThreshold = shippingRates.freeThreshold > 0 && goods >= shippingRates.freeThreshold;
  const payable = fee === null ? null : goods + fee;

  useEffect(() => {
    if (!open || !line.productId) return;
    const unitPrice = line.quantity > 0 ? Math.round(line.merchandise / line.quantity) : line.merchandise;
    trackCommerce("AddToCart", {
      id: line.productId,
      name: line.name,
      value: line.merchandise,
      unitPrice,
      quantity: line.quantity,
    });
  }, [line.merchandise, line.name, line.productId, line.quantity, open]);

  useEffect(() => {
    if (!open) return;
    setPlaced(null);
    setSubmitError(null);
    setSubmitting(false);
    const frame = window.requestAnimationFrame(() => nameRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, line.name]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (cityOpen) {
          setCityOpen(false);
          return;
        }
        onCloseRef.current();
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("button, input, textarea");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, cityOpen]);

  function update(key: keyof CodFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    const ready =
      (key === "name" && value.trim().split(/\s+/).filter(Boolean).length >= 2) ||
      (key === "phone" && value.replace(/\D/g, "").length >= 6) ||
      (key === "address" && value.trim().length >= 8) ||
      (key === "city" && value.trim().length >= 2);
    if (ready) setTouched((current) => ({ ...current, [key]: true }));
  }

  function chooseCity(city: string) {
    setFields((current) => ({ ...current, city }));
    setTouched((current) => ({ ...current, city: true }));
    setCityOpen(false);
  }

  const fieldError: Record<keyof CodFields, string> = {
    name: copy.nameError,
    phone: copy.phoneError,
    city: copy.cityError,
    address: copy.addressError,
  };

  function visibleError(key: keyof CodFields) {
    return touched[key] && check.errors[key] ? fieldError[key] : undefined;
  }

  function feeLabel(amount: number | null, cityName: string | null) {
    if (amount === null || !cityName) return copy.chooseCity;
    if (amount === 0) return freeByThreshold || cityName !== "Fès" ? copy.free : copy.freeFes;
    return formatDh(amount);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[92svh] w-full max-w-lg flex-col border border-gold/30 bg-card shadow-[0_-24px_80px_rgba(0,0,0,0.45)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.2, ease }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gold/20 px-5 py-4">
              <div>
                <p className="type-eyebrow">{copy.eyebrow}</p>
                <h2 id={titleId} className="type-title mt-2 text-[1.7rem]">
                  {copy.title}
                </h2>
                <p className="type-caption mt-2">{copy.lead}</p>
              </div>
              <button
                type="button"
                className="inline-flex size-10 shrink-0 items-center justify-center border border-gold/30 text-foreground hover:border-gold-bright hover:text-gold-bright"
                onClick={onClose}
                aria-label={copy.closeLabel}
              >
                <X strokeWidth={1.25} size={18} />
              </button>
            </div>

            {placed ? (
              <div className="px-5 py-8">
                <p className="type-body">
                  {copy.placed
                    .replace("{name}", line.name)
                    .replace("{total}", formatDh(goods + (deliveryFee(placed.city, goods, shippingRates) ?? 0)))
                    .replace("{city}", resolveCity(placed.city) ?? placed.city)}
                </p>
                <p className="type-caption mt-4">
                  {placed.name} · {placed.phone}
                  <br />
                  {placed.address}, {resolveCity(placed.city)}
                </p>
                <button type="button" className="type-nav mt-8 border border-gold/40 px-5 py-3 text-gold-bright" onClick={onClose}>
                  {copy.close}
                </button>
              </div>
            ) : (
              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setTouched({ name: true, phone: true, city: true, address: true });
                  if (!check.valid || submitting) {
                    const order: (keyof CodFields)[] = ["name", "phone", "city", "address"];
                    const first = order.find((key) => check.errors[key]);
                    if (first) panelRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
                    return;
                  }
                  setSubmitting(true);
                  setSubmitError(null);
                  const result = await placeCodOrder({
                    productId: line.productId,
                    shadeId: line.shadeId,
                    quantity: line.quantity,
                    name: fields.name,
                    phone: fields.phone,
                    city: fields.city,
                    address: fields.address,
                    couponCode: coupon?.code ?? "",
                  });
                  setSubmitting(false);
                  if (!result.ok) {
                    setSubmitError(result.error);
                    return;
                  }
                  setPlaced(fields);
                  const unitPrice = line.quantity > 0 ? Math.round(line.merchandise / line.quantity) : line.merchandise;
                  trackCommerce("Purchase", {
                    id: line.productId,
                    name: line.name,
                    value: payable ?? line.merchandise,
                    unitPrice,
                    quantity: line.quantity,
                    orderId: result.orderId,
                  });
                  window.location.assign(result.whatsappUrl);
                }}
              >
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <p className="type-caption">
                    {line.name}
                    {line.detail ? ` · ${line.detail}` : ""}
                  </p>
                  <p className="type-price mt-2">{formatDh(goods)}</p>
                  {coupon ? <p className="type-caption mt-1 line-through">{formatDh(line.merchandise)}</p> : null}

                  <div className="mt-6">
                    <CouponField merchandiseDh={line.merchandise} copy={copy} applied={coupon} onApplied={setCoupon} />
                  </div>

                  <label className="mt-6 block">
                    <span className="type-eyebrow">{copy.fullName}</span>
                    <input
                      ref={nameRef}
                      name="name"
                      autoComplete="name"
                      value={fields.name}
                      onChange={(event) => update("name", event.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, name: true }))}
                      className={`${fieldClass} ${visibleError("name") ? "border-[#E7B4A8]" : "border-gold/30"}`}
                      placeholder={copy.namePlaceholder}
                    />
                    <FieldError message={visibleError("name")} />
                  </label>

                  <label className="mt-5 block">
                    <span className="type-eyebrow">{copy.phone}</span>
                    <input
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={fields.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                      className={`${fieldClass} ${visibleError("phone") ? "border-[#E7B4A8]" : "border-gold/30"}`}
                      placeholder="06 12 34 56 78"
                    />
                    <FieldError message={visibleError("phone")} />
                  </label>

                  <div className="relative mt-5">
                    <label className="block" htmlFor={`${listId}-input`}>
                      <span className="type-eyebrow">{copy.city}</span>
                    </label>
                    <input
                      id={`${listId}-input`}
                      name="city"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={cityOpen}
                      aria-controls={listId}
                      aria-activedescendant={cityOpen && suggestions[activeIndex] ? `${listId}-${activeIndex}` : undefined}
                      autoComplete="off"
                      value={fields.city}
                      onChange={(event) => {
                        update("city", event.target.value);
                        setCityOpen(true);
                        setActiveIndex(0);
                      }}
                      onFocus={() => setCityOpen(true)}
                      onBlur={() => {
                        setTouched((current) => ({ ...current, city: true }));
                        window.setTimeout(() => setCityOpen(false), 120);
                      }}
                      onKeyDown={(event) => {
                        if (!cityOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                          setCityOpen(true);
                          return;
                        }
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setActiveIndex((index) => Math.min(suggestions.length - 1, index + 1));
                        } else if (event.key === "ArrowUp") {
                          event.preventDefault();
                          setActiveIndex((index) => Math.max(0, index - 1));
                        } else if (event.key === "Enter" && cityOpen && suggestions[activeIndex]) {
                          event.preventDefault();
                          chooseCity(suggestions[activeIndex]);
                        }
                      }}
                      className={`${fieldClass} ${visibleError("city") ? "border-[#E7B4A8]" : "border-gold/30"}`}
                      placeholder={copy.cityPlaceholder}
                    />
                    <FieldError message={visibleError("city")} />
                    {cityOpen ? (
                      <ul id={listId} role="listbox" className="absolute z-10 mt-1 max-h-52 w-full overflow-auto border border-gold/30 bg-background">
                        {suggestions.length === 0 ? (
                          <li className="type-caption px-3 py-3">{copy.noCity}</li>
                        ) : (
                          suggestions.map((city, index) => (
                            <li key={city} id={`${listId}-${index}`} role="option" aria-selected={index === activeIndex}>
                              <button
                                type="button"
                                className={`flex w-full items-center justify-between px-3 py-2.5 text-start text-sm ${index === activeIndex ? "bg-card text-gold-bright" : "text-foreground"}`}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => chooseCity(city)}
                              >
                                <span>{city}</span>
                                <span className="type-caption">
                                  {deliveryFee(city, goods, shippingRates) === 0 ? copy.free : formatDh(deliveryFee(city, goods, shippingRates) ?? 0)}
                                </span>
                              </button>
                            </li>
                          ))
                        )}
                      </ul>
                    ) : null}
                  </div>

                  <label className="mt-5 block">
                    <span className="type-eyebrow">{copy.address}</span>
                    <textarea
                      name="address"
                      autoComplete="street-address"
                      rows={2}
                      value={fields.address}
                      onChange={(event) => update("address", event.target.value)}
                      onBlur={() => setTouched((current) => ({ ...current, address: true }))}
                      className={`${fieldClass} resize-none ${visibleError("address") ? "border-[#E7B4A8]" : "border-gold/30"}`}
                      placeholder={copy.addressPlaceholder}
                    />
                    <FieldError message={visibleError("address")} />
                  </label>

                  <dl className="mt-6 space-y-2 border-t border-gold/20 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="type-caption">{copy.pieces}</dt>
                      <dd className="type-caption text-foreground">{formatDh(line.merchandise)}</dd>
                    </div>
                    {coupon ? (
                      <div className="flex items-center justify-between gap-4">
                        <dt className="type-caption">{copy.discount}</dt>
                        <dd className="type-caption text-gold-bright">−{formatDh(coupon.discountDh)}</dd>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-4">
                      <dt className="type-caption">{copy.delivery}</dt>
                      <dd className="type-caption text-gold-bright">{feeLabel(fee, resolvedCity)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <dt className="type-nav text-foreground">{copy.toPay}</dt>
                      <dd className="type-price">{payable === null ? "—" : formatDh(payable)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="border-t border-gold/20 px-5 py-4">
                  {submitError ? (
                    <p className="mb-3 text-xs tracking-wide text-[#E7B4A8]" role="alert">
                      {copy.server[submitError] ?? submitError}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={!check.valid || submitting}
                    className="type-nav w-full bg-[#E2187A] px-6 py-4 text-white transition-opacity enabled:hover:bg-[#FF4D9A] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {submitting ? copy.sending : check.valid && payable !== null ? copy.submit.replace("{total}", formatDh(payable)) : copy.submitIdle}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-xs tracking-wide text-[#E7B4A8]" role="alert">
      {message}
    </p>
  );
}
