import React, { useState, useRef, useEffect, memo } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
    muted: boolean;
    volume: number;
    onToggleMute: () => void;
    onVolumeChange: (volume: number) => void;
}

const VolumeControlBase: React.FC<VolumeControlProps> = ({
    muted,
    volume,
    onToggleMute,
    onVolumeChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hideTimeout = useRef<number | null>(null);

    const handleMouseEnter = () => {
        if (window.matchMedia('(hover: hover)').matches) {
            if (hideTimeout.current) window.clearTimeout(hideTimeout.current);
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (window.matchMedia('(hover: hover)').matches) {
            hideTimeout.current = window.setTimeout(() => {
                setIsOpen(false);
            }, 300);
        }
    };

    const handleClick = () => {
        // If it's a touch device (no hover support)
        if (!window.matchMedia('(hover: hover)').matches) {
            if (!isOpen) {
                setIsOpen(true);
            } else {
                // If clicking the icon specifically, toggle mute
                // If clicking the slider, the slider's own onClick might handle it (but we stop propagation there)
                onToggleMute();
            }
        } else {
            // Desktop: just toggle mute
            onToggleMute();
        }
    };

    // Close when clicking outside (especially important for mobile)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            ref={containerRef}
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onClick={handleClick}
                className="p-2 md:p-4 rounded-full bg-[#1a1510]/80 backdrop-blur-md border border-[#c9a227]/20 hover:border-[#ae2012]/50 hover:bg-[#251e16] transition-all active:scale-95 group shadow-lg flex items-center justify-center relative z-10"
                title={muted ? 'Unmute' : 'Mute'}
                aria-label={muted ? 'Unmute' : 'Mute'}
            >
                {muted ? (
                    <VolumeX className="w-4 h-4 md:w-6 md:h-6 text-[#5a4d41]" />
                ) : (
                    <Volume2 className="w-4 h-4 md:w-6 md:h-6 text-[#fdf5e6]/80 group-hover:text-[#ae2012]" />
                )}
            </button>

            <div
                className={`absolute right-full mr-2 h-10 md:h-14 bg-[#1a1510]/95 backdrop-blur-md border border-[#c9a227]/20 rounded-full px-4 flex items-center transition-all duration-300 origin-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-24 md:w-32 h-1 appearance-none cursor-pointer volume-slider"
                />
            </div>
        </div>
    );
};

export const VolumeControl = memo(VolumeControlBase);
