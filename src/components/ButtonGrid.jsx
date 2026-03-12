import { useRef } from 'react';
import LedButton from './LedButton';

export default function ButtonGrid({ buttonRefs }) {
    return (
        <div className="button-grid">
            {Array.from({ length: 8 }, (_, i) => (
                <LedButton
                    key={i}
                    index={i}
                    buttonRef={(el) => {
                        if (buttonRefs.current) buttonRefs.current[i] = el;
                    }}
                />
            ))}
        </div>
    );
}
