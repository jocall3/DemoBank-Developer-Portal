
import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'interactive' | 'outline';
}

const Card: React.FC<CardProps> = ({ title, children, className = '', variant = 'default' }) => {
    const variants = {
        default: 'bg-gray-800/80 border border-gray-700 shadow-xl',
        interactive: 'bg-gray-800/80 border border-gray-700 shadow-xl hover:border-cyan-500/50 hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1',
        outline: 'bg-transparent border border-gray-700 hover:border-gray-600 transition-colors',
    };

    return (
        <div className={`p-6 rounded-2xl ${variants[variant]} ${className}`}>
            {title && (
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-100 tracking-tight">{title}</h3>
                </div>
            )}
            <div className="relative">
                {children}
            </div>
        </div>
    );
};

export default Card;
