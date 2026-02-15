
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES ---
type RelationshipType = 'partner' | 'crush' | 'friend' | 'parent' | 'sibling';

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

// --- CONSTANTS & ICONS ---
const RELATIONSHIP_OPTIONS = [
  { value: 'partner', label: 'Partner/Significant Other' },
  { value: 'crush', label: 'A Secret Crush' },
  { value: 'friend', label: 'A Best Friend' },
  { value: 'parent', label: 'A Parent' },
  { value: 'sibling', label: 'A Sibling' },
];

const HeartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.372 0 2.615.553 3.5 1.442C11.885 3.553 13.128 3 14.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001Z" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.456-2.455l.259-1.036.259 1.036a3.375 3.375 0 0 0 2.455 2.456l1.036.259-1.036.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
  </svg>
);

const BookmarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const SunIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

// --- BACKGROUND COMPONENT ---
const FloatingHearts: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const hearts = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 20 + 10}px`,
    duration: `${Math.random() * 10 + 15}s`,
    delay: `${Math.random() * 10}s`,
  })), []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className={`floating-heart transition-colors duration-1000 ${
            isDarkMode ? 'text-rose-900 opacity-20' : 'text-rose-300 opacity-20'
          }`}
          style={{
            left: heart.left,
            fontSize: heart.size,
            // @ts-ignore
            '--duration': heart.duration,
            animationDelay: heart.delay,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

// --- APP COMPONENT ---
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
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ethereal_valentines');
    if (saved) setFavorites(JSON.parse(saved));
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('ethereal_valentines', JSON.stringify(favorites));
  }, [favorites]);

  const generateMessage = async () => {
    if (!recipient) return;
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    
    const prompt = `Write a deeply personal Valentine's Day message for ${recipient}. 
    Relationship: ${relationship}. ${context ? `Vibe: ${context}` : ""}
    Guidelines: Concise, sincere, human, intimate, 1-3 powerful sentences.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a thoughtful person writing a raw, sincere love note. No generic AI clichés.",
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
      const result = JSON.parse(response.text || "{}");
      setMessage(result);
      setLoading(false);
      setView('message');
      setTimeout(() => setIsRevealed(true), 150);
    } catch (e) {
      console.error(e);
      setMessage({ quote: "Thinking of you makes my world brighter.", author: "With all my heart" });
      setLoading(false);
      setView('message');
      setTimeout(() => setIsRevealed(true), 150);
    }
  };

  const handleShare = async (msgToShare?: GeneratedMessage) => {
    const activeMsg = msgToShare || message;
    if (!activeMsg) return;
    const shareText = `"${activeMsg.quote}"\n— ${activeMsg.author || recipient}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Valentine', text: shareText, url: window.location.href });
      else throw new Error();
    } catch {
      navigator.clipboard.writeText(shareText);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 relative overflow-hidden flex flex-col ${
      isDarkMode ? 'bg-gray-950 text-rose-100' : 'bg-rose-50 text-gray-800'
    }`}>
      <FloatingHearts isDarkMode={isDarkMode} />
      
      {/* Dark Mode & Favorites Toggles */}
      <div className="absolute top-6 right-6 z-20 flex space-x-3">
        {view === 'form' && favorites.length > 0 && (
          <button onClick={() => setView('favorites')} className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg flex items-center space-x-2 ${isDarkMode ? 'bg-rose-900/50 text-rose-300' : 'bg-white/90 text-rose-500'}`}>
            <BookmarkIcon className="w-6 h-6" />
            <span className="text-xs font-bold px-1">{favorites.length}</span>
          </button>
        )}
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${isDarkMode ? 'bg-rose-900/50 text-rose-300' : 'bg-white/90 text-rose-500'}`}>
          {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
      </div>

      <header className="pt-12 pb-6 text-center relative z-10">
        <HeartIcon className={`w-12 h-12 mx-auto animate-bounce mb-2 ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`} />
        <h1 className={`text-5xl md:text-7xl font-cursive ${isDarkMode ? 'text-rose-300' : 'text-rose-600'}`}>Ethereal Valentine</h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-20 relative z-10 w-full max-w-4xl mx-auto">
        {view === 'form' && (
          <div className={`w-full max-w-lg p-8 rounded-3xl shadow-xl border backdrop-blur-md ${isDarkMode ? 'bg-gray-900/70 border-rose-900/50' : 'bg-white/70 border-rose-100'}`}>
            <form onSubmit={(e) => { e.preventDefault(); generateMessage(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Who is this for?</label>
                <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Name" required className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-rose-400 outline-none ${isDarkMode ? 'bg-gray-800 border-rose-800 text-white' : 'bg-white border-rose-200'}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Relation</label>
                  <select value={relationship} onChange={e => setRelationship(e.target.value as any)} className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-800 border-rose-800 text-white' : 'bg-white border-rose-200'}`}>
                    {RELATIONSHIP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Vibe</label>
                  <input type="text" value={context} onChange={e => setContext(e.target.value)} placeholder="e.g. funny" className={`w-full px-4 py-3 rounded-xl border outline-none ${isDarkMode ? 'bg-gray-800 border-rose-800 text-white' : 'bg-white border-rose-200'}`} />
                </div>
              </div>
              <button disabled={loading} className="w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:scale-[1.03] transition-all">
                {loading ? <div className="w-5 h-5 border-2 border-t-white rounded-full animate-spin"></div> : <><SparklesIcon className="w-5 h-5" /><span>Generate Magic</span></>}
              </button>
            </form>
          </div>
        )}

        {view === 'message' && message && (
          <div className={`w-full max-w-2xl text-center ${isRevealed ? 'card-reveal' : 'opacity-0'}`}>
            <div className={`p-10 md:p-16 rounded-[2rem] shadow-2xl relative overflow-hidden backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/90' : 'bg-white/95'}`}>
              <div className="shimmer-overlay" />
              <div className="relative z-10">
                <blockquote className={`text-2xl md:text-3xl font-serif italic mb-8 fade-up-item ${isRevealed ? 'active' : ''}`} style={{ transitionDelay: '700ms' }}>"{message.quote}"</blockquote>
                <p className={`font-cursive text-3xl fade-up-item ${isRevealed ? 'active' : ''}`} style={{ transitionDelay: '1100ms' }}>— {message.author || recipient}</p>
                <div className={`mt-12 flex flex-col md:flex-row gap-4 justify-center fade-up-item ${isRevealed ? 'active' : ''}`} style={{ transitionDelay: '1500ms' }}>
                  <button onClick={() => handleShare()} className="px-6 py-3 rounded-full font-semibold bg-rose-500 text-white flex items-center space-x-2 hover:bg-rose-600 transition-all">
                    <ShareIcon className="w-5 h-5" /><span>{copyFeedback ? 'Copied!' : 'Share Your Love'}</span>
                  </button>
                  <button onClick={() => { setFavorites([{ id: Date.now().toString(), recipient, relationship, date: new Date().toLocaleDateString(), ...message }, ...favorites]); setSaveFeedback(true); setTimeout(() => setSaveFeedback(false), 2000); }} className="px-6 py-3 rounded-full font-semibold border border-rose-200 flex items-center space-x-2 hover:bg-rose-50 transition-all">
                    <BookmarkIcon className="w-5 h-5" /><span>{saveFeedback ? 'Saved!' : 'Save Favorite'}</span>
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => { setIsRevealed(false); setTimeout(() => setView('form'), 400); }} className="mt-8 font-semibold text-rose-500 hover:underline">← Create Another</button>
          </div>
        )}

        {view === 'favorites' && (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in">
            <button onClick={() => setView('form')} className="mb-6 flex items-center space-x-2 font-semibold text-rose-500">← Back</button>
            {favorites.map(f => (
              <div key={f.id} className={`p-8 rounded-[2rem] border shadow-lg relative group ${isDarkMode ? 'bg-gray-900/60 border-rose-900/30' : 'bg-white/90 border-rose-100'}`}>
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleShare(f)} className="p-2 text-rose-400 hover:bg-rose-900/40 rounded-full"><ShareIcon className="w-5 h-5" /></button>
                  <button onClick={() => setFavorites(favorites.filter(x => x.id !== f.id))} className="p-2 text-red-400 hover:bg-red-950/40 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                </div>
                <div className="mb-4 text-[10px] uppercase tracking-widest font-bold opacity-60">To: {f.recipient} • {f.date}</div>
                <blockquote className="text-lg italic font-serif leading-relaxed mb-4">"{f.quote}"</blockquote>
                <p className="font-cursive text-xl text-rose-500">— {f.author}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="py-6 text-center text-xs italic opacity-40 font-serif">Coded by dev deeyarh</footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
