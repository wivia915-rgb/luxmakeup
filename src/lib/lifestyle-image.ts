export type LifestylePerson = "woman" | "man";

const personFocus: Record<LifestylePerson, string> = {
  woman: "a woman",
  man: "a man",
};

export function lifestylePrompt(person: LifestylePerson, scene: string) {
  const context = scene.trim().replace(/[.。]+$/u, "") || "a quiet luxury interior, the person holding the product toward the camera";
  return [
    "Use the product in the reference image exactly: same container, same label, same colors, and same shape.",
    "Do not redesign or replace the packaging.",
    `Create a high-quality, professional lifestyle photograph of ${personFocus[person]} holding and using that product as the central focus.`,
    "The packaging must stay perfectly rendered and legible.",
    `Context: ${context}.`,
    "The style should be modern, clean, and photorealistic.",
    "Lighting should be soft and flattering.",
    "No extra products, no text overlays, and no watermark.",
  ].join(" ");
}

export function isLifestylePerson(value: string): value is LifestylePerson {
  return value === "woman" || value === "man";
}
