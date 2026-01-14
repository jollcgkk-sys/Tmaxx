import React from 'react';
import { MOODS } from '../constants';
import { MoodType } from '../types';

interface MoodSelectorProps {
  onSelectMood: (mood: MoodType, label: string) => void;
  disabled: boolean;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelectMood, disabled }) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">بماذا تشعرين الآن يا تبارك؟</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onSelectMood(mood.id, mood.label)}
            disabled={disabled}
            className={`
              ${mood.color} 
              border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2
              transition-all duration-300 transform hover:scale-105 active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md
            `}
          >
            <span className="text-4xl filter drop-shadow-sm" role="img" aria-label={mood.label}>
              {mood.emoji}
            </span>
            <span className="font-bold text-lg">{mood.label}</span>
            <span className="text-xs opacity-80 text-center hidden sm:block">{mood.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;