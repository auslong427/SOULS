
import React from 'react';
export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M12 2L2 7h20L12 2z"></path>
    <circle cx="8" cy="13" r="1"></circle>
    <circle cx="16" cy="13" r="1"></circle>
    <path d="M9 17h6"></path>
  </svg>
);
