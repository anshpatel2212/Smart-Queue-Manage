import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { aiChatMessages, aiMockResponses, aiSuggestedQuestions } from '@/data/mockData';

const AIAssistantPage = () => {
  const [messages, setMessages] = useState(
    aiChatMessages.map(m => ({ id: m.id, sender: m.role === 'assistant' ? 'ai' : 'user', text: m.message, time: m.time }))
  );
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getAIResponse = (userText) => {
    // Check exact match first
    if (aiMockResponses[userText]) return aiMockResponses[userText];
    // Check partial match
    const lowerText = userText.toLowerCase();
    for (const [key, value] of Object.entries(aiMockResponses)) {
      if (lowerText.includes(key.toLowerCase().split(' ').slice(0, 3).join(' '))) {
        return value;
      }
    }
    return "I can help you with queue information, campus services, waiting times, and general queries. Try asking about your queue position, wait time, or which service has the shortest queue!";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getAIResponse(userInput);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
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
                  <div className={`p-4 shadow-sm text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#168C82] text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white border border-[#E5E9E7] text-[#172033] rounded-2xl rounded-tl-none'
                  }`}>
                    {msg.text}
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
                onClick={() => handleSuggestionClick(q)}
                className="px-3 py-1.5 bg-[#EEF9F7] text-[#168C82] text-xs font-medium rounded-full hover:bg-[#168C82] hover:text-white transition-colors border border-[#168C82]/20"
              >
                {q}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about campus queues..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-[#E5E9E7] rounded-xl focus:outline-none focus:border-[#168C82] focus:bg-white text-sm transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
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
