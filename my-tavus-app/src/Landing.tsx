import React from 'react'

const Landing = () => {
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      textAlign: 'center',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <img 
        src="src/assets/logo.png" 
        alt="Aioli Logo" 
        style={{ width: '80px', height: 'auto' }}
      />
      <p>Aioli is a platform for creating and sharing AI-powered conversations.</p>
      <button>Get Started</button>
    </div>
  )
}

export default Landing