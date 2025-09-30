import { useNavigate } from 'react-router-dom'

// Icon components
const ChefHat = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const Camera = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const MessageCircle = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
)

const BookOpen = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

// Button component
const Button = ({ 
  children, 
  onClick, 
  className = '',
  variant = 'default',
  disabled = false,
  ...props
}: { 
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'hero' | 'ghost' | 'outline'
  disabled?: boolean
  [key: string]: unknown
}) => {
  const baseStyles = {
    padding: '1rem 2.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  }

  const variantStyles = {
    default: {
      background: 'hsl(18, 65%, 55%)',
      color: '#fff',
    },
    hero: {
      background: 'linear-gradient(135deg, hsl(18, 65%, 55%), hsl(18, 45%, 75%))',
      color: '#fff',
      boxShadow: '0 4px 20px -4px hsl(20 20% 15% / 0.1)',
    },
    ghost: {
      background: 'transparent',
      color: 'hsl(20, 20%, 15%)',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: 'hsl(20, 20%, 15%)',
      border: '1px solid hsl(85, 15%, 88%)',
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        opacity: disabled ? 0.6 : 1,
      }}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'hero') {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 25px -4px hsl(20 20% 15% / 0.15)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === 'hero') {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 20px -4px hsl(20 20% 15% / 0.1)'
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}

const Landing = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/analyze')
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, hsl(35, 20%, 98%) 0%, hsl(35, 30%, 96%) 50%, hsl(85, 25%, 88%) 100%)',
      margin: 0,
      padding: 0,
    }}>
      {/* Header */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, hsl(18, 65%, 55%), hsl(18, 45%, 75%))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ChefHat style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'hsl(20, 20%, 15%)',
              margin: 0,
            }}>Aioli</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 1rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center',
        }}>
          {/* Left side - Image */}
          <div>
            <div style={{ position: 'relative' }}>
              <img
                src="src/assets/food.jpeg"
                alt="Fresh cooking ingredients on a marble countertop"
                style={{
                  width: '100%',
                  height: '500px',
                  objectFit: 'cover',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent)',
                borderRadius: '16px',
              }} />
            </div>
          </div>

          {/* Right side - Content */}
          <div style={{ 
            textAlign: 'left',
          }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'hsl(20, 20%, 15%)',
              marginBottom: '1.5rem',
              lineHeight: 1.1,
            }}>
              Your AI
              <span style={{ 
                display: 'block', 
                color: 'hsl(18, 65%, 55%)' 
              }}>Cooking</span>
              <span style={{ display: 'block' }}>Assistant</span>
            </h2>
            
            <p style={{
              fontSize: '1.25rem',
              color: 'hsl(20, 10%, 45%)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}>
              Transform random ingredients into restaurant-quality meals. 
              Just snap a photo and let our AI chef guide you step-by-step 
              through personalized recipes via video chat.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <Button
                variant="hero"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
            </div>

            {/* Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'hsl(85, 35%, 65% / 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}>
                  <Camera style={{ width: '24px', height: '24px', color: 'hsl(85, 35%, 65%)' }} />
                </div>
                <h3 style={{
                  fontWeight: '600',
                  color: 'hsl(20, 20%, 15%)',
                  marginBottom: '0.25rem',
                  fontSize: '1rem',
                }}>Snap & Scan</h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'hsl(20, 10%, 45%)',
                  margin: 0,
                }}>AI recognizes your ingredients instantly</p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'hsl(18, 65%, 55% / 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}>
                  <MessageCircle style={{ width: '24px', height: '24px', color: 'hsl(18, 65%, 55%)' }} />
                </div>
                <h3 style={{
                  fontWeight: '600',
                  color: 'hsl(20, 20%, 15%)',
                  marginBottom: '0.25rem',
                  fontSize: '1rem',
                }}>Video Chat</h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'hsl(20, 10%, 45%)',
                  margin: 0,
                }}>Live guidance from AI chef</p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'hsl(85, 35%, 65% / 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                }}>
                  <BookOpen style={{ width: '24px', height: '24px', color: 'hsl(85, 35%, 65%)' }} />
                </div>
                <h3 style={{
                  fontWeight: '600',
                  color: 'hsl(20, 20%, 15%)',
                  marginBottom: '0.25rem',
                  fontSize: '1rem',
                }}>Save Recipes</h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'hsl(20, 10%, 45%)',
                  margin: 0,
                }}>Auto-extract recipes from conversations</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing