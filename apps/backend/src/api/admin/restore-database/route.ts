import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
const path = require("path")

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { importDatabase } = require("../../../../scripts/import-db")
    console.log("Starting database restore from local_db_export.json.gz...")
    const result = await importDatabase()
    res.json({ success: true, message: "Database restore completed successfully!", result })
  } catch (err: any) {
    console.error("Restore error:", err)
    res.status(500).json({ success: false, error: err.message })
  }
}
