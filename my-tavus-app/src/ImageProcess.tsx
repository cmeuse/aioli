import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Conversation } from './components/cvi/components/conversation'
import { CVIProvider } from './components/cvi/components/cvi-provider'

// Icon components
const ArrowLeft = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const Camera = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UploadIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const CheckCircle = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const PlayIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const PauseIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
)

const StopIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h12v12H6z"/>
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
    appearance: 'none',
    outline: 'none',
    textDecoration: 'none',
    userSelect: 'none',
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
      border: '1px solid hsl(18, 15%, 88%)',
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
      className={`custom-button ${className}`}
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

// Card component
const Card = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode
  className?: string
  [key: string]: unknown
}) => {
  return (
    <div
      style={{
        background: 'hsl(0, 0%, 100%)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px -4px hsl(20 20% 15% / 0.1)',
        border: '1px solid hsl(18, 15%, 88%)',
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

// Timer component
const Timer = () => {
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    let interval: number | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsRunning(false)
            // Timer finished - could add notification sound here
            return 0
          }
          return timeLeft - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const startTimer = () => {
    const total = minutes * 60 + seconds
    if (total > 0) {
      setTotalSeconds(total)
      setTimeLeft(total)
      setIsRunning(true)
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
  }

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60)
    const secs = timeInSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0

  return (
    <div style={{
      background: 'hsl(0, 0%, 100%)',
      borderRadius: '12px',
      padding: '1rem 1.5rem',
      boxShadow: '0 4px 20px -4px hsl(20 20% 15% / 0.1)',
      border: '1px solid hsl(18, 15%, 88%)',
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      minWidth: '600px',
    }}>
      <h3 style={{
        margin: '0',
        fontSize: '1rem',
        fontWeight: '600',
        color: 'hsl(18, 65%, 55%)',
        whiteSpace: 'nowrap',
      }}>
        Timer:
      </h3>

      {!isRunning && timeLeft === 0 ? (
        <>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'hsl(20, 20%, 15%)',
                marginBottom: '0.25rem',
              }}>Min</label>
              <input
                type="number"
                min="0"
                max="99"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: '50px',
                  padding: '0.375rem',
                  border: '1px solid hsl(18, 15%, 88%)',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'hsl(20, 20%, 15%)',
                marginBottom: '0.25rem',
              }}>Sec</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                style={{
                  width: '50px',
                  padding: '0.375rem',
                  border: '1px solid hsl(18, 15%, 88%)',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
          <Button
            variant="hero"
            onClick={startTimer}
            disabled={minutes === 0 && seconds === 0}
            style={{ padding: '0.5rem 1rem' }}
          >
            <PlayIcon style={{ width: '16px', height: '16px' }} />
            Start
          </Button>
        </>
      ) : (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: timeLeft <= 10 ? '#ef4444' : 'hsl(18, 65%, 55%)',
              minWidth: '80px',
            }}>
              {formatTime(timeLeft)}
            </div>
            {totalSeconds > 0 && (
              <div style={{
                width: '200px',
                height: '6px',
                background: 'hsl(18, 15%, 88%)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: 'hsl(18, 65%, 55%)',
                  width: `${progress}%`,
                  transition: 'width 1s linear',
                }} />
              </div>
            )}
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
          }}>
            <Button
              variant={isRunning ? "outline" : "hero"}
              onClick={isRunning ? pauseTimer : () => setIsRunning(true)}
              style={{ padding: '0.375rem 0.75rem' }}
            >
              {isRunning ? (
                <PauseIcon style={{ width: '16px', height: '16px' }} />
              ) : (
                <PlayIcon style={{ width: '16px', height: '16px' }} />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetTimer}
              style={{ padding: '0.375rem 0.75rem' }}
            >
              <StopIcon style={{ width: '16px', height: '16px' }} />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}


interface IngredientAnalysis {
  ingredients: string[]
  confidence?: number
}


const ImageProcess = () => {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<IngredientAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationUrl, setConversationUrl] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isInConversation, setIsInConversation] = useState(false)

  // Cleanup function to end conversation when component unmounts or user navigates away
  useEffect(() => {
    const cleanup = async () => {
      if (conversationId) {
        try {
          // Use sendBeacon for reliable cleanup on page unload
          const data = JSON.stringify({ conversation_id: conversationId })
          const blob = new Blob([data], { type: 'application/json' })
          
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/end-conversation', blob)
            console.log('Conversation cleanup sent via sendBeacon')
          } else {
            // Fallback for browsers that don't support sendBeacon
            await fetch('/api/end-conversation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: data,
              keepalive: true
            })
            console.log('Conversation ended on cleanup')
          }
        } catch (err) {
          console.error('Error ending conversation on cleanup:', err)
        }
      }
    }

    // Handle page unload (refresh, navigation) - sendBeacon works for these
    const handleBeforeUnload = () => {
      cleanup()
    }

    // Handle component unmount (navigation away)
    const handleUnload = () => {
      cleanup()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Return cleanup function for component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handleUnload()
    }
  }, [conversationId])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setAnalysis(null)
      setError(null)
    }
  }

  const analyzeImage = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)

    try {
      // Convert image to base64
      const base64 = await convertToBase64(selectedFile)
      
      // Call ChatGPT API for image analysis
      const response = await fetch('/api/analyze-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          prompt: "Analyze this image and extract all visible ingredients. Return only a JSON array of ingredient names, nothing else."
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze image')
      }

      const result = await response.json()
      setAnalysis(result)
      
      // Create persona and conversation after successful analysis
      if (result.ingredients && result.ingredients.length > 0) {
        await createPersonaAndConversation(result.ingredients)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createPersonaAndConversation = async (ingredients: string[]) => {
    try {
      // Setup conversation with existing persona
      const response = await fetch('/api/setup-cooking-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredients
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        
        if (response.status === 400 && errorData.message?.includes('maximum concurrent conversations')) {
          setError('You have reached the maximum number of active conversations. Please end existing conversations and try again.')
        } else if (response.status === 402) {
          setError('Cooking assistant credits have been exhausted. Please try again later.')
        } else {
          setError(`Failed to set up cooking assistant: ${errorData.message || 'Unknown error'}`)
        }
        return
      }

      const conversationData = await response.json()
      setConversationUrl(conversationData.conversation_url)
      setConversationId(conversationData.conversation_id)
    } catch (err) {
      console.error('Error setting up conversation:', err)
      setError('Failed to set up cooking assistant. Please try again.')
    }
  }

  const startConversation = () => {
    if (conversationUrl) {
      setIsInConversation(true)
    }
  }

  const handleLeaveConversation = async () => {
    setIsInConversation(false)

    // End the conversation on the server
    if (conversationId) {
      try {
        await fetch('/api/end-conversation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_id: conversationId
          })
        })
      } catch (err) {
        console.error('Error ending conversation:', err)
      }
    }

    setConversationUrl(null)
    setConversationId(null)

    // Navigate back to home page
    navigate('/')
  }



  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Show conversation interface if in conversation mode
  if (isInConversation && conversationUrl) {
    return (
      <CVIProvider>
        <div style={{
          height: '100vh',
          width: '100vw',
          fontFamily: 'Arial, sans-serif',
          background: 'linear-gradient(135deg, hsl(18, 65%, 95%) 0%, hsl(18, 65%, 80%) 50%, hsl(18, 65%, 65%) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          boxSizing: 'border-box',
        }}>
          <div style={{
            width: '1100px',
            height: 'calc(100vh - 160px)',
            maxHeight: '700px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Conversation
              onLeave={handleLeaveConversation}
              conversationUrl={conversationUrl}
            />
          </div>
          <Timer />
        </div>
      </CVIProvider>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, hsl(35, 20%, 98%) 0%, hsl(35, 30%, 96%) 50%, hsl(18, 25%, 90%) 100%)',
      margin: 0,
      padding: 0,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
      }}>
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          style={{
            marginBottom: '1.5rem',
            color: 'hsl(20, 20%, 15%)',
            padding: '0.5rem 0',
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
          Back
        </Button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'hsl(20, 20%, 15%)',
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            Snap A Picture of Your Ingredients
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'hsl(20, 10%, 45%)',
          }}>
            Let our AI chef see what you're working with
          </p>
        </div>

        <Card style={{ padding: '2rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          {!previewUrl ? (
            <div
              style={{
                border: '2px dashed hsl(18, 15%, 88%)',
                borderRadius: '8px',
                padding: '3rem',
                textAlign: 'center',
                background: 'hsl(18, 15%, 92% / 0.3)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => document.getElementById('image-upload')?.click()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'hsl(18, 15%, 92% / 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'hsl(18, 15%, 92% / 0.3)'
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.style.background = 'hsl(18, 15%, 92% / 0.7)'
                e.currentTarget.style.borderColor = 'hsl(18, 65%, 55%)'
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.currentTarget.style.background = 'hsl(18, 15%, 92% / 0.3)'
                e.currentTarget.style.borderColor = 'hsl(18, 15%, 88%)'
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.currentTarget.style.background = 'hsl(18, 15%, 92% / 0.3)'
                e.currentTarget.style.borderColor = 'hsl(18, 15%, 88%)'

                const files = e.dataTransfer.files
                if (files.length > 0) {
                  const file = files[0]
                  if (file.type.startsWith('image/')) {
                    setSelectedFile(file)
                    setPreviewUrl(URL.createObjectURL(file))
                    setAnalysis(null)
                    setError(null)
                  }
                }
              }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'hsl(18, 65%, 55% / 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Camera style={{ width: '32px', height: '32px', color: 'hsl(18, 65%, 55%)' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'hsl(20, 20%, 15%)',
                    marginBottom: '0.5rem',
                  }}>
                    Upload your ingredients photo
                  </h3>
                  <p style={{
                    color: 'hsl(20, 10%, 45%)',
                    marginBottom: '1rem',
                  }}>
                    Take a clear photo of all your available ingredients
                  </p>
                  <label htmlFor="image-upload">
                    <Button variant="hero" style={{ cursor: 'pointer' }}>
                      <UploadIcon style={{ width: '16px', height: '16px' }} />
                      Choose Image
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={previewUrl}
                  alt="Uploaded ingredients"
                  style={{
                    width: '100%',
                    height: '256px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    setAnalysis(null)
                    setError(null)
                    setConversationUrl(null)
                    setConversationId(null)
                  }}
                >
                  Reupload Image
                </Button>
                
                {!analysis && (
                  <Button
                    variant="hero"
                    onClick={analyzeImage}
                    disabled={loading}
                    style={{ minWidth: '160px' }}
                  >
                    {loading ? "Analyzing..." : "Analyze Ingredients"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Error Display */}
        {error && (
          <Card style={{ 
            padding: '1rem', 
            marginBottom: '2rem',
            background: 'hsl(0, 84.2%, 60.2% / 0.1)',
            border: '1px solid hsl(0, 84.2%, 60.2% / 0.2)',
          }}>
            <p style={{
              color: 'hsl(0, 84.2%, 60.2%)',
              textAlign: 'center',
              margin: 0,
            }}>
              {error}
            </p>
          </Card>
        )}

        {analysis && analysis.ingredients.length > 0 && (
          <Card style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <CheckCircle style={{ width: '20px', height: '20px', color: 'hsl(18, 65%, 55%)', marginRight: '0.5rem' }} />
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'hsl(18, 65%, 55%)',
                margin: 0,
              }}>
                Detected Ingredients
              </h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              {analysis.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  style={{
                    background: 'hsl(18, 65%, 65%)',
                    color: '#fff',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: 'none',
                    boxShadow: '0 2px 6px hsl(20 20% 15% / 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {ingredient}
                </div>
              ))}
            </div>
            
            {conversationUrl && (
              <div style={{ textAlign: 'center' }}>
                <Button
                  variant="hero"
                  onClick={startConversation}
                  style={{
                    fontSize: '1.125rem',
                    padding: '0.75rem 2rem',
                  }}
                >
                  Start Cooking Conversation
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

export default ImageProcess
