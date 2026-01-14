export enum MoodType {
  ANGRY = 'ANGRY',
  SAD = 'SAD',
  STRESSED = 'STRESSED',
  NEUTRAL = 'NEUTRAL',
  RELAXED = 'RELAXED',
  HAPPY = 'HAPPY',
  LOVING = 'LOVING',
  CONFUSED = 'CONFUSED',
  HURT = 'HURT',
  SLEEPY = 'SLEEPY',
  QUARREL = 'QUARREL', // New mood type for fighting/arguments
  MIXED = 'MIXED'
}

export interface MoodConfig {
  id: MoodType;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'aws';
  text: string;
  timestamp: Date;
  type: 'mood_response' | 'advice_response' | 'notification';
}

export interface NotificationSettings {
  enabled: boolean;
  frequency: number; // in minutes
  lastMood: MoodType | null;
}