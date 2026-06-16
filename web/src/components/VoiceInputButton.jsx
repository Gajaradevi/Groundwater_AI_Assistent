import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

/**
 * VoiceInputButton Component (Feature 2)
 * Integrates Web Speech API for voice-to-text input in the chatbot.
 */
export function VoiceInputButton({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // English (India) locale for voice analysis

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          // Ignore quiet pauses
        } else {
          alert(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  return (
    <button
      type="button"
      className={`voice-input-btn ${isListening ? 'listening' : ''}`}
      onClick={toggleListening}
      disabled={disabled}
      title={isListening ? 'Listening... click to stop' : 'Voice Input (English)'}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
    >
      <Mic className={`mic-icon ${isListening ? 'pulse' : ''}`} size={18} />
    </button>
  );
}

export default VoiceInputButton;
