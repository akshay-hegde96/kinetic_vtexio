import React from 'react'

const WishlistAccountButton = ({
  label = 'MY WISHLIST',
  redirectUrl = '/account#/wishlist',
  customStyle = {}
}) => {
  const handleClick = (e) => {
    if (window.location.hash !== '#/wishlist') {
      window.location.href = redirectUrl
    }
  }

  return (
    <div style={{ margin: '16px 0', display: 'inline-block' }}>
      <button
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '12px 24px',
          backgroundColor: '#0c0f0f',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '700',
          fontSize: '13px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transition: 'all 0.2s ease',
          ...customStyle
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e63946'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#0c0f0f'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span>{label}</span>
      </button>
    </div>
  )
}

export default WishlistAccountButton
