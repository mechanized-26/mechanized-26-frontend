import { useMechanize } from '../context/MechanizeContext';

// Elder Futhark runes as button icons
const RUNE_ICONS = ['ᚦ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᛁ', 'ᛃ', 'ᛈ'];
const RUNE_NAMES = ['THURISAZ', 'RAIDO', 'KAUNAN', 'GEBO', 'WUNJO', 'ISAZ', 'JERA', 'PERTHO'];

export default function LedButton({ index, buttonRef }) {
    const { state, activateButton } = useMechanize();
    const buttonState = state.buttons[index];
    const isActive = state.activeButton === index;
    const otherRunning = state.activeButton !== null && state.activeButton !== index;

    let className = 'led-button';
    if (buttonState === 'running') className += ' running';
    else if (buttonState === 'completed') className += ' completed';
    else if (otherRunning) className += ' disabled-other';

    const isDisabled = buttonState !== 'idle' || otherRunning;

    return (
        <button
            ref={buttonRef}
            className={className}
            data-index={index}
            disabled={isDisabled}
            onClick={() => activateButton(index)}
            aria-label={`Activate rune ${RUNE_NAMES[index]}`}
        >
            {buttonState === 'running' && <span className="led-btn-ring" />}
            {buttonState === 'completed' ? (
                <span className="led-btn-check">᛭</span>
            ) : (
                <>
                    <span className="led-btn-icon">{RUNE_ICONS[index]}</span>
                    <span className="led-btn-label">{RUNE_NAMES[index]}</span>
                </>
            )}
        </button>
    );
}
