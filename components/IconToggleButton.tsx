
import React from 'react';

// FIX: Moved IconToggleButtonProps before IconToggleButtonGroup to ensure it's defined before use.
interface IconToggleButtonProps {
    value: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    isStandalone?: boolean;
}

interface IconToggleButtonGroupProps {
    label: string;
    children: React.ReactNode;
    value?: string;
    onChange?: (value: string) => void;
    isMultiSelect?: boolean;
}

export const IconToggleButtonGroup: React.FC<IconToggleButtonGroupProps> = ({ label, children, value, onChange, isMultiSelect }) => {
    return (
        <div>
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">{label}</label>
            <div className="flex flex-wrap gap-2">
                {/* FIX: Used a type guard with React.isValidElement to ensure child is of the correct type before accessing props. */}
                {React.Children.map(children, (child) => {
                    if (React.isValidElement<IconToggleButtonProps>(child)) {
                        if (isMultiSelect) {
                            return child;
                        }
                        return React.cloneElement(child, {
                            isActive: child.props.value === value,
                            onClick: () => onChange && onChange(child.props.value),
                        });
                    }
                    return child;
                })}
            </div>
        </div>
    );
};

export const IconToggleButton: React.FC<IconToggleButtonProps> = ({ isActive, onClick, icon, label, isStandalone }) => {
    const baseClasses = 'flex items-center gap-2 p-2 rounded-md transition-colors font-semibold border';
    const activeClasses = 'bg-dathouzz-orange text-white border-dathouzz-orange';
    const inactiveClasses = 'bg-gray-200 dark:bg-[#282828] hover:bg-gray-300 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-transparent';
    const standaloneClasses = 'w-full justify-start text-sm';
    const groupItemClasses = 'flex-col flex-1 min-w-[70px] h-16 justify-center text-center text-[11px] leading-tight';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${isStandalone ? standaloneClasses : groupItemClasses}`}
        >
            <div className="w-5 h-5 mx-auto">{icon}</div>
            <span>{label}</span>
        </button>
    );
};