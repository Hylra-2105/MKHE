import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Chào bạn! Mình là Trợ lý ảo của Mekong Culture. Mình có thể giúp gì cho bạn về thông tin dự án, các thành viên hoặc các làng nghề truyền thống?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', { message: userMessage });
      const reply = response.data.data.reply;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Xin lỗi, hiện tại mình đang gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Facebook Button */}
      <a
        href="https://www.facebook.com/profile.php?id=61590251406483"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-[92px] right-6 p-4 bg-[#1877F2] text-white rounded-full shadow-xl hover:scale-110 transition-transform z-50 flex items-center justify-center cursor-pointer ${isOpen ? 'hidden' : 'flex'}`}
      >
        <FaFacebook size={28} />
      </a>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-mkhe-primary text-white rounded-full shadow-xl hover:scale-110 transition-transform z-50 flex items-center justify-center cursor-pointer ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-white dark:bg-mkhe-bg border border-black/5 dark:border-mkhe-border/50 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
          {/* Header */}
          <div className="bg-white dark:bg-transparent border-b border-black/5 dark:border-mkhe-border/50 p-5 flex justify-between items-center z-10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-mkhe-primary/10 dark:bg-mkhe-primary/20 p-2 rounded-full">
                <MessageCircle size={20} className="text-mkhe-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-wide leading-tight text-mkhe-primary">Mekong AI</h3>
                <p className="text-xs text-gray-500 dark:text-mkhe-text/70 font-medium">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/5 dark:hover:bg-mkhe-border/30 p-2 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-600 dark:text-mkhe-text">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#faf8f5] dark:bg-[#20130d]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3.5 px-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-mkhe-primary text-white rounded-br-sm' 
                      : 'bg-white dark:bg-[#2d1c15] text-gray-800 dark:text-mkhe-text rounded-bl-sm border border-black/5 dark:border-mkhe-border/30'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-strong:text-inherit prose-strong:font-bold prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-[#2d1c15] border border-black/5 dark:border-mkhe-border/30 p-3 px-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-mkhe-primary" />
                  <span className="text-[14px] text-gray-500 dark:text-mkhe-text/70 font-medium">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-mkhe-bg border-t border-black/5 dark:border-mkhe-border/50">
            <div className="flex items-end gap-2 bg-[#f4f4f5] dark:bg-[#20130d] p-1.5 rounded-[24px] focus-within:ring-2 focus-within:ring-mkhe-primary/20 focus-within:bg-white dark:focus-within:bg-[#2d1c15] transition-all border border-transparent focus-within:border-mkhe-primary/30">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`; // Max height 128px (max-h-32)
                }}
                onKeyDown={handleKeyPress}
                placeholder="Hỏi Mekong AI bất cứ điều gì..."
                className="flex-1 bg-transparent !border-0 !outline-none !ring-0 focus:ring-0 focus:outline-none resize-none max-h-32 min-h-[40px] px-3 py-2.5 text-[15px] text-gray-700 dark:text-mkhe-text placeholder-gray-400 dark:placeholder-mkhe-text/50 shadow-none"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 flex items-center justify-center bg-mkhe-primary text-white rounded-full hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer transition-all mb-0.5 mr-0.5 flex-shrink-0"
              >
                <Send size={18} className="relative right-[1px] top-[1px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
