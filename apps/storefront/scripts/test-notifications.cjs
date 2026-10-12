const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")

// Exercise the actual provider with deterministic hooks and timers, without a browser.
const slots = []
let cursor = 0
const effects = []
const timers = new Map()
let timerId = 0
const react = {
  createContext: () => ({ Provider: "Provider" }),
  useState(initial) {
    const index = cursor++
    if (!(index in slots)) slots[index] = initial
    return [slots[index], (value) => { slots[index] = value }]
  },
  useRef(initial) {
    const index = cursor++
    if (!(index in slots)) slots[index] = { current: initial }
    return slots[index]
  },
  useCallback: (fn) => fn,
  useEffect: (fn) => { effects.push(fn) },
}
const source = fs.readFileSync(path.join(__dirname, "../src/lib/context/toast-context.tsx"), "utf8")
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
const jsx = (type, props) => ({ type, props })
const context = {
  exports: {},
  document: { body: {} },
  setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, delay }); return id },
  clearTimeout(id) { timers.delete(id) },
  require(name) {
    if (name === "react") return react
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx }
    if (name === "react-dom") return { createPortal: (child, target) => ({ child, target }) }
    throw new Error(name)
  },
}
vm.runInNewContext(code, context)
const render = () => { cursor = 0; return context.exports.ToastProvider({ children: null }) }
let tree = render()
const cleanup = effects[0]()
tree = render()
const show = tree.props.value.showToast
show("Added to wishlist")
const stale = [...timers.values()][0].fn
show("Removed from wishlist", "info")
assert.equal(timers.size, 1, "Only the latest notification has a timer")
stale()
assert.equal(slots[0].message, "Removed from wishlist", "Old timers cannot dismiss a replacement")
for (let index = 0; index < 20; index++) show(index % 2 ? "Removed from wishlist" : "Added to wishlist")
assert.equal(timers.size, 1, "Rapid toggles never queue notifications")
show("Please select Color & Size first.", "info")
tree = render()
const portal = tree.props.children[1]
assert.equal(portal.target, context.document.body, "Notification escapes ancestor clipping and stacking contexts")
assert.equal(portal.child.props.children.props.children[1].props.children, "Please select Color & Size first.")
assert.equal([...timers.values()][0].delay, 2000)
const expire = [...timers.values()][0].fn
expire()
assert.equal(slots[0], null, "Notification is removed after its short lifetime")
show("Added to wishlist")
assert.equal(slots[0].message, "Added to wishlist", "A new notification works after expiry")
render().props.children[1].child.props.children.props.children[2].props.onClick()
assert.equal(slots[0], null)
assert.equal(timers.size, 0, "Dismiss clears the timer")
show("Added to wishlist")
cleanup()
assert.equal(timers.size, 0, "Unmount clears the timer")
console.log("Notification regressions passed: replacement, rapid toggles, validation, portal, expiry, redisplay, dismissal, cleanup")

slots.length = 0
cursor = 0
const messages = []
const stored = new Map()
react.useContext = () => null
const wishlistSource = fs.readFileSync(path.join(__dirname, "../src/lib/context/wishlist-context.tsx"), "utf8")
const wishlistCode = ts.transpileModule(wishlistSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
const wishlistContext = {
  ...context,
  exports: {},
  localStorage: { getItem: (key) => stored.get(key), setItem: (key, value) => stored.set(key, value) },
  require(name) {
    if (name === "./toast-context") return { useToast: () => ({ showToast: (...message) => messages.push(message) }) }
    return context.require(name)
  },
}
vm.runInNewContext(wishlistCode, wishlistContext)
const wishlist = wishlistContext.exports.WishlistProvider({ children: null }).props.value
const item = { id: "product_1", title: "Test product", handle: "test-product" }
for (let index = 0; index < 20; index++) wishlist.toggleWishlist(item)
assert.equal(messages.length, 20, "Exactly one notification per wishlist action")
assert.equal(messages[0][0], "Added to wishlist")
assert.equal(messages[19][0], "Removed from wishlist")
assert.deepEqual(JSON.parse(stored.get("naqsh_wishlist")), [], "Rapid toggles persist the final wishlist state")
console.log("Wishlist regressions passed: one notification per action and correct rapid-toggle persistence")
