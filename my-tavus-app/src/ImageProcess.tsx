import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Conversation } from './components/cvi/components/conversation'
import { Transcription } from './components/cvi/components/transcription'
import { CVIProvider } from './components/cvi/components/cvi-provider'


interface IngredientAnalysis {
  ingredients: string[]
  confidence?: number
}

interface ExtractedRecipe {
  title: string;
  ingredients: string[];
  steps: Array<{ step: number; instruction: string }>;
  cookingTime?: string;
  servings?: string;
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
  }


  const handleRecipeExtracted = (recipe: ExtractedRecipe) => {
    // Recipe extraction is handled by the Transcription component
    console.log('Recipe extracted:', recipe)
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
          display: 'flex',
          height: '100vh',
          width: '100vw',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Conversation 
              onLeave={handleLeaveConversation}
              conversationUrl={conversationUrl}
            />
          </div>
          <div style={{
            width: '400px',
            borderLeft: '1px solid #e9ecef',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Transcription onRecipeExtracted={handleRecipeExtracted} />
          </div>
        </div>
      </CVIProvider>
    )
  }

  return (
    <div style={{
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      boxSizing: 'border-box',
      height: '100vh',
      width: '100vw',
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 70%, #004d00 100%)',
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            background: '#004d00',
            color: 'white',
            border: '2px solid #004d00',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            position: 'fixed',
            top: '1rem',
            left: '1rem'
          }}
        >
          ← Back to Home
        </button>
      </div>
      {!conversationUrl && (
        <>
          <h2 style={{
            textAlign: 'center',
            color: '#004d00',
            fontSize: '2rem',
            marginBottom: '2rem'
          }}>
            Snap A Picture of Your Ingredients
            <br />
            And Leave the Rest to Us
          </h2>

      {/* File Upload */}
      {!previewUrl && (
        <div style={{
          border: '2px dashed #004d00',
          borderRadius: '10px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          backgroundColor: '#f9f9f9'
        }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'linear-gradient(to right, #004d00, #006400)',
              color: '#fff',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Choose Image
          </label>
          <p style={{ marginTop: '1rem', color: '#666' }}>
            Upload a photo of ingredients to get started
          </p>
        </div>
      )}
        </>
      )}

      {/* Image Preview */}
      {previewUrl && !conversationUrl && (
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '400px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      )}

      {/* Analyze Button */}
      {selectedFile && !conversationUrl && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={analyzeImage}
              disabled={loading}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: loading ? '#ccc' : 'linear-gradient(to right, #004d00, #006400)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze Ingredients'}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null)
                setPreviewUrl(null)
                setAnalysis(null)
                setError(null)
                setConversationUrl(null)
                setConversationId(null)
              }}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: 'white',
                color: '#004d00',
                borderColor: '#004d00',
                borderRadius: '6px',
                borderWidth: '2px',
                borderStyle: 'solid',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Reupload Image
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#ffe6e6',
          color: '#d00',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div style={{
          backgroundColor: '#f0f8f0',
          padding: '2rem',
          borderRadius: '10px',
          border: '2px solid #004d00',
          width: '90vw',
          maxWidth: '900px',
          minWidth: '600px'
        }}>
          <h3 style={{
            color: '#004d00',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Detected Ingredients
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            width: '100%'
          }}>
            {analysis.ingredients.map((ingredient, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#fff',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#004d00'
                }}
              >
                {ingredient}
              </div>
            ))}
          </div>
          
          {conversationUrl && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={startConversation}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(to right, #004d00, #006400)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto'
                }}
              >
                🍳 Start Cooking Conversation
              </button>
              <p style={{ 
                marginTop: '0.5rem', 
                color: '#666', 
                fontSize: '0.9rem' 
              }}>
                Chat with your AI cooking assistant to create recipes with these ingredients
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageProcess
