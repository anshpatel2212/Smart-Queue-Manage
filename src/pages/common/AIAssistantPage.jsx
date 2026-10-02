import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { aiSuggestedQuestions } from '@/data/mockData';
import { useAuth } from '@/hooks/useAuth';
import { processAIQuery } from '@/services/aiAssistantService';

const renderFormattedMessage = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const AIAssistantPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'AI_WELCOME',
      sender: 'ai',
      text: "Hello! I'm your Smart Campus Assistant. I can help you with live queue information, campus services, and general queries. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendQuestion = useCallback(async (questionText) => {
    const trimmed = (questionText || '').trim();
    if (!trimmed || isTyping) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      time: currentTime
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Query real Firestore queue/service data
      const responseText = await processAIQuery(trimmed, user?.uid);

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI Queue Data Error:', err);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I can't access your live queue information right now. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, user?.uid]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendQuestion(input);
  };

  const handleSuggestionClick = (question) => {
    handleSendQuestion(question);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col"
    >
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#172033] flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#168C82]" />
          AI Campus Assistant
        </h1>
        <p className="text-[#667085] mt-1">Ask questions about queues, campus services, wait times, and more.</p>
      </div>

      <div className="flex-1 bg-white border border-[#E5E9E7] rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FBFA]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-[#168C82]/10 text-[#168C82]' : 'bg-[#168C82] text-white shadow-sm'
                }`}>
                  {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div>
                  <div className={`p-4 shadow-sm text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user' 
                      ? 'bg-[#168C82] text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white border border-[#E5E9E7] text-[#172033] rounded-2xl rounded-tl-none'
                  }`}>
                    {renderFormattedMessage(msg.text)}
                  </div>
                  <p className={`text-xs text-[#667085] mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-[#168C82] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 bg-white border border-[#E5E9E7] rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-[#667085] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#667085] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#667085] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#E5E9E7]">
          <div className="flex flex-wrap gap-2 mb-3">
            {aiSuggestedQuestions.map((q, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(q)}
                disabled={isTyping}
                className="px-3 py-1.5 bg-[#EEF9F7] text-[#168C82] text-xs font-medium rounded-full hover:bg-[#168C82] hover:text-white transition-colors border border-[#168C82]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {q}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about campus queues..."
              disabled={isTyping}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-[#E5E9E7] rounded-xl focus:outline-none focus:border-[#168C82] focus:bg-white text-sm transition-colors disabled:opacity-60"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#168C82] text-white rounded-lg hover:bg-[#127a71] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantPage;
