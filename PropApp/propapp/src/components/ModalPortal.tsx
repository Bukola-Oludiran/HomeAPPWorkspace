import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ModalPortalProps {
    children: ReactNode;
}

/**
 * Portal component that renders children at the document body level.
 * This ensures modals escape any parent stacking contexts and appear above all content.
 */
export default function ModalPortal({ children }: ModalPortalProps) {
    // Render the modal content directly to document.body
    return createPortal(
        children,
        document.body
    );
}
