
import React, { useState } from 'react';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, isOpen: defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-gray-100 dark:bg-[#282828]/60 rounded-lg border border-gray-200 dark:border-dark-border">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left font-semibold text-base text-gray-800 dark:text-dark-text hover:bg-gray-200/50 dark:hover:bg-[#333333]/50"
            >
                <span>{title}</span>
                <svg
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                 <div className="p-4 border-t border-gray-200 dark:border-dark-border space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};