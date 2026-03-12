import { useRef } from 'react';
import { MechanizeProvider } from './context/MechanizeContext';
import Logo from './components/Logo';
import ButtonGrid from './components/ButtonGrid';
import EnergyLines from './components/EnergyLines';
import StatusToast from './components/StatusToast';

export default function App() {
    const logoRef = useRef(null);
    const buttonRefs = useRef([]);

    return (
        <MechanizeProvider>
            <div className="app-container">
                {/* Energy line SVG overlay */}
                <EnergyLines buttonRefs={buttonRefs} logoRef={logoRef} />

                {/* Logo */}
                <div ref={logoRef}>
                    <Logo />
                </div>

                {/* Button grid */}
                <ButtonGrid buttonRefs={buttonRefs} />

                {/* Subtle status toast */}
                <StatusToast />
            </div>
        </MechanizeProvider>
    );
}
