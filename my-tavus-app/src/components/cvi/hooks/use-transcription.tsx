import { useState, useEffect } from 'react';
import { useDaily } from '@daily-co/daily-react';

interface TranscriptionMessage {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export const useTranscription = () => {
  const [messages, setMessages] = useState<TranscriptionMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const daily = useDaily();

  useEffect(() => {
    if (!daily) return;

    // Listen for transcription events
    const handleTranscriptionStarted = () => {
      setIsListening(true);
    };

    const handleTranscriptionStopped = () => {
      setIsListening(false);
    };

    const handleTranscriptionMessage = (event: any) => {
      if (event.detail && event.detail.text) {
        const newMessage: TranscriptionMessage = {
          id: Date.now().toString(),
          speaker: event.detail.speaker === 'user' ? 'user' : 'assistant',
          text: event.detail.text,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
      }
    };

    // Daily.co events for transcription
    daily.on('transcription-started', handleTranscriptionStarted);
    daily.on('transcription-stopped', handleTranscriptionStopped);
    daily.on('transcription-message', handleTranscriptionMessage);

    // Also listen for participant events that might contain transcription
    const handleParticipantUpdated = (event: any) => {
      if (event.participant && event.participant.local) {
        // Handle local participant transcription
        if (event.participant.audioTrack && event.participant.audioTrack.state === 'playable') {
          setIsListening(true);
        }
      }
    };

    daily.on('participant-updated', handleParticipantUpdated);

    return () => {
      daily.off('transcription-started', handleTranscriptionStarted);
      daily.off('transcription-stopped', handleTranscriptionStopped);
      daily.off('transcription-message', handleTranscriptionMessage);
      daily.off('participant-updated', handleParticipantUpdated);
    };
  }, [daily]);

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isListening,
    clearMessages
  };
};
