import React, { Fragment } from 'react'
import { Route } from 'vtex.my-account-commons/Router'
// Your component pages
import Example from './Components/MyAccountCustomPages/Example'

const MyAccountAppPage = () => (
  <Fragment>
    <Route path="/example" component={Example} />
  </Fragment>
)

export default MyAccountAppPage