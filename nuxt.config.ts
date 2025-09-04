// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Limnograph',
      meta: [
        { name: 'description', content: 'A web app for visualizing limnological data' }
      ],
      htmlAttrs: {
        lang: 'en'
      }
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode'
  ],
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  nitro: {
    prerender: {
      autoSubfolderIndex: false
    }
  }
})