import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { runInventoryAutoLinker } from "../../../utils/inventory-auto-linker"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const result = await runInventoryAutoLinker()
    return res.status(200).json({
      success: true,
      message: `Auto-linked ${result.linked} variant(s)`,
      linked: result.linked,
      details: result.details,
    })
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || String(err),
    })
  }
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  return POST(req, res)
}
