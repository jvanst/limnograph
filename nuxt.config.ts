// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Kawagama Water Levels',
      meta: [
        { name: 'description', content: 'A web app for visualizing kawagama lake water level data' }
      ],
      htmlAttrs: {
        lang: 'en'
      }
    }
  },
  colorMode: {
    classSuffix: '', // Ensure Tailwind uses 'dark' class
    preference: 'system',
    fallback: 'light',
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    "nitro-cloudflare-dev"
  ],
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  },
})