import { useEffect, useState } from 'react';

const POSITIONS = [
  'left-[5%] top-[8%]',
  'right-[5%] top-[12%]',
  'left-[8%] bottom-[12%]',
  'right-[7%] bottom-[10%]',
  'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
];

const nextDelay = () => 11000 + Math.floor(Math.random() * 9000);

export default function ProtectedContentWatermark({ displayName, viewerId }) {
  const [position, setPosition] = useState(() => Math.floor(Math.random() * POSITIONS.length));

  useEffect(() => {
    let timeout;
    const move = () => {
      timeout = window.setTimeout(() => {
        setPosition((current) => {
          const offset = 1 + Math.floor(Math.random() * (POSITIONS.length - 1));
          return (current + offset) % POSITIONS.length;
        });
        move();
      }, nextDelay());
    };
    move();
    return () => window.clearTimeout(timeout);
  }, []);

  if (!viewerId) return null;
  return (
    <div
      aria-hidden='true'
      className={`pointer-events-none absolute z-10 max-w-[70%] select-none rounded-md bg-black/25 px-2.5 py-1.5 text-start text-[10px] font-semibold leading-4 text-white/55 shadow-sm backdrop-blur-[1px] transition-[left,right,top,bottom,transform] duration-700 sm:text-xs ${POSITIONS[position]}`}
    >
      <span className='truncate' dir='auto'>{displayName || 'متعلم'}</span>
      <span className='px-1 text-white/40'>•</span>
      <span dir='ltr'>{viewerId}</span>
    </div>
  );
}
