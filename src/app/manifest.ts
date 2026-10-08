import type { MetadataRoute } from "next";
import {brand} from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    start_url: "/",
    scope: "/",
    display_override: ["window-controls-overlay", "standalone"],
    display: "standalone",
    background_color: brand.backgroundColor,
    theme_color: brand.themeColor,
    orientation: "portrait-primary",
    lang: "en",
    categories: ["beauty", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      { src: brand.icon192, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: brand.icon512, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: brand.icon512, sizes: "512x512", type: "image/png", purpose: "maskable" },

    ],
    shortcuts: [
      { name: "Book appointment", short_name: "Book", description: "Choose a service and request an appointment.", url: "/order", icons: [{ src: brand.icon192, sizes: "192x192", type: "image/png" }] },
      { name: "My appointments", short_name: "My bookings", description: "See your appointment requests and account.", url: "/account", icons: [{ src: brand.icon192, sizes: "192x192", type: "image/png" }] }
    ]
  };
}