import type { Locale } from "@/lib/locale";

export type LegalDocument = {
  eyebrow: string;
  title: string;
  lead: string;
  sections: { heading: string; body: string }[];
};

const documents: Record<Locale, { terms: LegalDocument; usage: LegalDocument; about: LegalDocument; contact: LegalDocument }> = {
  en: {
    terms: {
      eyebrow: "The maison",
      title: "Terms of use",
      lead: "These terms cover orders placed on Lux Makeup. Prices are in Moroccan dirhams, and payment is cash on delivery.",
      sections: [
        {
          heading: "The house",
          body: "Lux Makeup sells makeup, perfume, and skin care through this site to customers in Morocco. Using the site to place an order means these terms apply.",
        },
        {
          heading: "Prices",
          body: "Each price is a whole amount in Moroccan dirhams (DH). When a piece shows a lower offer, that offer is the amount due for the piece.",
        },
        {
          heading: "Orders",
          body: "An order is a request for cash on delivery. An advisor confirms it before the piece leaves the atelier. Lux Makeup may decline an order it cannot prepare.",
        },
        {
          heading: "Delivery",
          body: "The customer gives a name, phone number, Moroccan city, and address. The delivery amount is the one shown for that city before the order is sent. The customer pays the courier in cash.",
        },
        {
          heading: "Pieces",
          body: "Photographs and shade names are a guide. A screen does not reproduce pigment exactly. Ingredients and benefits describe the formula and are not a medical claim.",
        },
        {
          heading: "Coupons",
          body: "A code applies only when the site accepts it, and only on the conditions shown at that moment.",
        },
      ],
    },
    usage: {
      eyebrow: "The maison",
      title: "Usage policy",
      lead: "The site is for choosing and ordering pieces. This policy explains the ordinary use of the house.",
      sections: [
        {
          heading: "Personal use",
          body: "Browse and order for yourself. Do not scrape the catalog, harvest photographs, or send automated orders.",
        },
        {
          heading: "The bag",
          body: "The shopping bag stays in this browser. It is not an account, and it is not shared with another device.",
        },
        {
          heading: "Language and appearance",
          body: "The site remembers the chosen language and the light or dark mode in cookies on this browser.",
        },
        {
          heading: "Delivery details",
          body: "The name, phone, city, and address must be your own and clear enough for the courier to arrive.",
        },
        {
          heading: "Forms and coupons",
          body: "Do not send repeated false orders, and do not pass a private code around in order to abuse it.",
        },
        {
          heading: "Care",
          body: "Descriptions and benefits describe the formula. They do not replace a physician, and a piece is not a medicine. Some photographs are studio images; the piece you receive is the one named on the page.",
        },
      ],
    },
    about: {
      eyebrow: "The maison",
      title: "About",
      lead: "Lux Makeup is a Moroccan house of makeup, perfume, and skin care. The room stays dark so gold, pigment, and skin can speak.",
      sections: [
        {
          heading: "The house",
          body: "We finish a face the way a perfumer finishes a formula: one precise note at a time. Each piece is composed for a private clientele and priced in Moroccan dirhams.",
        },
        {
          heading: "The edit",
          body: "The collection is makeup, parfum, and skin care. A piece can be held, offered, or prepared to order. What you see on the page is what the atelier can send.",
        },
        {
          heading: "An order",
          body: "There is no account. You choose a piece, and an advisor confirms it before it leaves. You pay the courier in cash.",
        },
      ],
    },
    contact: {
      eyebrow: "The maison",
      title: "Contact",
      lead: "Write to the atelier on WhatsApp or by email. An order placed on a piece also reaches us.",
      sections: [
        {
          heading: "Orders",
          body: "Choose the piece, then send the cash-on-delivery request with your name, phone, Moroccan city, and address. The advisor confirms it before the piece leaves.",
        },
        {
          heading: "Delivery",
          body: "The delivery amount is the one shown for your city. You pay the courier in cash when the piece arrives.",
        },
      ],
    },
  },
  fr: {
    terms: {
      eyebrow: "La maison",
      title: "Conditions d'utilisation",
      lead: "Ces conditions couvrent les commandes passées chez Lux Makeup. Les prix sont en dirhams marocains, et le paiement se fait à la livraison.",
      sections: [
        {
          heading: "La maison",
          body: "Lux Makeup vend le maquillage, le parfum et le soin par ce site à des clients au Maroc. Passer une commande, c'est accepter ces conditions.",
        },
        {
          heading: "Prix",
          body: "Chaque prix est un montant entier en dirhams marocains (DH). Lorsqu'une pièce affiche une offre, cette offre est le montant dû pour la pièce.",
        },
        {
          heading: "Commandes",
          body: "Une commande est une demande de paiement à la livraison. Un conseiller la confirme avant que la pièce ne quitte l'atelier. Lux Makeup peut refuser une commande qu'elle ne peut pas préparer.",
        },
        {
          heading: "Livraison",
          body: "Le client indique un nom, un téléphone, une ville marocaine et une adresse. Le montant de la livraison est celui affiché pour cette ville avant l'envoi. Le client paie le livreur en espèces.",
        },
        {
          heading: "Pièces",
          body: "Les photographies et les noms de teinte sont un guide. Un écran ne reproduit pas exactement le pigment. Les ingrédients et les bienfaits décrivent la formule et ne constituent pas un avis médical.",
        },
        {
          heading: "Coupons",
          body: "Un code s'applique seulement lorsque le site l'accepte, et seulement aux conditions affichées à ce moment.",
        },
      ],
    },
    usage: {
      eyebrow: "La maison",
      title: "Politique d'utilisation",
      lead: "Le site sert à choisir et à commander des pièces. Cette politique décrit l'usage ordinaire de la maison.",
      sections: [
        {
          heading: "Usage personnel",
          body: "Parcourez et commandez pour vous-même. N'extrayez pas le catalogue, ne récupérez pas les photographies et n'envoyez pas de commandes automatiques.",
        },
        {
          heading: "Le panier",
          body: "Le panier reste dans ce navigateur. Ce n'est pas un compte, et il n'est pas partagé avec un autre appareil.",
        },
        {
          heading: "Langue et apparence",
          body: "Le site retient la langue choisie et le mode clair ou sombre dans des cookies sur ce navigateur.",
        },
        {
          heading: "Livraison",
          body: "Le nom, le téléphone, la ville et l'adresse doivent être les vôtres et assez clairs pour que le livreur arrive.",
        },
        {
          heading: "Formulaires et coupons",
          body: "N'envoyez pas de fausses commandes répétées, et ne faites pas circuler un code privé pour en abuser.",
        },
        {
          heading: "Soin",
          body: "Les descriptions et les bienfaits décrivent la formule. Ils ne remplacent pas un médecin, et une pièce n'est pas un médicament. Certaines photographies sont des images de studio ; la pièce reçue est celle nommée sur la page.",
        },
      ],
    },
    about: {
      eyebrow: "La maison",
      title: "À propos",
      lead: "Lux Makeup est une maison marocaine de maquillage, de parfum et de soin. La pièce reste sombre pour que l'or, le pigment et la peau parlent.",
      sections: [
        {
          heading: "La maison",
          body: "Nous finissons un visage comme un parfumeur finit une formule : une note précise à la fois. Chaque pièce est composée pour une clientèle privée, et les prix sont en dirhams marocains.",
        },
        {
          heading: "La sélection",
          body: "La collection réunit le maquillage, le parfum et le soin. Une pièce peut être retenue, proposée, ou préparée à la commande. Ce que la page montre est ce que l'atelier peut envoyer.",
        },
        {
          heading: "Une commande",
          body: "Pas de compte. Vous choisissez une pièce, et un conseiller la confirme avant qu'elle ne parte. Vous payez le livreur en espèces.",
        },
      ],
    },
    contact: {
      eyebrow: "La maison",
      title: "Contact",
      lead: "Écrivez à l'atelier sur WhatsApp ou par email. Une commande passée sur une pièce nous parvient aussi.",
      sections: [
        {
          heading: "Commandes",
          body: "Choisissez la pièce, puis envoyez la demande de paiement à la livraison avec votre nom, téléphone, ville marocaine et adresse. Le conseiller confirme avant le départ.",
        },
        {
          heading: "Livraison",
          body: "Le montant de la livraison est celui affiché pour votre ville. Vous payez le livreur en espèces à l'arrivée.",
        },
      ],
    },
  },
  ar: {
    terms: {
      eyebrow: "الدار",
      title: "شروط الاستخدام",
      lead: "هذه الشروط تخص الطلبات عبر لوكس ميكاب. الأسعار بالدرهم المغربي، والدفع عند الاستلام.",
      sections: [
        {
          heading: "الدار",
          body: "تبيع لوكس ميكاب المكياج والعطر والعناية عبر هذا الموقع لزبائن في المغرب. إرسال طلب يعني أن هذه الشروط تسري.",
        },
        {
          heading: "الأسعار",
          body: "كل سعر مبلغ كامل بالدرهم المغربي. إذا ظهرت للقطعة عرض، فالمبلغ المستحق هو سعر العرض.",
        },
        {
          heading: "الطلبات",
          body: "الطلب طلب دفع عند الاستلام. يؤكده المستشار قبل أن تغادر القطعة المشغل. يجوز للدار رفض طلب لا تستطيع تجهيزه.",
        },
        {
          heading: "التوصيل",
          body: "يذكر الزبون الاسم والهاتف ومدينة مغربية والعنوان. مبلغ التوصيل هو المبلغ الظاهر لتلك المدينة قبل إرسال الطلب. يدفع الزبون للمندوب نقدًا.",
        },
        {
          heading: "القطع",
          body: "الصور وأسماء الدرجات دليل. الشاشة لا تنقل الصبغة كما هي. المكوّنات والفوائد تصف التركيبة وليست ادعاءً طبيًا.",
        },
        {
          heading: "القسائم",
          body: "يسري الكود فقط إذا قبله الموقع، وبالشروط الظاهرة في تلك اللحظة.",
        },
      ],
    },
    usage: {
      eyebrow: "الدار",
      title: "سياسة الاستخدام",
      lead: "الموقع لاختيار القطع وطلبها. هذه السياسة تشرح الاستعمال العادي للدار.",
      sections: [
        {
          heading: "استعمال شخصي",
          body: "تصفّحوا واطلبوا لأنفسكم. لا تنسخوا الكتالوج ولا تجمعوا الصور ولا ترسلوا طلبات آلية.",
        },
        {
          heading: "السلة",
          body: "تبقى السلة في هذا المتصفح. ليست حسابًا، ولا تنتقل إلى جهاز آخر.",
        },
        {
          heading: "اللغة والمظهر",
          body: "يحفظ الموقع اللغة المختارة والوضع المضيء أو المظلم في ملفات تعريف على هذا المتصفح.",
        },
        {
          heading: "بيانات التوصيل",
          body: "الاسم والهاتف والمدينة والعنوان يجب أن تكون لكم، وواضحة بما يكفي ليصل المندوب.",
        },
        {
          heading: "النماذج والقسائم",
          body: "لا ترسلوا طلبات كاذبة متكررة، ولا تتداولوا كودًا خاصًا بقصد إساءة استعماله.",
        },
        {
          heading: "العناية",
          body: "الوصف والفوائد يصفان التركيبة. لا يغنيان عن الطبيب، والقطعة ليست دواء. بعض الصور صور استوديو، والقطعة التي تصل هي القطعة المسماة في الصفحة.",
        },
      ],
    },
    about: {
      eyebrow: "الدار",
      title: "حول",
      lead: "لوكس ميكاب دار مغربية للمكياج والعطر والعناية. تبقى الغرفة معتمة ليصمت المكان ويتكلم الذهب والصبغة والجلد.",
      sections: [
        {
          heading: "الدار",
          body: "نُكمل الوجه كما يُكمل العطّار تركيبته: نغمة دقيقة في كل مرة. كل قطعة تُصاغ لزبائن خاصين، والأسعار بالدرهم المغربي.",
        },
        {
          heading: "المجموعة",
          body: "المجموعة مكياج وعطر وعناية. قد تُحجز قطعة أو تُعرض أو تُجهَّز عند الطلب. ما يظهر في الصفحة هو ما يستطيع المشغل إرساله.",
        },
        {
          heading: "الطلب",
          body: "بلا حساب. تختارون القطعة، ويؤكدها المستشار قبل أن تغادر. تدفعون للمندوب نقدًا.",
        },
      ],
    },
    contact: {
      eyebrow: "الدار",
      title: "اتصل بنا",
      lead: "اكتبوا للمشغل على واتساب أو بالبريد. الطلب الذي يُرسل من صفحة القطعة يصل إلينا أيضًا.",
      sections: [
        {
          heading: "الطلبات",
          body: "اختاروا القطعة، ثم أرسلوا طلب الدفع عند الاستلام بالاسم والهاتف ومدينة مغربية والعنوان. يؤكد المستشار الطلب قبل المغادرة.",
        },
        {
          heading: "التوصيل",
          body: "مبلغ التوصيل هو المبلغ الظاهر لمدينتكم. تدفعون للمندوب نقدًا عند الوصول.",
        },
      ],
    },
  },
};

export function legalDocument(locale: Locale, page: "terms" | "usage" | "about" | "contact") {
  return documents[locale][page];
}
