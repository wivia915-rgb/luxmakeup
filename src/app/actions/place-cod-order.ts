"use server";

import { deliveryFee, resolveCity, validateCod } from "@/lib/cod";
import { getStoreSettings } from "@/lib/store-settings";
import { formatDh } from "@/lib/products";
import { getProductPage } from "@/lib/product-story";
import { prisma } from "@/lib/prisma";

export type PlaceCodOrderInput = {
  productId: string;
  shadeId: string;
  quantity: number;
  name: string;
  phone: string;
  city: string;
  address: string;
};

export type PlaceCodOrderResult =
  | { ok: true; orderId: string; whatsappUrl: string; webhookSent: boolean }
  | { ok: false; error: string };

export async function placeCodOrder(input: PlaceCodOrderInput): Promise<PlaceCodOrderResult> {
  const ownerPhone = shopWhatsAppPhone();
  if (!ownerPhone) {
    return { ok: false, error: "The shop WhatsApp number is not configured yet." };
  }

  const product = getProductPage(input.productId);
  if (!product) {
    return { ok: false, error: "This piece is no longer available." };
  }

  const shade = product.shades.find((item) => item.id === input.shadeId);
  if (!shade) {
    return { ok: false, error: "Choose a shade before ordering." };
  }

  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 8) {
    return { ok: false, error: "Choose a quantity between 1 and 8." };
  }

  const customer = validateCod({
    name: input.name,
    phone: input.phone,
    city: input.city,
    address: input.address,
  });
  if (!customer.valid || customer.delivery === null) {
    const message = customer.errors.name ?? customer.errors.phone ?? customer.errors.city ?? customer.errors.address;
    return { ok: false, error: message ?? "Check the delivery details." };
  }

  const city = resolveCity(input.city);
  if (!city) {
    return { ok: false, error: "Choose a city from the list." };
  }

  const merchandiseDh = product.price * input.quantity;
  const settings = await getStoreSettings();
  const deliveryDh = deliveryFee(city, merchandiseDh, settings.freeShippingThreshold) ?? customer.delivery;
  const totalDh = merchandiseDh + deliveryDh;

  let orderId: string;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const categorySlug = product.category.toLowerCase().replace(/\s+/g, "-");
      const category = await tx.category.upsert({
        where: { slug: categorySlug },
        update: { name: product.category },
        create: { name: product.category, slug: categorySlug },
      });

      const savedProduct = await tx.product.upsert({
        where: { slug: product.id },
        update: {
          title: product.name,
          price: product.price,
          ingredients: product.ingredients.map((item) => item.name),
        },
        create: {
          title: product.name,
          slug: product.id,
          price: product.price,
          categoryId: category.id,
          ingredients: product.ingredients.map((item) => item.name),
          images: [],
          stock: 99,
          featured: false,
        },
      });

      if (savedProduct.stock < input.quantity) {
        throw new Error("OUT_OF_STOCK");
      }

      await tx.product.update({
        where: { id: savedProduct.id },
        data: { stock: { decrement: input.quantity } },
      });

      return tx.order.create({
        data: {
          customerName: input.name.trim(),
          phone: input.phone.trim(),
          city,
          address: input.address.trim(),
          totalAmount: totalDh,
          status: "PENDING",
          items: {
            create: {
              productId: savedProduct.id,
              title: product.name,
              shadeName: shade.name,
              quantity: input.quantity,
              unitPrice: product.price,
            },
          },
        },
        select: { id: true },
      });
    });
    orderId = order.id;
  } catch (error) {
    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return { ok: false, error: "This piece is out of stock." };
    }
    console.error("COD order was not saved", error instanceof Error ? error.name : "unknown");
    return { ok: false, error: "The order could not be saved. Try again in a moment." };
  }

  const breakdown = {
    orderId,
    productName: product.name,
    shade: shade.name,
    quantity: input.quantity,
    merchandiseDh,
    deliveryDh,
    totalDh,
    currency: "MAD",
    customer: {
      name: input.name.trim(),
      phone: input.phone.trim(),
      city,
      address: input.address.trim(),
    },
  };

  const whatsappUrl = whatsAppOrderLink(ownerPhone, breakdown);
  const webhookSent = await sendCodWebhook({ ...breakdown, whatsappUrl });

  return { ok: true, orderId, whatsappUrl, webhookSent };
}

function shopWhatsAppPhone() {
  const digits = process.env.LUX_OWNER_WHATSAPP?.replace(/\D/g, "") ?? "";
  if (!/^\d{8,15}$/.test(digits)) return null;
  return digits;
}

function whatsAppOrderLink(
  phone: string,
  order: {
    orderId: string;
    productName: string;
    shade: string;
    quantity: number;
    merchandiseDh: number;
    deliveryDh: number;
    totalDh: number;
    customer: { name: string; phone: string; city: string; address: string };
  },
) {
  const delivery = order.deliveryDh === 0 ? "Free" : formatDh(order.deliveryDh);
  const text = [
    "Lux Makeup COD order",
    "",
    `Product: ${order.productName}`,
    `Shade: ${order.shade}`,
    `Quantity: ${order.quantity}`,
    `Pieces: ${formatDh(order.merchandiseDh)}`,
    `Delivery: ${delivery}`,
    `Total: ${formatDh(order.totalDh)}`,
    "",
    `Customer: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `City: ${order.customer.city}`,
    `Address: ${order.customer.address}`,
    "",
    `Order: ${order.orderId}`,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

async function sendCodWebhook(payload: Record<string, unknown>) {
  const url = process.env.COD_WEBHOOK_URL;
  if (!url) return false;

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (process.env.COD_WEBHOOK_SECRET) {
    headers.authorization = `Bearer ${process.env.COD_WEBHOOK_SECRET}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ event: "cod.order.created", ...payload }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error(`COD webhook failed for order ${String(payload.orderId)} with status ${response.status}`);
    }
    return response.ok;
  } catch (error) {
    console.error(`COD webhook failed for order ${String(payload.orderId)}`, error instanceof Error ? error.name : "unknown");
    return false;
  }
}
