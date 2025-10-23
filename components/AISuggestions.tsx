import React, { useState } from 'react';
import { MagicWandIcon, ClipboardIcon, CheckIcon } from './Icons';

interface AISuggestionsProps {
    suggestions: string[];
    isLoading: boolean;
    onSuggestionClick: (suggestion: string) => void;
}

const SuggestionSkeleton: React.FC = () => (
    <div className="space-y-2 animate-pulse">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
    </div>
);

export const AISuggestions: React.FC<AISuggestionsProps> = ({ suggestions, isLoading, onSuggestionClick }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const hasSuggestions = suggestions && suggestions.length > 0;

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => {
            setCopiedIndex(null);
        }, 2000); // Reset icon after 2 seconds
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-4 rounded-xl shadow-lg">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-dark-text">
                    <MagicWandIcon className="w-5 h-5 text-dathouzz-orange" />
                    <span>AI đang phân tích...</span>
                </h3>
                <SuggestionSkeleton />
            </div>
        );
    }

    if (!hasSuggestions) {
        return null; // Don't render anything if there are no suggestions and it's not loading
    }
    
    return (
        <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border p-4 rounded-xl shadow-lg">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-800 dark:text-dark-text">
                <MagicWandIcon className="w-5 h-5 text-dathouzz-orange" />
                <span>Gợi ý từ AI</span>
            </h3>
            <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-center justify-between gap-2 group">
                        <button
                          onClick={() => onSuggestionClick(suggestion)}
                          className="flex-grow text-left text-sm text-gray-600 dark:text-gray-300 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-dark-border transition-colors focus:outline-none focus:ring-2 focus:ring-dathouzz-orange"
                          aria-label={`Sử dụng gợi ý: ${suggestion}`}
                        >
                           - {suggestion}
                        </button>
                        <button
                            onClick={() => handleCopy(suggestion, index)}
                            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border flex-shrink-0"
                            aria-label="Sao chép gợi ý"
                            title="Sao chép gợi ý"
                        >
                            {copiedIndex === index ? (
                                <CheckIcon className="w-4 h-4 text-green-500" />
                            ) : (
                                <ClipboardIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};