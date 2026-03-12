import { useMechanize } from '../context/MechanizeContext';

export default function Logo() {
    const { state } = useMechanize();
    const { allComplete, mqttConnected, espOnline } = state;

    return (
        <div className="logo-container">
            <h1 className={`logo-text ${allComplete ? 'powered' : ''}`}>
                MECHANIZED 26
            </h1>

            {/* Decorative rune border */}
            <div className="logo-rune-border">
                <div className="logo-line" />
                <span className="logo-rune-symbol">ᛟ ᚱ ᛞ ᛖ ᚱ</span>
                <div className="logo-line" />
            </div>

            <p className="logo-subtitle">
                <span className={`connection-dot ${mqttConnected ? 'online' : 'offline'}`} />
                {mqttConnected
                    ? (espOnline ? 'Forge Connected' : 'Awaiting Forge')
                    : 'Disconnected'}
            </p>
        </div>
    );
}
