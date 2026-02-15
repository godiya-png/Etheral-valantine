
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES ---
type RelationshipType = 'partner' | 'spouse' | 'anniversary' | 'long_distance' | 'crush' | 'friend' | 'parent' | 'sibling';

interface GeneratedMessage {
  quote: string;
  author?: string;
}

interface SavedMessage extends GeneratedMessage {
  id: string;
  recipient: string;
  relationship: string;
  date: string;
}

// --- CONSTANTS ---
const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'partner', label: 'Partner/Significant Other' },
  { value: 'spouse', label: 'Spouse/Life Partner' },
  { value: 'anniversary', label: 'Anniversary Partner' },
  { value: 'long_distance', label: 'Long-distance Love' },
  { value: 'crush', label: 'A Secret Crush' },
  { value: 'friend', label: 'A Best Friend' },
  { value: 'parent', label: 'A Parent' },
  { value: 'sibling', label: 'A Sibling' },
];

// --- ICONS ---
const Icons = {
  Heart: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.372 0 2.615.553 3.5 1.442C11.885 3.553 13.128 3 14.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001Z" />
    </svg>
  ),
  Sparkles: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.456-2.455l.259-1.036.259 1.036a3.375 3.375 0 0 0 2.455 2.456l1.036.259-1.036.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  ),
  Share: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  ),
  Bookmark: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  ),
  Trash: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  Sun: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  ),
  Moon: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  ),
  ArrowLeft: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
};

// --- COMPONENTS ---
const FloatingHearts: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const hearts = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 20 + 10}px`,
    duration: `${Math.random() * 10 + 15}s`,
    delay: `${Math.random() * 5}s`,
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {hearts.map((h) => (
        <div
          key={h.id}
          className={`floating-heart ${isDarkMode ? 'text-rose-900 opacity-20' : 'text-rose-300 opacity-20'}`}
          style={{
            left: h.left,
            fontSize: h.size,
            // @ts-ignore
            '--duration': h.duration,
            animationDelay: h.delay,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'message' | 'favorites'>('form');
  const [recipient, setRecipient] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('partner');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<GeneratedMessage | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState<SavedMessage[]>([]);
  const [feedback, setFeedback] = useState({ copy: false, save: false });

  useEffect(() => {
    const saved = localStorage.getItem('ethereal_valentines');
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch (e) { console.error("Error loading favorites", e); }
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('ethereal_valentines', JSON.stringify(favorites));
  }, [favorites]);

  const generate = async () => {
    if (!recipient) return;
    setLoading(true);
    
    // Create new GoogleGenAI instance for the request
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    
    const promptText = `Write a deeply personal Valentine's Day message for ${recipient}. 
    The relationship is: ${relationship}. 
    ${context ? `Special detail/vibe: ${context}` : ""}
    
    Guidelines:
    - Sincere, warm, and authentic. No clichés.
    - 1-3 powerful sentences.
    - Focus on a specific connection or emotion.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: promptText,
        config: {
          systemInstruction: "You are a thoughtful individual expressing genuine human emotions. Your goal is to write a message that feels like a handwritten note. Do not use AI clichés.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quote: { type: Type.STRING },
              author: { type: Type.STRING }
            },
            required: ["quote"]
          }
        }
      });

      const dataStr = response.text;
      if (!dataStr) throw new Error("Empty response from AI");
      
      const data = JSON.parse(dataStr);
      setMessage(data);
      setView('message');
      setTimeout(() => setIsRevealed(true), 150);
    } catch (e) {
      console.error("Gemini API Error:", e);
      // Fallback message if API fails
      setMessage({ 
        quote: "Every moment with you feels like a gift I didn't know I was waiting for.", 
        author: "With all my heart" 
      });
      setView('message');
      setTimeout(() => setIsRevealed(true), 150);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (m?: GeneratedMessage) => {
    const active = m || message;
    if (!active) return;
    const text = `"${active.quote}"\n— ${active.author || recipient}`;
    try {
      if (navigator.share) await navigator.share({ text });
      else throw new Error();
    } catch {
      navigator.clipboard.writeText(text);
      setFeedback({ ...feedback, copy: true });
      setTimeout(() => setFeedback({ ...feedback, copy: false }), 2000);
    }
  };

  const saveToFavs = () => {
    if (!message) return;
    setFavorites([{ id: Date.now().toString(), recipient, relationship, date: new Date().toLocaleDateString(), ...message }, ...favorites]);
    setFeedback({ ...feedback, save: true });
    setTimeout(() => setFeedback({ ...feedback, save: false }), 2000);
  };

  const quoteWords = useMemo(() => {
    if (!message?.quote) return [];
    return message.quote.split(' ');
  }, [message?.quote]);

  return (
    <div className={`min-h-screen transition-all duration-1000 flex flex-col relative ${isDarkMode ? 'bg-gray-950 text-rose-100' : 'bg-rose-50 text-gray-800'}`}>
      <FloatingHearts isDarkMode={isDarkMode} />
      
      <div className="absolute top-6 right-6 z-30 flex gap-3">
        {view === 'form' && favorites.length > 0 && (
          <button 
            onClick={() => setView('favorites')} 
            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-xl hover:brightness-110 shadow-lg flex items-center gap-2 ${isDarkMode ? 'bg-rose-900/40 text-rose-300' : 'bg-white text-rose-500'}`}
          >
            <Icons.Bookmark className="w-6 h-6" />
            <span className="text-xs font-bold">{favorites.length}</span>
          </button>
        )}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${isDarkMode ? 'bg-rose-900/40 text-rose-300' : 'bg-white text-rose-500'}`}
        >
          {isDarkMode ? <Icons.Sun className="w-6 h-6" /> : <Icons.Moon className="w-6 h-6" />}
        </button>
      </div>

      <header className="pt-12 pb-6 text-center z-10">
        <Icons.Heart className={`w-12 h-12 mx-auto animate-bounce mb-2 ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`} />
        <h1 className={`text-5xl md:text-7xl font-cursive ${isDarkMode ? 'text-rose-300' : 'text-rose-600'}`}>Ethereal Valentine</h1>
        <p className={`font-serif italic mt-2 opacity-60 ${isDarkMode ? 'text-rose-200' : 'text-rose-400'}`}>Weaving moments of love into words.</p>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-20 z-10 w-full max-w-4xl mx-auto">
        {view === 'form' && (
          <div className={`w-full max-w-lg p-8 rounded-3xl shadow-2xl border backdrop-blur-md transition-all ${isDarkMode ? 'bg-gray-900/70 border-rose-900/50' : 'bg-white/80 border-rose-100'}`}>
            <form onSubmit={e => { e.preventDefault(); generate(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Who is this for?</label>
                <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient Name" required className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-rose-400 ${isDarkMode ? 'bg-gray-800 border-rose-800' : 'bg-white/50 border-rose-200'}`} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Relationship</label>
                  <select value={relationship} onChange={e => setRelationship(e.target.value as any)} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-800 border-rose-800' : 'bg-white/50 border-rose-200'}`}>
                    {RELATIONSHIP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Vibe (Optional)</label>
                  <input type="text" value={context} onChange={e => setContext(e.target.value)} placeholder="e.g. cosmic, silly" className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-800 border-rose-800' : 'bg-white/50 border-rose-200'}`} />
                </div>
              </div>
              <button 
                disabled={loading} 
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-rose-400/40 active:scale-95 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-t-white rounded-full animate-spin"></div> : <><Icons.Sparkles className="w-5 h-5" /><span>Generate Magic</span></>}
              </button>
            </form>
          </div>
        )}

        {view === 'message' && message && (
          <div className={`w-full max-w-2xl text-center ${isRevealed ? 'card-reveal' : 'opacity-0'}`}>
            <div className={`p-10 md:p-16 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/95'}`}>
              <div className="shimmer-overlay" />
              <div className="relative z-10">
                <div className="text-2xl md:text-3xl font-serif italic mb-8 flex flex-wrap justify-center gap-x-2">
                  {quoteWords.map((word, idx) => (
                    <span 
                      key={idx} 
                      className={`word-reveal ${isRevealed ? 'active' : ''}`}
                      style={{ transitionDelay: `${500 + (idx * 70)}ms` }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <p className={`font-cursive text-3xl text-rose-500 fade-up-item ${isRevealed ? 'active' : ''}`} style={{ transitionDelay: `${800 + (quoteWords.length * 70)}ms` }}>
                  — {message.author || recipient}
                </p>
                <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
                  <button onClick={() => handleShare()} className="px-8 py-3 rounded-full font-bold bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-all active:scale-95">
                    {feedback.copy ? 'Copied!' : 'Share the Love'}
                  </button>
                  <button onClick={saveToFavs} className={`px-8 py-3 rounded-full font-bold border transition-all active:scale-95 ${isDarkMode ? 'border-rose-900 hover:bg-rose-900/20' : 'border-rose-200 hover:bg-rose-50'}`}>
                    {feedback.save ? 'Saved!' : 'Save Favorite'}
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => { setIsRevealed(false); setTimeout(() => setView('form'), 400); }} className="mt-8 font-semibold text-rose-500 hover:underline">← Craft Another Message</button>
          </div>
        )}

        {view === 'favorites' && (
          <div className="w-full max-w-2xl space-y-6 animate-fade-in">
            <button onClick={() => setView('form')} className="flex items-center gap-2 text-rose-500 font-bold mb-6 hover:translate-x-[-4px] transition-transform">
              <Icons.ArrowLeft className="w-5 h-5" /> Back to Studio
            </button>
            {favorites.length === 0 ? (
              <div className="text-center py-20 opacity-30 italic">Your gallery of love is currently empty.</div>
            ) : (
              favorites.map(f => (
                <div key={f.id} className={`p-8 rounded-3xl border shadow-lg relative group transition-all ${isDarkMode ? 'bg-gray-900/60 border-rose-900/30' : 'bg-white/90 border-rose-100'}`}>
                  <div className="absolute top-4 right-4 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleShare(f)} className="p-2 text-rose-400 hover:bg-rose-900/40 rounded-full"><Icons.Share className="w-5 h-5" /></button>
                    <button onClick={() => setFavorites(favorites.filter(x => x.id !== f.id))} className="p-2 text-red-400 hover:bg-red-950/40 rounded-full"><Icons.Trash className="w-5 h-5" /></button>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-40 mb-2">To: {f.recipient} • {f.date}</div>
                  <p className="italic font-serif text-lg mb-2">"{f.quote}"</p>
                  <p className="font-cursive text-xl text-rose-500">— {f.author}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-[10px] uppercase tracking-widest opacity-30">© 2025 Ethereal Valentine • Built with Heart</footer>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
