
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}

export const ActionButton: React.FC<ActionButtonProps> = ({ children, variant = 'primary', ...props }) => {
    const baseClasses = 'w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base';
    
    const variantClasses = {
        primary: 'bg-dathouzz-orange text-white hover:bg-dathouzz-orange-dark focus:ring-dathouzz-orange',
        secondary: 'bg-gray-200 dark:bg-[#282828] text-gray-800 dark:text-dark-text hover:bg-gray-300 dark:hover:bg-[#333333] focus:ring-gray-400 dark:focus:ring-[#444444]'
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
            {children}
        </button>
    );
};