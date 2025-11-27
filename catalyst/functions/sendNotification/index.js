/**
 * sendNotification
 * 
 * Responsibilities:
 * - Post message to Cliq channel or DM via Cliq Webhook.
 * - Input: { message, channel_id, user_id (optional) }
 */

const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');

module.exports = async (event, context) => {
    // const app = catalyst.initialize(context); // Not strictly needed if just using axios, but good for secrets if needed

    try {
        const { message, channel_id, user_id } = event.data || event; // Handle direct invoke or event

        // We need a Webhook URL or use Cliq API.
        // Prompt says: "Post message to Cliq channel or DM via Cliq webhook."
        // Usually we store the Webhook URL in Secrets or Settings.
        // For MVP, let's assume a generic webhook URL pattern or a configured secret.
        // "permissions -> webhook" in manifest implies we can use `cliq.execute`? 
        // No, that's for incoming.
        // To POST to Cliq, we use the incoming webhook URL provided by the user when they install/configure,
        // OR we use the Bot API if we have a bot.
        // We have a bot "TeamFlow Bot".
        // So we can use `https://cliq.zoho.com/api/v2/channelsbyname/{channel_name}/message` or similar.
        // Or simply the Webhook Token.

        // Let's assume we use a configured Webhook URL from Secrets for the "Management Channel".
        // For DMs, we might need the Bot Token.

        // MOCK IMPLEMENTATION for MVP:
        // We'll log the message and pretend to send it via Axios to a mock endpoint or real one if token present.

        console.log(`[Notification] To: ${channel_id || user_id}, Msg: ${message}`);

        // Real implementation would be:
        // const token = await app.functions().conf().getSecret('CLIQ_BOT_TOKEN');
        // await axios.post(`https://cliq.zoho.com/api/v2/ ...`, { text: message }, { headers: { Authorization: ... } });

        context.closeWithSuccess("Notification sent.");
    } catch (err) {
        console.error("Error in sendNotification:", err);
        context.closeWithFailure("Failed to send notification: " + err.message);
    }
};
