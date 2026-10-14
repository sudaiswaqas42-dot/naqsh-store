// This entry is loaded globally, including direct links to order details.
if (typeof window !== "undefined") {
  try {
    const key = "naqsh-admin-refreshed-v20261014-cod-update"
    if (!window.sessionStorage.getItem(key)) {
      window.sessionStorage.setItem(key, "1")
      window.location.reload()
    }
  } catch {
    // Restricted storage must never cause a reload loop.
  }
}

export {}
