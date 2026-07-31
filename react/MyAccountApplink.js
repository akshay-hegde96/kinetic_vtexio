import PropTypes from 'prop-types'
import { intlShape, injectIntl } from 'react-intl'

const MyAccountApplink = ({ render, intl }) => {
  return render([
    {
      name:"Example Link",
      path: '/example',
    },
  ])
}

MyAccountApplink.propTypes = {
  render: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
}

export default injectIntl(MyAccountApplink)