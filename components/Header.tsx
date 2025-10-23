
import React from 'react';
import type { ActiveMode } from '../types';

interface HeaderProps {
    activeMode: ActiveMode;
    setActiveMode: (mode: ActiveMode) => void;
}

const ModeButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap flex-1 py-3 px-4 text-base tracking-wider font-bold transition-all duration-300 border-b-4 ${
            isActive 
                ? 'text-dathouzz-orange border-dathouzz-orange' 
                : 'text-gray-600 dark:text-gray-300 border-transparent hover:text-dathouzz-orange'
        }`}
    >
        {label.toUpperCase()}
    </button>
);

export const Header: React.FC<HeaderProps> = ({ activeMode, setActiveMode }) => {
    return (
        <header className="bg-white dark:bg-[#1c1c1c] p-3 flex items-center justify-between border-b border-gray-200 dark:border-dark-border flex-shrink-0">
            <div className="flex-1">
                 <div className="text-left text-xs text-gray-500 dark:text-gray-400">
                    <p>
                        COPYRIGHT 2025 <span className="font-bold text-dathouzz-orange">HCDOOR</span><span className="font-bold text-black dark:text-white">.AI</span>
                    </p>
                    <p>ALL RIGHT RESERVED</p>
                    <p>Zalo: 0937973791</p>
                </div>
            </div>
            <div className="flex flex-col items-center">
                 <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <span>HCDOOR.AI</span>
                </h1>
                <nav className="w-full max-w-4xl flex items-center justify-center gap-2 mt-2">
                    <ModeButton label="Ngoại thất" isActive={activeMode === 'exterior'} onClick={() => setActiveMode('exterior')} />
                    <ModeButton label="Nội thất" isActive={activeMode === 'interior'} onClick={() => setActiveMode('interior')} />
                    <ModeButton label="Quy hoạch" isActive={activeMode === 'planning'} onClick={() => setActiveMode('planning')} />
                    <ModeButton label="Hoàn thiện nét vẽ" isActive={activeMode === 'sketch_colorize'} onClick={() => setActiveMode('sketch_colorize')} />
                    <ModeButton label="2D sang 3D" isActive={activeMode === 'plan_to_3d'} onClick={() => setActiveMode('plan_to_3d')} />
                    <ModeButton label="2D sang Phối cảnh" isActive={activeMode === 'plan_to_perspective'} onClick={() => setActiveMode('plan_to_perspective')} />
                    <ModeButton label="Ảnh đã tạo" isActive={activeMode === 'gallery'} onClick={() => setActiveMode('gallery')} />
                </nav>
            </div>
            <div className="flex-1 flex justify-end">
            </div>
        </header>
    );
};