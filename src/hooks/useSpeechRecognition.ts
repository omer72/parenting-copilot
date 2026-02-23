import { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import type { RecordingData } from 'capacitor-voice-recorder';

interface WebSpeechRecognitionResult {
  [index: number]: {
    transcript: string;
  };
  isFinal: boolean;
}

interface WebSpeechRecognitionResultList {
  [index: number]: WebSpeechRecognitionResult;
  length: number;
}

interface WebSpeechRecognitionEvent {
  results: WebSpeechRecognitionResultList;
}

interface WebSpeechRecognitionErrorEvent {
  error: string;
}

interface IWebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((event: WebSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => IWebSpeechRecognition;
    webkitSpeechRecognition: new () => IWebSpeechRecognition;
  }
}

// Transcribe audio using OpenAI Whisper API
async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    console.warn('OpenAI API key not configured for transcription');
    return '';
  }

  try {
    // Convert base64 to blob
    const byteCharacters = atob(base64Audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Determine file extension and actual MIME type for Whisper API
    // iOS returns 'audio/aac' (raw AAC/ADTS) which Whisper doesn't support directly
    // We send it as M4A which uses AAC codec - Whisper may accept it
    let extension: string;
    let actualMimeType: string;

    if (mimeType.includes('aac')) {
      // iOS raw AAC - try as M4A (AAC in MP4 container)
      extension = 'm4a';
      actualMimeType = 'audio/mp4';
    } else if (mimeType.includes('mp4')) {
      extension = 'm4a';
      actualMimeType = mimeType;
    } else if (mimeType.includes('webm')) {
      extension = 'webm';
      actualMimeType = mimeType;
    } else if (mimeType.includes('wav')) {
      extension = 'wav';
      actualMimeType = mimeType;
    } else {
      extension = 'mp3';
      actualMimeType = 'audio/mpeg';
    }

    const blob = new Blob([byteArray], { type: actualMimeType });
    const file = new File([blob], `recording.${extension}`, { type: actualMimeType });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', 'he'); // Hebrew

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', errorText);
      return '';
    }

    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('Transcription error:', error);
    return '';
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef<IWebSpeechRecognition | null>(null);
  const isNative = Capacitor.isNativePlatform();

  // Check if speech recognition is supported
  useEffect(() => {
    const checkSupport = async () => {
      if (isNative) {
        // Check native voice recording permission
        try {
          const permissionStatus = await VoiceRecorder.hasAudioRecordingPermission();
          if (!permissionStatus.value) {
            const requestResult = await VoiceRecorder.requestAudioRecordingPermission();
            setIsSupported(requestResult.value);
          } else {
            setIsSupported(true);
          }
        } catch (error) {
          console.error('Error checking voice recorder permission:', error);
          setIsSupported(false);
        }
      } else {
        // Check for Web Speech API support
        const webSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
        setIsSupported(webSupported);

        if (webSupported) {
          const WebSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new WebSpeechRecognition();

          const recognition = recognitionRef.current;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'he-IL';

          recognition.onresult = (event: WebSpeechRecognitionEvent) => {
            let finalTranscript = '';

            for (let i = event.results.length - 1; i >= 0; i--) {
              const result = event.results[i];
              if (result.isFinal) {
                finalTranscript = result[0].transcript + ' ';
                break;
              }
            }

            if (finalTranscript) {
              setTranscript(prev => prev + finalTranscript);
            }
          };

          recognition.onerror = (event: WebSpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };
        }
      }
    };

    checkSupport();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isNative]);

  const startListening = useCallback(async () => {
    if (isListening) return;

    setTranscript('');

    if (isNative) {
      try {
        // Check and request permission if needed
        const permissionStatus = await VoiceRecorder.hasAudioRecordingPermission();
        if (!permissionStatus.value) {
          const requestResult = await VoiceRecorder.requestAudioRecordingPermission();
          if (!requestResult.value) {
            console.error('Microphone permission denied');
            return;
          }
        }

        await VoiceRecorder.startRecording();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting native recording:', error);
      }
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [isListening, isNative]);

  const stopListening = useCallback(async () => {
    if (!isListening) return;

    if (isNative) {
      try {
        setIsListening(false);
        setIsTranscribing(true);

        const recording: RecordingData = await VoiceRecorder.stopRecording();

        if (recording.value && recording.value.recordDataBase64) {
          const mimeType = recording.value.mimeType || 'audio/mp4';
          const transcribedText = await transcribeAudio(
            recording.value.recordDataBase64,
            mimeType
          );
          setTranscript(transcribedText);
        }

        setIsTranscribing(false);
      } catch (error) {
        console.error('Error stopping native recording:', error);
        setIsTranscribing(false);
      }
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      setIsListening(false);
    }
  }, [isListening, isNative]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    isTranscribing,
    startListening,
    stopListening,
    resetTranscript,
  };
}
