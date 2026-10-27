import React from 'react';

interface MagneticButtonProps {
    /** Child elements (button content) */
    children: React.ReactNode;
    /** @deprecated No longer used; the cursor-tracking effect was removed */
    strength?: number;
    /** Additional className for the wrapper */
    className?: string;
    /** @deprecated No longer used; the cursor-tracking effect was removed */
    disabled?: boolean;
}

/**
 * MagneticButton - Layout wrapper kept for existing call sites.
 * The cursor-tracking "magnetic" motion was removed; buttons stay put.
 */
const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className = '' }) => (
    <div className={`inline-block ${className}`}>{children}</div>
);

export default MagneticButton;
