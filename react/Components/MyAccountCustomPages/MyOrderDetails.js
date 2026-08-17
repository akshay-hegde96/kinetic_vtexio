import React, { useEffect, useState } from 'react'
import styles from './MyOrderDetails.css'
import ExchangeOrder from './ExchangeOrder'

const MyOrderDetails = ({ orderId }) => {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showExchange, setShowExchange] = useState(false)

  console.log('Order ID:', orderId)

  useEffect(() => {
    if (!orderId) {
      setError('Order ID not found')
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/oms/user/orders/${encodeURIComponent(orderId)}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch order: ${response.status}`
          )
        }

        const data = await response.json()

        console.log(
          'Order Details API response:',
          data
        )

        setOrder(data)
      } catch (error) {
        console.error(
          'Order details error:',
          error
        )

        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  // -------------------------
  // Loading
  // -------------------------

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Order Details</h1>
        <p>Loading order...</p>
      </div>
    )
  }

  // -------------------------
  // Error
  // -------------------------

  if (error) {
    return (
      <div className={styles.container}>
        <h1>Order Details</h1>

        <p>
          Unable to load order.
        </p>

        <p>{error}</p>
      </div>
    )
  }

  // -------------------------
  // No order
  // -------------------------

  if (!order) {
    return (
      <div className={styles.container}>
        <h1>Order Details</h1>

        <p>Order not found.</p>
      </div>
    )
  }

  if (showExchange) {
    return (
        <ExchangeOrder
        order={order}
        onBack={() =>
            setShowExchange(false)
        }
        />
    )
}

const canExchangeOrder = (status) => {
  if (!status) {
    return false
  }

  const normalizedStatus = status
    .toLowerCase()
    .replace(/_/g, '-')

  return (
    normalizedStatus === 'handling' ||
    normalizedStatus === 'ready-for-handling'
  )
}


  // -------------------------
  // Order details
  // -------------------------

  return (
    <div className={styles.container}>
      <button
        type="button"
        onClick={() => {
          window.location.hash = '/myorder'
        }}
      >
        ← Back to My Orders
      </button>

      <h1>Order Details</h1>

      {/* Order Header */}

      <div className={styles.orderHeader}>
        <h2>
          Order #{order.orderId}
        </h2>

        <p>
          Status:{' '}
          <strong>
            {order.status ||
              '-'}
          </strong>
        </p>

        <p>
          Order Date:{' '}
          {order.creationDate
            ? new Date(
                order.creationDate
              ).toLocaleDateString()
            : '-'}
        </p>

        <div className={styles.orderActions}>
           {canExchangeOrder(order.status) && (
            <button
            type="button"
            onClick={() => setShowExchange(true)}
            >
                Exchange Order
            </button>
           )}
        </div>

      </div>

      {/* Order Summary */}

      <div className={styles.summary}>
        <div>
          <span>Total Items</span>

          <strong>
            {order.items?.length ||
              order.totalItems ||
              0}
          </strong>
        </div>

        <div>
          <span>Payment</span>

          <strong>
            {order.paymentNames || '-'}
          </strong>
        </div>

        <div>
          <span>Total</span>

          <strong>
            {order.storePreferencesData
              ?.currencyCode ||
              order.currencyCode ||
              ''}{' '}
            {(
              (order.value ||
                order.totalValue ||
                0) / 100
            ).toFixed(2)}
          </strong>
        </div>
      </div>

      {/* Items */}

      <h2>Items</h2>

      {order.items?.length ? (
        <div className={styles.items}>
          {order.items.map(
            (item, index) => (
              <div
                key={
                  item.id || index
                }
                className={styles.item}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={
                      item.name ||
                      'Product'
                    }
                    width="100"
                    height="100"
                  />
                )}

                <div>
                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    Quantity:{' '}
                    {item.quantity}
                  </p>

                  <p>
                    Price:{' '}
                    {(
                      (item.price ||
                        0) / 100
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <p>
          No item details available.
        </p>
      )}
    </div>
  )
}

export default MyOrderDetails