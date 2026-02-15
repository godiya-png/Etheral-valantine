
import React, { useState, useEffect } from 'react';
import FloatingHearts from './components/FloatingHearts';
import { generateValentineMessage } from './services/geminiService';
import { RELATIONSHIP_OPTIONS, HeartIcon, SparklesIcon, ShareIcon, SunIcon, MoonIcon, BookmarkIcon, TrashIcon, ArrowLeftIcon } from './constants';
import { RelationshipType, GeneratedMessage, SavedMessage } from './types';

type AppView = 'form' | 'message' | 'favorites';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('form');
  const [recipient, setRecipient] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('partner');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<GeneratedMessage | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState<SavedMessage[]>([]);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
    const saved = localStorage.getItem('ethereal_valentines');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ethereal_valentines', JSON.stringify(favorites));
  }, [favorites]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;

    setLoading(true);
    setError(null);
    setCopyFeedback(false);
    setIsRevealed(false);

    try {
      const generated = await generateValentineMessage({
        recipientName: recipient,
        relationship,
        additionalContext: context
      });

      setMessage(generated);
      setView('message');
      setLoading(false);
      
      setTimeout(() => {
        setIsRevealed(true);
      }, 150);
    } catch (err) {
      console.error("Failed to generate:", err);
      setError("The stars aren't aligned right now. Please try again.");
      setLoading(false);
    }
  };

  const handleShare = async (msgToShare?: GeneratedMessage) => {
    const activeMsg = msgToShare || message;
    if (!activeMsg) return;

    const shareText = `"${activeMsg.quote}"\n\n— ${activeMsg.author}`;
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

  const handleSaveFavorite = () => {
    if (!message) return;
    
    const newFavorite: SavedMessage = {
      id: Date.now().toString(),
      recipient,
      relationship,
      quote: message.quote,
      author: message.author,
      date: new Date().toLocaleDateString()
    };

    setFavorites(prev => [newFavorite, ...prev]);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const removeFavorite = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setFavorites(prev => prev.filter(f => f.id !== id));
      setRemovingId(null);
    }, 300);
  };

  const resetView = () => {
    setIsRevealed(false);
    // Smooth transition back to form
    setTimeout(() => {
      setRecipient('');
      setContext('');
      setRelationship('partner');
      setMessage(null);
      setError(null);
      setView('form');
    }, 300);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const quoteWords = message?.quote.split(' ') || [];
  const authorDelay = quoteWords.length * 120 + 300;

  const getRelationshipLabel = (val: string) => {
    return RELATIONSHIP_OPTIONS.find(opt => opt.value === val)?.label || val;
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 relative overflow-hidden flex flex-col ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-950 via-rose-950 to-purple-950 text-rose-100' 
        : 'bg-gradient-to-br from-rose-50 via-pink-100 to-red-50 text-gray-800'
    }`}>
      <FloatingHearts isDarkMode={isDarkMode} />

      <div className="absolute top-6 right-6 z-20 flex space-x-3">
        {view === 'form' && favorites.length > 0 && (
          <button 
            onClick={() => setView('favorites')}
            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg flex items-center space-x-2 ${
              isDarkMode 
                ? 'bg-rose-900/50 text-rose-300 border border-rose-800' 
                : 'bg-white/90 text-rose-500 border border-rose-100'
            }`}
          >
            <BookmarkIcon className="w-6 h-6" />
            <span className="text-xs font-bold px-1">{favorites.length}</span>
          </button>
        )}
        <button 
          onClick={toggleDarkMode}
          className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
            isDarkMode 
              ? 'bg-rose-900/50 text-rose-300 border border-rose-800' 
              : 'bg-white/90 text-rose-500 border border-rose-100'
          }`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
      </div>

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
          <p className={`font-serif italic text-lg max-w-md mx-auto transition-colors duration-500 ${
            isDarkMode ? 'text-rose-200/70' : 'text-rose-400'
          }`}>
            Personalized poetry for your heart.
          </p>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-20 relative z-10 w-full max-w-4xl mx-auto">
        {view === 'form' && (
          <div className={`w-full max-w-lg p-8 rounded-3xl shadow-xl border backdrop-blur-md transition-all duration-500 ${
            isDarkMode 
              ? 'bg-gray-900/70 border-rose-900/50' 
              : 'bg-white/70 border-rose-100'
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-rose-300' : 'text-rose-600'}`}>Who is this for?</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Name"
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
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-rose-300' : 'text-rose-600'}`}>Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all ${
                      isDarkMode ? 'bg-gray-800/50 border-rose-800 text-white' : 'bg-white/50 border-rose-200'
                    }`}
                  >
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className={isDarkMode ? 'bg-gray-900 text-white' : ''}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-rose-300' : 'text-rose-600'}`}>Vibe (Optional)</label>
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g. silly, deep"
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-rose-800 text-white placeholder-gray-500' 
                        : 'bg-white/50 border-rose-200'
                    }`}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95 ${
                  loading 
                    ? 'bg-rose-300 cursor-not-allowed' 
                    : error 
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 hover:scale-[1.01]'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    <span>{error ? 'Try Again' : 'Generate Now'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {view === 'message' && message && (
          <div 
            className={`w-full max-2xl transform transition-all duration-700 flex flex-col items-center ${
              isRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
            }`}
          >
            <div className={`p-1 bg-gradient-to-tr from-rose-400 via-pink-300 to-red-400 rounded-[2rem] shadow-2xl w-full`}>
              <div className={`rounded-[1.9rem] p-8 md:p-16 text-center relative overflow-hidden backdrop-blur-xl ${
                isDarkMode ? 'bg-gray-900/90' : 'bg-white/95'
              }`}>
                <div className="shimmer-overlay" />
                
                <div className="relative z-10">
                  <span className={`inline-block mb-6 px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${
                    isDarkMode ? 'bg-rose-900/40 text-rose-300' : 'bg-rose-50 text-rose-500 border border-rose-100'
                  }`}>
                    For my {getRelationshipLabel(relationship)}
                  </span>

                  <blockquote 
                    className={`text-2xl md:text-3xl font-serif leading-relaxed italic mb-8 ${isDarkMode ? 'text-rose-100' : 'text-gray-700'}`}
                  >
                    {quoteWords.map((word, i) => (
                      <span 
                        key={i} 
                        className={`inline-block transition-all duration-700 transform ${
                          isRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90'
                        }`}
                        style={{ 
                          transitionDelay: `${i * 120}ms`,
                          marginRight: '0.3em'
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </blockquote>

                  <p 
                    className={`font-cursive text-4xl transition-all duration-1000 ${
                      isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`}
                    style={{ transitionDelay: `${authorDelay}ms` }}
                  >
                    — {message.author}
                  </p>

                  <div 
                    className={`mt-12 flex flex-col md:flex-row items-center justify-center gap-4 transition-all duration-1000 ${
                      isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${authorDelay + 250}ms` }}
                  >
                    <button 
                      onClick={() => handleShare()}
                      className={`flex items-center justify-center space-x-2 w-full md:w-auto px-10 py-4 rounded-full font-bold transition-all shadow-lg active:scale-95 ${
                        isDarkMode ? 'bg-rose-800 text-white hover:bg-rose-700' : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}
                    >
                      {copyFeedback ? 'Copied to Heart' : 'Share the Love'}
                    </button>
                    
                    <button 
                      onClick={handleSaveFavorite}
                      className={`flex items-center justify-center space-x-2 w-full md:w-auto px-10 py-4 rounded-full font-bold transition-all border ${
                        saveFeedback 
                          ? 'bg-green-500/10 border-green-500 text-green-500'
                          : isDarkMode 
                            ? 'text-rose-300 border-rose-800 hover:bg-rose-900/30' 
                            : 'text-rose-600 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      <BookmarkIcon className="w-5 h-5" />
                      <span>{saveFeedback ? 'Saved!' : 'Favorite'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={resetView}
              className={`mt-8 font-semibold flex items-center space-x-1 hover:underline transition-opacity duration-1000 ${
                isRevealed ? 'opacity-100' : 'opacity-0'
              } ${isDarkMode ? 'text-rose-400' : 'text-rose-500'}`}
              style={{ transitionDelay: `${authorDelay + 500}ms` }}
            >
              <span>← Create Another One</span>
            </button>
          </div>
        )}

        {view === 'favorites' && (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in">
            <button 
              onClick={() => setView('form')}
              className={`flex items-center space-x-2 font-semibold transition-colors ${
                isDarkMode ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-500'
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Creation</span>
            </button>

            {favorites.length === 0 ? (
              <div className="text-center py-20 opacity-30 flex flex-col items-center">
                <HeartIcon className="w-10 h-10 mb-4" />
                <p>Your gallery of love is empty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {favorites.map((fav, index) => (
                  <div 
                    key={fav.id}
                    style={{ animationDelay: `${index * 80}ms` }}
                    className={`p-8 rounded-[2rem] border shadow-sm relative group transition-all opacity-0 ${
                      removingId === fav.id ? 'favorite-item-exit' : 'favorite-item-enter'
                    } ${
                      isDarkMode ? 'bg-gray-900/60 border-rose-900/30' : 'bg-white border-rose-100'
                    }`}
                  >
                    <div className="absolute top-6 right-6 flex space-x-3">
                      <button 
                        onClick={() => handleShare(fav)}
                        className="text-rose-400 hover:text-rose-500 p-2 transition-transform hover:scale-110"
                        aria-label="Share this message"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => removeFavorite(fav.id)} 
                        className="text-rose-400 hover:text-red-500 transition-colors p-2 transition-transform hover:scale-110"
                        aria-label="Remove from favorites"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                       <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                         isDarkMode ? 'bg-rose-900/40 text-rose-300' : 'bg-rose-50 text-rose-500'
                       }`}>
                         {getRelationshipLabel(fav.relationship)}
                       </span>
                       <span className="text-[10px] opacity-30 font-serif italic">{fav.date}</span>
                    </div>
                    <p className={`italic font-serif mb-6 text-2xl ${isDarkMode ? 'text-rose-100' : 'text-gray-700'}`}>
                      "{fav.quote}"
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-cursive text-4xl text-rose-500">— {fav.author}</p>
                      <p className="text-sm opacity-30 font-serif">To: {fav.recipient}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className={`py-10 text-center text-xs font-serif opacity-30 transition-colors duration-1000`}>
        <p>Coded with ❤️ by dev deeyarh</p>
      </footer>
    </div>
  );
};

export default App;
