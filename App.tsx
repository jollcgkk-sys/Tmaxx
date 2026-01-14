import React, { useState, useEffect } from 'react';
import { Heart, Trash2, BookHeart } from 'lucide-react';
import { MoodType, ChatMessage } from './types';
import { generateMoodResponse, generateSmartReply } from './services/geminiService';
import { logUserMessage, logAiResponse, db } from './services/firebase'; 
import MoodSelector from './components/MoodSelector';
import AdviceSection from './components/AdviceSection';
import ChatHistory from './components/ChatHistory';
import NotificationManager from './components/NotificationManager';
import TextCorrector from './components/TextCorrector';
import MemoriesLog from './components/MemoriesLog';

const App: React.FC = () => {
  // Load initial state from local storage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('aws_chat_history');
        if (saved) {
          return JSON.parse(saved, (key, value) => 
            key === 'timestamp' ? new Date(value) : value
          );
        }
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastMood, setLastMood] = useState<MoodType | null>(null);
  const [showMemories, setShowMemories] = useState(false);
  
  // Save to local storage whenever messages change
  useEffect(() => {
    localStorage.setItem('aws_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Updated: Only handles local UI state now
  const addMessage = (text: string, sender: 'user' | 'aws', type: ChatMessage['type']) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(),
      sender,
      text,
      timestamp: new Date(),
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleMoodSelect = async (moodId: MoodType, moodLabel: string) => {
    if (isLoading) return;
    
    setLastMood(moodId);
    setIsLoading(true);

    const userText = `أشعر أنني ${moodLabel}`;
    
    // 1. Update UI immediately
    addMessage(userText, 'user', 'mood_response');

    // 2. Start Cloud Logging in Background (Don't await it here to avoid blocking)
    const logPromise = logUserMessage(userText, 'mood_response');

    try {
      // 3. Generate AI Response
      const response = await generateMoodResponse(moodId, moodLabel, messages);
      
      // 4. Show AI Response
      addMessage(response, 'aws', 'mood_response');

      // 5. Update Cloud Log when done
      logPromise.then(async (docId) => {
        if (docId) await logAiResponse(docId, response);
      }).catch(err => console.error("Background logging failed:", err));
      
    } catch (error) {
      addMessage("حبيبتي تبارك، أنا معك. قولي لي أكثر.", 'aws', 'mood_response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversation = async (query: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // 1. Update UI immediately
    addMessage(query, 'user', 'advice_response');

    // 2. Start Cloud Logging in Background
    const logPromise = logUserMessage(query, 'advice_response');

    try {
      // 3. Generate AI Response
      const response = await generateSmartReply(query, messages);
      
      // 4. Show AI Response
      addMessage(response, 'aws', 'advice_response');

      // 5. Update Cloud Log when done
      logPromise.then(async (docId) => {
        if (docId) await logAiResponse(docId, response);
      }).catch(err => console.error("Background logging failed:", err));

    } catch (error) {
      addMessage("أنا هنا معك، ممكن تعيدين كلامك؟", 'aws', 'advice_response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCorrectionLog = async (original: string, corrected: string) => {
    // Fire and forget logging
    try {
      const docId = await logUserMessage(`طلب تصحيح نص: \n${original}`, 'text_correction');
      if (docId) {
        await logAiResponse(docId, corrected);
      }
    } catch (e) {
      console.warn("Correction logging failed");
    }
  };

  const clearHistory = () => {
    if (window.confirm("هل أنت متأكدة من مسح الذاكرة المحلية؟ (ستظل الرسائل محفوظة في السحاب)")) {
      setMessages([]);
      localStorage.removeItem('aws_chat_history');
    }
  };

  if (showMemories) {
    return <MemoriesLog onClose={() => setShowMemories(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#fef6fa] text-gray-800 font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Heart className="w-6 h-6 text-primary fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">من أجل تبارك</h1>
              <p className="text-xs text-secondary font-medium">مساحة خاصة مع أوس</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setShowMemories(true)} 
                className="p-2 text-gray-500 hover:text-secondary hover:bg-purple-50 rounded-full transition-all"
                title="سجل الذكريات"
              >
                <BookHeart className="w-5 h-5" />
              </button>

            {messages.length > 0 && (
              <button onClick={clearHistory} className="text-gray-400 hover:text-red-400" title="مسح المحادثة المحلية">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-xs shadow-md">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        
        {/* Chat Area */}
        <section className="min-h-[200px]">
           <ChatHistory messages={messages} isTyping={isLoading} />
        </section>

        {/* Divider */}
        {messages.length > 0 && <div className="border-t border-pink-100 my-4"></div>}

        {/* Mood Selector */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-pink-50">
          <MoodSelector onSelectMood={handleMoodSelect} disabled={isLoading} />
        </section>

        {/* Text Corrector Tool */}
        <section>
          <TextCorrector onCorrectionComplete={handleCorrectionLog} />
        </section>

        {/* Conversation/Advice Section */}
        <section>
          <AdviceSection onRequestAdvice={handleConversation} isLoading={isLoading} />
        </section>

      </main>

      <NotificationManager lastMood={lastMood} messages={messages} />
      
      <footer className="py-8 text-center text-gray-400 text-xs">
        <p>صُنع بحب ❤️ لتبارك</p>
      </footer>
    </div>
  );
};

export default App;