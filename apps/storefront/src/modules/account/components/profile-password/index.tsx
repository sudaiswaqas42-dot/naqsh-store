"use client"

import { useActionState } from "react"
import { HttpTypes } from "@medusajs/types"
import { changePassword } from "@lib/data/password"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"

export default function ProfilePassword({ customer: _customer }: { customer: HttpTypes.StoreCustomer }) {
  const [state, action] = useActionState(changePassword, { success: false, error: "" })
  return <form action={action} className="w-full">
    <AccountInfo label="Password" currentInfo="Keep your account secure with a unique password" isSuccess={state.success} isError={!!state.error} errorMessage={state.error} clearState={() => {}} data-testid="account-password-editor">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Current password" name="old_password" type="password" autoComplete="current-password" required />
        <Input label="New password" name="new_password" type="password" autoComplete="new-password" minLength={8} required />
        <Input label="Confirm new password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} required />
      </div>
    </AccountInfo>
  </form>
}
