import { useRef, useEffect, useState, useCallback } from 'react';
import { useMechanize } from '../context/MechanizeContext';

// Fire / ember colors per button — Viking forge palette
const LINE_COLORS = [
    '#ff6b00', '#ff4444', '#ffaa00', '#44cc44',
    '#6699ff', '#cc44ff', '#ff4488', '#44dddd',
];

// Generate a tree-branch path from button up to the logo
// The lines merge into a main trunk toward the center-top
function buildBranchPath(btnX, btnY, logoX, logoY, index, total) {
    // Trunk point — all branches converge here below the logo
    const trunkX = logoX;
    const trunkY = logoY + 30;

    // First segment: button → a spread point (branch grows outward & up)
    const spread = (index - (total - 1) / 2) * 18; // horizontal spread based on position
    const branchMidX = btnX + spread * 0.4;
    const branchMidY = btnY - (btnY - trunkY) * 0.35;

    // Second segment: spread point → trunk merge (branches curve inward toward trunk)
    const mergeX = trunkX + spread * 0.15;
    const mergeY = trunkY + (branchMidY - trunkY) * 0.4;

    return `M ${btnX} ${btnY} C ${branchMidX} ${branchMidY}, ${mergeX} ${mergeY}, ${trunkX} ${trunkY} L ${logoX} ${logoY}`;
}

// Generate small twig sub-branches for decoration
function buildTwigs(btnX, btnY, logoX, logoY, index, total) {
    const twigs = [];
    const spread = (index - (total - 1) / 2) * 18;
    const trunkX = logoX;
    const trunkY = logoY + 30;

    // Midpoint of the branch
    const midX = (btnX + trunkX) / 2 + spread * 0.3;
    const midY = (btnY + trunkY) / 2;

    // Left twig
    const twigLen = 18 + Math.abs(spread) * 0.3;
    const twigAngle = index < total / 2 ? -1 : 1;
    twigs.push({
        path: `M ${midX} ${midY} l ${twigAngle * twigLen} ${-twigLen * 0.6}`,
    });

    // Upper twig near the trunk merge
    const upperX = (midX + trunkX) / 2;
    const upperY = (midY + trunkY) / 2;
    twigs.push({
        path: `M ${upperX} ${upperY} l ${twigAngle * twigLen * 0.6} ${-twigLen * 0.4}`,
    });

    return twigs;
}

export default function EnergyLines({ buttonRefs, logoRef }) {
    const { state } = useMechanize();
    const svgRef = useRef(null);
    const [lines, setLines] = useState([]);

    const updateLines = useCallback(() => {
        if (!svgRef.current || !logoRef?.current) return;

        const svgRect = svgRef.current.getBoundingClientRect();
        const logoRect = logoRef.current.getBoundingClientRect();

        const logoX = logoRect.left + logoRect.width / 2 - svgRect.left;
        const logoY = logoRect.bottom - svgRect.top;

        const total = buttonRefs.current.length;

        const newLines = buttonRefs.current.map((btnEl, i) => {
            if (!btnEl) return null;
            const btnRect = btnEl.getBoundingClientRect();
            const btnX = btnRect.left + btnRect.width / 2 - svgRect.left;
            const btnY = btnRect.top - svgRect.top;

            return {
                id: i,
                path: buildBranchPath(btnX, btnY, logoX, logoY, i, total),
                twigs: buildTwigs(btnX, btnY, logoX, logoY, i, total),
                color: LINE_COLORS[i],
                active: state.buttons[i] === 'running',
                completed: state.buttons[i] === 'completed',
            };
        }).filter(Boolean);

        setLines(newLines);
    }, [buttonRefs, logoRef, state.buttons]);

    useEffect(() => {
        updateLines();
        window.addEventListener('resize', updateLines);
        return () => window.removeEventListener('resize', updateLines);
    }, [updateLines]);

    return (
        <svg ref={svgRef} className="energy-lines-container">
            <defs>
                {LINE_COLORS.map((color, i) => (
                    <filter key={`glow-${i}`} id={`glow-${i}`}>
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                ))}

                {LINE_COLORS.map((color, i) => (
                    <linearGradient key={`grad-${i}`} id={`fire-grad-${i}`} x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor={color} stopOpacity="1" />
                        <stop offset="40%" stopColor="#ffd700" stopOpacity="0.7" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                    </linearGradient>
                ))}
            </defs>

            {lines.map((line) => {
                const isVisible = line.active || line.completed;

                return (
                    <g key={line.id}>
                        {/* Wide bark/glow layer */}
                        {isVisible && (
                            <path
                                d={line.path}
                                stroke={line.color}
                                strokeWidth={line.active ? 5 : 3}
                                fill="none"
                                opacity={line.completed ? 0.08 : 0.12}
                                strokeLinecap="round"
                                filter={`url(#glow-${line.id})`}
                            />
                        )}

                        {/* Main branch line */}
                        <path
                            d={line.path}
                            stroke={line.active ? `url(#fire-grad-${line.id})` : line.color}
                            strokeWidth={line.active ? 2.5 : 1.2}
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={line.active ? '8 10' : 'none'}
                            style={{
                                opacity: line.active ? 1 : line.completed ? 0.2 : 0,
                                animation: line.active ? 'dash-flow 0.6s linear infinite' : 'none',
                                transition: 'opacity 0.5s ease',
                            }}
                            filter={line.active ? `url(#glow-${line.id})` : 'none'}
                        />

                        {/* Twig sub-branches */}
                        {isVisible && line.twigs.map((twig, ti) => (
                            <path
                                key={ti}
                                d={twig.path}
                                stroke={line.color}
                                strokeWidth={line.active ? 1.2 : 0.8}
                                fill="none"
                                strokeLinecap="round"
                                opacity={line.active ? 0.5 : 0.1}
                                filter={line.active ? `url(#glow-${line.id})` : 'none'}
                            />
                        ))}

                        {/* Traveling ember particles on active branch */}
                        {line.active && (
                            <>
                                <circle r="3" fill={line.color} opacity="0.9" filter={`url(#glow-${line.id})`}>
                                    <animateMotion dur="1.2s" repeatCount="indefinite" path={line.path} />
                                </circle>
                                <circle r="2" fill="#ffd700" opacity="0.7">
                                    <animateMotion dur="1.2s" repeatCount="indefinite" path={line.path} begin="0.4s" />
                                </circle>
                                <circle r="1.5" fill="#fff" opacity="0.4">
                                    <animateMotion dur="1.2s" repeatCount="indefinite" path={line.path} begin="0.8s" />
                                </circle>
                            </>
                        )}

                        {/* Faint residue on completed branch */}
                        {line.completed && (
                            <circle r="1.5" fill={line.color} opacity="0.1">
                                <animateMotion dur="5s" repeatCount="indefinite" path={line.path} />
                            </circle>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
