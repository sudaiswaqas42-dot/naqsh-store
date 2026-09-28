import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "Rs. 0"
  // NAQSH exclusively displays and bills in Pakistani Rupees (PKR)
  const val = Math.round(Number(amount))
  return `Rs. ${val.toLocaleString("en-PK")}`
}
