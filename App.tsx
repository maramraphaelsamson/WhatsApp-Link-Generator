
import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Copy, 
  ExternalLink, 
  History, 
  Sparkles, 
  Trash2, 
  Share2,
  CheckCircle2,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateWhatsAppUrl, isValidPhone, formatPhoneNumber } from './utils/whatsapp';
import { getMessageTemplates } from './services/geminiService';
import { LinkHistoryItem, MessageTemplate } from './types';

const App: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [history, setHistory] = useState<LinkHistoryItem[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiTemplates, setAiTemplates] = useState<MessageTemplate[]>([]);
  const [businessType, setBusinessType] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('wa_link_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  // Update URL as user types
  useEffect(() => {
    if (isValidPhone(phoneNumber)) {
      setGeneratedUrl(generateWhatsAppUrl(phoneNumber, message));
    } else {
      setGeneratedUrl('');
    }
  }, [phoneNumber, message]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSaveToHistory = () => {
    if (!generatedUrl) return;
    
    const newItem: LinkHistoryItem = {
      id: Date.now().toString(),
      phoneNumber,
      message,
      url: generatedUrl,
      timestamp: Date.now()
    };
    
    const newHistory = [newItem, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('wa_link_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('wa_link_history');
  };

  const fetchTemplates = async () => {
    if (!businessType) return;
    setIsLoadingAI(true);
    try {
      const data = await getMessageTemplates(businessType);
      setAiTemplates(data.templates);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-slate-50">
      {/* Header */}
      <header className="w-full max-w-4xl text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-green-500 text-white rounded-2xl mb-4 shadow-lg shadow-green-200">
          <MessageSquare size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          WhatsApp Link Pro
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Create instant chat links for your business. No more manual number saving for your customers.
        </p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & AI */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Smartphone size={20} className="text-green-600" />
              Link Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number (International Format)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+</span>
                  <input
                    type="tel"
                    placeholder="2348000000000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    className={`w-full pl-8 pr-4 py-4 bg-slate-50 border ${isValidPhone(phoneNumber) ? 'border-green-200' : 'border-slate-200'} rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all text-lg`}
                  />
                </div>
                {!isValidPhone(phoneNumber) && phoneNumber.length > 0 && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle size={14} /> Please enter a valid phone number (min 7 digits)
                  </p>
                )}
                <p className="text-slate-400 text-xs mt-2">
                  Include country code (e.g., 234 for Nigeria, 1 for USA) without the '+' sign.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Auto-filled Message (Optional)
                </label>
                <textarea
                  placeholder="Hello! I'm interested in your services..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* AI Helper Section */}
          <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />
                AI Template Generator
              </h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <input
                type="text"
                placeholder="E.g. Real Estate Agency, Bakery..."
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-blue-200 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
              />
              <button
                onClick={fetchTemplates}
                disabled={isLoadingAI || !businessType}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
              >
                {isLoadingAI ? 'Generating...' : 'Get Templates'}
              </button>
            </div>

            {aiTemplates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiTemplates.map((tmp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMessage(tmp.content)}
                    className="p-4 bg-white hover:bg-white text-left border border-blue-100 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <p className="font-bold text-sm text-blue-900 mb-1 group-hover:text-blue-600">{tmp.title}</p>
                    <p className="text-slate-500 text-xs line-clamp-2">{tmp.content}</p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Results & QR */}
        <div className="lg:col-span-5 sticky top-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col items-center">
            <h2 className="text-xl font-bold text-slate-800 mb-6 w-full text-left">Your Link</h2>
            
            {generatedUrl ? (
              <>
                <div className="p-4 bg-slate-50 rounded-2xl mb-6 border border-dashed border-slate-200 flex items-center justify-center">
                  <QRCodeSVG value={generatedUrl} size={180} />
                </div>
                
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 relative group">
                  <p className="text-slate-800 font-mono text-sm break-all pr-12 line-clamp-3">
                    {generatedUrl}
                  </p>
                  <button 
                    onClick={() => handleCopy(generatedUrl)}
                    className="absolute right-3 top-3 p-2 bg-white text-slate-600 hover:text-green-600 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-90"
                    title="Copy Link"
                  >
                    {isCopied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="grid grid-cols-1 w-full gap-3">
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSaveToHistory}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-200 active:scale-95"
                  >
                    <ExternalLink size={20} />
                    Open in WhatsApp
                  </a>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(generatedUrl)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Copy size={18} />
                      {isCopied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={handleSaveToHistory}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <History size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <Smartphone size={64} className="mb-4 opacity-20" />
                <p className="text-center font-medium">Enter your number to generate a link and QR code</p>
              </div>
            )}
          </div>

          {/* History Accordion */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <History size={18} className="text-slate-400" />
                Recent Links
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                {history.length}
              </span>
            </button>
            
            {showHistory && (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto border-t border-slate-50">
                {history.length > 0 ? (
                  <>
                    {history.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-400">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => {
                              setPhoneNumber(item.phoneNumber);
                              setMessage(item.message);
                            }} className="p-1 hover:bg-blue-100 text-blue-600 rounded">
                              <Share2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-700">+{item.phoneNumber}</p>
                        <p className="text-xs text-slate-500 line-clamp-1 italic">{item.message || '(No message)'}</p>
                        <button 
                          onClick={() => handleCopy(item.url)}
                          className="mt-2 w-full py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
                        >
                          Copy Link
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={clearHistory}
                      className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-all rounded-lg flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      Clear History
                    </button>
                  </>
                ) : (
                  <p className="text-center py-6 text-slate-400 text-sm italic">No history yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-slate-400 text-sm space-y-1">
        <p>&copy; {new Date().getFullYear()} WhatsApp Link Pro. All rights reserved.</p>
        <p>Grow your business with direct messaging.</p>
        <p className="font-semibold text-slate-500 pt-2">Created by Maram Raphael Samson</p>
      </footer>
    </div>
  );
};

export default App;
