/**
 * detectOverload
 * 
 * Responsibilities:
 * - Receive { user_id, old_status, new_status, capacity_percent }
 * - Check if state flipped to Overloaded or Critical.
 * - Call sendNotification if needed.
 */

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (event, context) => {
    const app = catalyst.initialize(context);

    try {
        const { user_id, user_name, old_status, new_status, capacity_percent } = event.data || {};

        // 1. Check for State Flip
        // We care if it goes TO Overloaded/Critical FROM something lower.
        const isHighLoad = (s) => ['Overloaded', 'Critical'].includes(s);

        if (isHighLoad(new_status) && new_status !== old_status) {
            // Flip detected!

            // 2. Construct Message
            const message = `⚠️ **Capacity Alert**: ${user_name} is now **${new_status}** (${capacity_percent}%).`;

            // 3. Call sendNotification
            // We can invoke it directly or via circuit.
            // Using function execution component.
            const functions = app.functions();
            const notificationFunc = functions.getFunctionDetails('sendNotification'); // Ensure name matches
            // Actually, to invoke another function:
            // await functions.execute('sendNotification', { message, channel_id: '...' });

            // We need a target channel. Fetch from settings.
            const datastore = app.datastore();
            const settingsTable = datastore.table('settings');
            const settingsQuery = await settingsTable.getPagedRows({ max_rows: 1 });
            const settings = settingsQuery.data[0] || {};
            const channelId = settings.channel_id; // Management channel

            if (channelId) {
                await functions.execute('sendNotification', {
                    message: message,
                    channel_id: channelId
                });
            } else {
                console.warn("No management channel_id configured in settings.");
            }
        }

        context.closeWithSuccess("Overload check complete.");
    } catch (err) {
        console.error("Error in detectOverload:", err);
        context.closeWithFailure("Failed to detect overload: " + err.message);
    }
};
