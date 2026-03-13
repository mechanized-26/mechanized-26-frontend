import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { connectMqtt, subscribeTopic, publishMessage, onConnectionChange, disconnectMqtt } from '../mqtt/mqttClient';
import { TOPICS, cmdTopic, SUBSCRIBE_TOPICS } from '../mqtt/topics';

// --- State Shape ---
const initialState = {
    buttons: Array(8).fill('idle'), // 'idle' | 'running' | 'completed'
    activeButton: null,             // index of current running button, or null
    progress: 0,                    // 0-100 progress of current strip
    statusText: '',                 // ephemeral status message
    statusVisible: false,           // whether status text is visible
    allComplete: false,             // all 8 strips done
    relayActive: false,             // relay has been triggered
    mqttConnected: false,           // broker connection state
    espOnline: false,               // ESP32 presence
};

// --- Reducer ---
function reducer(state, action) {
    switch (action.type) {
        case 'START_BUTTON': {
            const buttons = [...state.buttons];
            buttons[action.index] = 'running';
            return {
                ...state,
                buttons,
                activeButton: action.index,
                progress: 0,
                statusText: `Activating strip ${action.index + 1}...`,
                statusVisible: true,
            };
        }

        case 'SET_PROGRESS': {
            return {
                ...state,
                progress: action.progress,
                statusText: `Lighting strip ${(state.activeButton ?? 0) + 1}... ${action.progress}%`,
                statusVisible: true,
            };
        }

        case 'BUTTON_COMPLETE': {
            const buttons = [...state.buttons];
            const idx = action.index ?? state.activeButton;
            if (idx !== null && idx !== undefined) {
                buttons[idx] = 'completed';
            }
            const allComplete = buttons.every(b => b === 'completed');
            return {
                ...state,
                buttons,
                activeButton: null,
                progress: 0,
                statusText: `Strip ${(idx ?? 0) + 1} completed!`,
                statusVisible: true,
                allComplete,
            };
        }

        case 'SET_STATUS_TEXT': {
            return {
                ...state,
                statusText: action.text,
                statusVisible: true,
            };
        }

        case 'HIDE_STATUS': {
            return {
                ...state,
                statusVisible: false,
            };
        }

        case 'SET_RELAY': {
            return { ...state, relayActive: true };
        }

        case 'SET_MQTT_CONNECTED': {
            return { ...state, mqttConnected: action.connected };
        }

        case 'SET_ESP_ONLINE': {
            return { ...state, espOnline: action.online };
        }

        case 'RESTORE_STATE': {
            // Restore from ESP32 retained state message
            const buttons = action.buttons || Array(8).fill('idle');
            const allComplete = buttons.every(b => b === 'completed');
            // ESP32 sends activeButton as -1 when idle, convert to null for React
            const activeBtn = (action.activeButton !== undefined && action.activeButton >= 0)
                ? action.activeButton
                : null;
            return {
                ...state,
                buttons,
                activeButton: activeBtn,
                progress: action.progress ?? 0,
                allComplete,
                relayActive: action.relayActive ?? false,
            };
        }

        case 'RESET_ALL': {
            return {
                ...initialState,
                mqttConnected: state.mqttConnected,
                espOnline: state.espOnline,
            };
        }

        default:
            return state;
    }
}

// --- Context ---
const MechanizeContext = createContext(null);

export function MechanizeProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const statusTimerRef = useRef(null);

    // Auto-hide status text after delay
    const showStatus = useCallback((text, duration = 3000) => {
        dispatch({ type: 'SET_STATUS_TEXT', text });
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(() => {
            dispatch({ type: 'HIDE_STATUS' });
        }, duration);
    }, []);

    // Button click handler
    const activateButton = useCallback((index) => {
        if (state.buttons[index] !== 'idle' || state.activeButton !== null) return;
        dispatch({ type: 'START_BUTTON', index });
        publishMessage(cmdTopic(index), JSON.stringify({ action: 'start', strip: index + 1 }));
    }, [state.buttons, state.activeButton]);

    // MQTT setup — wrapped in try-catch to prevent crash if broker URL is invalid
    useEffect(() => {
        let unsubConnection = () => {};
        let unsubs = [];

        try {
            connectMqtt();

            unsubConnection = onConnectionChange((connected) => {
                dispatch({ type: 'SET_MQTT_CONNECTED', connected });
            });

            // Subscribe to all dashboard topics
            unsubs = SUBSCRIBE_TOPICS.map(topic =>
                subscribeTopic(topic, (t, message) => {
                    try {
                        handleMqttMessage(t, message, dispatch, showStatus);
                    } catch (e) {
                        console.error('[MQTT] Error handling message:', e);
                    }
                })
            );
        } catch (e) {
            console.warn('[MQTT] Failed to initialize:', e.message);
        }

        return () => {
            unsubConnection();
            unsubs.forEach(unsub => unsub());
            try { disconnectMqtt(); } catch (e) { /* ignore */ }
        };
    }, [showStatus]);

    // Send relay command when all complete
    useEffect(() => {
        if (state.allComplete && !state.relayActive) {
            dispatch({ type: 'SET_RELAY' });
            showStatus('All strips activated! Powering up relay...', 5000);
            // Short delay so the user sees the logo animation first
            setTimeout(() => {
                publishMessage(TOPICS.RELAY, 'ON', { retain: true });
            }, 2000);
        }
    }, [state.allComplete, state.relayActive, showStatus]);

    // Auto-hide status after button events
    useEffect(() => {
        if (state.statusVisible && state.activeButton === null && !state.allComplete) {
            if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
            statusTimerRef.current = setTimeout(() => {
                dispatch({ type: 'HIDE_STATUS' });
            }, 3000);
        }
    }, [state.statusVisible, state.activeButton, state.allComplete]);

    const value = { state, dispatch, activateButton, showStatus };
    return (
        <MechanizeContext.Provider value={value}>
            {children}
        </MechanizeContext.Provider>
    );
}

export function useMechanize() {
    const ctx = useContext(MechanizeContext);
    if (!ctx) throw new Error('useMechanize must be used within MechanizeProvider');
    return ctx;
}

// --- MQTT message handler ---
function handleMqttMessage(topic, message, dispatch, showStatus) {
    if (topic === TOPICS.STATUS) {
        const data = JSON.parse(message);
        // data: { button: 1-8, phase: 'command_received' | 'running' | 'completed' }
        const buttonIndex = data.button - 1;
        switch (data.phase) {
            case 'command_received':
                showStatus(`ESP32 received command for strip ${data.button}`);
                break;
            case 'running':
                dispatch({ type: 'START_BUTTON', index: buttonIndex });
                break;
            case 'completed':
                dispatch({ type: 'BUTTON_COMPLETE', index: buttonIndex });
                break;
        }
    }

    if (topic === TOPICS.PROGRESS) {
        const data = JSON.parse(message);
        // data: { button: 1-8, current: 0-100, total: 100 }
        const pct = Math.round((data.current / data.total) * 100);
        dispatch({ type: 'SET_PROGRESS', progress: pct });
    }

    if (topic === TOPICS.STATE) {
        const data = JSON.parse(message);
        // Full state restore: { buttons: [...], activeButton, relayActive }
        dispatch({ type: 'RESTORE_STATE', ...data });
    }

    if (topic === TOPICS.ESP_STATUS) {
        if (message === 'online') {
            dispatch({ type: 'SET_ESP_ONLINE', online: true });
            showStatus('ESP32 connected');
        } else if (message === 'offline') {
            dispatch({ type: 'SET_ESP_ONLINE', online: false });
            dispatch({ type: 'RESET_ALL' });
            showStatus('ESP32 disconnected — state reset', 5000);
        }
    }
}
