"use client";

import { createProduct, deleteProduct, toggleProductAvailability, updateProduct } from "@/app/actions/product-desk";
import { deskCategories, type DeskProduct, type ProductDraft } from "@/lib/admin-catalog";
import { formatDh } from "@/lib/products";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type FormEvent } from "react";

const emptyDraft: ProductDraft = {
  title: "",
  description: "",
  price: "",
  category: "makeup",
  imageUrl: "",
  stock: "0",
};

export function ProductsDesk({ connected, products }: { connected: boolean; products: DeskProduct[] }) {
  const router = useRouter();
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
      imageUrl: product.imageUrl,
      stock: String(product.stock),
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
        setNotice(result.error);
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
    const stock = available && product.stock === 0 ? 1 : product.stock;
    setNotice(null);
    setAvailability((current) => ({ ...current, [product.id]: available }));
    setStocks((current) => ({ ...current, [product.id]: stock }));
    startTransition(async () => {
      const result = await toggleProductAvailability(product.id);
      if (!result.ok) {
        setAvailability((current) => ({ ...current, [product.id]: previous.available }));
        setStocks((current) => ({ ...current, [product.id]: previous.stock }));
        setNotice(result.error);
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
        setNotice(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-eyebrow">Collection</p>
          <h1 className="type-headline mt-3">Pieces</h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="type-nav border border-gold-bright px-4 py-3 text-gold-bright transition-colors hover:bg-gold/10"
        >
          Add new product
        </button>
      </div>

      {!connected ? (
        <p className="type-body mt-6 max-w-xl">
          The catalog is waiting for the database. Connect PostgreSQL, then the collection will appear here.
        </p>
      ) : null}

      {notice && !draft ? (
        <p className="mt-4 text-xs tracking-wide text-[#E7B4A8]" role="alert">
          {notice}
        </p>
      ) : null}

      <p className="type-caption mt-6">{rows.length === 1 ? "1 piece" : `${rows.length} pieces`}</p>

      <div className="mt-4 space-y-3 md:hidden">
        {rows.length === 0 ? (
          <p className="type-body border border-gold/20 px-4 py-10">No pieces are in the catalog yet.</p>
        ) : (
          rows.map((product) => (
            <article key={product.id} className="border border-gold/20 bg-card px-4 py-4">
              <div className="flex gap-4">
                <Thumbnail title={product.title} imageUrl={product.imageUrl} />
                <div className="min-w-0">
                  <p className="font-serif text-2xl text-foreground">{product.title}</p>
                  <p className="type-caption mt-1">{product.categoryName}</p>
                  <p className="type-price mt-2">{formatDh(product.price)}</p>
                  <StockBadge product={product} />
                </div>
              </div>
              <RowActions product={product} onEdit={() => openEdit(product)} onToggle={() => toggle(product)} onAskDelete={() => setConfirm(product)} />
            </article>
          ))
        )}
      </div>

      <div className="mt-4 hidden overflow-x-auto border border-gold/20 md:block">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead className="bg-card">
            <tr className="type-eyebrow text-[0.62rem]">
              <th className="px-4 py-3 font-medium">Piece</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="type-body px-4 py-10">
                  No pieces are in the catalog yet.
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
                    <StockBadge product={product} />
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
            <p className="type-eyebrow">Remove</p>
            <h2 id="delete-product-title" className="mt-3 font-serif text-3xl text-foreground">
              {confirm.title}
            </h2>
            <p className="type-body mt-4">This piece leaves the catalog. A piece already on an order stays.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => remove(confirm)}
                className="type-nav border border-[#E7B4A8] px-4 py-3 text-[#E7B4A8]"
              >
                Delete piece
              </button>
              <button type="button" onClick={() => setConfirm(null)} className="type-nav px-4 py-3 text-foreground/70">
                Keep
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

function StockBadge({ product }: { product: DeskProduct }) {
  const inStock = product.available && product.stock > 0;
  const label = !product.available
    ? product.stock > 0
      ? `Held · ${product.stock}`
      : "Unavailable"
    : product.stock === 0
      ? "Out of stock"
      : `${product.stock} in stock`;
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
  return (
    <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
      <button type="button" onClick={onEdit} className="type-caption border border-gold/30 px-2.5 py-1.5 text-foreground hover:border-gold-bright hover:text-gold-bright">
        Edit
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="type-caption border border-gold/30 px-2.5 py-1.5 text-foreground hover:border-gold-bright hover:text-gold-bright"
      >
        {product.available ? "Hold" : "Release"}
      </button>
      <button type="button" onClick={onAskDelete} className="type-caption border border-gold/30 px-2.5 py-1.5 text-foreground/70 hover:border-gold-bright">
        Delete
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
  onChange: (draft: ProductDraft) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function setField(field: keyof ProductDraft, value: string) {
    onChange({ ...draft, [field]: value });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        onSubmit={onSubmit}
        className="max-h-[90svh] w-full max-w-lg overflow-y-auto border border-gold/30 bg-[#0D0D0D] px-6 py-6"
      >
        <p className="type-eyebrow">{editing ? "Edit" : "New piece"}</p>
        <h2 id="product-form-title" className="mt-3 font-serif text-3xl text-foreground">
          {editing ? draft.title || "Piece" : "Add to the collection"}
        </h2>

        <div className="mt-6 grid gap-4">
          <Field label="Title" value={draft.title} onChange={(value) => setField("title", value)} />
          <label className="block">
            <span className="type-eyebrow">Description</span>
            <textarea
              value={draft.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={4}
              className="mt-2 w-full resize-y border border-gold/30 bg-[#0D0D0D] px-3 py-3 text-sm text-foreground outline-none focus:border-[#E5C158]"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (DH)" value={draft.price} inputMode="numeric" onChange={(value) => setField("price", value)} />
            <Field label="Stock count" value={draft.stock} inputMode="numeric" onChange={(value) => setField("stock", value)} />
          </div>
          <label className="block">
            <span className="type-eyebrow">Category</span>
            <select
              value={draft.category}
              onChange={(event) => setField("category", event.target.value)}
              className="mt-2 w-full border border-gold/30 bg-[#0D0D0D] px-3 py-3 text-sm text-foreground outline-none [color-scheme:dark] focus:border-[#E5C158]"
            >
              {deskCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Image URL" value={draft.imageUrl} onChange={(value) => setField("imageUrl", value)} />
          <Thumbnail title={draft.title || "Piece"} imageUrl={draft.imageUrl.trim()} large />
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
            {busy ? "Saving" : editing ? "Save piece" : "Add product"}
          </button>
          <button type="button" onClick={onClose} className="type-nav px-4 py-3 text-foreground/70">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="block">
      <span className="type-eyebrow">{label}</span>
      <input
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-gold/30 bg-[#0D0D0D] px-3 py-3 text-sm text-foreground outline-none focus:border-[#E5C158]"
      />
    </label>
  );
}
