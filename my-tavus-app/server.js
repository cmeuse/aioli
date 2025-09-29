import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'dist')))

// API endpoint to get existing persona and create conversation
app.post('/api/setup-cooking-conversation', async (req, res) => {
  const { ingredients } = req.body
  const existingPersonaId =  process.env.VITE_PERSONA_ID 
  
  try {
    
    // Check if Tavus API key is available
    if (!process.env.VITE_TAVUS_API_KEY) {
      console.error('TAVUS_API_KEY not found')
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Tavus API key not configured'
      })
    }
    
    // Get existing persona details with timeout
    console.log(`Fetching persona ${existingPersonaId} with API key: ${process.env.VITE_TAVUS_API_KEY?.substring(0, 10)}...`)
    
    const personaResponse = await fetch(`https://tavusapi.com/v2/personas/${existingPersonaId}`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.VITE_TAVUS_API_KEY,
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!personaResponse.ok) {
      const errorText = await personaResponse.text()
      console.error(`Tavus API error ${personaResponse.status}: ${errorText}`)
      console.error(`Request details: URL=${personaResponse.url}, Headers=${JSON.stringify({ 'x-api-key': process.env.VITE_TAVUS_API_KEY?.substring(0, 10) + '...' })}`)
      
      // Return proper error response
      return res.status(personaResponse.status).json({
        error: 'Failed to fetch persona',
        message: errorText,
        status: personaResponse.status
      })
    }

    const personaData = await personaResponse.json()
    
    // Create conversation with existing persona with timeout
    const conversationPayload = {
      persona_id: existingPersonaId,
      conversation_name: `Cooking with ${ingredients?.length || 0} ingredients`,
      conversational_context: ingredients?.length > 0
        ? `The user has these ingredients available: ${ingredients.join(', ')}. Help them create a delicious recipe using these ingredients.`
        : 'Help the user create a delicious recipe with their available ingredients.',
      custom_greeting: ingredients?.length > 0
        ? `Hi! I see you have ${ingredients.join(', ')} to work with. Let's create something amazing together! What kind of dish are you in the mood for?`
        : 'Hi! I\'m your cooking assistant. Tell me what ingredients you have and I\'ll help you create something delicious!'
    }

    const conversationResponse = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_TAVUS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(conversationPayload),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!conversationResponse.ok) {
      const errorText = await conversationResponse.text()
      console.error(`Tavus conversation API error ${conversationResponse.status}: ${errorText}`)
      
      // Return proper error response
      return res.status(conversationResponse.status).json({
        error: 'Failed to create conversation',
        message: errorText,
        status: conversationResponse.status
      })
    }

    const conversationData = await conversationResponse.json()
    
    // Return conversation data with persona and ingredient context
    res.json({
      ...conversationData,
      persona: personaData,
      ingredients: ingredients || []
    })
  } catch (error) {
    console.error('Error setting up conversation:', error)
    
    // Return mock data if API fails
    if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('fetch failed') || error.message.includes('400')) {
      console.warn('Tavus API failed, returning mock data:', error.message)
      return res.json({
        conversation_url: 'mock://conversation-url',
        persona: { id: existingPersonaId, name: 'Cooking Assistant' },
        ingredients: ingredients || []
      })
    }
    
    res.status(500).json({ 
      error: 'Failed to setup conversation',
      details: error.message 
    })
  }
})

// API endpoint for extracting recipe from conversation
app.post('/api/extract-recipe', async (req, res) => {
  try {
    const { conversation } = req.body

    if (!conversation) {
      return res.status(400).json({ error: 'Conversation text is required' })
    }

    // Call OpenAI API to extract recipe from conversation
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a recipe extraction assistant. Analyze the conversation and extract any recipe information. 
            Return a JSON object with the following structure:
            {
              "title": "Recipe name",
              "ingredients": ["ingredient 1", "ingredient 2", ...],
              "steps": [
                {"step": 1, "instruction": "First step"},
                {"step": 2, "instruction": "Second step"}
              ],
              "cookingTime": "X minutes/hours",
              "servings": "X servings"
            }
            
            Only return valid JSON. If no complete recipe is found, return an empty object.`
          },
          {
            role: 'user',
            content: conversation
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0].message.content

    try {
      const extractedRecipe = JSON.parse(content)
      res.json(extractedRecipe)
    } catch (parseError) {
      // If parsing fails, return empty recipe
      res.json({})
    }
  } catch (error) {
    console.error('Error extracting recipe:', error)
    res.status(500).json({ 
      error: 'Failed to extract recipe',
      details: error.message 
    })
  }
})


// API endpoint to list and end existing conversations
app.get('/api/conversations', async (req, res) => {
  try {
    if (!process.env.VITE_TAVUS_API_KEY) {
      return res.json({ conversations: [] })
    }

    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'GET',
      headers: {
        'x-api-key': process.env.VITE_TAVUS_API_KEY,
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to list conversations: ${response.status} - ${errorText}`)
      return res.json({ conversations: [], error: errorText })
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error listing conversations:', error)
    res.json({ conversations: [], error: error.message })
  }
})

// API endpoint to end a conversation
app.post('/api/end-conversation', async (req, res) => {
  try {
    const { conversation_id } = req.body

    if (!process.env.VITE_TAVUS_API_KEY || !conversation_id) {
      return res.json({ success: true, message: 'No API key or conversation ID provided' })
    }

    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.VITE_TAVUS_API_KEY,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to end conversation: ${response.status} - ${errorText}`)
      return res.json({ success: false, error: errorText })
    }

    const responseText = await response.text()
    const data = responseText ? JSON.parse(responseText) : { message: 'Conversation ended successfully' }
    res.json({ success: true, data })
  } catch (error) {
    console.error('Error ending conversation:', error)
    res.json({ success: false, error: error.message })
  }
})

// API endpoint for ingredient analysis
app.post('/api/analyze-ingredients', async (req, res) => {
  try {
    const { image, prompt } = req.body

    if (!image) {
      return res.status(400).json({ error: 'No image provided' })
    }

    // Extract base64 data from data URL if needed
    let base64Image = image
    if (image.startsWith('data:')) {
      const [header, data] = image.split(',')
      console.log('Image header:', header)
      console.log('Image data length:', data?.length || 0)
      base64Image = data
    }
    
    console.log('Base64 image length:', base64Image?.length || 0)

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found')
      return res.status(500).json({ error: 'OpenAI API key not configured' })
    }

    console.log('Calling OpenAI API...')

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt || 'Analyze this image and extract all visible ingredients. Return only a JSON array of ingredient names, nothing else.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error(`OpenAI API error ${openaiResponse.status}: ${errorText}`)
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`)
    }

    const openaiData = await openaiResponse.json()
    console.log('OpenAI response received')
    const content = openaiData.choices[0].message.content
    console.log('OpenAI content:', content)

    // Try to parse the JSON response
    let ingredients
    try {
      // Clean the content by removing markdown code blocks
      const cleanedContent = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

      console.log('Cleaned content:', cleanedContent)
      ingredients = JSON.parse(cleanedContent)
    } catch (parseError) {
      // If parsing fails, try to extract ingredients from text
      ingredients = content.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('[') && !line.startsWith(']'))
        .map(line => line.replace(/^[-•*]\s*/, '').replace(/[",]/g, '').trim())
        .filter(line => line.length > 0 && line !== 'ingredients' && !line.toLowerCase().includes('ingredients:'))
    }

    res.json({ ingredients })
  } catch (error) {
    console.error('Error analyzing ingredients:', error)
    res.status(500).json({
      error: 'Failed to analyze ingredients',
      details: error.message
    })
  }
})

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
