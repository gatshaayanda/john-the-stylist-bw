export type PublicService = {
  id: string;
  name: string;
  price: number;
  maxPrice?: number;
  display: string;
  detail: string;
  note: string;
  tag: string;
};

export const DEFAULT_PUBLIC_SERVICES: PublicService[] = [
  { id: "pixie-cut", name: "Pixie cut", price: 350, maxPrice: 400, display: "P350–P400", detail: "Precision short cut", note: "A shaped, precision short cut.", tag: "THE CUT" },
  { id: "cut-pixie", name: "Cut + pixie cut", price: 200, display: "P200", detail: "Cut and shape", note: "A clean cut with a considered finish.", tag: "THE SHAPE" },
  { id: "pure-white", name: "Pure white", price: 300, display: "P300", detail: "Bleach / colour", note: "Bleach and colour for a high-impact finish.", tag: "THE COLOUR" },
  { id: "cut-bleach", name: "Cut + bleach", price: 250, display: "P250", detail: "Cut + bleach", note: "A cut paired with a bleach service.", tag: "THE CHANGE" },
];

export function normalizePublicServices(value: unknown): PublicService[] {
  if (!Array.isArray(value)) return DEFAULT_PUBLIC_SERVICES;
  return value.filter((item): item is PublicService => !!item && typeof item === "object"
    && typeof (item as PublicService).id === "string"
    && typeof (item as PublicService).name === "string"
    && typeof (item as PublicService).price === "number"
    && typeof (item as PublicService).display === "string"
    && typeof (item as PublicService).note === "string"
    && typeof (item as PublicService).tag === "string"
    && typeof (item as PublicService).detail === "string");
}
