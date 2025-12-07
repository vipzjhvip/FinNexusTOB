import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface AIAssistantProps {
  contextData: any; // The full state of the app to be fed as context
}

const AIAssistant: React.FC<AIAssistantProps> = ({ contextData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "您好！我是您的 FinNexus 财务助手。我可以访问您的发票和财务图表数据。您可以问我关于收入趋势、待付款项或税务负债的问题。",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const contextString = JSON.stringify(contextData);
      const responseText = await sendMessageToGemini(userMsg.text, contextString);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "抱歉，连接 AI 服务时出现错误。请检查您的网络连接。",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">FinAI 智能助手</h3>
            <p className="text-xs text-slate-500">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${isUser ? 'bg-blue-600' : 'bg-indigo-600'}
                `}>
                  {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                
                <div className={`
                  p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${isUser 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : msg.isError 
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }
                `}>
                  {msg.isError && <AlertTriangle className="w-4 h-4 mb-2 inline-block mr-2" />}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className={`text-[10px] mt-2 opacity-70 ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex flex-row gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-slate-500">思考中...</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="询问您的财务状况，例如：'我目前的税务风险如何？'"
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`
              absolute right-2 p-2 rounded-lg transition-colors
              ${!input.trim() || isLoading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}
            `}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2">
          AI 可能生成不准确的信息，请务必核实。
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;