import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../modules/homepage"

const defaultSalesConfig = {
  active: true,
  default_discount: 20,
  category_discounts: {
    "Ready-to-Wear": 20,
    "Luxury Pret": 25,
    "Summer Lawn '25": 30,
    "Festive Formals": 30,
    "Pret Edit": 20,
    "Bestsellers": 25,
    "Unstitched": 30,
    "Men": 34,
    "Women": 20,
  },
  product_discounts: {},
  products: {
    "prod_01M31CTRNB1YGYYJE0SD21B36W": { on_sale: true, sale_price: 2800, original_price: 3600, discount_percent: 22 },
    "prod_01M31CTRNB7DTFRX4DH9AJW7NB": { on_sale: true, sale_price: 2800, original_price: 4242, discount_percent: 34 },
    "prod_01M31CTRNB7P065EBKVZ71HHN1": { on_sale: true, sale_price: 2800, original_price: 3500, discount_percent: 20 },
    "prod_01M31CTRNBTGW61C5NJRA5VTSG": { on_sale: true, sale_price: 2800, original_price: 3500, discount_percent: 20 },
    "prod_01M36SEMJ379FRT68AE30K4G99": { on_sale: true, sale_price: 6950, original_price: 8688, discount_percent: 20 },
    "prod_01M36SEN4HBGHD9CDS9QW4DQ6E": { on_sale: true, sale_price: 18500, original_price: 26428, discount_percent: 30 },
    "prod_01M36SEN91G48HAME3QPH5KPGX": { on_sale: true, sale_price: 8200, original_price: 11714, discount_percent: 30 },
    "prod_01M36SENEPNH8WAXW0DXCXAPKK": { on_sale: true, sale_price: 4450, original_price: 5705, discount_percent: 22 },
    "prod_01M36SENMAEANGD72CTSS0RF7K": { on_sale: false },
    "prod_01M36SENQETE5KFV2CZHXV7GP4": { on_sale: true, sale_price: 5950, original_price: 8500, discount_percent: 30 },
    "prod_01M36SENWRN04X9CHYV3688VGJ": { on_sale: false },
    "prod_01M36SEP19QFXTF36H5VXTSJRJ": { on_sale: true, sale_price: 7200, original_price: 9600, discount_percent: 25 },
    "prod_01M36SEP62VK1Z8ETPZQEPDA1T": { on_sale: false },
    "prod_01M36SEP9BE0PZ112GK23VZW3R": { on_sale: true, sale_price: 3200, original_price: 4000, discount_percent: 20 },
    "prod_01M36SEPBV0JQGZXT4BXTSFWGC": { on_sale: true, sale_price: 4800, original_price: 6400, discount_percent: 25 },
    "prod_01M36SEPH84Y0RERRJZE9KV17W": { on_sale: false },
    "prod_01M36SEPRZ5076MNNMDSZM513P": { on_sale: true, sale_price: 14500, original_price: 20700, discount_percent: 30 },
  },
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const sections = await homepageService.listHomepageSections({ key: "sale_discounts" })
    if (sections && sections.length > 0 && sections[0].settings) {
      const mergedSales = {
        ...defaultSalesConfig,
        ...sections[0].settings,
        products:
          sections[0].settings.products && Object.keys(sections[0].settings.products).length > 0
            ? sections[0].settings.products
            : defaultSalesConfig.products,
      }
      return res.json({ sales: mergedSales })
    }
    return res.json({ sales: defaultSalesConfig })
  } catch (error: any) {
    return res.json({ sales: defaultSalesConfig })
  }
}
