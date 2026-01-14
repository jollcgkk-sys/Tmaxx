import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { User, Sparkles } from 'lucide-react';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isTyping }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // تم التعديل لاستخدام 'nearest' بدلاً من الافتراضي
    // هذا يعني: إذا كانت الرسالة ظاهرة، لا تتحرك الشاشة. إذا كانت مخفية، تحركي إليها فقط.
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <p className="text-lg text-gray-500 font-medium">مساحتك الخاصة مع أوس</p>
            <p className="text-sm text-gray-400">اختاري شعورك أو اطلبي نصيحة</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex w-full ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`
              max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 shadow-sm relative
              ${msg.sender === 'user' 
                ? 'bg-white text-gray-800 rounded-tr-none border border-gray-100' 
                : 'bg-gradient-to-br from-secondary to-primary text-white rounded-tl-none'
              }
            `}
          >
            {/* Label */}
            <div className={`text-xs mb-1 font-bold opacity-80 ${msg.sender === 'user' ? 'text-primary' : 'text-pink-100'}`}>
                {msg.sender === 'user' ? 'تبارك' : 'أوس'}
            </div>
            
            <p className="leading-relaxed text-base whitespace-pre-wrap">{msg.text}</p>
            
            <div className={`text-[10px] mt-2 text-right opacity-60`}>
              {msg.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex w-full justify-end animate-pulse">
           <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1">
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
             <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
           </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatHistory;