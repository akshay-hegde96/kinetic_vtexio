const SALES_CHANNEL = '2'
const SIMULATION_PATH = '/api/checkout/pub/orderForms/simulation'
const PATCH_MARKER = '__kineticSalesChannelBridge'

const withSalesChannel = (requestUrl) => {
  const url = new URL(requestUrl, window.location.origin)

  if (
    url.origin !== window.location.origin ||
    url.pathname !== SIMULATION_PATH ||
    url.searchParams.has('sc')
  ) {
    return requestUrl
  }

  url.searchParams.set('sc', SALES_CHANNEL)

  return requestUrl.startsWith('http')
    ? url.toString()
    : `${url.pathname}${url.search}${url.hash}`
}

/**
 * vtex.my-orders-app checks alternative SKUs by calling Checkout simulation,
 * but its current implementation omits the order's sales channel. The account
 * storefront therefore falls back to trade policy 1 even though Kinetic uses
 * trade policy 2. Patch only that simulation request until the OOTB app starts
 * forwarding the commercial context itself.
 */
const installBridge = () => {
  const xhrPrototype = window.XMLHttpRequest?.prototype

  if (!xhrPrototype || xhrPrototype[PATCH_MARKER]) {
    return
  }

  const originalOpen = xhrPrototype.open

  xhrPrototype.open = function patchedOpen(method, url, ...args) {
    const nextUrl = typeof url === 'string' ? withSalesChannel(url) : url

    return originalOpen.call(this, method, nextUrl, ...args)
  }

  xhrPrototype[PATCH_MARKER] = true
}

if (typeof window !== 'undefined') {
  installBridge()
}

const MyAccountSalesChannelBridge = () => null

export default MyAccountSalesChannelBridge
