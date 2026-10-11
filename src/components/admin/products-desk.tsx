"use client";

import { createProduct, deleteProduct, toggleProductAvailability, updateProduct } from "@/app/actions/product-desk";
import { uploadProductImage } from "@/app/actions/upload-images";
import { useAdminCopy, useDeskError } from "@/components/admin/admin-locale";
import { fillCount } from "@/lib/admin-copy";
import { deskCategories, type DeskProduct, type DeskVariant, type ProductDraft, type VariantDraft } from "@/lib/admin-catalog";
import { formatDh } from "@/lib/products";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type Dispatch, type FormEvent, type SetStateAction } from "react";

const emptyDraft: ProductDraft = {
  title: "",
  description: "",
  price: "",
  category: "makeup",
  imageUrls: [],
  stock: "0",
  variants: [],
};

function blankVariant(stock = "0"): VariantDraft {
  return {
    clientId: crypto.randomUUID(),
    name: "",
    colorCode: "",
    size: "",
    stock,
    priceAdjustment: "0",
    isActive: true,
  };
}

export function ProductsDesk({ connected, products }: { connected: boolean; products: DeskProduct[] }) {
  const router = useRouter();
  const copy = useAdminCopy().products;
  const explain = useDeskError();
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<DeskProduct | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setAvailability((current) => pruneMatched(current, products, (product, value) => product.available === value));
    setStocks((current) => pruneMatched(current, products, (product, value) => product.stock === value));
    setHidden((current) => {
      const next = { ...current };
      let changed = false;
      for (const id of Object.keys(current)) {
        if (!products.some((product) => product.id === id)) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [products]);

  const rows = products
    .filter((product) => !hidden[product.id])
    .map((product) => ({
      ...product,
      available: availability[product.id] ?? product.available,
      stock: stocks[product.id] ?? product.stock,
    }));

  function openCreate() {
    setNotice(null);
    setEditingId(null);
    setDraft(emptyDraft);
  }

  function openEdit(product: DeskProduct) {
    setNotice(null);
    setConfirm(null);
    setEditingId(product.id);
    setDraft({
      title: product.title,
      description: product.description,
      price: String(product.price),
      category: product.categorySlug,
      imageUrls: product.imageUrls,
      stock: String(product.stock),
      variants: product.variants.map((variant) => ({
        clientId: variant.id,
        name: variant.name,
        colorCode: variant.colorCode,
        size: variant.size,
        stock: String(variant.stock),
        priceAdjustment: String(variant.priceAdjustment),
        isActive: variant.isActive,
      })),
    });
  }

  function closeForm() {
    if (isPending) return;
    setDraft(null);
    setEditingId(null);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setNotice(null);
    startTransition(async () => {
      const result = editingId ? await updateProduct(editingId, draft) : await createProduct(draft);
      if (!result.ok) {
        setNotice(explain(result.error));
        return;
      }
      setDraft(null);
      setEditingId(null);
      router.refresh();
    });
  }

  function toggle(product: DeskProduct) {
    const previous = { available: product.available, stock: product.stock };
    const available = !product.available;
    const stock = available && product.stock === 0 && product.variants.length === 0 ? 1 : product.stock;
    setNotice(null);
    setAvailability((current) => ({ ...current, [product.id]: available }));
    setStocks((current) => ({ ...current, [product.id]: stock }));
    startTransition(async () => {
      const result = await toggleProductAvailability(product.id);
      if (!result.ok) {
        setAvailability((current) => ({ ...current, [product.id]: previous.available }));
        setStocks((current) => ({ ...current, [product.id]: previous.stock }));
        setNotice(explain(result.error));
        return;
      }
      setAvailability((current) => ({ ...current, [product.id]: result.available }));
      setStocks((current) => ({ ...current, [product.id]: result.stock }));
      router.refresh();
    });
  }

  function remove(product: DeskProduct) {
    setNotice(null);
    setConfirm(null);
    setHidden((current) => ({ ...current, [product.id]: true }));
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (!result.ok) {
        setHidden((current) => {
          const next = { ...current };
          delete next[product.id];
          return next;
        });
        setNotice(explain(result.error));
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-eyebrow">{copy.eyebrow}</p>
          <h1 className="type-headline mt-3">{copy.title}</h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="type-nav border border-gold-bright px-4 py-3 text-gold-bright transition-colors hover:bg-gold/10"
        >
          {copy.add}
        </button>
      </div>

      {!connected ? (
        <p className="type-body mt-6 max-w-xl">{copy.waiting}</p>
      ) : null}

      {notice && !draft ? (
        <p className="mt-4 text-xs tracking-wide text-[#E7B4A8]" role="alert">
          {notice}
        </p>
      ) : null}

      <p className="type-caption mt-6">{rows.length === 1 ? copy.one : fillCount(copy.many, rows.length)}</p>

      <div className="mt-4 space-y-3 md:hidden">
        {rows.length === 0 ? (
          <p className="type-body border border-gold/20 px-4 py-10">{copy.empty}</p>
        ) : (
          rows.map((product) => (
            <article key={product.id} className="border border-gold/20 bg-card px-4 py-4">
              <div className="flex gap-4">
                <Thumbnail title={product.title} imageUrl={product.imageUrl} />
                <div className="min-w-0">
                  <p className="font-serif text-2xl text-foreground">{product.title}</p>
                  <p className="type-caption mt-1">{product.categoryName}</p>
                  <p className="type-price mt-2">{formatDh(product.price)}</p>
                  <div className="mt-3">
                    <VariantStock product={product} />
                  </div>
                </div>
              </div>
              <RowActions product={product} onEdit={() => openEdit(product)} onToggle={() => toggle(product)} onAskDelete={() => setConfirm(product)} />
            </article>
          ))
        )}
      </div>

      <div className="mt-4 hidden overflow-x-auto border border-gold/20 md:block">
        <table className="w-full min-w-[980px] border-collapse text-start">
          <thead className="bg-card">
            <tr className="type-eyebrow text-[0.62rem]">
              <th className="px-4 py-3 font-medium">{copy.piece}</th>
              <th className="px-4 py-3 font-medium">{copy.category}</th>
              <th className="px-4 py-3 font-medium">{copy.price}</th>
              <th className="px-4 py-3 font-medium">{copy.variants}</th>
              <th className="px-4 py-3 font-medium">{copy.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="type-body px-4 py-10">
                  {copy.empty}
                </td>
              </tr>
            ) : (
              rows.map((product) => (
                <tr key={product.id} className="border-t border-gold/15 align-middle">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Thumbnail title={product.title} imageUrl={product.imageUrl} />
                      <p className="font-serif text-xl text-foreground">{product.title}</p>
                    </div>
                  </td>
                  <td className="type-body px-4 py-4">{product.categoryName}</td>
                  <td className="type-price px-4 py-4">{formatDh(product.price)}</td>
                  <td className="px-4 py-4">
                    <VariantStock product={product} />
                  </td>
                  <td className="px-4 py-4">
                    <RowActions product={product} onEdit={() => openEdit(product)} onToggle={() => toggle(product)} onAskDelete={() => setConfirm(product)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {draft ? (
        <ProductForm
          draft={draft}
          editing={Boolean(editingId)}
          busy={isPending}
          notice={notice}
          onChange={setDraft}
          onClose={closeForm}
          onSubmit={save}
        />
      ) : null}

      {confirm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-product-title" className="w-full max-w-md border border-gold/30 bg-[#0D0D0D] px-6 py-6">
            <p className="type-eyebrow">{copy.remove}</p>
            <h2 id="delete-product-title" className="mt-3 font-serif text-3xl text-foreground">
              {confirm.title}
            </h2>
            <p className="type-body mt-4">{copy.removeBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => remove(confirm)}
                className="type-nav border border-[#E7B4A8] px-4 py-3 text-[#E7B4A8]"
              >
                {copy.delete}
              </button>
              <button type="button" onClick={() => setConfirm(null)} className="type-nav px-4 py-3 text-foreground/70">
                {copy.cancel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function pruneMatched<T>(current: Record<string, T>, products: DeskProduct[], same: (product: DeskProduct, value: T) => boolean) {
  const next = { ...current };
  let changed = false;
  for (const [id, value] of Object.entries(current)) {
    const product = products.find((item) => item.id === id);
    if (product && same(product, value)) {
      delete next[id];
      changed = true;
    }
  }
  return changed ? next : current;
}

const imageCap = 8;

function ImageList({
  label,
  uploadLabel,
  addLinkLabel,
  removeLabel,
  uploadingLabel,
  urls,
  onChange,
}: {
  label: string;
  uploadLabel: string;
  addLinkLabel: string;
  removeLabel: string;
  uploadingLabel: string;
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const explain = useDeskError();
  const inputRef = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;
    const room = imageCap - urls.length;
    if (room <= 0) {
      setNote(explain("A piece can hold up to 8 images."));
      return;
    }

    setUploading(true);
    setNote(null);
    const next = [...urls];
    let failed: string | null = null;
    for (const file of files.slice(0, room)) {
      try {
        const blob = await shrinkImage(file);
        const data = new FormData();
        data.set("image", new File([blob], "piece.jpg", { type: "image/jpeg" }));
        const result = await uploadProductImage(data);
        if (!result.ok) {
          failed = explain(result.error);
          break;
        }
        if (!next.includes(result.url)) next.push(result.url);
      } catch {
        failed = explain("Choose a JPEG, PNG, or WebP image.");
        break;
      }
    }
    setUploading(false);
    onChange(next);
    setNote(failed);
  }

  function addLink() {
    const url = link.trim();
    if (!url) return;
    if (urls.length >= imageCap) {
      setNote(explain("A piece can hold up to 8 images."));
      return;
    }
    if (!/^https?:\/\//.test(url)) {
      setNote(explain("Image URL must start with http:// or https://."));
      return;
    }
    setNote(null);
    setLink("");
    if (!urls.includes(url)) onChange([...urls, url]);
  }

  return (
    <div>
      <span className="type-eyebrow">{label}</span>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={uploading || urls.length >= imageCap}
          onClick={() => inputRef.current?.click()}
          className="type-nav border border-gold-bright px-4 py-3 text-gold-bright disabled:opacity-40"
        >
          {uploading ? uploadingLabel : uploadLabel}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(event) => void onFiles(event.target.files)} />
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="https://"
          className="min-w-0 flex-1 border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm text-foreground outline-none focus:border-[#E5C158]"
        />
        <button type="button" onClick={addLink} disabled={urls.length >= imageCap} className="type-nav border border-gold/40 px-3 py-3 text-foreground/80 disabled:opacity-40">
          {addLinkLabel}
        </button>
      </div>
      {note ? (
        <p className="mt-2 text-xs tracking-wide text-[#E7B4A8]" role="alert">
          {note}
        </p>
      ) : null}
      {urls.length > 0 ? (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((url) => (
            <li key={url} className="border border-gold/25 bg-[#0D0D0D]">
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              <button type="button" onClick={() => onChange(urls.filter((item) => item !== url))} className="type-caption w-full px-2 py-1.5 text-foreground/70 hover:text-[#E5C158]">
                {removeLabel}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function shrinkImage(file: File) {
  return new Promise<Blob>((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(source);
        reject(new Error("canvas"));
        return;
      }
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(source);
          if (blob && blob.size <= 1_500_000) resolve(blob);
          else reject(new Error("size"));
        },
        "image/jpeg",
        0.82,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error("image"));
    };
    img.src = source;
  });
}

function Thumbnail({ title, imageUrl, large = false }: { title: string; imageUrl: string; large?: boolean }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [imageUrl]);

  return (
    <div className={`${large ? "h-28 w-full" : "size-14"} shrink-0 overflow-hidden border border-gold/25 bg-[#0D0D0D]`}>
      {imageUrl && !broken ? (
        <img src={imageUrl} alt="" className="size-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <PieceMark title={title} />
      )}
    </div>
  );
}

function PieceMark({ title }: { title: string }) {
  const mark = title.trim().slice(0, 1).toUpperCase() || "L";
  return (
    <span className="grid size-full place-items-center bg-[#0D0D0D]">
      <span className="grid size-8 place-items-center rounded-full border border-gold/50 font-serif text-sm text-gold">{mark}</span>
    </span>
  );
}

function variantLabel(variant: Pick<DeskVariant, "name" | "size">) {
  if (!variant.size || variant.size.toLowerCase() === variant.name.toLowerCase()) return variant.name;
  return `${variant.name} · ${variant.size}`;
}

function signedAdjustment(amount: number) {
  if (amount === 0) return "";
  const formatted = formatDh(Math.abs(amount));
  return amount > 0 ? `+${formatted}` : `−${formatted}`;
}

function VariantStock({ product }: { product: DeskProduct }) {
  const copy = useAdminCopy().products;
  const active = product.variants.filter((variant) => variant.isActive);
  if (product.variants.length === 0) return <StockBadge product={product} />;

  return (
    <div>
      {!product.available ? <p className="type-caption mb-2 text-foreground/55">{copy.held}</p> : null}
      {active.length === 0 ? (
        <p className="type-caption text-foreground/55">{copy.noVariant}</p>
      ) : (
        <ul className="space-y-1.5">
          {active.map((variant) => (
            <li key={variant.id} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                {/^#[0-9A-F]{6}$/.test(variant.colorCode) ? (
                  <span className="size-2.5 shrink-0 border border-gold/40" style={{ background: variant.colorCode }} aria-hidden />
                ) : null}
                <span className="type-caption truncate text-foreground">
                  {variantLabel(variant)}
                  {variant.priceAdjustment !== 0 ? <span className="text-[#E5C158]"> {signedAdjustment(variant.priceAdjustment)}</span> : null}
                </span>
              </span>
              <span className="type-caption shrink-0 text-[#E5C158]">{fillCount(copy.inStock, variant.stock)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StockBadge({ product }: { product: DeskProduct }) {
  const copy = useAdminCopy().products;
  const inStock = product.available && product.stock > 0;
  const label = !product.available
    ? product.stock > 0
      ? fillCount(copy.heldStock, product.stock)
      : copy.unavailable
    : product.stock === 0
      ? copy.out
      : fillCount(copy.inStock, product.stock);
  return (
    <span
      className={`type-caption inline-flex px-2.5 py-1 ${inStock ? "border border-[#E5C158] text-[#E5C158]" : "border border-foreground/25 text-foreground/55"}`}
    >
      {label}
    </span>
  );
}

function RowActions({
  product,
  onEdit,
  onToggle,
  onAskDelete,
}: {
  product: DeskProduct;
  onEdit: () => void;
  onToggle: () => void;
  onAskDelete: () => void;
}) {
  const copy = useAdminCopy().products;
  return (
    <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
      <Link
        href={`/product/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="type-caption border border-[#E5C158] px-2.5 py-1.5 text-[#E5C158] hover:bg-gold/10"
      >
        {copy.preview}
      </Link>
      <button type="button" onClick={onEdit} className="type-caption border border-gold/30 px-2.5 py-1.5 text-foreground hover:border-gold-bright hover:text-gold-bright">
        {copy.edit}
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="type-caption border border-gold/30 px-2.5 py-1.5 text-foreground hover:border-gold-bright hover:text-gold-bright"
      >
        {product.available ? copy.hold : copy.release}
      </button>
      <button type="button" onClick={onAskDelete} className="type-caption border border-gold/30 px-2.5 py-1.5 text-foreground/70 hover:border-gold-bright">
        {copy.deleteShort}
      </button>
    </div>
  );
}

function ProductForm({
  draft,
  editing,
  busy,
  notice,
  onChange,
  onClose,
  onSubmit,
}: {
  draft: ProductDraft;
  editing: boolean;
  busy: boolean;
  notice: string | null;
  onChange: Dispatch<SetStateAction<ProductDraft | null>>;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const copy = useAdminCopy().products;
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function setField(field: "title" | "description" | "price" | "category" | "stock", value: string) {
    onChange((current) => (current ? { ...current, [field]: value } : current));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        onSubmit={onSubmit}
        className="max-h-[90svh] w-full max-w-xl overflow-y-auto border border-gold/30 bg-[#0a0a0a] px-6 py-6"
      >
        <p className="type-eyebrow">{editing ? copy.editing : copy.creating}</p>
        <h2 id="product-form-title" className="mt-3 font-serif text-3xl text-foreground">
          {editing ? draft.title || copy.piece : copy.addTitle}
        </h2>

        <div className="mt-6 grid gap-4">
          <Field label={copy.titleField} value={draft.title} onChange={(value) => setField("title", value)} />
          <label className="block">
            <span className="type-eyebrow">{copy.description}</span>
            <textarea
              value={draft.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={4}
              className="mt-2 w-full resize-y border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm text-foreground outline-none focus:border-[#E5C158]"
            />
          </label>
          <div className={draft.variants.length === 0 ? "grid gap-4 sm:grid-cols-2" : ""}>
            <Field label={copy.priceField} value={draft.price} inputMode="numeric" onChange={(value) => setField("price", value)} />
            {draft.variants.length === 0 ? (
              <Field label={copy.stock} value={draft.stock} inputMode="numeric" onChange={(value) => setField("stock", value)} />
            ) : null}
          </div>
          <VariantEditor variants={draft.variants} onChange={onChange} />
          <label className="block">
            <span className="type-eyebrow">{copy.category}</span>
            <select
              value={draft.category}
              onChange={(event) => setField("category", event.target.value)}
              className="mt-2 w-full border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm text-foreground outline-none [color-scheme:dark] focus:border-[#E5C158]"
            >
              {deskCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <ImageList
            label={copy.image}
            uploadLabel={copy.upload}
            addLinkLabel={copy.addLink}
            removeLabel={copy.removeImage}
            uploadingLabel={copy.uploading}
            urls={draft.imageUrls}
            onChange={(imageUrls) => onChange((current) => (current ? { ...current, imageUrls } : current))}
          />
        </div>

        {notice ? (
          <p className="mt-4 text-xs tracking-wide text-[#E7B4A8]" role="alert">
            {notice}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="type-nav border border-gold-bright px-4 py-3 text-gold-bright disabled:opacity-40"
          >
            {busy ? copy.saving : editing ? copy.save : copy.addProduct}
          </button>
          <button type="button" onClick={onClose} className="type-nav px-4 py-3 text-foreground/70">
            {copy.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}

function VariantEditor({
  variants,
  onChange,
}: {
  variants: VariantDraft[];
  onChange: Dispatch<SetStateAction<ProductDraft | null>>;
}) {
  const copy = useAdminCopy().products;
  function changeVariants(update: (variants: VariantDraft[], stock: string) => VariantDraft[]) {
    onChange((current) => (current ? { ...current, variants: update(current.variants, current.stock) } : current));
  }

  function update(clientId: string, patch: Partial<VariantDraft>) {
    changeVariants((items) => items.map((variant) => (variant.clientId === clientId ? { ...variant, ...patch } : variant)));
  }

  return (
    <fieldset className="border border-gold/25 px-4 py-4">
      <legend className="type-eyebrow px-2">{copy.variants}</legend>
      <p className="type-caption">{copy.variantsLead}</p>
      <div className="mt-4 space-y-3">
        {variants.map((variant, index) => (
          <div key={variant.clientId} className="border border-gold/20 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="type-caption text-[#E5C158]">{fillCount(copy.variant, index + 1)}</span>
              <button
                type="button"
                onClick={() => changeVariants((items) => items.filter((item) => item.clientId !== variant.clientId))}
                className="type-caption text-foreground/70 hover:text-[#E7B4A8]"
              >
                {copy.removeVariant}
              </button>
            </div>
            <div className="mt-3 grid gap-3">
              <Field label={copy.shade} value={variant.name} placeholder="Ruby Gold" onChange={(value) => update(variant.clientId, { name: value })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={copy.color}
                  value={variant.colorCode}
                  placeholder="#8C1C13"
                  onChange={(value) => update(variant.clientId, { colorCode: value })}
                />
                <Field label={copy.volume} value={variant.size} placeholder="50ml" onChange={(value) => update(variant.clientId, { size: value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={copy.variantStock}
                  value={variant.stock}
                  inputMode="numeric"
                  onChange={(value) => update(variant.clientId, { stock: value })}
                />
                <Field
                  label={copy.adjustment}
                  value={variant.priceAdjustment}
                  placeholder="0"
                  onChange={(value) => update(variant.clientId, { priceAdjustment: value })}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={variant.isActive}
                  onChange={(event) => update(variant.clientId, { isActive: event.target.checked })}
                  className="accent-[#D4AF37]"
                />
                <span className="type-caption text-foreground">{copy.active}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => changeVariants((items, stock) => [...items, blankVariant(items.length === 0 ? stock || "0" : "0")])}
        className="type-nav mt-4 border border-gold/40 px-4 py-3 text-gold-bright"
      >
        {copy.addVariant}
      </button>
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "numeric" | "text";
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="type-eyebrow">{label}</span>
      <input
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-gold/30 bg-[#0a0a0a] px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/35 focus:border-[#E5C158]"
      />
    </label>
  );
}
