/**
 * calculateCapacity
 * 
 * Responsibilities:
 * - Compute weighted load for each user.
 * - Update 'capacity_cache' DataStore.
 * - Batch users in chunks of 10-25.
 * - Schedule: every 10 minutes.
 * 
 * Algorithm:
 * For each active open task:
 *   priority weight: High=3, Medium=2, Low=1
 *   due multiplier: <24h → ×2.0; 1–3d → ×1.5; 4–7d → ×1.2; >7d → ×1.0
 *   weighted_sum = Σ(priority_weight × multiplier)
 *   capacity_percent = min(100, round((weighted_sum / max_capacity_base) * 100))
 * 
 * Status:
 *   >=90 → Critical
 *   >=80 → Overloaded
 *   <=40 → Available
 *   else → Busy
 */

const catalyst = require('zcatalyst-sdk-node');
const pMap = require('p-map');

// Constants
const BATCH_SIZE = 20;
const MAX_CAPACITY_BASE_DEFAULT = 12;

// Helper: Calculate Due Multiplier
function getDueMultiplier(dueDateStr) {
    if (!dueDateStr) return 1.0;
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffHours = (due - now) / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 24) return 2.0;
    if (diffDays <= 3) return 1.5;
    if (diffDays <= 7) return 1.2;
    return 1.0;
}

// Helper: Get Priority Weight
function getPriorityWeight(priority) {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return 3;
    if (p === 'medium') return 2;
    if (p === 'low') return 1;
    return 1; // Default
}

// Helper: Determine Status
function getStatus(percent) {
    if (percent >= 90) return 'Critical';
    if (percent >= 80) return 'Overloaded';
    if (percent <= 40) return 'Available';
    return 'Busy';
}

module.exports = async (event, context) => {
    const app = catalyst.initialize(context);
    const datastore = app.datastore();

    try {
        // 1. Fetch Settings (for max_capacity_base)
        const settingsTable = datastore.table('settings');
        const settingsQuery = await settingsTable.getPagedRows({ max_rows: 1 }); // Assuming single settings row
        const settings = settingsQuery.data[0] || {};
        const maxCapacityBase = settings.max_capacity_base || MAX_CAPACITY_BASE_DEFAULT;

        // 2. Fetch All Users (from team_members)
        // In a real large app, we'd paginate. MVP: fetch all (assuming < 100 users for MVP context)
        const teamTable = datastore.table('team_members');
        const teamRows = await teamTable.getPagedRows({ max_rows: 100 });
        const users = teamRows.data;

        // 3. Process Users in Batches
        const capacityUpdates = await pMap(users, async (user) => {
            // Fetch active tasks for user from 'tasks' table
            // ZCQL is better for this: SELECT * FROM tasks WHERE user_id = '...' AND status != 'Closed'
            const zcql = app.zcql();
            const query = `SELECT * FROM tasks WHERE user_id = '${user.user_id}' AND status != 'Closed'`;
            const taskRows = await zcql.executeZCQLQuery(query);
            const tasks = taskRows.map(r => r.tasks); // ZCQL returns { tasks: { ... } }

            let weightedSum = 0;
            let activeTaskCount = 0;

            for (const task of tasks) {
                activeTaskCount++;
                const weight = getPriorityWeight(task.priority);
                const multiplier = getDueMultiplier(task.due_date);
                weightedSum += (weight * multiplier);
            }

            const capacityPercent = Math.min(100, Math.round((weightedSum / maxCapacityBase) * 100));
            const status = getStatus(capacityPercent);

            return {
                user_id: user.user_id,
                weighted_load: weightedSum,
                capacity_percent: capacityPercent,
                active_task_count: activeTaskCount,
                last_updated: new Date().toISOString(),
                status: status
            };
        }, { concurrency: 5 }); // Process 5 users in parallel

        // 4. Update capacity_cache
        const capacityTable = datastore.table('capacity_cache');

        // Batch insert/update
        // Catalyst DataStore doesn't support "upsert" easily in one go without ROWID.
        // We might need to delete old or check existence.
        // For MVP, let's assume we just insert new rows or update if we have ROWID.
        // Since we don't have ROWIDs here easily without querying, and we want to be fast:
        // Strategy: Delete all for these users and insert new? Or just insert and query latest by timestamp?
        // Better: Use ZCQL to update or just insert and let the dashboard pick the latest.
        // "capacity_cache" implies current state.
        // Let's try to find existing rows to update? Too slow.
        // Let's just Insert. The dashboard can query `ORDER BY last_updated DESC LIMIT 1`.
        // OR, we can use `upsertRow` if we had the ROWID.
        // Let's stick to Insert for simplicity and speed, assuming a cleanup job or just querying latest.
        // Wait, "capacity_cache document: { user_id ... }" - if we just insert, we get duplicates.
        // Let's try to delete previous entry for user first?
        // `DELETE FROM capacity_cache WHERE user_id = '...'`

        // Optimization: Delete all entries for these users in one query if possible, then insert.
        // `DELETE FROM capacity_cache WHERE user_id IN (...)`

        // Constructing DELETE query
        const userIds = users.map(u => `'${u.user_id}'`).join(',');
        if (userIds) {
            const zcql = app.zcql();
            await zcql.executeZCQLQuery(`DELETE FROM capacity_cache WHERE user_id IN (${userIds})`).catch(e => console.warn("Delete old cache failed", e));
        }

        // Insert new
        for (let i = 0; i < capacityUpdates.length; i += BATCH_SIZE) {
            const batch = capacityUpdates.slice(i, i + BATCH_SIZE);
            await capacityTable.insertRows(batch);
        }

        context.closeWithSuccess("Capacity calculated and updated.");
    } catch (err) {
        console.error("Error in calculateCapacity:", err);
        context.closeWithFailure("Failed to calculate capacity: " + err.message);
    }
};
