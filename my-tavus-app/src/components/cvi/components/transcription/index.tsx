import React, { useState, useEffect, useRef } from 'react';
import { useTranscription } from '../../hooks/use-transcription';
import styles from './transcription.module.css';

interface RecipeStep {
  step: number;
  instruction: string;
}

interface ExtractedRecipe {
  title: string;
  ingredients: string[];
  steps: RecipeStep[];
  cookingTime?: string;
  servings?: string;
}

interface TranscriptionProps {
  onRecipeExtracted?: (recipe: ExtractedRecipe) => void;
}

export const Transcription: React.FC<TranscriptionProps> = ({ onRecipeExtracted }) => {
  const [currentRecipe, setCurrentRecipe] = useState<ExtractedRecipe | null>(null);
  const { messages, isListening } = useTranscription();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      // Try to extract recipe from the conversation when new messages arrive
      extractRecipeFromMessages(messages);
    }
  }, [messages]);

  const extractRecipeFromMessages = async (allMessages: TranscriptionMessage[]) => {
    // Combine recent messages for recipe extraction
    const recentMessages = allMessages.slice(-10);
    const conversationText = recentMessages
      .map(msg => `${msg.speaker}: ${msg.text}`)
      .join('\n');

    // Check if conversation contains recipe-related keywords
    const recipeKeywords = ['recipe', 'ingredients', 'steps', 'cook', 'bake', 'fry', 'mix', 'season', 'heat'];
    const hasRecipeContent = recipeKeywords.some(keyword => 
      conversationText.toLowerCase().includes(keyword)
    );

    if (!hasRecipeContent) return;

    try {
      const response = await fetch('/api/extract-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversationText
        })
      });

      if (response.ok) {
        const extractedRecipe = await response.json();
        if (extractedRecipe.title && extractedRecipe.steps.length > 0) {
          setCurrentRecipe(extractedRecipe);
          onRecipeExtracted?.(extractedRecipe);
        }
      }
    } catch (error) {
      console.error('Error extracting recipe:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Cooking Conversation</h3>
        <div className={`${styles.listeningIndicator} ${isListening ? styles.listening : ''}`}>
          {isListening ? '🎤 Listening...' : '🔇'}
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Start talking to see the transcription here...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${styles[message.speaker]}`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.speaker}>
                  {message.speaker === 'user' ? '👤 You' : '🤖 Chef'}
                </span>
                <span className={styles.timestamp}>
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div className={styles.messageText}>
                {message.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {currentRecipe && (
        <div className={styles.recipeCard}>
          <h4 className={styles.recipeTitle}>🍳 {currentRecipe.title}</h4>
          
          {currentRecipe.cookingTime && (
            <div className={styles.recipeMeta}>
              <span>⏱️ {currentRecipe.cookingTime}</span>
              {currentRecipe.servings && <span>👥 {currentRecipe.servings}</span>}
            </div>
          )}

          {currentRecipe.ingredients.length > 0 && (
            <div className={styles.ingredientsSection}>
              <h5>Ingredients:</h5>
              <ul>
                {currentRecipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.stepsSection}>
            <h5>Instructions:</h5>
            <ol>
              {currentRecipe.steps.map((step) => (
                <li key={step.step}>{step.instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
