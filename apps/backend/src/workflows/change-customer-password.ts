import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"

type Input = { customer_id: string; old_password: string; new_password: string }
const changePasswordStep = createStep("change-customer-password", async (input: Input, { container }) => {
  const customerService = container.resolve(Modules.CUSTOMER)
  const authService = container.resolve(Modules.AUTH)
  const customer = await customerService.retrieveCustomer(input.customer_id)
  const authentication = await authService.authenticate("emailpass", { body: { email: customer.email, password: input.old_password } })
  if (!authentication.success) throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Your current password is incorrect.")
  const result = await authService.updateProvider("emailpass", { entity_id: customer.email, password: input.new_password })
  if (!result.success) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Unable to update the password.")
  return new StepResponse({ success: true })
})
export const changeCustomerPasswordWorkflow = createWorkflow("change-customer-password-workflow", (input: Input) => new WorkflowResponse(changePasswordStep(input)))
