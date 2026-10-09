import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Sprout,
  Globe,
  RefreshCw,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Language } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: string;
}

const PRESET_QUESTIONS: Record<Language, string[]> = {
  en: [
    'How do I treat Early Blight on my Tomato crop organically?',
    'What does an AI confidence score of 88% mean for my field?',
    'How does high humidity increase fungal spore germination?',
    'What is the Pre-Harvest Interval (PHI) for Copper Oxychloride?'
  ],
  hi: [
    'टमाटर में अगेती झुलसा (Early Blight) का जैविक उपचार क्या है?',
    'एआई मॉडल का 88% कॉन्फिडेंस स्कोर क्या दर्शाता है?',
    'अधिक नमी से फफूंद रोग कैसे बढ़ता है?',
    'फसलों पर छिड़काव करते समय क्या सावधानियां रखनी चाहिए?'
  ],
  mr: [
    'टोमॅटो पिकावरील करपा रोगावर जैविक नियंत्रण कसे करावे?',
    'एआय मॉडेलचा ८८% विश्वासार्हता (Confidence) स्कोअर काय दर्शवतो?',
    'हवेतील वाढत्या आर्द्रतेमुळे बुरशीजन्य रोग कसा पसरतो?',
    'कीटकनाशक फवारणी करताना कोणती काळजी घ्यावी?'
  ]
};

export const FarmerAssistant: React.FC = () => {
  const { language, setLanguage, activeField, scans } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'mr'
          ? 'नमस्कार शेतकरी बंधू! मी तुमचा ॲग्रोस्कॅन किसान एआय मित्र आहे. पिकांचे आजार, फवारणीचे वेळापत्रक, जैविक उपाय किंवा हवामान जोखमीबद्दल मला काहीही विचारा!'
          : language === 'hi'
          ? 'नमस्ते किसान भाई! मैं आपका एग्रोस्कैन किसान एआई मित्र हूँ। फसल के रोगों, छिड़काव की सही विधि या मौसम के जोखिम पर आप मुझसे कोई भी सवाल पूछ सकते हैं।'
          : 'Namaste Kisan Friend! I am your AgroScan AI Assistant. Ask me anything about crop diseases, organic IPM management, weather-driven risks, or scan confidence scores.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const latestScan = scans[0];
      const context = {
        crop: activeField?.cropType || 'Tomato',
        field: activeField?.name || 'Main Plot',
        latestCondition: latestScan ? latestScan.predictedCondition : 'Healthy Foliage',
        latestSeverity: latestScan ? latestScan.severity : 'None'
      };

      const res = await api.askAssistant(text, language, context);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: res.language
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'mr'
              ? 'क्षमस्व, नेटवर्क उपलब्ध नाही. कृपया काही वेळाने पुन्हा प्रयत्न करा.'
              : language === 'hi'
              ? 'क्षमा करें, नेटवर्क उपलब्ध नहीं है। कृपया थोड़ी देर बाद पुनः प्रयास करें।'
              : 'Network temporarily unavailable. Please retry shortly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            AI Farmer Assistant (Kisan Mitra)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Gemini 3.8 Flash
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Multilingual agricultural decision support in Marathi, Hindi, and English.
          </p>
        </div>

        {/* Quick Language Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              language === 'en' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              language === 'hi' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              language === 'mr' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            मराठी
          </button>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p
                  className={`text-[10px] ${
                    msg.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 text-xs text-slate-500 rounded-tl-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Kisan Mitra is formulating agronomic guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Suggestions:</span>
          {(PRESET_QUESTIONS[language] || PRESET_QUESTIONS.en).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder={
              language === 'mr'
                ? 'पिकांच्या आरोग्याबद्दल किंवा रोगांबद्दल काहीही विचारा...'
                : language === 'hi'
                ? 'फसल स्वास्थ्य या रोग नियंत्रण के बारे में प्रश्न पूछें...'
                : 'Ask about crop health, diseases, spray schedules, or confidence guards...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
