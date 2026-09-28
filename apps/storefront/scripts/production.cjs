const { spawn } = require("node:child_process")
const path = require("node:path")
const next = require.resolve("next/dist/bin/next")
const mode = process.argv[2] || "start"
const args = mode === "build" ? ["build"] : ["start", "-p", process.env.PORT || "8001"]
const child = spawn(process.execPath, [next, ...args], { cwd: path.join(__dirname, ".."), stdio: "inherit", windowsHide: true, env: { ...process.env, NEXT_BUILD_DIR: ".next-production" } })
child.on("exit", code => process.exit(code ?? 1))
