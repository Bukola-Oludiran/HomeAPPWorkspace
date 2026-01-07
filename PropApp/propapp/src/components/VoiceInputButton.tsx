import { useState } from 'react';

interface VoiceInputButtonProps {
    onResult?: (transcript: string) => void;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'primary' | 'outline';
    disabled?: boolean;
}

export default function VoiceInputButton({
    onResult,
    size = 'md',
    variant = 'default',
    disabled = false,
}: VoiceInputButtonProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

    const handleClick = () => {
        if (!isSupported) {
            alert('Voice input is not supported in your browser. Please try Chrome or Edge.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        setIsListening(true);

        // Create speech recognition instance
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (onResult) {
                onResult(transcript);
            }
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const sizeClasses = {
        sm: 'size-8',
        md: 'size-10',
        lg: 'size-12',
    };

    const iconSizes = {
        sm: 'text-[18px]',
        md: 'text-[22px]',
        lg: 'text-[26px]',
    };

    const variantClasses = {
        default: `bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 ${isListening ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : ''
            }`,
        primary: `bg-[#137fec] text-white hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/30 ${isListening ? 'bg-red-500 shadow-red-500/30' : ''
            }`,
        outline: `border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 ${isListening ? 'border-red-500 text-red-500' : ''
            }`,
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`rounded-full flex items-center justify-center transition-all relative ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                }`}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
            {/* Pulse animation when listening */}
            {isListening && (
                <>
                    <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></span>
                    <span className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse"></span>
                </>
            )}

            <span className={`material-symbols-outlined ${iconSizes[size]} relative z-10`}>
                {isListening ? 'mic' : 'mic_none'}
            </span>
        </button>
    );
}
