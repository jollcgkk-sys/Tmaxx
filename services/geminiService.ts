import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_AWS, NOTIFICATION_TEMPLATES } from "../constants";
import { MoodType, ChatMessage } from "../types";

// Declare process for browser environment to avoid build errors
// The value is injected by Vite define plugin
declare var process: {
  env: {
    API_KEY: string;
  }
};

// Helper to get fresh instance with key check
const getAI = () => {
  const key = process.env.API_KEY;
  if (!key || key.includes("__GEMINI_API_KEY__")) {
    console.error("Gemini API Key is missing or invalid. Check your .env file.");
    // Return a dummy object or handle this upstream, but for now let's allow it to fail gracefully
  }
  return new GoogleGenAI({ apiKey: key });
};

// Helper to format history with timestamps for better context awareness
const formatHistory = (history: ChatMessage[]) => {
  // Analyze last 30 messages for context
  return history.slice(-30).map(msg => {
    const time = new Date(msg.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    return `[${time}] ${msg.sender === 'user' ? 'تبارك' : 'أوس'}: ${msg.text}`;
  }).join('\n');
};

export const generateMoodResponse = async (moodId: MoodType, moodLabel: string, history: ChatMessage[] = []): Promise<string> => {
  const ai = getAI();
  const context = formatHistory(history);
  
  // تعليمات خاصة بناءً على الحالة الشعورية لتعزيز دور "الموجه والمداوي"
  let specificInstruction = "";
  if (moodId === MoodType.QUARREL) {
    specificInstruction = `
    حالة خاصة (شجار): تبارك اختارت وضع "متخاصمين".
    دورك: الإصلاح والتهدئة وتذكيرها بأن الحب أسمى من الخلافات.
    `;
  } else if ([MoodType.SAD, MoodType.HURT, MoodType.STRESSED, MoodType.CONFUSED].includes(moodId)) {
    specificInstruction = `
    حالة خاصة (سلبية): تبارك تشعر بـ ${moodLabel}.
    المطلوب منك كـ "أوس" (السند والموجه):
    1. **الاحتواء أولاً**: أظهر تعاطفاً عميقاً (أنا أحس بيكِ، حقك تضوجين).
    2. **التوجيه ثانياً**: لا تتركها تغرق في الحزن. اقترح عليها حلاً بسيطاً، أو غير نظرتها للأمور، أو ذكرها بقوتها وإنجازاتها.
    3. **النبرة**: حنونة جداً لكن حازمة في عدم قبول استسلامها للحزن.
    `;
  } else if ([MoodType.HAPPY, MoodType.RELAXED, MoodType.LOVING].includes(moodId)) {
    specificInstruction = `
    حالة خاصة (إيجابية): تبارك تشعر بـ ${moodLabel}.
    دورك: شاركها الفرحة، وشجعها تستغل هذه الطاقة الإيجابية في شيء مفيد (دراسة، عمل، تطوير ذات) لأنك تريد مصلحتها.
    `;
  }

  const prompt = `
    سياق المحادثة السابقة:
    ${context}
    
    الحدث الحالي:
    تبارك اختارت أنها تشعر بـ: "${moodLabel}".
    
    ${specificInstruction}
    
    المطلوب منك كـ "أوس":
    أكتب رسالة واحدة فقط تكون كافية وشاملة.
    
    تحليل الذاكرة (هام جداً):
    - هل هناك سبب سابق لهذا المزاج؟ اربط ردك به.
    
    الأسلوب المطلوب:
    1. **اللهجة**: عراقية دافئة (شلونج، بنيتي، فدوة) + فصحى راقية.
    2. **الإملاء**: (أنتِ، لكِ، عليكِ).
    3. **الهدف**: تبارك يجب أن تشعر أنها "أفضل" بعد قراءة رسالتك، أو أنها تملك خطة، أو أنها مسنودة بقوة.
    4. **الإغلاق**: جملة تامة المعنى.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_AWS,
        temperature: 0.85, 
        // maxOutputTokens removed per guidelines
      }
    });
    return response.text || "يا عمري أنتِ، أنا جنبك دائماً وأريد مصلحتك وراحتك.";
  } catch (error) {
    console.error("Error generating mood response:", error);
    return "حبيبتي تبارك، الشبكة عندي ضعيفة بس قلبي معك. ممكن تعيدين المحاولة؟";
  }
};

export const generateSmartReply = async (userQuery: string, history: ChatMessage[]): Promise<string> => {
  const ai = getAI();
  const context = formatHistory(history);

  const prompt = `
    سجل المحادثة:
    ${context}
    
    رسالة تبارك الجديدة: "${userQuery}"
    
    المطلوب من "أوس" (الشريك الناصح والمحب):
    
    التوجيهات:
    1. **التفاعل الذكي**: إذا كانت تبارك تشتكي من شيء، لا تواسها فقط، بل انصحها كيف تتجاوزه.
    2. **التحفيز**: إذا بدت كسولة أو محبطة، كن "محركاً" لها. ذكرها بأهدافها وأحلامها.
    3. **الحب العميق**: اجعل نصيحتك مغلفة بالحب والخوف عليها (مثلاً: "أقولك هذا لأني أحبك وأريدك أحسن وحدة").
    4. **اللهجة**: عراقية محببة (يا عيني، أغاتي).
    5. **الإملاء**: انتبه للتاء المربوطة والهمزات ومخاطبة الأنثى.
    
    الهدف: اجعلها تشعر أنك سند حقيقي يساعدها تواجه الحياة، مو بس شخص يسمع.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_AWS,
        temperature: 0.85,
        // maxOutputTokens removed per guidelines
      }
    });
    return response.text || "أسمعج يا روحي، وكلامج على راسي. كملي.";
  } catch (error) {
    console.error("Error generating reply:", error);
    return "يا روحي الشبكة شوية تعبانة، بس أنا قلبي وياج ويسمعج. حاولي مرة ثانية.";
  }
};

export const generateNotificationMessage = async (lastMood: MoodType | null, history: ChatMessage[] = []): Promise<string> => {
  const ai = getAI();
  const currentHour = new Date().getHours();
  const historyContext = formatHistory(history);
  
  // 1. Determine granular time context
  let timeContext = "وقت غير محدد";
  if (currentHour >= 5 && currentHour < 12) {
    timeContext = "الصباح (وقت النشاط والبدايات)";
  } else if (currentHour >= 12 && currentHour < 17) {
    timeContext = "منتصف النهار (وقت الانشغال)";
  } else if (currentHour >= 17 && currentHour < 22) {
    timeContext = "المساء (وقت الراحة والتقييم)";
  } else {
    timeContext = "الليل المتأخر (وقت الهدوء)";
  }

  // 2. Determine mood context
  let moodContext = "عادية/مستقرة";
  let relevantTemplates = NOTIFICATION_TEMPLATES.GENERAL;
  if (lastMood && NOTIFICATION_TEMPLATES[lastMood]) {
    moodContext = `كانت تشعر بـ: ${lastMood}`;
    relevantTemplates = NOTIFICATION_TEMPLATES[lastMood];
  }

  // 3. Select a random theme centered on CARE and GROWTH
  const themes = [
    "تذكير بالاهتمام بالنفس (أكل، راحة، ماء)",
    "تحفيز للدراسة أو العمل أو الطموح",
    "اشتياق ممزوج بالدعاء لها",
    "تذكير بقوتها وقدرتها على التجاوز",
    "رسالة حب عميقة ومطمئنة"
  ];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];

  // Fallback function
  const getFallback = () => {
    if (relevantTemplates.length > 0) {
      return relevantTemplates[Math.floor(Math.random() * relevantTemplates.length)];
    }
    return "تبارك، ديري بالج على نفسك.. أحبك 🤍";
  };
  
  const prompt = `
    أنت "أوس".
    
    البيانات الحالية:
    - الوقت: ${timeContext}
    - الحالة الأخيرة: ${moodContext}
    - **سياق الحديث الأخير**:
    ${historyContext}
    
    المهمة: اكتب رسالة إشعار (Notification) لتبارك تعبر عن اهتمامك الحقيقي بها.
    
    تعليمات:
    1. تفحص "سياق الحديث الأخير". إذا كانت متعبة أو عندها امتحان أو مشكلة، **يجب** أن تسأل عنها وتطمئن عليها.
    2. إذا لم يكن هناك سياق محدد، اختر موضوعاً عشوائياً: ${randomTheme}.
    3. **النبرة**: نبرة شخص مسؤول ومحب يخاف عليها ويوجهها للأفضل (مثل: "طمنيني أكلتي؟"، "خلصتي دراستك؟"، "لا تسهرين كثير").
    4. **اللهجة**: عراقية (شلونج، بنيتي).
    5. **الإملاء**: دقيق جداً (أنتِ).
    
    اكتب الرسالة فقط (جملتين كحد أقصى):
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 1.0, 
        // maxOutputTokens removed per guidelines
      }
    });
    return response.text || getFallback();
  } catch (error) {
    console.warn("Notification generation failed (using fallback template):", error);
    return getFallback();
  }
};

export const generateCorrection = async (text: string): Promise<string> => {
  const ai = getAI();
  
  const prompt = `
    أنت أوس، وتساعد تبارك في تدقيق هذا النص:
    "${text}"
    
    المطلوب:
    1. قم بتصحيح النص لغوياً وإملائياً.
    2. أضف تعليقاً بسيطاً في البداية بلهجة عراقية مشجعة (مثال: "عاشت إيدك، بس هيج تصير أحلى"، "مبدعة بنيتي، شوفي هذا التعديل").
    3. افصل بين تعليقك والنص المصحح.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_AWS,
        temperature: 0.7,
        // maxOutputTokens removed per guidelines
      }
    });
    return response.text || "النص ممتاز يا روحي، ما يحتاج تعديل.";
  } catch (error) {
    console.error("Error generating correction:", error);
    return "حدث خطأ بسيط، حاولي مرة ثانية يا عمري.";
  }
};