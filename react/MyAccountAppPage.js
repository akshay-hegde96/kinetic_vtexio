import React, { Fragment } from 'react'
import { Route } from 'vtex.my-account-commons/Router'
// Your component pages
import Example from './Components/MyAccountCustomPages/Example'
import MyOrder from './Components/MyAccountCustomPages/MyOrder'
import ExchangeOrder from './Components/MyAccountCustomPages/ExchangeOrder'


const MyAccountAppPage = () => (
  <Fragment>
    <Route path="/example" component={Example} />
    <Route path="/myorder" component={MyOrder} />
  </Fragment>
)

export default MyAccountAppPage