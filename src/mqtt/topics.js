// MQTT Topic Constants
export const TOPICS = {
    CMD_PREFIX: 'mechanize/cmd/button',
    STATUS: 'mechanize/status',
    PROGRESS: 'mechanize/progress',
    RELAY: 'mechanize/relay',
    STATE: 'mechanize/state',
    ESP_STATUS: 'mechanize/esp_status',
};

// Build command topic for a button index (0-based → button1-button8)
export function cmdTopic(buttonIndex) {
    return `${TOPICS.CMD_PREFIX}${buttonIndex + 1}`;
}

// All topics the dashboard should subscribe to
export const SUBSCRIBE_TOPICS = [
    TOPICS.STATUS,
    TOPICS.PROGRESS,
    TOPICS.STATE,
    TOPICS.ESP_STATUS,
];
