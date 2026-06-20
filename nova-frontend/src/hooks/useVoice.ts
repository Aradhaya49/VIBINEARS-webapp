import { useState, useRef, useCallback } from 'react';

// Cross-browser speech recognition types
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): { transcript: string };
  [index: number]: { transcript: string };
}

interface ISpeechRecognitionEvent {
  readonly results: ISpeechRecognitionResult[] & { length: number };
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

interface VoiceState {
  isListening: boolean;
  transcript: string;
  audioLevel: number;
  error: string | null;
}

export function useVoice(onTranscript?: (text: string) => void) {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    audioLevel: 0,
    error: null,
  });

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = useCallback(async () => {
    try {
      // Audio level monitoring
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const updateLevel = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setState((s) => ({ ...s, audioLevel: avg / 128 }));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // Speech recognition
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
          const text = Array.from({ length: event.results.length })
            .map((_, i) => event.results[i][0].transcript)
            .join('');
          setState((s) => ({ ...s, transcript: text }));
          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            onTranscript?.(text);
          }
        };

        recognition.onerror = (e) => {
          setState((s) => ({ ...s, error: e.error, isListening: false }));
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setState((s) => ({ ...s, isListening: true, error: null }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Microphone access denied',
      }));
    }
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setState((s) => ({ ...s, isListening: false, audioLevel: 0 }));
  }, []);

  const toggleListening = useCallback(() => {
    state.isListening ? stopListening() : startListening();
  }, [state.isListening, startListening, stopListening]);

  return { ...state, startListening, stopListening, toggleListening };
}
