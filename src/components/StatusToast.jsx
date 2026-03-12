import { useState, useEffect, useRef } from 'react';
import { useMechanize } from '../context/MechanizeContext';

export default function StatusToast() {
    const { state } = useMechanize();
    const { statusText, statusVisible, progress, activeButton } = state;
    const [displayText, setDisplayText] = useState('');
    const [animClass, setAnimClass] = useState('');
    const prevVisibleRef = useRef(false);

    useEffect(() => {
        if (statusVisible && statusText) {
            setDisplayText(statusText);
            setAnimClass('entering');
        } else if (!statusVisible && prevVisibleRef.current) {
            setAnimClass('exiting');
            const timer = setTimeout(() => {
                setDisplayText('');
                setAnimClass('');
            }, 400);
            return () => clearTimeout(timer);
        }
        prevVisibleRef.current = statusVisible;
    }, [statusVisible, statusText]);

    const showProgress = activeButton !== null && progress > 0;

    return (
        <div className="status-toast-area">
            <div className={`progress-bar-track ${showProgress ? 'visible' : ''}`}>
                <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
            {displayText && (
                <span className={`status-text ${animClass}`}>
                    {displayText}
                </span>
            )}
        </div>
    );
}
