import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "John The Stylist Bw",
    short_name: "JTS Styles",
    description: "Book your next hairstyle with John The Stylist Bw.",
    start_url: "/",
    scope: "/",
    display_override: ["window-controls-overlay", "standalone"],
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["beauty", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ],
    shortcuts: [
      { name: "Book appointment", short_name: "Book", description: "Choose a service and request an appointment.", url: "/order", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "My appointments", short_name: "My bookings", description: "See your appointment requests and account.", url: "/account", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }] }
    ]
  };
}