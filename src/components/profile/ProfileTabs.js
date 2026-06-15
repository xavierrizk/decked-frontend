import React from 'react';

export default function ProfileTabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 mb-8 border-b border-white/[0.07] overflow-x-auto">
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
              isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {tab.label}
            {tab.count != null && (
              <span className={`ml-1.5 text-xs ${isActive ? 'text-[#00D9FF]' : 'text-gray-600'}`}>
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: '#00D9FF' }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
