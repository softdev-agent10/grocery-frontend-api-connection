"use client";

import { useEffect, useRef } from "react";

interface Props {
    onScan: (barcode: string) => void;
    minChars?: number;
    timeout?: number;
}

/**
 * Reusable Barcode Scanner listener component.
 * Listens for hardware scanner input (keyboard-emulated) globally.
 * Hardware scanners usually type very fast and end with 'Enter'.
 */
export default function BarcodeScanner({ onScan, minChars = 3, timeout = 100 }: Props) {
    const buffer = useRef<string>("");
    const lastKeyTime = useRef<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore events if user is typing in an input/textarea (optional, but good for POS)
            // In a POS, you might want to allow scanning even when focus is elsewhere
            const target = e.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
                // If the input is the search bar, we might want to scan into it.
                // But usually, scanners just trigger 'Enter' at the end.
                // For now, we allow global scanning but ignore if it's already an input.
                // However, many POS systems need scanning to work regardless of focus.
            }

            const now = Date.now();

            // Hardware scanners type very fast. If the gap between keys is too large,
            // it's likely manual typing, so we reset the buffer.
            if (now - lastKeyTime.current > timeout) {
                buffer.current = "";
            }

            lastKeyTime.current = now;

            if (e.key === "Enter") {
                if (buffer.current.length >= minChars) {
                    onScan(buffer.current);
                    buffer.current = "";
                }
            } else if (e.key.length === 1) {
                // Only collect single-character keys
                buffer.current += e.key;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onScan, minChars, timeout]);

    return null; // This component doesn't render anything
}
