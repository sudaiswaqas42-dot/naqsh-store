import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from "node:path"
import { container } from "@medusajs/framework"
import { customizeDashboard } from "./src/admin-policy"
import OrderNumberModuleService from "./src/modules/order-number/service"

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    vite: () => ({
      plugins: [{
        name: "naqsh-order-edit-policy",
        enforce: "pre" as const,
        transform: customizeDashboard,
      }],
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
    redisUrl: process.env.REDIS_URL,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    http: {
      storeCors: process.env.STORE_CORS || "https://naqsh-storefront.vercel.app,http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "https://naqsh-backend-production.up.railway.app,http://localhost:9000",
      authCors: process.env.AUTH_CORS || "https://naqsh-storefront.vercel.app,https://naqsh-backend-production.up.railway.app,http://localhost:8000,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    { resolve: path.resolve(__dirname, "src/modules/order-number") },
    {
      resolve: "@medusajs/medusa/order",
      options: {
        generateCustomDisplayId: () => container.resolve<OrderNumberModuleService>("orderNumber").allocateReference(),
      },
    },
    { resolve: path.resolve(__dirname, "src/modules/instagram") },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [{ resolve: path.resolve(__dirname, "src/modules/email"), id: "naqsh-email", options: { channels: ["email"] } }],
      },
    },
    { resolve: path.resolve(__dirname, "src/modules/customer-care") },
    {
      resolve: path.resolve(__dirname, "src/modules/homepage"),
    },
    {
      resolve: path.resolve(__dirname, "src/modules/returns"),
    },
  ]
})
