import { useRef, type KeyboardEvent, type ChangeEvent, type ClipboardEvent } from 'react';

interface AuthCodeInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    type?: 'single' | 'boxes';
    placeholder?: string;
    autoFocus?: boolean;
}

export default function AuthCodeInput({
    length = 6,
    value,
    onChange,
    type = 'single',
    placeholder = '000000',
    autoFocus = true
}: AuthCodeInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Single input style (2FA Default - wide tracking)
    if (type === 'single') {
        return (
            <div className="relative group">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={length}
                    value={value}
                    onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
                    autoFocus={autoFocus}
                    autoComplete="one-time-code"
                    placeholder={placeholder}
                    className="block w-full py-4 px-4 border border-white/10 dark:border-slate-600 rounded-xl bg-white/5 dark:bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent transition-all text-center text-3xl font-bold tracking-[0.5em] md:tracking-[0.75em]"
                />
            </div>
        );
    }

    // Boxes style (6 separate inputs)
    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.replace(/\D/g, '');
        if (newValue.length > 1) return;

        const valueArray = value.split('');
        valueArray[index] = newValue;
        const newCode = valueArray.join('');
        onChange(newCode);

        // Auto-advance to next input
        if (newValue && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace - go to previous input
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pastedData);

        // Focus on the next empty input or last input
        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className="flex justify-between gap-2 sm:gap-3">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    autoFocus={autoFocus && index === 0}
                    className="w-full h-12 sm:h-16 rounded-xl border-white/10 bg-white/5 text-center text-2xl font-bold text-white placeholder-slate-600 focus:border-[#137fec] focus:ring-[#137fec] shadow-sm transition-all outline-none"
                />
            ))}
        </div>
    );
}
