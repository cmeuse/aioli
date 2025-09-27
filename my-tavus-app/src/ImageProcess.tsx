import { useState } from 'react'
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
  const [isInConversation, setIsInConversation] = useState(false)

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
        throw new Error('Failed to setup conversation')
      }

      const conversationData = await response.json()
      setConversationUrl(conversationData.conversation_url)
    } catch (err) {
      console.error('Error setting up conversation:', err)
      setError('Failed to set up cooking assistant')
    }
  }

  const startConversation = () => {
    if (conversationUrl) {
      setIsInConversation(true)
    }
  }

  const handleLeaveConversation = () => {
    setIsInConversation(false)
    setConversationUrl(null)
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
      maxWidth: '800px',
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
      transform: 'translate(-50%, -50%)'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            background: 'transparent',
            color: '#004d00',
            border: '2px solid #004d00',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
      </div>
      <h2 style={{
        textAlign: 'center',
        color: '#004d00',
        marginBottom: '2rem',
        fontSize: '2rem'
      }}>
        Upload Image for Ingredient Analysis
      </h2>

      {/* File Upload */}
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

      {/* Image Preview */}
      {previewUrl && (
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
      {selectedFile && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
          border: '2px solid #004d00'
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
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
