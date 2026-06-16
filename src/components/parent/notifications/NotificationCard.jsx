import React from 'react';
import { Eye, EyeOff, GraduationCap, Settings } from 'lucide-react';

const NotificationCard = ({ title, description, time, type, isRead, onToggleRead }) => {
  const isAcademic = type === 'academic';
  const Icon = isAcademic ? GraduationCap : Settings;

  return (
    <div 
      className="flex items-start gap-4 border border-[#E5E5E5] transition-all"
      dir="rtl"
      style={{
      
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: isRead ? '#FFFFFF' : '#EAF4FF' 
      }}
    >
     
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isAcademic ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#E6F1FB] text-[#185FA5]'}`}>
        <Icon size={18} />
      </div>

  
      <div className="flex-1 text-right">
        <h3 
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '24px',
            color: '#1F2937'
          }}
        >
          {title}
        </h3>
        <p 
          className="mt-1"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#1F2937BF' 
          }}
        >
          {description}
        </p>
        <span 
          className="mt-1.5 block"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '16px',
            color: '#1F2937BF'
          }}
        >
          {time}
        </span>
      </div>

     
      <button
        onClick={onToggleRead}
        className="flex items-center gap-1 hover:text-[#123C91] shrink-0 pt-0.5 whitespace-nowrap"
        style={{
          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '16px',
          color: '#1F2937'
        }}
      >
        {isRead ? <EyeOff size={14} /> : <Eye size={14} />}
        {isRead ? 'وضع علامة كغير مقروءة' : 'وضع علامة كمقروءة'}
      </button>
    </div>
  );
};

export default NotificationCard;