import mqtt from 'mqtt';

const BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:9001';

let client = null;
const messageHandlers = new Map();
let connectionListeners = [];

export function connectMqtt() {
    if (client && client.connected) return client;

    const options = {
        clientId: `mechanize-dashboard-${Math.random().toString(16).slice(2, 10)}`,
        clean: true,
        reconnectPeriod: 3000,
        connectTimeout: 5000,
    };

    // Add credentials if provided via env
    const username = import.meta.env.VITE_MQTT_USERNAME;
    const password = import.meta.env.VITE_MQTT_PASSWORD;
    if (username) options.username = username;
    if (password) options.password = password;

    client = mqtt.connect(BROKER_URL, options);

    client.on('connect', () => {
        console.log('[MQTT] Connected to broker');
        connectionListeners.forEach(fn => fn(true));
    });

    client.on('reconnect', () => {
        console.log('[MQTT] Reconnecting...');
    });

    client.on('close', () => {
        console.log('[MQTT] Disconnected');
        connectionListeners.forEach(fn => fn(false));
    });

    client.on('error', (err) => {
        console.error('[MQTT] Error:', err.message);
    });

    client.on('message', (topic, payload) => {
        const message = payload.toString();
        const handlers = messageHandlers.get(topic) || [];
        handlers.forEach(fn => fn(topic, message));

        // Also call wildcard handlers
        const wildcardHandlers = messageHandlers.get('#') || [];
        wildcardHandlers.forEach(fn => fn(topic, message));
    });

    return client;
}

export function subscribeTopic(topic, handler) {
    if (!messageHandlers.has(topic)) {
        messageHandlers.set(topic, []);
        if (client && client.connected) {
            client.subscribe(topic, { qos: 1 });
        }
    }
    messageHandlers.get(topic).push(handler);

    // If we're already connected, subscribe immediately
    if (client && client.connected && messageHandlers.get(topic).length === 1) {
        client.subscribe(topic, { qos: 1 });
    }

    return () => {
        const handlers = messageHandlers.get(topic);
        if (handlers) {
            const idx = handlers.indexOf(handler);
            if (idx >= 0) handlers.splice(idx, 1);
        }
    };
}

export function publishMessage(topic, payload, options = {}) {
    if (client && client.connected) {
        client.publish(topic, payload, { qos: 1, ...options });
        console.log(`[MQTT] Published to ${topic}:`, payload);
        return true;
    }
    console.warn('[MQTT] Not connected, cannot publish');
    return false;
}

export function onConnectionChange(listener) {
    connectionListeners.push(listener);
    return () => {
        connectionListeners = connectionListeners.filter(fn => fn !== listener);
    };
}

export function disconnectMqtt() {
    if (client) {
        client.end();
        client = null;
        messageHandlers.clear();
        connectionListeners = [];
    }
}

export function isConnected() {
    return client?.connected || false;
}
