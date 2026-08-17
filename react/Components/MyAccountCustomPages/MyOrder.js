import React, { useEffect, useState } from 'react'
import MyOrderDetails from './MyOrderDetails'
import styles from './MyOrder.css'

const MyOrder = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/oms/user/orders', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(
            `Failed to fetch orders: ${response.status}`
          )
        }

        const data = await response.json()

        console.log('Complete API response:', data)
        console.log('Orders:', data.list)

        // Your orders are inside data.list
        setOrders(data.list || [])
      } catch (error) {
        console.error('Orders API error:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])
  
  useEffect(() => {
    const getOrderIdFromHash = () => {
        const hash = window.location.hash

        console.log('Current hash:', hash)

        const queryIndex = hash.indexOf('?')

        if (queryIndex === -1) {
        setSelectedOrderId(null)
        return
        }

        const queryString =
        hash.substring(queryIndex + 1)

        const params = new URLSearchParams(
        queryString
        )

        const orderId = params.get('orderId')

        console.log('Selected Order ID:', orderId)

        setSelectedOrderId(orderId)
    }

    getOrderIdFromHash()

    window.addEventListener(
        'hashchange',
        getOrderIdFromHash
    )

    return () => {
        window.removeEventListener(
        'hashchange',
        getOrderIdFromHash
        )
    }
}, [])


    if (selectedOrderId) {
        return (
            <MyOrderDetails
            orderId={selectedOrderId}
            onExchange={() => setShowExchange(true)}
            />
        )
    }

  if (loading) {
    return (
      <div className={styles.MyOrderPage_container}>
        <h1>My Orders</h1>
        <p>Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.MyOrderPage_container}>
        <h1>My Orders</h1>
        <p>Unable to load orders.</p>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className={styles.MyOrderPage_container}>
      <h1>My Orders</h1>

      <p>
        Total Orders: {orders.length}
      </p>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div
              key={order.orderId}
              className={styles.orderCard}
            >
              <div className={styles.orderHeader}>
                <div>
                  <h2>
                    Order #{order.orderId}
                  </h2>

                  <p>
                    Placed on:{' '}
                    {new Date(
                      order.creationDate
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    Customer: {order.clientName}
                  </p>
                </div>

                <div className={styles.orderSummary}>
                  <p>
                    <strong>
                      {order.status}
                    </strong>
                  </p>

                  <p>
                    Total:{' '}
                    {order.currencyCode}{' '}
                    {(order.totalValue / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className={styles.orderInfo}>
                <div>
                  <span>Items</span>
                  <strong>
                    {order.totalItems}
                  </strong>
                </div>

                <div>
                  <span>Payment</span>
                  <strong>
                    {order.paymentNames}
                  </strong>
                </div>

                <div>
                  <span>Order Status</span>
                  <strong>
                    {order.status}
                  </strong>
                </div>
              </div>

              {order.ShippingEstimatedDate && (
                <div className={styles.orderDates}>
                  <p>
                    Estimated delivery:{' '}
                    {new Date(
                      order.ShippingEstimatedDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className={styles.orderFooter}>
                    <button
                        type="button"
                        onClick={() => {
                            window.location.hash =
                            `/myorder?orderId=${encodeURIComponent(
                                order.orderId
                            )}`
                        }}
                        >
                        View Order
                    </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrder