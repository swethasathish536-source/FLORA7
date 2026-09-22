import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  MessageSquare, 
  Heart, 
  Copy, 
  Check, 
  ArrowRight, 
  RotateCcw,
  Flower2,
  Gift,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: Array<{ label: string; action: string; path?: string }>;
}

const QUICK_PROMPTS = [
  '🌹 Best flowers for girlfriend under ₹300?',
  '💙 What is special about the 7 Blue Roses?',
  '💌 Write a romantic anniversary card message',
  '🎀 How do I build a custom satin bouquet?'
];

const OCCASIONS = [
  'Anniversary',
  'Birthday',
  "Valentine's Day",
  'Romantic Proposal',
  'Friendship',
  'Mother’s Day',
  'Apology / Make Up',
  'Congratulations'
];

const TONES = [
  'Heartfelt & Romantic',
  'Poetic & Deep',
  'Sweet & Simple',
  'Playful & Cheerful'
];

interface Flora7AiAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialMode?: 'chat' | 'card_writer';
}

export const Flora7AiAssistant: React.FC<Flora7AiAssistantProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  initialMode = 'chat'
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (controlledOnClose && !open) {
      controlledOnClose();
    }
    setInternalIsOpen(open);
  };

  const [activeTab, setActiveTab] = useState<'chat' | 'card_writer'>(initialMode);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Card Writer State
  const [cardRecipient, setCardRecipient] = useState('');
  const [cardOccasion, setCardOccasion] = useState('Anniversary');
  const [cardTone, setCardTone] = useState('Heartfelt & Romantic');
  const [cardDetails, setCardDetails] = useState('');
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([]);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! 🌸 I'm Flora, your AI Floral Concierge powered by Gemini. Whether you need gift ideas, want to know what rose colors mean, or want a touching poem for your card, I'm here for you! How can I help today?",
      suggestedActions: [
        { label: '🛍️ Browse Bouquets', action: 'navigate', path: '/shop' },
        { label: '🎨 Customise Bouquet', action: 'navigate', path: '/customise' }
      ]
    }
  ]);

  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: 'chat' | 'card_writer'; prompt?: string }>;
      if (customEvent.detail?.mode) {
        setActiveTab(customEvent.detail.mode);
      }
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt);
      }
    };

    window.addEventListener('open-flora-ai', handleOpenEvent);
    return () => window.removeEventListener('open-flora-ai', handleOpenEvent);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          message: text
        })
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I'd love to help you find the perfect rose creation!",
        suggestedActions: data.suggestedActions || []
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Gemini chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: "I'm having a brief creative pause connecting with Gemini AI. You can still explore our handcrafted collections in the Shop or message Shwetha on WhatsApp!"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCards = async () => {
    setIsGeneratingCards(true);
    try {
      const res = await fetch('/api/gemini/card-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: cardRecipient.trim(),
          occasion: cardOccasion,
          tone: cardTone,
          details: cardDetails.trim()
        })
      });

      const data = await res.json();
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setGeneratedMessages(data.messages);
      }
    } catch (err) {
      console.error('Error generating card messages:', err);
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello again! 🌸 What special occasion or gift can I assist you with right now?",
        suggestedActions: [
          { label: '🛍️ Browse Bouquets', action: 'navigate', path: '/shop' },
          { label: '🎨 Customise Bouquet', action: 'navigate', path: '/customise' }
        ]
      }
    ]);
  };

  return (
    <>
      {/* Floating Sparkle Trigger Button (Only rendered when not externally controlled) */}
      {controlledIsOpen === undefined && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-22 right-5 z-40 bg-gradient-to-r from-[#B76E79] to-[#8C5263] text-white p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group border-2 border-white/80"
          title="Ask Gemini AI Floral Assistant"
        >
          <Sparkles className="w-6 h-6 text-[#FFDFB9] animate-pulse" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
            Ask Gemini AI
          </span>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFDFB9] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FFDFB9]"></span>
          </span>
        </button>
      )}

      {/* Slide-in Concierge Panel / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-all animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md h-full bg-[#FFF9FA] shadow-2xl border-l border-[#FCE7F0] flex flex-col justify-between animate-in slide-in-from-right duration-300 relative"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#5C2533] via-[#7A3245] to-[#B76E79] text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 text-xl shadow-inner">
                  🌸
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-bold text-base tracking-wide">Flora AI</h3>
                    <span className="bg-[#FFDFB9] text-[#5C2533] text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 inline" /> Gemini 3.8
                    </span>
                  </div>
                  <p className="text-[11px] text-pink-100 font-light">
                    Handmade Satin Rose Advisor • Studio Shwetha
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {activeTab === 'chat' && (
                  <button
                    onClick={resetChat}
                    className="p-1.5 rounded-full hover:bg-white/20 text-pink-100 hover:text-white transition-colors"
                    title="Clear conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-pink-100 hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#FCE7F0] bg-white px-3 pt-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('chat')}
                className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'border-[#B76E79] text-[#5C2533]'
                    : 'border-transparent text-[#8C5263] hover:text-[#5C2533]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Floral Concierge</span>
              </button>
              <button
                onClick={() => setActiveTab('card_writer')}
                className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'card_writer'
                    ? 'border-[#B76E79] text-[#5C2533]'
                    : 'border-transparent text-[#8C5263] hover:text-[#5C2533]'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Card Note Writer</span>
              </button>
            </div>

            {/* Content Area */}
            {activeTab === 'chat' ? (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                {/* Message Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-[#B76E79] text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-[#2D2727] border border-[#FCE7F0] rounded-bl-xs shadow-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>

                        {/* Suggested action buttons inside message */}
                        {m.suggestedActions && m.suggestedActions.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-[#FCE7F0] flex flex-wrap gap-1.5">
                            {m.suggestedActions.map((action, idx) => (
                              action.path ? (
                                <Link
                                  key={idx}
                                  to={action.path}
                                  onClick={() => setIsOpen(false)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF9FA] border border-[#F4B8C7] text-[#5C2533] hover:bg-[#FCE7F0] font-semibold text-[11px] transition-colors"
                                >
                                  <span>{action.label}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              ) : null
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-start">
                      <div className="bg-white border border-[#FCE7F0] rounded-2xl rounded-bl-xs p-3 shadow-xs flex items-center gap-2 text-[#8C5263]">
                        <Sparkles className="w-4 h-4 text-[#B76E79] animate-spin" />
                        <span className="italic">Flora is crafting floral advice...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts Suggestions */}
                <div className="px-4 py-2 bg-white/60 border-t border-[#FCE7F0]">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8C5263]">
                    <Sparkles className="w-3 h-3 text-[#B76E79]" />
                    <span>Suggestions:</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(prompt)}
                        className="whitespace-nowrap px-3 py-1 bg-white border border-[#FCE7F0] hover:border-[#B76E79] hover:bg-[#FFF9FA] text-[#5C2533] rounded-full transition-all text-left shadow-2xs"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-white border-t border-[#FCE7F0]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Ask Flora anything about flowers, gifts, quotes..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={isLoading}
                      className="flex-1 bg-[#FFF9FA] border border-[#FCE7F0] rounded-full py-2.5 px-4 text-xs text-[#2D2727] placeholder-[#A09395] focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className="p-2.5 bg-[#B76E79] hover:bg-[#9E5762] disabled:opacity-40 text-white rounded-full transition-all shadow-xs"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <p className="text-[9px] text-[#A09395] text-center mt-1.5">
                    Powered by Google Gemini AI • Always double check custom booking dates
                  </p>
                </div>
              </div>
            ) : (
              /* Card Message Generator Tab */
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                <div className="bg-white border border-[#FCE7F0] rounded-2xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 text-[#5C2533] font-serif font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-[#B76E79]" />
                    <h4>AI Gift Card Message Writer</h4>
                  </div>
                  <p className="text-[11px] text-[#7A6B6E]">
                    Tell Gemini who this bouquet is for, and get 3 heartfelt handwritten notes to include with your roses.
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block font-semibold text-[#5C2533] mb-1">Occasion</label>
                      <select
                        value={cardOccasion}
                        onChange={(e) => setCardOccasion(e.target.value)}
                        className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl p-2 focus:outline-none text-[#5C2533]"
                      >
                        {OCCASIONS.map(occ => (
                          <option key={occ} value={occ}>{occ}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#5C2533] mb-1">Tone</label>
                      <select
                        value={cardTone}
                        onChange={(e) => setCardTone(e.target.value)}
                        className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl p-2 focus:outline-none text-[#5C2533]"
                      >
                        {TONES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#5C2533] mb-1">
                        Recipient Name / Relationship (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. My fiancée Ananya / Best Friend Priya"
                        value={cardRecipient}
                        onChange={(e) => setCardRecipient(e.target.value)}
                        className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl p-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#5C2533] mb-1">
                        Any special memory or personal touch? (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 3 years together, love her dimple smile"
                        value={cardDetails}
                        onChange={(e) => setCardDetails(e.target.value)}
                        className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-xl p-2 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleGenerateCards}
                      disabled={isGeneratingCards}
                      className="w-full py-2.5 px-4 bg-[#B76E79] hover:bg-[#9E5762] text-white font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs"
                    >
                      {isGeneratingCards ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin text-[#FFDFB9]" />
                          <span>Crafting Poetic Messages...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#FFDFB9]" />
                          <span>Generate 3 Card Messages</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Generated Card Messages List */}
                {generatedMessages.length > 0 && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <h5 className="font-serif font-bold text-xs text-[#5C2533] flex items-center justify-between">
                      <span>Pick Your Favorite:</span>
                      <span className="text-[10px] text-[#8C5263] font-normal">Click to copy</span>
                    </h5>

                    {generatedMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-[#FCE7F0] hover:border-[#B76E79] rounded-2xl p-3.5 shadow-2xs transition-all relative group"
                      >
                        <p className="text-xs text-[#2D2727] italic font-serif leading-relaxed pr-8">
                          "{msg}"
                        </p>

                        <button
                          onClick={() => handleCopy(msg, idx)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#FFF9FA] border border-[#FCE7F0] text-[#5C2533] hover:bg-[#FCE7F0] transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {copiedIndex === idx && (
                          <span className="absolute bottom-2 right-3 text-[10px] text-green-600 font-bold animate-in fade-in">
                            Copied! Paste into Gift Card Note
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
