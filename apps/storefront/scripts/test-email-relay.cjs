const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")

async function main() {
  let sends = 0
  let lastMessage
  const exports = {}
  const env = { EMAIL_RELAY_SECRET: "test-secret", SMTP_USER: "sender@example.com", SMTP_PASSWORD: "test-password" }
  const filename = path.join(__dirname, "../src/app/api/internal/order-email/route.ts")
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText
  vm.runInNewContext(source, {
    exports, process: { env }, TextEncoder, console,
    require: name => {
      if (name === "node:crypto") return require(name)
      if (name === "next/server") return { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } }
      if (name === "nodemailer") return { createTransport: () => ({ sendMail: async message => { sends++; lastMessage = message; return { messageId: "test-message", accepted: [message.to] } }, close: () => {} }) }
      throw new Error(`Unexpected import ${name}`)
    },
  })
  const request = (body, token = "test-secret") => new Request("https://store.example.test/api/internal/order-email", {
    method: "POST", headers: { authorization: `Bearer ${token}` }, body: JSON.stringify(body),
  })
  const message = { to: "test@example.com", subject: "OTP", html: "<p>Verification code</p>" }
  assert.equal((await exports.POST(request(message, "wrong"))).status, 401)
  assert.equal(sends, 0)
  assert.equal((await exports.POST(request(message))).status, 200)
  assert.equal(lastMessage.html, message.html)
  assert.equal((await exports.POST(request({ ...message, html: undefined, text: "Plain text" }))).status, 200)
  assert.equal((await exports.POST(request({ ...message, html: undefined }))).status, 400)
  delete env.SMTP_PASSWORD
  assert.equal((await exports.POST(request(message))).status, 503)
  assert.equal(sends, 2)
  console.log("Email relay checks passed: authentication, HTML-only OTP, text-only mail, validation and missing credentials")
}
main().catch(error => { console.error(error); process.exitCode = 1 })
