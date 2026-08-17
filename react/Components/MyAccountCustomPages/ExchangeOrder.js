import React, { useState } from 'react'
import styles from './ExchangeOrder.css'

const ExchangeOrder = ({ order, onBack }) => {
  const [selectedOriginalItem, setSelectedOriginalItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [products, setProducts] = useState([])
  const [selectedReplacementItem, setSelectedReplacementItem] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /*
   * ============================================================
   * SEARCH PRODUCTS
   * ============================================================
   */
  const searchProducts = async () => {
    if (!searchText.trim()) {
      setError('Please enter a product name or SKU to search.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setProducts([])
      setSelectedReplacementItem(null)

      const response = await fetch(
        `/api/catalog_system/pub/products/search?ft=${encodeURIComponent(
          searchText.trim()
        )}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(
          `Product search failed: ${response.status} - ${responseText}`
        )
      }

      const data = JSON.parse(responseText)

      console.log('Products:', data)

      if (!Array.isArray(data)) {
        setProducts([])
        setError('No products found.')
        return
      }

      setProducts(data)
    } catch (err) {
      console.error(
        'Product search error:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to search products.'
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * ============================================================
   * SELECT ORIGINAL PRODUCT
   * ============================================================
   */
  const selectOriginalProduct = (item) => {
    console.log(
      'Selected original item:',
      item
    )

    setSelectedOriginalItem(item)
    setSelectedReplacementItem(null)
    setError(null)
  }

  /*
   * ============================================================
   * SELECT REPLACEMENT PRODUCT
   * ============================================================
   */
  const selectReplacementProduct = (item) => {
    console.log(
      'Selected replacement item:',
      item
    )

    setSelectedReplacementItem(item)
    setError(null)
  }

  /*
   * ============================================================
   * BUILD EXCHANGE PAYLOAD
   * ============================================================
   */
  const buildExchangePayload = () => {
    if (!selectedOriginalItem) {
      return null
    }

    if (!selectedReplacementItem) {
      return null
    }

    const originalQuantity =
      Number(selectedOriginalItem.quantity) || 1

    const replacementItemId =
      selectedReplacementItem.itemId ||
      selectedReplacementItem.id

    /*
     * Validate original item
     */
    if (!selectedOriginalItem.id) {
      console.error(
        'Original item does not contain an id:',
        selectedOriginalItem
      )

      return null
    }

    /*
     * Validate replacement item
     */
    if (!replacementItemId) {
      console.error(
        'Replacement item does not contain itemId/id:',
        selectedReplacementItem
      )

      return null
    }

    const payload = {
      reason:
        'Customer wants to exchange the product',

      manualDiscountValue: 0,

      add: {
        items: [],
      },

      remove: {
        items: [],
      },

      replace: [
        {
          from: {
            items: [
              {
                id: String(
                  selectedOriginalItem.id
                ),

                quantity:
                  originalQuantity,
              },
            ],
          },

          to: {
            items: [
              {
                id: String(
                  replacementItemId
                ),

                quantity:
                  originalQuantity,

                measurementUnit:
                  selectedReplacementItem.measurementUnit ||
                  'un',

                unitMultiplier:
                  Number(
                    selectedReplacementItem.unitMultiplier
                  ) || 1,
              },
            ],
          },
        },
      ],
    }

    return payload
  }

  /*
   * ============================================================
   * CONFIRM EXCHANGE
   * ============================================================
   */
  const confirmExchange = async () => {
    /*
     * Validate original product
     */
    if (!selectedOriginalItem) {
      setError(
        'Please select the product you want to exchange.'
      )

      return
    }

    /*
     * Validate replacement product
     */
    if (!selectedReplacementItem) {
      setError(
        'Please select a replacement product.'
      )

      return
    }

    /*
     * Validate order
     */
    if (!order?.orderId) {
      setError(
        'Order ID is missing.'
      )

      return
    }

    /*
     * Build payload
     */
    const payload =
      buildExchangePayload()

    if (!payload) {
      setError(
        'Unable to create exchange payload.'
      )

      return
    }

    try {
      setLoading(true)
      setError(null)

      const previewResponse =
        await fetch(
          `/api/order-system/orders/${encodeURIComponent(
            order.orderId
          )}/changes/preview`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        )

      const previewText = await previewResponse.text()

      /*
       * Stop if preview/validation fails
       */
      if (!previewResponse.ok) {
        throw new Error(
          `Exchange validation failed: ${previewResponse.status} - ${previewText}`
        )
      }

      console.log('Exchange validation successful.')

      /*
       * ========================================================
       * STEP 2
       *
       * ACTUAL EXCHANGE
       * ========================================================
       */

      const exchangeResponse =
        await fetch(
          `/api/order-system/orders/${encodeURIComponent(
            order.orderId
          )}/changes`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        )

      const exchangeText =
        await exchangeResponse.text()

      console.log(
        'Exchange status:',
        exchangeResponse.status
      )

      console.log(
        'Exchange response:',
        exchangeText
      )

      /*
       * Stop if actual exchange fails
       */
      if (!exchangeResponse.ok) {
        throw new Error(
          `Exchange failed: ${exchangeResponse.status} - ${exchangeText}`
        )
      }

      alert(
        'Product exchanged successfully.'
      )

      /*
       * Go back to order page
       */
      onBack()
    } catch (err) {
      console.error(
        'Exchange error:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to exchange product.'
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <div
      className={
        styles.container
      }
    >

      <button
        type="button"
        onClick={onBack}
        disabled={loading}
      >
        ← Back to Order
      </button>

      <h1>
        Exchange Product
      </h1>

      <p>
        Order #{order?.orderId}
      </p>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div
          className={
            styles.error
          }
        >
          <strong>
            Error:
          </strong>

          <p>
            {error}
          </p>
        </div>
      )}

      {/* ======================================================
          ORIGINAL ORDER ITEMS
          ====================================================== */}

      <h2>
        Select Product to Exchange
      </h2>

      {!order?.items ||
      order.items.length === 0 ? (
        <p>
          No products found in this order.
        </p>
      ) : (
        <div>
          {order.items.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.uniqueId ||
                  item.id ||
                  index
                }
                className={
                  styles.productCard
                }
              >
                <h3>
                  {item.name}
                </h3>

                <p>
                  SKU:{' '}
                  {item.id}
                </p>

                <p>
                  Quantity:{' '}
                  {
                    item.quantity
                  }
                </p>

                {item.uniqueId && (
                  <p>
                    Unique ID:{' '}
                    {
                      item.uniqueId
                    }
                  </p>
                )}

                <button
                  type="button"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    selectOriginalProduct(
                      item
                    )
                  }
                >
                  {selectedOriginalItem?.id ===
                  item.id
                    ? 'Selected'
                    : 'Exchange This Product'}
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* ======================================================
          REPLACEMENT PRODUCT SEARCH
          ====================================================== */}

      {selectedOriginalItem && (
        <>
          <h2>
            Select Replacement Product
          </h2>

          <p>
            Replacing:{' '}
            <strong>
              {
                selectedOriginalItem.name
              }
            </strong>
          </p>

          <p>
            Original SKU:{' '}
            <strong>
              {
                selectedOriginalItem.id
              }
            </strong>
          </p>

          <p>
            Quantity:{' '}
            <strong>
              {
                selectedOriginalItem.quantity ||
                1
              }
            </strong>
          </p>

          {/* SEARCH BOX */}

          <div
            className={
              styles.searchBox
            }
          >
            <input
              type="text"
              value={
                searchText
              }
              onChange={(
                event
              ) => {
                setSearchText(
                  event.target.value
                )

                setError(
                  null
                )
              }}
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  'Enter'
                ) {
                  searchProducts()
                }
              }}
              placeholder="Search product or SKU"
              disabled={
                loading
              }
            />

            <button
              type="button"
              onClick={
                searchProducts
              }
              disabled={
                loading
              }
            >
              {loading
                ? 'Searching...'
                : 'Search'}
            </button>
          </div>

          {/* ==================================================
              SEARCH RESULTS
              ================================================== */}

          {products.length >
            0 && (
            <div>
              <h3>
                Search Results
              </h3>

              {products.map(
                (
                  product,
                  productIndex
                ) => (
                  <div
                    key={
                      product.productId ||
                      productIndex
                    }
                    className={
                      styles.productCard
                    }
                  >
                    <h3>
                      {
                        product.productName
                      }
                    </h3>

                    {product.brand && (
                      <p>
                        Brand:{' '}
                        {
                          product.brand
                        }
                      </p>
                    )}

                    {product.items &&
                    product.items.length >
                      0 ? (
                      <div>
                        {product.items.map(
                          (
                            item,
                            itemIndex
                          ) => {
                            const isSelected =
                              selectedReplacementItem?.itemId ===
                              item.itemId

                            return (
                              <div
                                key={
                                  item.itemId ||
                                  itemIndex
                                }
                                className={
                                  styles.skuItem
                                }
                              >
                                <p>
                                  SKU:{' '}
                                  {
                                    item.itemId
                                  }
                                </p>

                                {item.name && (
                                  <p>
                                    {
                                      item.name
                                    }
                                  </p>
                                )}

                                {item.measurementUnit && (
                                  <p>
                                    Measurement:{' '}
                                    {
                                      item.measurementUnit
                                    }
                                  </p>
                                )}

                                {item.unitMultiplier && (
                                  <p>
                                    Unit multiplier:{' '}
                                    {
                                      item.unitMultiplier
                                    }
                                  </p>
                                )}

                                <button
                                  type="button"
                                  disabled={
                                    loading
                                  }
                                  onClick={() =>
                                    selectReplacementProduct(
                                      item
                                    )
                                  }
                                >
                                  {isSelected
                                    ? 'Selected'
                                    : 'Select Product'}
                                </button>
                              </div>
                            )
                          }
                        )}
                      </div>
                    ) : (
                      <p>
                        No SKU found for
                        this product.
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {products.length ===
            0 &&
            searchText &&
            !loading && (
              <p>
                No products found.
              </p>
            )}
        </>
      )}

      {/* ======================================================
          CONFIRM EXCHANGE
          ====================================================== */}

      {selectedOriginalItem &&
        selectedReplacementItem && (
          <div
            className={
              styles.exchangeSummary
            }
          >
            <h2>
              Confirm Exchange
            </h2>

            <p>
              Original:{' '}
              {
                selectedOriginalItem.name
              }
            </p>

            <p>
              Replacement:{' '}
              {
                selectedReplacementItem.name ||
                selectedReplacementItem.itemId
              }
            </p>

            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                confirmExchange
              }
            >
              {loading
                ? 'Exchanging...'
                : 'Confirm Exchange'}
            </button>
          </div>
        )}
    </div>
  )
}

export default ExchangeOrder