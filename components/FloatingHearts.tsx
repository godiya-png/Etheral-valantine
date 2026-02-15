
import React, { useEffect, useState } from 'react';

interface FloatingHeartsProps {
  isDarkMode?: boolean;
}

const FloatingHearts: React.FC<FloatingHeartsProps> = ({ isDarkMode = false }) => {
  const [hearts, setHearts] = useState<{ id: number; left: string; size: string; duration: string; delay: string }[]>([]);

  useEffect(() => {
    const initialHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 20 + 10}px`,
      duration: `${Math.random() * 10 + 15}s`,
      delay: `${Math.random() * 10}s`,
    }));
    setHearts(initialHearts);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className={`floating-heart transition-colors duration-1000 ${
            isDarkMode ? 'text-rose-900 opacity-20' : 'text-rose-300 opacity-20'
          }`}
          style={{
            left: heart.left,
            fontSize: heart.size,
            // @ts-ignore
            '--duration': heart.duration,
            animationDelay: heart.delay,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
