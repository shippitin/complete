// src/global.d.ts

// Extend the Window interface to correctly type both standard and webkit prefixed properties
interface Window {
  // Web Speech API constructors
  SpeechRecognition: {
    new (): SpeechRecognition;
    prototype: SpeechRecognition;
  };
  SpeechGrammarList: {
    new (): SpeechGrammarList;
    prototype: SpeechGrammarList;
  };

  // Webkit prefixed versions
  webkitSpeechRecognition: {
    new (): SpeechRecognition;
    prototype: SpeechRecognition;
  };
  webkitSpeechGrammarList: {
    new (): SpeechGrammarList;
    prototype: SpeechGrammarList;
  };
}
