import React, { Fragment } from 'react'
import { Route } from 'vtex.my-account-commons/Router'
// Your component pages
import Example from './Components/MyAccountCustomPages/Example'
import MyAccountSalesChannelBridge from './Components/MyAccountSalesChannelBridge'

const MyAccountAppPage = () => (
  <Fragment>
    <MyAccountSalesChannelBridge />
    <Route path="/example" component={Example} />
  </Fragment>
)

export default MyAccountAppPage
