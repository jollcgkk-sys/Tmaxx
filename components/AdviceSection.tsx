import React, { useState } from 'react';
import { Send, HeartHandshake, MessageCircleHeart } from 'lucide-react';

interface AdviceSectionProps {
  onRequestAdvice: (query: string) => void;
  isLoading: boolean;
}

const AdviceSection: React.FC<AdviceSectionProps> = ({ onRequestAdvice, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onRequestAdvice(query);
      setQuery('');
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-lg border border-pink-100 mt-8">
      <div className="flex items-center gap-2 mb-4 text-secondary">
        <MessageCircleHeart className="w-6 h-6" />
        <h2 className="text-xl font-bold">حديث مع أوس</h2>
      </div>
      <p className="text-gray-500 mb-4 text-sm">
        أنا هنا لأسمعك. اطلبي نصيحة، فضفضي، أو ناقشيني في أي موضوع يهمك.
      </p>
      
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="اكتبي لي يا تبارك..."
          className="w-full bg-gray-50 rounded-xl p-4 pr-4 pl-12 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none border border-gray-200 placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute left-3 bottom-3 p-2 bg-primary text-white rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5 rtl:rotate-180" />
          )}
        </button>
      </form>
    </div>
  );
};

export default AdviceSection;