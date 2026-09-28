import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { InstagramService } from "../modules/instagram/instagram-service"

const syncStep = createStep("sync-instagram", async (input: { refreshToken: boolean }, { container }) => {
  const service = container.resolve<InstagramService>("instagram")
  return new StepResponse(input.refreshToken ? await service.refreshToken() : await service.fetchAndStoreReels())
})

export const syncInstagramWorkflow = createWorkflow("sync-instagram-workflow", (input: { refreshToken: boolean }) => new WorkflowResponse(syncStep(input)))
