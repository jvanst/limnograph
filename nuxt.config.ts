// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: "/kawagama/",
    head: {
      title: "Kawagama Water Data",
      meta: [
        // Primary Meta Tags
        { name: "title", content: "Kawagama Water Data" },
        {
          name: "description",
          content: "A web app for visualizing kawagama lake water level data",
        },

        // Open Graph / Facebook
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://jvan.ca/kawagama" },
        { property: "og:title", content: "Kawagama Water Data" },
        {
          property: "og:description",
          content: "A web app for visualizing kawagama lake water level data",
        },
        {
          property: "og:image",
          content: "https://jvan.ca/kawagama/meta-image.png",
        },

        // X (Twitter)
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:url", content: "https://jvan.ca/kawagama" },
        { property: "twitter:title", content: "Kawagama Water Data" },
        {
          property: "twitter:description",
          content: "A web app for visualizing kawagama lake water level data",
        },
        {
          property: "twitter:image",
          content: "https://jvan.ca/kawagama/meta-image.png",
        },
      ],
      htmlAttrs: {
        lang: "en",
      },
    },
  },
  colorMode: {
    classSuffix: "", // Ensure Tailwind uses 'dark' class
    preference: "system",
    fallback: "light",
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "nitro-cloudflare-dev",
  ],
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
  },
});
