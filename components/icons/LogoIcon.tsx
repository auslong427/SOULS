import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" {...props}>
        <style>
            {`
                .title-font { font-family: 'Brush Script MT', cursive; fill: currentColor; }
                .subtitle-font { font-family: 'Inter', sans-serif; fill: currentColor; opacity: 0.9; }
            `}
        </style>
        <text x="100" y="45" textAnchor="middle" className="title-font" fontSize="40">
            Austin + Angie
        </text>
        <text x="100" y="70" textAnchor="middle" className="subtitle-font" fontSize="20" fontWeight="600" letterSpacing="2">
            4EVER
        </text>
    </svg>
);