import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  createCustomersWorkflow,
} from "@medusajs/medusa/core-flows"
import { HOMEPAGE_MODULE } from "../modules/homepage"

export default async function naqsh_seed({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as any
  const link = container.resolve(ContainerRegistrationKeys.LINK) as any
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any
  const fulfillmentModuleService = container.resolve(ModuleRegistrationName.FULFILLMENT) as any
  const storeModuleService = container.resolve(Modules.STORE) as any
  const orderModuleService = container.resolve(Modules.ORDER) as any

  logger.info("==========================================")
  logger.info("Starting NAQSH Luxury Store Data Seeding...")
  logger.info("==========================================")

  // 1. Fetch or create Sales Channel
  let salesChannel: any
  const { data: existingSC } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  if (existingSC?.length > 0) {
    salesChannel = existingSC[0]
  } else {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          { name: "NAQSH Official Webstore", description: "Primary retail storefront" },
        ],
      },
    })
    salesChannel = result[0]
  }

  // 2. Fetch or update Store to support PKR, USD, EUR
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name", "supported_currencies.*"],
  })
  let store = stores?.[0]
  if (store) {
    await storeModuleService.updateStores(store.id, {
      name: "NAQSH Luxury Apparel",
      supported_currencies: [
        { currency_code: "pkr", is_default: true },
        { currency_code: "usd", is_default: false },
        { currency_code: "eur", is_default: false },
      ],
      default_sales_channel_id: salesChannel.id,
    })
  }

  // 3. Ensure Publishable Key linked
  const { data: apiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id", "token", "type"],
  })
  const pubKey = apiKeys?.find((k: any) => k.type === "publishable")
  if (pubKey) {
    try {
      await linkSalesChannelsToApiKeyWorkflow(container).run({
        input: {
          id: pubKey.id,
          add: [salesChannel.id],
        },
      })
    } catch {}
  }

  // 4. Create Pakistan Region (and Europe fallback)
  logger.info("Creating Pakistan Region (PKR)...")
  let pkRegion: any
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  })

  pkRegion = existingRegions?.find((r: any) => r.currency_code === "pkr")
  if (!pkRegion) {
    const { result: newRegions } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "Pakistan",
            currency_code: "pkr",
            countries: ["pk"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    })
    pkRegion = newRegions[0]

    try {
      await createTaxRegionsWorkflow(container).run({
        input: [{ country_code: "pk", provider_id: "tp_system" }],
      })
    } catch {}
  }

  // 5. Stock Location & Shipping Options
  logger.info("Setting up Karachi fulfillment hub & shipping rates...")
  let stockLocation: any
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })
  if (locations?.length > 0) {
    stockLocation = locations[0]
  } else {
    const { result: locResult } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Karachi Central Fulfillment Hub",
            address: {
              city: "Karachi",
              country_code: "PK",
              address_1: "DHA Phase 6 Commercial",
            },
          },
        ],
      },
    })
    stockLocation = locResult[0]
  }

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [salesChannel.id],
      },
    })
  } catch {}

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfiles?.[0]

  try {
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Pakistan Nationwide Delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Pakistan",
          geo_zones: [{ country_code: "pk", type: "country" }],
        },
      ],
    })

    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })

    if (shippingProfile && pkRegion) {
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            name: "Standard Delivery (TCS / Leopards)",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: fulfillmentSet.service_zones[0].id,
            shipping_profile_id: shippingProfile.id,
            type: { label: "Standard", description: "Delivered in 2-4 business days across Pakistan", code: "standard" },
            prices: [
              { currency_code: "pkr", amount: 250 },
            ],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" },
              { attribute: "is_return", value: "false", operator: "eq" },
            ],
          },
          {
            name: "Express Delivery (Next Day)",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: fulfillmentSet.service_zones[0].id,
            shipping_profile_id: shippingProfile.id,
            type: { label: "Express", description: "Priority air dispatch within 24-48 hours", code: "express" },
            prices: [
              { currency_code: "pkr", amount: 500 },
            ],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" },
              { attribute: "is_return", value: "false", operator: "eq" },
            ],
          },
        ],
      })
    }
  } catch {}

  // 6. Categories Tree
  logger.info("Resolving or creating categories...")
  let categoryMap: Record<string, string> = {}
  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name"],
  })
  existingCats?.forEach((c: any) => { categoryMap[c.handle] = c.id })

  if (!categoryMap["women"]) {
    try {
      const { result: topCats } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [
            { name: "Women", handle: "women", is_active: true },
            { name: "Men", handle: "men", is_active: true },
            { name: "Kids", handle: "kids", is_active: true },
            { name: "Accessories", handle: "accessories", is_active: true },
            { name: "Sale", handle: "sale", is_active: true },
          ],
        },
      })
      topCats.forEach((c: any) => { categoryMap[c.handle] = c.id })

      const { result: subCats } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [
            { name: "Unstitched Fabric", handle: "unstitched", parent_category_id: categoryMap["women"], is_active: true },
            { name: "Ready to Wear", handle: "ready-to-wear", parent_category_id: categoryMap["women"], is_active: true },
            { name: "Co-ords Sets", handle: "co-ords", parent_category_id: categoryMap["women"], is_active: true },
            { name: "Festive Formals", handle: "festive-formals", parent_category_id: categoryMap["women"], is_active: true },

            { name: "Kurta & Shalwar", handle: "kurta-shalwar", parent_category_id: categoryMap["men"], is_active: true },
            { name: "Waistcoats", handle: "waistcoats", parent_category_id: categoryMap["men"], is_active: true },
            { name: "Casual Shirts", handle: "casual-men", parent_category_id: categoryMap["men"], is_active: true },

            { name: "Girls Eastern", handle: "girls-eastern", parent_category_id: categoryMap["kids"], is_active: true },
            { name: "Boys Eastern", handle: "boys-eastern", parent_category_id: categoryMap["kids"], is_active: true },

            { name: "Shawls & Dupattas", handle: "shawls-dupattas", parent_category_id: categoryMap["accessories"], is_active: true },
            { name: "Jewellery", handle: "jewellery", parent_category_id: categoryMap["accessories"], is_active: true },
            { name: "Footwear & Khussa", handle: "footwear", parent_category_id: categoryMap["accessories"], is_active: true },

            { name: "Clearance", handle: "clearance", parent_category_id: categoryMap["sale"], is_active: true },
            { name: "Special Offers", handle: "special-offers", parent_category_id: categoryMap["sale"], is_active: true },
          ],
        },
      })
      subCats.forEach((c: any) => { categoryMap[c.handle] = c.id })
    } catch {}
  }

  // 7. Collections
  logger.info("Resolving or creating collections...")
  let colMap: Record<string, string> = {}
  try {
    const { data: existingCols } = await query.graph({
      entity: "product_collection",
      fields: ["id", "handle", "title"],
    })
    existingCols?.forEach((c: any) => { colMap[c.handle] = c.id })
  } catch {}

  if (!colMap["summer-lawn-25"]) {
    try {
      const { result: collections } = await createCollectionsWorkflow(container).run({
        input: {
          collections: [
            { title: "Summer Lawn '25", handle: "summer-lawn-25" },
            { title: "Festive Formals", handle: "festive-formals" },
            { title: "Pret Edit", handle: "pret-edit" },
            { title: "Bestsellers", handle: "bestsellers" },
          ],
        },
      })
      collections.forEach((c: any) => { colMap[c.handle] = c.id })
    } catch {}
  }

  // 8. 28 Products Data
  logger.info("Seeding authentic Pakistani fashion products...")
  const rawProducts = [
    {
      title: "Royal Crimson Embroidered Lawn 3-Piece",
      handle: "royal-crimson-embroidered-lawn-3pc",
      description: "Exquisite 3-piece luxury lawn suit featuring intricate schiffli embroidery on the neckline, digital printed chiffon dupatta, and dyed cambric trousers.",
      price: 6950,
      origPrice: 8500,
      category: "unstitched",
      collection: "summer-lawn-25",
      fabric: "Lawn",
      occasion: "Festive",
      colors: ["Crimson Red", "Emerald Green"],
      sizes: ["Small", "Medium", "Large"],
      lowStock: false,
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Ivory Pearl Organza Formal Ensemble",
      handle: "ivory-pearl-organza-formal-ensemble",
      description: "Hand-embellished pure organza front open jacket paired with silk undershirt and flared trousers, accented with delicate pearl and sequins craftsmanship.",
      price: 18500,
      origPrice: 22000,
      category: "festive-formals",
      collection: "festive-formals",
      fabric: "Organza",
      occasion: "Bridal",
      colors: ["Ivory Gold"],
      sizes: ["Small", "Medium", "Large"],
      lowStock: true,
      images: [
        "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Printed Silk Co-ord Set - Midnight Mirage",
      handle: "printed-silk-coord-set-midnight",
      description: "Tailored modern relaxed-fit tunic paired with matching wide-leg trousers crafted from lustrous Turkish silk crepe with contemporary geometric motifs.",
      price: 8200,
      origPrice: null,
      category: "co-ords",
      collection: "pret-edit",
      fabric: "Silk",
      occasion: "Semi-Formal",
      colors: ["Midnight Blue", "Sand Beige"],
      sizes: ["Small", "Medium", "Large", "XL"],
      lowStock: false,
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Sage Green Embroidered Pret Kurta",
      handle: "sage-green-embroidered-pret-kurta",
      description: "Straight-cut daily wear linen kurta featuring tone-on-tone threadwork embroidery on sleeves and placket. Clean minimalist aesthetics for effortless elegance.",
      price: 4450,
      origPrice: 5500,
      category: "ready-to-wear",
      collection: "bestsellers",
      fabric: "Linen",
      occasion: "Casual",
      colors: ["Sage Green", "Blush Pink"],
      sizes: ["Small", "Medium", "Large"],
      lowStock: false,
      images: [
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Mustard Schiffli Chikankari 2-Piece",
      handle: "mustard-schiffli-chikankari-2pc",
      description: "Pure cotton chikankari shirt with delicate cutwork detailing along the hemline, accompanied by solid dyed culottes. Breathable summer favorite.",
      price: 5900,
      origPrice: null,
      category: "unstitched",
      collection: "summer-lawn-25",
      fabric: "Cotton",
      occasion: "Casual",
      colors: ["Sun Mustard"],
      sizes: ["Small", "Medium"],
      lowStock: false,
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Men's Luxury Jacquard Kurta Pajama",
      handle: "mens-luxury-jacquard-kurta-pajama",
      description: "Refined ceremonial men's kurta tailored in self-textured cotton jacquard fabric with embroidered band collar, paired with tailored off-white cotton churidar.",
      price: 7800,
      origPrice: 9500,
      category: "kurta-shalwar",
      collection: "festive-formals",
      fabric: "Jacquard",
      occasion: "Festive",
      colors: ["Charcoal Grey", "Navy Blue"],
      sizes: ["Small", "Medium", "Large", "XL"],
      lowStock: false,
      images: [
        "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Embroidered Raw Silk Men's Waistcoat",
      handle: "embroidered-raw-silk-mens-waistcoat",
      description: "Structured slim-fit raw silk waistcoat adorned with subtle metallic thread floral motifs and monogrammed metallic buttons. Elevates any eastern attire.",
      price: 6200,
      origPrice: null,
      category: "waistcoats",
      collection: "festive-formals",
      fabric: "Silk",
      occasion: "Semi-Formal",
      colors: ["Deep Maroon", "Champagne Gold"],
      sizes: ["Medium", "Large", "XL"],
      lowStock: true,
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Girls Festive Chiffon Sharara Set",
      handle: "girls-festive-chiffon-sharara-set",
      description: "Delightful 3-piece sharara set featuring gold block print peplum top, tiered flowy sharara, and zari netted dupatta. Perfect for Eid and celebrations.",
      price: 5200,
      origPrice: 6500,
      category: "girls-eastern",
      collection: "festive-formals",
      fabric: "Chiffon",
      occasion: "Festive",
      colors: ["Coral Peach", "Teal"],
      sizes: ["4-5 Y", "6-7 Y", "8-9 Y"],
      lowStock: false,
      images: [
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Handcrafted Zardozi Velvet Shawl",
      handle: "handcrafted-zardozi-velvet-shawl",
      description: "Opulent micro-velvet shawl finished with heavy four-sided dabka, tilla, and zardozi border embroidery. A timeless family heirloom.",
      price: 14500,
      origPrice: 18000,
      category: "shawls-dupattas",
      collection: "bestsellers",
      fabric: "Velvet",
      occasion: "Bridal",
      colors: ["Royal Black", "Plum Purple"],
      sizes: ["Standard"],
      lowStock: false,
      images: [
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Traditional Kundan & Pearl Jhumka",
      handle: "traditional-kundan-pearl-jhumka",
      description: "22K gold-plated artisanal earrings with hand-set kundan stones and hanging natural baroque pearl drops. Lightweight and tarnish-resistant.",
      price: 2850,
      origPrice: 3500,
      category: "jewellery",
      collection: "pret-edit",
      fabric: "Brass Alloy",
      occasion: "Festive",
      colors: ["Antique Gold"],
      sizes: ["Free Size"],
      lowStock: false,
      images: [
        "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Hand-Embroidered Tilla Khussa",
      handle: "hand-embroidered-tilla-khussa",
      description: "Authentic Multani leather khussa with padded sole cushioning and genuine copper tilla work. Soft genuine leather that molds to your foot.",
      price: 3600,
      origPrice: null,
      category: "footwear",
      collection: "bestsellers",
      fabric: "Leather",
      occasion: "Casual",
      colors: ["Gold", "Silver"],
      sizes: ["36", "37", "38", "39", "40"],
      lowStock: true,
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Dusky Lilac Monochromatic Lawn Set",
      handle: "dusky-lilac-monochromatic-lawn",
      description: "Contemporary single-tone embroidered 2-piece kurta trouser suit with organza ladder lace inserts along sleeves and daman.",
      price: 4950,
      origPrice: 5950,
      category: "ready-to-wear",
      collection: "summer-lawn-25",
      fabric: "Lawn",
      occasion: "Casual",
      colors: ["Dusky Lilac"],
      sizes: ["Small", "Medium", "Large"],
      lowStock: false,
      images: [
        "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=800&q=80",
      ],
    },
    {
      title: "Limited Edition Pashmina Wrap",
      handle: "limited-handloom-pashmina-wrap",
      description: "Pure Himalayan cashmere hand-spun pashmina with intricate kalamkari motif borders. Ultra-fine softness and exceptional natural warmth.",
      price: 24000,
      origPrice: null,
      category: "shawls-dupattas",
      collection: "bestsellers",
      fabric: "Cashmere",
      occasion: "Bridal",
      colors: ["Natural Walnut"],
      sizes: ["Standard"],
      outOfStock: true,
      images: [
        "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
      ],
    },
  ]

  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  })
  const existingHandles = new Set(existingProducts?.map((p: any) => p.handle))

  for (let i = 0; i < rawProducts.length; i++) {
    const p = rawProducts[i]
    if (existingHandles.has(p.handle)) {
      continue
    }

    try {
      const optionsConfig = [
        { title: "Size", values: p.sizes },
        { title: "Color", values: p.colors },
      ]

      const variantsConfig: any[] = []
      let vIndex = 0
      for (const size of p.sizes) {
        for (const color of p.colors) {
          vIndex++
          const skuCode = `NQ-${i + 1}-${vIndex}-${size.slice(0, 2).toUpperCase()}`
          variantsConfig.push({
            title: `${size} / ${color}`,
            sku: skuCode,
            options: {
              Size: size,
              Color: color,
            },
            prices: [
              { currency_code: "pkr", amount: p.price },
              { currency_code: "usd", amount: Math.max(10, Math.round(p.price / 280)) },
              { currency_code: "eur", amount: Math.max(10, Math.round(p.price / 300)) },
            ],
          })
        }
      }

      const { result: createdProds } = await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: p.title,
              handle: p.handle,
              description: p.description,
              status: ProductStatus.PUBLISHED,
              category_ids: [categoryMap[p.category] || ""].filter(Boolean),
              collection_id: colMap[p.collection] || undefined,
              images: p.images.map((url) => ({ url })),
              thumbnail: p.images[0],
              options: optionsConfig,
              variants: variantsConfig,
              metadata: {
                fabric: p.fabric,
                occasion: p.occasion,
                original_price: p.origPrice || null,
                is_featured: true,
                rating: 4.8,
                reviews_count: 34,
              },
            },
          ],
        },
      })

      const createdProduct = createdProds[0]

      if (stockLocation && createdProduct.variants) {
        for (const v of createdProduct.variants) {
          const stockQty = p.outOfStock ? 0 : p.lowStock ? 3 : 25
          try {
            await createInventoryLevelsWorkflow(container).run({
              input: {
                inventory_levels: [
                  {
                    location_id: stockLocation.id,
                    inventory_item_id: (v as any).inventory_item_id || v.id,
                    stocked_quantity: stockQty,
                  },
                ],
              },
            })
          } catch {}
        }
      }
    } catch (prodErr: any) {
      logger.warn(`Product ${p.handle} notice: ${prodErr.message}`)
    }
  }

  // 9. Promotions / Discount Codes via PROMOTION Module
  logger.info("Setting up promotion codes (LUXE20, FLAT1000, FREESHIP)...")
  try {
    const promotionModuleService = container.resolve(Modules.PROMOTION) as any
    const existingPromos = await promotionModuleService.listPromotions({})
    const existingCodes = new Set(existingPromos?.map((pr: any) => pr.code))

    if (!existingCodes.has("LUXE20")) {
      await promotionModuleService.createPromotions([
        {
          code: "LUXE20",
          type: "standard",
          status: "active",
          application_method: {
            type: "percentage",
            value: 20,
            currency_code: "pkr",
            target_type: "order",
          },
        },
      ])
    }

    if (!existingCodes.has("FLAT1000")) {
      await promotionModuleService.createPromotions([
        {
          code: "FLAT1000",
          type: "standard",
          status: "active",
          application_method: {
            type: "fixed",
            value: 1000,
            currency_code: "pkr",
            target_type: "order",
          },
        },
      ])
    }

    if (!existingCodes.has("FREESHIP")) {
      await promotionModuleService.createPromotions([
        {
          code: "FREESHIP",
          type: "standard",
          status: "active",
          application_method: {
            type: "fixed",
            value: 250,
            currency_code: "pkr",
            target_type: "shipping_methods",
          },
        },
      ])
    }
  } catch (promoErr: any) {
    logger.warn(`Promotion setup notice: ${promoErr.message}`)
  }

  // 10. Demo Customers
  logger.info("Seeding customers...")
  try {
    const { data: existingCustomers } = await query.graph({
      entity: "customer",
      fields: ["id", "email"],
    })
    const existingEmails = new Set(existingCustomers?.map((c: any) => c.email))

    const newCustomersData = [
      {
        first_name: "Fatima",
        last_name: "Khan",
        email: "fatima.khan@example.com",
        phone: "+923001234567",
        addresses: [
          {
            first_name: "Fatima",
            last_name: "Khan",
            address_1: "House 14-B, Street 3, Sector F-7/2",
            city: "Islamabad",
            province: "Federal Capital",
            postal_code: "44000",
            country_code: "pk",
            phone: "+923001234567",
          },
        ],
      },
      {
        first_name: "Zainab",
        last_name: "Ahmed",
        email: "zainab.ahmed@example.com",
        phone: "+923219876543",
        addresses: [
          {
            first_name: "Zainab",
            last_name: "Ahmed",
            address_1: "Apartment 402, Creek Vistas, DHA Phase 8",
            city: "Karachi",
            province: "Sindh",
            postal_code: "75500",
            country_code: "pk",
            phone: "+923219876543",
          },
        ],
      },
      {
        first_name: "Bilal",
        last_name: "Siddiqui",
        email: "bilal.siddiqui@example.com",
        phone: "+923334567890",
        addresses: [
          {
            first_name: "Bilal",
            last_name: "Siddiqui",
            address_1: "78 Gulberg III",
            city: "Lahore",
            province: "Punjab",
            postal_code: "54000",
            country_code: "pk",
            phone: "+923334567890",
          },
        ],
      },
    ].filter((c) => !existingEmails.has(c.email))

    if (newCustomersData.length > 0) {
      await createCustomersWorkflow(container).run({
        input: { customersData: newCustomersData },
      })
    }
  } catch (custErr: any) {
    logger.warn(`Customer seed notice: ${custErr.message}`)
  }

  // 11. Seed Historical Demo Orders for Analytics & Tracking
  logger.info("Seeding historical demo orders spanning multiple statuses...")
  try {
    const { data: allProds } = await query.graph({
      entity: "product",
      fields: ["id", "title", "variants.id", "variants.title"],
      pagination: { take: 10 },
    })

    const { data: existingOrders } = await query.graph({
      entity: "order",
      fields: ["id"],
    })

    if ((existingOrders?.length || 0) < 6 && allProds?.length > 0) {
      const demoOrdersData = [
        {
          display_id: 1001,
          email: "fatima.khan@example.com",
          currency_code: "pkr",
          custom_status: "Delivered",
          carrier: "TCS Express",
          tracking_number: "774910281",
          days_ago: 10,
          total: 13900,
          subtotal: 13900,
          shipping_total: 0,
          items: [
            {
              title: allProds[0]?.title || "Embroidered Lawn Suit",
              quantity: 2,
              unit_price: 6950,
            },
          ],
        },
        {
          display_id: 1002,
          email: "zainab.ahmed@example.com",
          currency_code: "pkr",
          custom_status: "Shipped",
          carrier: "Leopards Courier",
          tracking_number: "LEO-994821",
          days_ago: 5,
          total: 8450,
          subtotal: 8200,
          shipping_total: 250,
          items: [
            {
              title: allProds[1]?.title || "Printed Silk Co-ord Set",
              quantity: 1,
              unit_price: 8200,
            },
          ],
        },
        {
          display_id: 1003,
          email: "bilal.siddiqui@example.com",
          currency_code: "pkr",
          custom_status: "Packed",
          carrier: "TCS Express",
          tracking_number: "TCS-112349",
          days_ago: 2,
          total: 7800,
          subtotal: 7800,
          shipping_total: 0,
          items: [
            {
              title: allProds[2]?.title || "Men's Luxury Jacquard Kurta",
              quantity: 1,
              unit_price: 7800,
            },
          ],
        },
        {
          display_id: 1004,
          email: "usman.ghani@example.com",
          currency_code: "pkr",
          custom_status: "Out for Delivery",
          carrier: "M&P Logistics",
          tracking_number: "MP-558291",
          days_ago: 1,
          total: 18500,
          subtotal: 18500,
          shipping_total: 0,
          items: [
            {
              title: allProds[1]?.title || "Ivory Pearl Organza Formal",
              quantity: 1,
              unit_price: 18500,
            },
          ],
        },
        {
          display_id: 1005,
          email: "sana.amir@example.com",
          currency_code: "pkr",
          custom_status: "Returned",
          carrier: "TCS Express",
          tracking_number: "TCS-883921",
          days_ago: 7,
          total: 5900,
          subtotal: 5900,
          shipping_total: 0,
          items: [
            {
              title: allProds[0]?.title || "Mustard Schiffli Chikankari",
              quantity: 1,
              unit_price: 5900,
            },
          ],
        },
        {
          display_id: 1006,
          email: "nadia.zahid@example.com",
          currency_code: "pkr",
          custom_status: "Cancelled",
          carrier: "TCS Express",
          tracking_number: null,
          days_ago: 4,
          total: 6200,
          subtotal: 6200,
          shipping_total: 0,
          items: [
            {
              title: allProds[2]?.title || "Raw Silk Waistcoat",
              quantity: 1,
              unit_price: 6200,
            },
          ],
        },
      ]

      for (const ord of demoOrdersData) {
        try {
          const ordDate = new Date()
          ordDate.setDate(ordDate.getDate() - ord.days_ago)

          await orderModuleService.createOrders({
            currency_code: ord.currency_code,
            email: ord.email,
            total: ord.total,
            subtotal: ord.subtotal,
            shipping_total: ord.shipping_total,
            status: ord.custom_status === "Cancelled" ? "canceled" :
                    ord.custom_status === "Delivered" ? "completed" : "pending",
            items: ord.items,
            metadata: {
              custom_status: ord.custom_status,
              carrier: ord.carrier,
              tracking_number: ord.tracking_number,
              seeded: true,
            },
            created_at: ordDate,
          })
        } catch (ordErr: any) {
          logger.warn(`Order seed notice for #${ord.display_id}: ${ordErr.message}`)
        }
      }
    }
  } catch (demoOrdErr: any) {
    logger.warn(`Demo orders seed notice: ${demoOrdErr.message}`)
  }

  // 12. Seed Homepage Sections
  logger.info("Configuring dynamic homepage sections...")
  try {
    const homepageService = container.resolve(HOMEPAGE_MODULE) as any
    const existingSecs = await homepageService.listHomepageSections({})
    if (existingSecs.length === 0) {
      await homepageService.createHomepageSections([
        {
          key: "hero",
          type: "hero_slider",
          title: "Dressed in Quiet Luxury",
          subtitle: "Handcrafted fabrics. Refined silhouettes. Elegance that whispers rather than shouts.",
          cta_text: "Explore Summer '25",
          cta_link: "/categories/women",
          rank: 0,
          is_active: true,
          settings: {
            slides: [
              {
                eyebrow: "Summer Collection 2025",
                title: "Dressed in Quiet Luxury",
                sub: "Handcrafted lawn, pure silks, and artisanal Pakistani craft tailored for modern sensibilities.",
                cta_text: "Shop Summer Lawn",
                cta_link: "/categories/unstitched",
                bg_gradient: "linear-gradient(135deg, #2c1810 0%, #4a2c1a 40%, #c9a96e 100%)",
              },
              {
                eyebrow: "Festive Edit 2025",
                title: "Heirloom Craftsmanship",
                sub: "Intricate zardozi embroidery, delicate organza coats, and timeless luxury pret formals.",
                cta_text: "Explore Formals",
                cta_link: "/categories/festive-formals",
                bg_gradient: "linear-gradient(135deg, #1a2535 0%, #2d3f5c 50%, #8fa8c8 100%)",
              },
              {
                eyebrow: "Everyday Pret & Co-ords",
                title: "Refined Modern Silhouettes",
                sub: "Breathable matching sets designed for warm weather sophistication.",
                cta_text: "Shop Co-ords",
                cta_link: "/categories/co-ords",
                bg_gradient: "linear-gradient(145deg, #1a1a1a 0%, #3d2e24 50%, #8b6543 100%)",
              },
            ],
          },
        },
        {
          key: "features",
          type: "features_strip",
          title: "Our Guarantees",
          subtitle: "The NAQSH shopping experience",
          rank: 1,
          is_active: true,
          settings: {
            items: [
              { title: "Free Nationwide Delivery", desc: "On all orders above Rs. 4,999 across Pakistan", icon: "truck" },
              { title: "Hassle-Free 7-Day Returns", desc: "Easy doorstep exchange or refund policy", icon: "refresh" },
              { title: "Cash on Delivery", desc: "Inspect and pay when your parcel arrives", icon: "cash" },
              { title: "24/7 Dedicated Support", desc: "Direct WhatsApp assistance & sizing advice", icon: "support" },
            ],
          },
        },
        {
          key: "featured_categories",
          type: "featured_categories",
          title: "Explore Curated Categories",
          subtitle: "From unstitched luxury fabrics to ready-to-wear kurtas",
          rank: 2,
          is_active: true,
        },
        {
          key: "curated_tabs",
          type: "product_carousel",
          title: "Curated for You",
          subtitle: "Hand-selected pieces from our latest designer collections",
          cta_text: "View All Products",
          cta_link: "/store",
          rank: 3,
          is_active: true,
        },
        {
          key: "promo_banners",
          type: "promo_banner",
          title: "Seasonal Spotlights",
          subtitle: "Exclusive limited drops",
          rank: 4,
          is_active: true,
          settings: {
            banner_left: {
              label: "Limited Edition",
              title: "Summer Unstitched Lawn Edit",
              cta: "Shop Now",
              link: "/categories/unstitched",
              bg: "linear-gradient(135deg, #2c1810, #8b5e35, #d4a574)",
            },
            banner_right: {
              label: "New Season",
              title: "Contemporary Pret & Co-ords",
              cta: "Discover",
              link: "/categories/co-ords",
              bg: "linear-gradient(135deg, #1a2535, #1e3a5f, #4a7fb5)",
            },
          },
        },
        {
          key: "newsletter",
          type: "newsletter",
          title: "Get First Access to New Drops",
          subtitle: "Subscribe for exclusive early access, styling lookbooks, and members-only offers.",
          rank: 5,
          is_active: true,
        },
      ])
    }
  } catch (homeErr: any) {
    logger.warn(`Homepage config seed notice: ${homeErr.message}`)
  }

  logger.info("==========================================")
  logger.info("NAQSH Seeding completed successfully!")
  logger.info("==========================================")
}
