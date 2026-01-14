import React, { useEffect, useState, useRef } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { NotificationSettings, MoodType, ChatMessage } from '../types';
import { generateNotificationMessage } from '../services/geminiService';

interface NotificationManagerProps {
  lastMood: MoodType | null;
  messages: ChatMessage[];
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ lastMood, messages }) => {
  const [enabled, setEnabled] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  // Check initial permission
  useEffect(() => {
    isMounted.current = true;
    if ("Notification" in window && Notification.permission === "granted") {
       setEnabled(true);
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Setup timer for system notifications
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (enabled && "Notification" in window && Notification.permission === "granted") {
      // Send a notification every 45 minutes to 2 hours (randomized for natural feel)
      const minTime = 45 * 60 * 1000;
      const maxTime = 120 * 60 * 1000;
      const randomInterval = Math.floor(Math.random() * (maxTime - minTime + 1) + minTime);

      timerRef.current = setInterval(async () => {
        if (!isMounted.current) return;
        
        try {
          const msg = await generateNotificationMessage(lastMood, messages);
          if (isMounted.current && msg) {
            new Notification("رسالة من أوس ❤️", {
                body: msg,
                icon: "https://cdn-icons-png.flaticon.com/512/2593/2593491.png",
                dir: "rtl",
                lang: "ar",
                tag: "aws-notification"
            });
          }
        } catch (e) {
          console.warn("Skipping notification due to error");
        }
      }, randomInterval);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, lastMood, messages]);

  const toggleNotifications = async () => {
    if (!("Notification" in window)) {
      alert("عذراً، المتصفح لا يدعم الإشعارات.");
      return;
    }

    if (!enabled) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setEnabled(true);
        new Notification("تم تفعيل إشعارات أوس", { body: "سأكون معكِ دائماً حتى خارج التطبيق." });
      } else {
        alert("يرجى السماح بالإشعارات من إعدادات المتصفح.");
      }
    } else {
      setEnabled(false);
    }
  };

  return (
    <button
      onClick={toggleNotifications}
      className={`fixed bottom-4 left-4 z-40 p-3 rounded-full shadow-lg border transition-all duration-300 ${
        enabled 
          ? 'bg-primary text-white border-primary hover:bg-secondary' 
          : 'bg-white text-gray-400 border-gray-200 hover:text-primary'
      }`}
      title={enabled ? "إيقاف إشعارات أوس" : "تفعيل إشعارات أوس"}
    >
      {enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
    </button>
  );
};

export default NotificationManager;