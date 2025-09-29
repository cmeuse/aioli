import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/analyze')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 70%, #004d00 100%)',
    }}>
        <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            boxSizing: 'border-box',
        }}>
        <img 
            src="src/assets/logo.png" 
            alt="Aioli Logo" 
            style={{ width: '300px', height: 'auto' }}
        />
        </div>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            maxWidth: '2000px',
            margin: '0 auto',
            padding: '0 2rem'
        }}>
            <img
            src="src/assets/food.jpeg"
            alt="Aioli Logo"
            style={{ width: '700px', height: 'auto', borderRadius: '10px'}}
        />
        <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}> Turn your random ingredients into restaurant-quality meals with just a photo.  
                AI instantly recognizes what's in your kitchen, then pairs you with a conversational cooking 
                assistant who guides you step-by-step through personalized recipes. 
                Cooking has never been this smart or simple.</p>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <button 
                    onClick={handleGetStarted}
                    style={{ 
                        padding: '0.75rem 1.5rem', 
                        fontSize: '1rem', 
                        background: 'linear-gradient(to right, #004d00, #006400)',
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer', 
                        borderColor: '#004d00',
                        fontWeight: 'bold',
                    }}
                >
                    Get Started
                </button>
            </div>
        </div>
        </div>
    </div>
  )
}

export default Landing