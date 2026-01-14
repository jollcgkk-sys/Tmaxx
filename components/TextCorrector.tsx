import React, { useState } from 'react';
import { PenTool, Copy, Sparkles, Check } from 'lucide-react';
import { generateCorrection } from '../services/geminiService';

interface TextCorrectorProps {
  onCorrectionComplete?: (original: string, corrected: string) => void;
}

const TextCorrector: React.FC<TextCorrectorProps> = ({ onCorrectionComplete }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCorrect = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setCopied(false);
    try {
      const response = await generateCorrection(input);
      setResult(response);
      
      // Save to cloud via parent callback if available
      if (onCorrectionComplete) {
        onCorrectionComplete(input, response);
      }
    } catch (e) {
      setResult("حدث خطأ بسيط، حاولي مرة ثانية يا روحي.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-pink-50 mt-6 transition-all hover:shadow-md">
       {/* Header */}
       <div className="flex items-center gap-2 mb-4 text-secondary">
         <div className="bg-secondary/10 p-2 rounded-full">
            <PenTool className="w-5 h-5 text-secondary" />
         </div>
         <h2 className="text-lg font-bold">مصحح النصوص (لمسات أوس)</h2>
       </div>
       
       <p className="text-xs text-gray-400 mb-3">
         عندك نص تردين تدزي لأحد أو بوست تردين تنشري؟ خلين أرتبلج ياه.
       </p>

       <textarea
         className="w-full bg-gray-50 rounded-xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary/30 min-h-[100px] border border-gray-200 resize-none mb-4 placeholder:text-gray-300 transition-all"
         placeholder="اكتبي النص هنا..."
         value={input}
         onChange={(e) => setInput(e.target.value)}
       />

       <div className="flex justify-end mb-2">
         <button
           onClick={handleCorrect}
           disabled={loading || !input.trim()}
           className="bg-secondary text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-95"
         >
           {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
           <span>رتب لي الكلام</span>
         </button>
       </div>

       {result && (
         <div className="mt-6 bg-gradient-to-br from-pink-50 to-white rounded-xl p-5 border border-pink-100 animate-fade-in relative group">
           <h3 className="text-xs font-bold text-primary mb-3 flex items-center gap-1">
             <Sparkles className="w-3 h-3" />
             النتيجة:
           </h3>
           <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm md:text-base font-medium">
             {result}
           </p>
           
           <button 
             onClick={copyToClipboard}
             className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-primary hover:bg-pink-50 transition-all"
             title="نسخ النص"
           >
             {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
           </button>
         </div>
       )}
    </div>
  );
};

export default TextCorrector;