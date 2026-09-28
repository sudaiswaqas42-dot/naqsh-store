import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from "node:path"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    vite: () => ({
      server: {
        hmr: {
          overlay: false,
        },
      },
      resolve: {
        dedupe: ["react", "react-dom"],
        alias: {
          react: path.dirname(require.resolve("react/package.json")),
          "react-dom": path.dirname(require.resolve("react-dom/package.json")),
        },
      },
    }),
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    { resolve: "./src/modules/instagram" },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [{ resolve: "./src/modules/email", id: "naqsh-email", options: { channels: ["email"] } }],
      },
    },
    { resolve: "./src/modules/customer-care" },
    {
      resolve: './src/modules/homepage',
    },
    {
      resolve: './src/modules/returns',
    },
  ]
})
