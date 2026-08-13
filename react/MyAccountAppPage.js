import React, { Fragment } from 'react'
import { Route } from 'vtex.my-account-commons/Router'
// Your component pages
import Example from './Components/MyAccountCustomPages/Example'
import MyWishlist from './Components/MyAccountCustomPages/MyWishlist'

const MyAccountAppPage = () => (
  <Fragment>
    <Route path="/wishlist" component={MyWishlist} />
    <Route path="/example" component={Example} />
  </Fragment>
)

export default MyAccountAppPage