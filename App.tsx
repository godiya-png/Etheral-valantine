
import React, { useState, useEffect } from 'react';
import FloatingHearts from './components/FloatingHearts';
import { generateValentineMessage } from './services/geminiService';
import { RELATIONSHIP_OPTIONS, HeartIcon, SparklesIcon, ShareIcon, ClipboardIcon, SunIcon, MoonIcon } from './constants';
import { RelationshipType, GeneratedMessage } from './types';

type AppView = 'form' | 'message';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('form');
  const [recipient, setRecipient] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('partner');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<GeneratedMessage | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;

    setLoading(true);
    setCopyFeedback(false);

    try {
      const generated = await generateValentineMessage({
        recipientName: recipient,
        relationship,
        additionalContext: context
      });

      setMessage(generated);
      setLoading(false);
      setView('message');
      
      requestAnimationFrame(() => {
        setTimeout(() => setIsRevealed(true), 300);
      });
    } catch (error) {
      console.error("Failed to generate:", error);
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!message) return;

    const shareText = `"${message.quote}"\n\n— ${message.author}`;
    const shareData = {
      title: 'A Valentine for you',
      text: shareText,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  };

  const resetView = () => {
    setIsRevealed(false);
    setTimeout(() => {
      setView('form');
      setMessage(null);
    }, 300);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen transition-colors duration-700 relative overflow-hidden flex flex-col ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-950 via-rose-950 to-purple-950 text-rose-100' 
        : 'bg-gradient-to-br from-rose-50 via-pink-100 to-red-50 text-gray-800'
    }`}>
      <FloatingHearts isDarkMode={isDarkMode} />

      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleDarkMode}
          className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-90 shadow-lg ${
            isDarkMode 
              ? 'bg-rose-900/50 text-rose-300 hover:bg-rose-800/60 border border-rose-800' 
              : 'bg-white/80 text-rose-500 hover:bg-rose-50 border border-rose-100'
          }`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Persistence Header */}
      <header className="pt-12 pb-6 px-4 text-center relative z-10">
        <div className="inline-block animate-bounce mb-2">
          <HeartIcon className={`w-12 h-12 transition-colors duration-500 ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`} />
        </div>
        <h1 className={`text-5xl md:text-7xl font-cursive drop-shadow-sm mb-4 transition-colors duration-500 ${
          isDarkMode ? 'text-rose-300' : 'text-rose-600'
        }`}>
          Ethereal Valentine
        </h1>
        {view === 'form' && (
          <p className={`font-serif italic text-lg max-w-md mx-auto animate-fade-in transition-colors duration-500 ${
            isDarkMode ? 'text-rose-200/70' : 'text-rose-400'
          }`}>
            Crafting moments of love through poetry and light.
          </p>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-20 relative z-10 w-full max-w-4xl mx-auto">
        {view === 'form' ? (
          <div className={`w-full max-w-lg p-8 rounded-3xl shadow-xl border transition-all duration-700 backdrop-blur-md ${
            isDarkMode 
              ? 'bg-gray-900/70 border-rose-900/50 shadow-rose-950/20' 
              : 'bg-white/70 border-rose-100'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                  isDarkMode ? 'text-rose-300' : 'text-rose-600'
                }`}>Who is this for?</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Name of your loved one"
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-rose-800 text-white placeholder-gray-500' 
                      : 'bg-white/50 border-rose-200'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-rose-300' : 'text-rose-600'
                  }`}>Relationship</label>
                  <div className="relative">
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all appearance-none cursor-pointer ${
                        isDarkMode 
                          ? 'bg-gray-800/50 border-rose-800 text-white' 
                          : 'bg-white/50 border-rose-200'
                      }`}
                    >
                      {RELATIONSHIP_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className={isDarkMode ? 'bg-gray-900 text-white' : ''}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${
                      isDarkMode ? 'text-rose-700' : 'text-rose-300'
                    }`}>
                      ▼
                    </div>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-rose-300' : 'text-rose-600'
                  }`}>Vibe (Optional)</label>
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. silly, deep, cosmic"
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-rose-800 text-white placeholder-gray-500' 
                        : 'bg-white/50 border-rose-200'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
                  loading 
                    ? 'bg-rose-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 hover:shadow-rose-200'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    <span>Weaving words...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>Generate Magic</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          message && (
            <div 
              className={`w-full max-w-2xl transform transition-all duration-1000 ease-out flex flex-col items-center ${
                isRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <div className={`relative p-1 bg-gradient-to-tr from-rose-400 via-pink-300 to-red-400 rounded-[2rem] shadow-2xl overflow-hidden w-full ${
                isDarkMode ? 'shadow-rose-950/40' : ''
              }`}>
                <div className={`rounded-[1.9rem] p-10 md:p-16 text-center relative overflow-hidden backdrop-blur-xl ${
                  isDarkMode ? 'bg-gray-900/90' : 'bg-white/95'
                }`}>
                  <div className="shimmer-overlay" />
                  
                  <div className={`absolute top-4 left-4 opacity-10 select-none ${isDarkMode ? 'text-rose-300' : 'text-rose-100'}`}>
                    <HeartIcon className="w-24 h-24" />
                  </div>
                  <div className={`absolute bottom-4 right-4 opacity-10 rotate-180 select-none ${isDarkMode ? 'text-rose-300' : 'text-rose-100'}`}>
                    <HeartIcon className="w-24 h-24" />
                  </div>

                  <div className="relative z-10">
                    <div className={`mb-8 flex justify-center fade-up-item ${isRevealed ? 'active' : ''}`} style={{ transitionDelay: '200ms' }}>
                      <div className={`w-16 h-px self-center ${isDarkMode ? 'bg-rose-900' : 'bg-rose-200'}`}></div>
                      <HeartIcon className={`w-6 h-6 mx-4 ${isDarkMode ? 'text-rose-700' : 'text-rose-400'}`} />
                      <div className={`w-16 h-px self-center ${isDarkMode ? 'bg-rose-900' : 'bg-rose-200'}`}></div>
                    </div>

                    <blockquote 
                      className={`text-2xl md:text-3xl font-serif leading-relaxed italic mb-8 fade-up-item transition-colors duration-500 ${
                        isRevealed ? 'active' : ''
                      } ${isDarkMode ? 'text-rose-100' : 'text-gray-700'}`}
                      style={{ transitionDelay: '400ms' }}
                    >
                      "{message.quote}"
                    </blockquote>

                    <p 
                      className={`font-cursive text-3xl fade-up-item transition-colors duration-500 ${
                        isRevealed ? 'active' : ''
                      } ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`}
                      style={{ transitionDelay: '600ms' }}
                    >
                      — {message.author}
                    </p>

                    <div 
                      className={`mt-12 flex flex-col md:flex-row items-center justify-center gap-4 fade-up-item ${isRevealed ? 'active' : ''}`}
                      style={{ transitionDelay: '800ms' }}
                    >
                      <button 
                        onClick={handleShare}
                        className={`group flex items-center space-x-2 px-6 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 ${
                          isDarkMode 
                            ? 'bg-rose-800 text-white hover:bg-rose-700' 
                            : 'bg-rose-500 text-white hover:bg-rose-600'
                        }`}
                      >
                        {copyFeedback ? (
                          <>
                            <ClipboardIcon className="w-5 h-5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <ShareIcon className="w-5 h-5" />
                            <span>Share Your Love</span>
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => window.print()}
                        className={`text-sm font-semibold transition-colors uppercase tracking-widest px-6 py-3 border rounded-full ${
                          isDarkMode 
                            ? 'text-rose-400 border-rose-900 hover:bg-rose-950/40' 
                            : 'text-rose-400 border-rose-100 hover:bg-rose-50'
                        }`}
                      >
                        Keep (Print)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`mt-8 flex flex-col items-center space-y-4 transition-all duration-1000 delay-1000 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                <p className={`font-medium animate-pulse ${isDarkMode ? 'text-rose-400/80' : 'text-rose-400'}`}>
                  Share this message with {recipient} 💝
                </p>
                <button 
                  onClick={resetView}
                  className={`font-semibold flex items-center space-x-1 hover:underline ${
                    isDarkMode ? 'text-rose-400' : 'text-rose-500'
                  }`}
                >
                  <span>← Create another message</span>
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className={`py-6 text-center text-sm font-serif italic z-10 transition-colors duration-500 ${
        isDarkMode ? 'text-rose-900/60' : 'text-rose-300'
      }`}>
        <p>Coded by dev deeyarh</p>
      </footer>
    </div>
  );
};

export default App;
