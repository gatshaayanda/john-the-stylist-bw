import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "John The Stylist Bw",
    short_name: "JTS Styles",
    description: "Book your next hairstyle with John The Stylist Bw.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["beauty","lifestyle","shopping"],
    shortcuts: [
      { name: "Book appointment", short_name: "Book", description: "Choose a service and request an appointment.", url: "/order", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] },
      { name: "My appointments", short_name: "My bookings", description: "See your appointment requests and account.", url: "/account", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] }
    ],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
    ]
  };
}
