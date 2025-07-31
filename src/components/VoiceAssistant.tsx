// src/components/VoiceAssistant.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaTimes, FaVolumeUp, FaVolumeMute, FaPaperPlane, FaSpinner } from 'react-icons/fa';

// Import ParsedVoiceCommand and BookingType from the centralized types file
import { ParsedVoiceCommand, BookingType } from '../types/QuoteFormHandle';

interface VoiceAssistantProps {
  onCommandParsed: (command: ParsedVoiceCommand) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommandParsed }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setResponseText('Listening...');
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = event.results[0][0].transcript;
        setTranscript(currentTranscript);
        setIsListening(false);
        processVoiceCommand(currentTranscript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setResponseText(`Error: ${event.error}`);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please enable it in your browser settings to use voice input.');
        } else if (event.error === 'no-speech') {
          // alert('No speech detected. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
      setResponseText('Speech Recognition not supported.');
    }

    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    } else {
      console.warn('Speech Synthesis API not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setResponseText('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if (speechSynthRef.current && !isMuted) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        // Optional: Do something after speech ends
      };
      speechSynthRef.current.speak(utterance);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (speechSynthRef.current && speechSynthRef.current.speaking) {
      speechSynthRef.current.cancel();
    }
  };

  const processVoiceCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    setIsLoading(true);
    setChatHistory((prev) => [...prev, { role: 'user', text: commandText }]);

    let aiResponseTextForChat = 'Processing your request...';
    setChatHistory((prev) => [...prev, { role: 'model', text: aiResponseTextForChat }]);

    try {
      const currentChatHistory = chatHistory.map(entry => ({ role: entry.role, parts: [{ text: entry.text }] }));
      currentChatHistory.push({ role: "user", parts: [{ text: commandText }] });

      type ServiceEnum = BookingType | "Track" | "unknown" | "home" | "quote" | "train" | "Rail";

      const payload = {
        contents: currentChatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              "service": { "type": "STRING", "enum": [
                "Door to Door", "Train Container Booking", "Train Goods Booking", "Train Parcel Booking",
                "Sea", "Air", "Truck", "LCL", "Parcel", "Customs", "Insurance", "First/Last Mile",
                "Track", "unknown", "home", "quote", "train", "Rail"
              ] as ServiceEnum[] },
              "origin": { "type": "STRING" },
              "destination": { "type": "STRING" },
              "readyDate": { "type": "STRING" },
              "cargoType": { "type": "STRING" },
              "cargoWeight": { "type": "NUMBER" },
              "dimensions": { "type": "STRING" },
              "volumetricWeight": { "type": "NUMBER" },
              "containerType": { "type": "STRING", "enum": ["20ft Standard", "40ft Standard", "20ft Reefer", "40ft Reefer", "Other", "Dry Van", "Reefer", "Open Top", "Flat Rack"] },
              "numberOfContainers": { "type": "NUMBER" },
              "isDomestic": { "type": "BOOLEAN" }, // Explicitly set to BOOLEAN
              "wagonCode": { "type": "STRING" },
              "wagonType": { "type": "STRING", "enum": ["Open Wagon", "Covered Wagon", "Flat Wagon", "Hopper Wagon"] },
              "numberOfWagons": { "type": "NUMBER" },
              "parcelCount": { "type": "NUMBER" },
              "shipmentId": { "type": "STRING" },
              "serviceType": { "type": "STRING", "enum": ["express", "standard", "economy", "First Mile", "Last Mile", "Both"] },
              "incoterms": { "type": "STRING", "enum": ["EXW", "FOB", "CIF", "DDP", "FCA", "CPT", "CIP", "DAP", "Other"] },
              "hazardousCargo": { "type": "BOOLEAN" },
              "insuranceRequired": { "type": "BOOLEAN" },
              "cargoValue": { "type": "NUMBER" },
              "specialInstructions": { "type": "STRING" },
              "activityType": { "type": "STRING", "enum": ["Airport to Airport", "Airport to Door", "Door to Airport", "Door to Door"] },
              "modeOfTransport": { "type": "STRING", "enum": ["air", "sea", "road", "rail"] },
              "vehicleType": { "type": "STRING", "enum": ["Bike", "Van", "Mini Truck", "Truck", "14 ft Truck", "17 ft Truck", "20 ft Truck", "32 ft SXL", "32 ft MXL", "Container Truck", "Trailer"] },
              "documentType": { "type": "STRING", "enum": ["Bill of Lading", "Air Waybill", "Commercial Invoice", "Packing List", "Other"] },
              "country": { "type": "STRING" },
              "customsServiceType": { "type": "STRING", "enum": ["Import Clearance", "Export Clearance", "Consultation", "Other"] },
              "coverageType": { "type": "STRING", "enum": ["All Risk", "Named Perils", "Total Loss", "Other"] },
              "deliveryInstructions": { "type": "STRING" },
              "numberOfPieces": { "type": "NUMBER" },
              "commodityCategory": { "type": "STRING" },
              "commodity": { "type": "STRING" },
              "hsnCode": { "type": "STRING" }
            },
            "required": ["service"]
          }
        }
      };

      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const jsonResponse = result.candidates[0].content.parts[0].text;
        const parsedCommand: ParsedVoiceCommand = JSON.parse(jsonResponse);

        aiResponseTextForChat = `Understood: ${parsedCommand.service} booking.`;
        setChatHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', text: aiResponseTextForChat };
          return newHistory;
        });
        speak(aiResponseTextForChat);

        onCommandParsed(parsedCommand);
      } else {
        aiResponseTextForChat = 'Could not understand the command. Please try again.';
        setChatHistory((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', text: aiResponseTextForChat };
          return newHistory;
        });
        speak(aiResponseTextForChat);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      aiResponseTextForChat = 'An error occurred while processing your request.';
      setChatHistory((prev) => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'model', text: aiResponseTextForChat };
        return newHistory;
      });
      speak(aiResponseTextForChat);
    } finally {
      setIsLoading(false);
      setTranscript('');
    }
  };

  const handleManualInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      processVoiceCommand(transcript);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isChatOpen && (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-72 h-96 sm:w-80 md:w-96 md:h-[450px] lg:w-[400px] lg:h-[500px] flex flex-col mb-4">
          {/* Chat Header */}
          <div
            className="flex justify-between items-center p-4 border-b border-gray-200 text-white rounded-t-xl"
            style={{
              background: 'linear-gradient(to right, #53b2fe, #065af3)',
            }}
          >
            <h3 className="font-bold">Shippitin Voice</h3>
            <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-gray-200">
              <FaTimes />
            </button>
          </div>

          {/* Chat Body */}
          <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto text-sm space-y-2 bg-gray-50">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`p-2 rounded-lg max-w-[80%] shadow-sm ${
                    msg.role === 'user' ? 'text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                  style={msg.role === 'user' ? { background: 'linear-gradient(to right, #53b2fe, #065af3)' } : {}}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-600 italic flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleManualInput} className="p-4 border-t border-gray-200 flex items-center bg-white">
            {/* Mute/Unmute button */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 bg-gray-200 text-gray-700 rounded-full shadow-md hover:bg-gray-300 transition duration-300 mr-2"
              title={isMuted ? 'Unmute' : 'Mute'}
              disabled={isLoading}
            >
              {isMuted ? <FaVolumeMute className="text-lg" /> : <FaVolumeUp className="text-lg" />}
            </button>
            {/* Microphone/Stop button */}
            {'SpeechRecognition' in window || 'webkitSpeechRecognition' in window ? (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-full shadow-md transition-all duration-300 ${
                  isListening ? 'bg-red-600 hover:bg-red-700' : 'text-white'
                } mr-2`}
                style={isListening ? {} : { background: 'linear-gradient(to right, #53b2fe, #065af3)', border: 'none' }}
                title={isListening ? 'Stop Listening' : 'Start Listening'}
                disabled={isLoading}
              >
                {isListening ? <FaStop className="text-lg" /> : <FaMicrophone className="text-lg" />}
              </button>
            ) : null}
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type or speak your command..."}
              className="flex-grow border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading || isListening}
            />
            <button
              type="submit"
              className="ml-2 p-2 text-white rounded-md shadow-md transition-colors"
              style={{
                background: 'linear-gradient(to right, #53b2fe, #065af3)',
                border: 'none',
              }}
              disabled={isLoading || isListening}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button to open chat */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="p-4 text-white rounded-full shadow-lg transition duration-300 transform hover:scale-110"
          style={{
            background: 'linear-gradient(to right, #53b2fe, #065af3)',
            border: 'none',
          }}
          title="Open Shippitin Voice"
        >
          <FaMicrophone className="text-2xl" />
        </button>
      )}
    </div>
  );
};

export default VoiceAssistant;
