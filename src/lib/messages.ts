import type { Category, Mood } from "@/lib/products";
import type { Locale } from "@/lib/locale";

export type Dictionary = {
  language: string;
  announcement: string;
  nav: { makeup: string; parfums: string; skin: string; maison: string };
  search: string;
  bag: string;
  openMenu: string;
  closeMenu: string;
  skip: string;
  hero: { eyebrow: string; line1: string; line2: string; line3: string; cta: string; turn: string };
  product: {
    collection: string;
    shade: string;
    quantity: string;
    decrease: string;
    increase: string;
    order: string;
    orderNote: string;
    formula: string;
    ingredients: string;
  };
  checkout: {
    eyebrow: string;
    title: string;
    lead: string;
    close: string;
    closeLabel: string;
    placed: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    namePlaceholder: string;
    cityPlaceholder: string;
    addressPlaceholder: string;
    noCity: string;
    free: string;
    freeFes: string;
    chooseCity: string;
    pieces: string;
    delivery: string;
    toPay: string;
    sending: string;
    submit: string;
    submitIdle: string;
    nameError: string;
    phoneError: string;
    cityError: string;
    addressError: string;
    server: Record<string, string>;
  };
  catalog: {
    eyebrow: string;
    title: string;
    lead: string;
    categories: string;
    moods: string;
    allLooks: string;
    onePiece: string;
    manyPieces: string;
    emptyTitle: string;
    emptyBody: string;
    showAll: string;
    offer: string;
    quickOrder: string;
    view: string;
  };
  category: Record<Category, string>;
  mood: Record<Mood, string>;
  maisonEyebrow: string;
  maisonQuote: string;
  maisonBody: string;
  footer: string;
  badges: Record<string, string>;
  descriptions: Record<string, string>;
};

const badgesEn = {
  "Lip lacquer": "Lip lacquer",
  "Eye liner": "Eye liner",
  "Skin tint": "Skin tint",
  Cheek: "Cheek",
  Palette: "Palette",
  Extrait: "Extrait",
  "Eau de parfum": "Eau de parfum",
  "Eau fraîche": "Eau fraîche",
  Serum: "Serum",
  Mist: "Mist",
  "Night balm": "Night balm",
  Illuminator: "Illuminator",
};

export const messages: Record<Locale, Dictionary> = {
  en: {
    language: "Language",
    announcement: "Private clientele · Complimentary engraving on parfum",
    nav: { makeup: "Makeup", parfums: "Parfums", skin: "Skin Care", maison: "Maison" },
    search: "Search the maison",
    bag: "Shopping bag, empty",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    skip: "Skip to content",
    hero: {
      eyebrow: "Maison de beauté",
      line1: "Redefine",
      line2: "Elegance",
      line3: "with Lux Makeup",
      cta: "Explore Collection",
      turn: "Turn the bottle",
    },
    product: {
      collection: "Collection",
      shade: "Shade",
      quantity: "Quantity",
      decrease: "Decrease quantity",
      increase: "Increase quantity",
      order: "Instant Order (COD)",
      orderNote: "Cash on delivery. An advisor confirms the piece before it leaves the atelier.",
      formula: "Formula",
      ingredients: "Key Ingredients & Benefits",
    },
    checkout: {
      eyebrow: "Cash on delivery",
      title: "Instant Order (COD)",
      lead: "No account. One step, pay the courier.",
      close: "Close",
      closeLabel: "Close cash on delivery",
      placed: "Order placed for {name}. Pay {total} in cash when it arrives in {city}.",
      fullName: "Full name",
      phone: "Phone number",
      city: "Moroccan city",
      address: "Shipping address",
      namePlaceholder: "Amina El Fassi",
      cityPlaceholder: "Fès, Casablanca, Rabat…",
      addressPlaceholder: "12 Rue Talaa Kebira, Médina",
      noCity: "No matching city",
      free: "Free",
      freeFes: "Free in Fès",
      chooseCity: "Choose a city",
      pieces: "Pieces",
      delivery: "Delivery",
      toPay: "To pay",
      sending: "Sending order",
      submit: "Order · {total} COD",
      submitIdle: "Order · pay on delivery",
      nameError: "Enter your full name.",
      phoneError: "Use a Moroccan mobile number, like 06 12 34 56 78.",
      cityError: "Choose a city from the list.",
      addressError: "Add a street and neighbourhood.",
      server: {
        "The shop WhatsApp number is not configured yet.": "The shop WhatsApp number is not configured yet.",
        "This piece is no longer available.": "This piece is no longer available.",
        "Choose a shade before ordering.": "Choose a shade before ordering.",
        "Choose a quantity between 1 and 8.": "Choose a quantity between 1 and 8.",
        "Check the delivery details.": "Check the delivery details.",
        "Choose a city from the list.": "Choose a city from the list.",
        "This piece is out of stock.": "This piece is out of stock.",
        "The order could not be saved. Try again in a moment.": "The order could not be saved. Try again in a moment.",
      },
    },
    catalog: {
      eyebrow: "The collection",
      title: "Shop the maison",
      lead: "Makeup, parfum, and skin care. Prices in Moroccan dirhams (DH).",
      categories: "Categories",
      moods: "Shop by Look / Mood",
      allLooks: "All looks",
      onePiece: "1 piece",
      manyPieces: "{count} pieces",
      emptyTitle: "Nothing in this edit",
      emptyBody: "The maison has no piece in this pairing yet.",
      showAll: "Show the full collection",
      offer: "Offer",
      quickOrder: "Quick Order",
      view: "View {name}",
    },
    category: {
      All: "All",
      Makeup: "Makeup",
      Parfums: "Parfums",
      "Skin Care": "Skin Care",
      "Special Offers": "Special Offers",
    },
    mood: {
      All: "All",
      "Glam Evening": "Glam Evening",
      "Natural Glow": "Natural Glow",
      "Hydration Boost": "Hydration Boost",
    },
    maisonEyebrow: "The maison",
    maisonQuote: "We finish the face the way a perfumer finishes a formula — one precise note at a time.",
    maisonBody:
      "Lux Makeup is an ultra-high-end house of complexion, fragrance, and color. The room stays dark so gold, pigment, and skin can speak.",
    footer: "Makeup, perfume, and beauty. Composed in a dark atelier.",
    badges: badgesEn,
    descriptions: {},
  },
  fr: {
    language: "Langue",
    announcement: "Clientèle privée · Gravure offerte sur le parfum",
    nav: { makeup: "Maquillage", parfums: "Parfums", skin: "Soin", maison: "Maison" },
    search: "Rechercher dans la maison",
    bag: "Panier, vide",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    skip: "Aller au contenu",
    hero: {
      eyebrow: "Maison de beauté",
      line1: "Redéfinir",
      line2: "l'élégance",
      line3: "avec Lux Makeup",
      cta: "Explorer la collection",
      turn: "Tourner le flacon",
    },
    product: {
      collection: "Collection",
      shade: "Teinte",
      quantity: "Quantité",
      decrease: "Diminuer la quantité",
      increase: "Augmenter la quantité",
      order: "Commander (paiement à la livraison)",
      orderNote: "Paiement à la livraison. Un conseiller confirme la pièce avant qu'elle ne quitte l'atelier.",
      formula: "Formule",
      ingredients: "Ingrédients et bienfaits",
    },
    checkout: {
      eyebrow: "Paiement à la livraison",
      title: "Commande immédiate",
      lead: "Sans compte. Une étape, vous payez le livreur.",
      close: "Fermer",
      closeLabel: "Fermer la commande",
      placed: "Commande passée pour {name}. Payez {total} en espèces à l'arrivée à {city}.",
      fullName: "Nom complet",
      phone: "Téléphone",
      city: "Ville marocaine",
      address: "Adresse de livraison",
      namePlaceholder: "Amina El Fassi",
      cityPlaceholder: "Fès, Casablanca, Rabat…",
      addressPlaceholder: "12 Rue Talaa Kebira, Médina",
      noCity: "Aucune ville correspondante",
      free: "Offerte",
      freeFes: "Offerte à Fès",
      chooseCity: "Choisissez une ville",
      pieces: "Pièces",
      delivery: "Livraison",
      toPay: "À payer",
      sending: "Envoi de la commande",
      submit: "Commander · {total}",
      submitIdle: "Commander · paiement à la livraison",
      nameError: "Indiquez votre nom complet.",
      phoneError: "Utilisez un mobile marocain, comme 06 12 34 56 78.",
      cityError: "Choisissez une ville dans la liste.",
      addressError: "Ajoutez une rue et un quartier.",
      server: {
        "The shop WhatsApp number is not configured yet.": "Le numéro WhatsApp de la maison n'est pas encore configuré.",
        "This piece is no longer available.": "Cette pièce n'est plus disponible.",
        "Choose a shade before ordering.": "Choisissez une teinte avant de commander.",
        "Choose a quantity between 1 and 8.": "Choisissez une quantité entre 1 et 8.",
        "Check the delivery details.": "Vérifiez les détails de livraison.",
        "Choose a city from the list.": "Choisissez une ville dans la liste.",
        "This piece is out of stock.": "Cette pièce est en rupture.",
        "The order could not be saved. Try again in a moment.": "La commande n'a pas pu être enregistrée. Réessayez dans un instant.",
      },
    },
    catalog: {
      eyebrow: "La collection",
      title: "La maison",
      lead: "Maquillage, parfum et soin. Prix en dirhams marocains (DH).",
      categories: "Catégories",
      moods: "Selon l'allure",
      allLooks: "Toutes les allures",
      onePiece: "1 pièce",
      manyPieces: "{count} pièces",
      emptyTitle: "Rien dans cette sélection",
      emptyBody: "La maison n'a pas encore de pièce pour cet accord.",
      showAll: "Voir toute la collection",
      offer: "Offre",
      quickOrder: "Commander",
      view: "Voir {name}",
    },
    category: {
      All: "Tout",
      Makeup: "Maquillage",
      Parfums: "Parfums",
      "Skin Care": "Soin",
      "Special Offers": "Offres",
    },
    mood: {
      All: "Tout",
      "Glam Evening": "Soirée",
      "Natural Glow": "Éclat naturel",
      "Hydration Boost": "Hydratation",
    },
    maisonEyebrow: "La maison",
    maisonQuote: "Nous finissons le visage comme un parfumeur finit une formule — une note précise à la fois.",
    maisonBody:
      "Lux Makeup est une maison de teint, de parfum et de couleur. La pièce reste sombre pour que l'or, le pigment et la peau parlent.",
    footer: "Maquillage, parfum et beauté. Composé dans un atelier sombre.",
    badges: {
      "Lip lacquer": "Laque lèvres",
      "Eye liner": "Eye-liner",
      "Skin tint": "Teint voile",
      Cheek: "Joue",
      Palette: "Palette",
      Extrait: "Extrait",
      "Eau de parfum": "Eau de parfum",
      "Eau fraîche": "Eau fraîche",
      Serum: "Sérum",
      Mist: "Brume",
      "Night balm": "Baume de nuit",
      Illuminator: "Illuminateur",
    },
    descriptions: {
      "atelier-rouge": "Un rouge peu brillant, lourd comme une laque. Un trait, puis plus rien.",
      "noir-ligne": "Un trait noir précis, graphique du crépuscule jusqu'à la dernière lumière.",
      veil: "Un voile de teint sans poids. Léger sur la joue, silencieux en photo.",
      "peche-satin": "Une pêche satin qui se lit comme une chaleur, avec un coussin d'humidité.",
      "or-de-soir": "Quatre métaux du soir. L'or là où la lumière doit se prendre, et nulle part ailleurs.",
      nocturne: "Des floraux résineux, portés près du pouls. La nuit, sans douceur.",
      blanche: "Des fleurs blanches lavées jusqu'à la transparence. Un sillage propre, sur la peau.",
      oree: "Zeste d'agrume et nénuphar. Une brume fraîche, comme du verre froid.",
      "lait-dor": "Un sérum teinté d'or qui pénètre vite et laisse la peau lucide.",
      rosee: "Une rosée fine de glycérine et de néroli. Le maquillage s'y pose comme sur une peau reposée.",
      "baume-nuit": "Un baume de nuit discret. Au matin, le visage paraît reposé, pas couvert.",
      "eclat-noir": "Un enlumineur liquide pour la joue et la paupière. La lumière du soir, en flacon.",
    },
  },
  ar: {
    language: "اللغة",
    announcement: "لزبائن الدار · نقش مجاني على العطر",
    nav: { makeup: "مكياج", parfums: "عطور", skin: "عناية", maison: "الدار" },
    search: "ابحث في الدار",
    bag: "الحقيبة فارغة",
    openMenu: "افتح القائمة",
    closeMenu: "أغلق القائمة",
    skip: "تخطي إلى المحتوى",
    hero: {
      eyebrow: "دار الجمال",
      line1: "صياغة",
      line2: "الأناقة",
      line3: "مع لوكس ميكاب",
      cta: "استكشف المجموعة",
      turn: "أدر القنينة",
    },
    product: {
      collection: "المجموعة",
      shade: "الدرجة",
      quantity: "الكمية",
      decrease: "إنقاص الكمية",
      increase: "زيادة الكمية",
      order: "اطلب الآن (الدفع عند الاستلام)",
      orderNote: "الدفع عند الاستلام. يؤكد المستشار القطعة قبل أن تغادر الدار.",
      formula: "التركيبة",
      ingredients: "المكوّنات والفوائد",
    },
    checkout: {
      eyebrow: "الدفع عند الاستلام",
      title: "طلب فوري",
      lead: "بلا حساب. خطوة واحدة، والدفع للمندوب.",
      close: "إغلاق",
      closeLabel: "إغلاق الطلب",
      placed: "تم تسجيل طلب {name}. ادفعوا {total} نقدًا عند الوصول إلى {city}.",
      fullName: "الاسم الكامل",
      phone: "رقم الهاتف",
      city: "مدينة مغربية",
      address: "عنوان التوصيل",
      namePlaceholder: "أمينة الفاسي",
      cityPlaceholder: "فاس، الدار البيضاء، الرباط…",
      addressPlaceholder: "12 زنقة الطالعة الكبيرة، المدينة",
      noCity: "لا مدينة مطابقة",
      free: "مجاني",
      freeFes: "مجاني في فاس",
      chooseCity: "اختاروا مدينة",
      pieces: "القطع",
      delivery: "التوصيل",
      toPay: "للدفع",
      sending: "جارٍ إرسال الطلب",
      submit: "اطلب · {total}",
      submitIdle: "اطلب · الدفع عند الاستلام",
      nameError: "أدخلوا الاسم الكامل.",
      phoneError: "استعملوا رقمًا مغربيًا، مثل 06 12 34 56 78.",
      cityError: "اختاروا مدينة من القائمة.",
      addressError: "أضيفوا الزنقة والحي.",
      server: {
        "The shop WhatsApp number is not configured yet.": "رقم واتساب الدار غير مُعد بعد.",
        "This piece is no longer available.": "هذه القطعة لم تعد متاحة.",
        "Choose a shade before ordering.": "اختاروا درجة قبل الطلب.",
        "Choose a quantity between 1 and 8.": "اختاروا كمية بين 1 و 8.",
        "Check the delivery details.": "راجعوا تفاصيل التوصيل.",
        "Choose a city from the list.": "اختاروا مدينة من القائمة.",
        "This piece is out of stock.": "نفد مخزون هذه القطعة.",
        "The order could not be saved. Try again in a moment.": "تعذّر حفظ الطلب. أعيدوا المحاولة بعد لحظة.",
      },
    },
    catalog: {
      eyebrow: "المجموعة",
      title: "تسوّق الدار",
      lead: "مكياج وعطر وعناية. الأسعار بالدرهم المغربي.",
      categories: "الأقسام",
      moods: "حسب الإطلالة",
      allLooks: "كل الإطلالات",
      onePiece: "قطعة واحدة",
      manyPieces: "{count} قطع",
      emptyTitle: "لا شيء في هذا الاختيار",
      emptyBody: "ليس في الدار بعد قطعة لهذا المزيج.",
      showAll: "اعرض المجموعة كاملة",
      offer: "عرض",
      quickOrder: "اطلب الآن",
      view: "عرض {name}",
    },
    category: {
      All: "الكل",
      Makeup: "مكياج",
      Parfums: "عطور",
      "Skin Care": "عناية",
      "Special Offers": "عروض",
    },
    mood: {
      All: "الكل",
      "Glam Evening": "سهرة",
      "Natural Glow": "إشراق طبيعي",
      "Hydration Boost": "ترطيب",
    },
    maisonEyebrow: "الدار",
    maisonQuote: "نُكمل الوجه كما يُكمل العطّار تركيبته — نغمة دقيقة في كل مرة.",
    maisonBody: "لوكس ميكاب دار للبشرة والعطر واللون. تبقى الغرفة معتمة ليصمت المكان ويتكلم الذهب والصبغة والجلد.",
    footer: "مكياج وعطر وجمال. يُصاغ في مشغل مظلم.",
    badges: {
      "Lip lacquer": "طلاء شفاه",
      "Eye liner": "كحل سائل",
      "Skin tint": "حجاب بشرة",
      Cheek: "خد",
      Palette: "لوحة",
      Extrait: "خلاصة عطر",
      "Eau de parfum": "أو دو بارفان",
      "Eau fraîche": "أو فريش",
      Serum: "سيروم",
      Mist: "رذاذ",
      "Night balm": "بلسم ليلي",
      Illuminator: "إضاءة",
    },
    descriptions: {
      "atelier-rouge": "أحمر خافت اللمعان، بثقل الطلاء. لمسة واحدة، ثم لا شيء بعدها.",
      "noir-ligne": "خط أسود دقيق يبقى رسماً من الغسق حتى آخر ضوء.",
      veil: "حجاب بشرة بلا وزن. خفيف على الخد، صامت في الصورة.",
      "peche-satin": "خوخي ساتان يُقرأ دفئاً، وتحته وسادة من الرطوبة.",
      "or-de-soir": "أربعة معادن للمساء. الذهب حيث يجب أن يلتقط الضوء، ولا مكان سواه.",
      nocturne: "زهور راتنجية تُلبس قرب النبض. ليل بلا حلاوة.",
      blanche: "زهور بيضاء مغسولة حتى الشفافية. أثر نظيف يبقى على الجلد.",
      oree: "قشر حمضيات وزنبق الماء. رذاذ بارد كزجاج مبلل.",
      "lait-dor": "سيروم مذهّب يُشرب سريعاً ويترك البشرة صافية.",
      rosee: "ندى رقيق من الغليسرين والنيرولي. يستقر المكياج عليه كأنه على بشرة مرتاحة.",
      "baume-nuit": "بلسم ليلي هادئ. في الصباح يبدو الوجه مرتاحاً، لا مغطى.",
      "eclat-noir": "إضاءة سائلة للخد والجفن. ضوء المساء، في علبة.",
    },
  },
};

export function pieceCount(copy: Dictionary["catalog"], count: number) {
  if (count === 1) return copy.onePiece;
  return copy.manyPieces.replace("{count}", String(count));
}
