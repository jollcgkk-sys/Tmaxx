import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Heart, Loader2, MessageCircle } from 'lucide-react';
import { getMemories, ConversationLog } from '../services/firebase';

interface MemoriesLogProps {
  onClose: () => void;
}

const MemoriesLog: React.FC<MemoriesLogProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<ConversationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMemories();
        // Show newest first
        setLogs(data.reverse());
      } catch (err) {
        console.error(err);
        setError('تعذر استرجاع الذكريات، تأكد من الاتصال بالإنترنت.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      return "تاريخ غير معروف";
    }
  };

  const formatTime = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return "--:--";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fef6fa] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100 p-4 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <ArrowRight className="w-6 h-6 rtl:rotate-180" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            سجل الذكريات
          </h2>
          <p className="text-xs text-secondary">الأحاديث محفوظة ومؤرخة بالكامل</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-primary/60 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>جاري استرجاع السجل...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 mt-10">{error}</div>
        ) : logs.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">لا توجد محادثات محفوظة بعد.</div>
        ) : (
          <div className="space-y-8 max-w-3xl mx-auto">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100/50">
                {/* Time Header */}
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gray-100 text-gray-500 text-[10px] px-3 py-1 rounded-full font-medium">
                    {formatDate(log.createdAt)} • {formatTime(log.createdAt)}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Tabarak's Message */}
                  <div className="flex justify-start">
                     <div className="bg-pink-50 text-gray-800 rounded-2xl rounded-tr-none p-4 max-w-[90%] relative border border-pink-100">
                        <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full text-[10px] px-2">
                           تبارك
                        </div>
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap mt-2">{log.tabarakMessage}</p>
                     </div>
                  </div>

                  {/* Aws's Response (if exists) */}
                  {log.awsReply && (
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-br from-secondary/5 to-primary/5 text-gray-800 rounded-2xl rounded-tl-none p-4 max-w-[90%] relative border border-purple-100">
                        <div className="absolute -top-2 -left-2 bg-secondary text-white p-1 rounded-full text-[10px] px-2">
                           أوس
                        </div>
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap mt-2">{log.awsReply}</p>
                      </div>
                    </div>
                  )}

                  {!log.awsReply && (
                     <p className="text-xs text-center text-gray-300 italic">...أوس يكتب الآن...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoriesLog;