import React from 'react';

const AnimatedLogo: React.FC = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 150 150"
    className="drop-shadow-lg"
  >
    <defs>
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .bowl-bounce {
            animation: bounce 2.5s ease-in-out infinite;
          }
        `}
      </style>
    </defs>
    <g className="bowl-bounce">
      <path d="M35 80 Q75 130 115 80" stroke="white" strokeWidth="10" fill="transparent" strokeLinecap="round" />
      <circle cx="50" cy="65" r="10" fill="#a3e635" />
      <circle cx="75" cy="55" r="12" fill="#84cc16" />
      <circle cx="100" cy="65" r="10" fill="#a3e635" />
      <path d="M60 70 Q75 50 90 70" stroke="#bef264" strokeWidth="5" fill="transparent" strokeLinecap="round" />
    </g>
  </svg>
);

export default AnimatedLogo;