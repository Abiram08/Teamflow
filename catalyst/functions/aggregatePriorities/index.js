/**
 * aggregatePriorities
 * 
 * Responsibilities:
 * - Aggregate tasks for a user.
 * - Compute urgency scores.
 * - Write top N to 'priority_scores'.
 * - Schedule: 09:00 daily.
 * 
 * Urgency Score Algorithm (0-100):
 * - Time-to-deadline (0-40)
 * - Priority flag (0-30)
 * - Type weight (Projects=10, Desk=20, CRM=15) -> MVP only Projects
 * - Staleness (0-10)
 */

const catalyst = require('zcatalyst-sdk-node');
const pMap = require('p-map');

// Constants
const TOP_N = 5;
const BATCH_SIZE = 20;

// Helper: Score Urgency
function scoreUrgency(task) {
    let score = 0;

    // 1. Time-to-deadline (0-40)
    if (task.due_date) {
        const now = new Date();
        const due = new Date(task.due_date);
        const diffHours = (due - now) / (1000 * 60 * 60);

        if (diffHours < 0) score += 40; // Overdue
        else if (diffHours < 24) score += 35;
        else if (diffHours < 72) score += 20;
        else if (diffHours < 168) score += 10;
        else score += 5;
    }

    // 2. Priority flag (0-30)
    const p = (task.priority || '').toLowerCase();
    if (p === 'high') score += 30;
    else if (p === 'medium') score += 15;
    else if (p === 'low') score += 5;

    // 3. Type weight (Projects=10)
    score += 10;

    // 4. Staleness (0-10) - Time since last update
    if (task.last_updated) {
        const lastUpd = new Date(task.last_updated);
        const diffDays = (new Date() - lastUpd) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) score += 10;
        else if (diffDays > 3) score += 5;
    }

    return Math.min(100, score);
}

module.exports = async (event, context) => {
    const app = catalyst.initialize(context);
    const datastore = app.datastore();
    const zcql = app.zcql();

    try {
        // 1. Fetch Users
        const teamTable = datastore.table('team_members');
        const teamRows = await teamTable.getPagedRows({ max_rows: 100 });
        const users = teamRows.data;

        // 2. Process per user
        await pMap(users, async (user) => {
            // Fetch active tasks
            const query = `SELECT * FROM tasks WHERE user_id = '${user.user_id}' AND status != 'Closed'`;
            const taskRows = await zcql.executeZCQLQuery(query);
            const tasks = taskRows.map(r => r.tasks);

            // Score tasks
            const scoredTasks = tasks.map(t => ({
                item_id: t.task_id,
                user_id: user.user_id,
                score: scoreUrgency(t),
                source: 'Projects',
                metadata: { name: t.name, due_date: t.due_date },
                timestamp: new Date().toISOString()
            }));

            // Sort and take Top N
            scoredTasks.sort((a, b) => b.score - a.score);
            const topTasks = scoredTasks.slice(0, TOP_N);

            // Write to priority_scores
            // First, clear old scores for this user? Or just append?
            // "priority_scores document... item_id, user_id..."
            // Usually we want to replace the "daily feed".
            // Let's delete old ones for this user.
            await zcql.executeZCQLQuery(`DELETE FROM priority_scores WHERE user_id = '${user.user_id}'`).catch(e => { });

            const priorityTable = datastore.table('priority_scores');
            if (topTasks.length > 0) {
                await priorityTable.insertRows(topTasks);
            }

        }, { concurrency: 5 });

        context.closeWithSuccess("Priorities aggregated.");
    } catch (err) {
        console.error("Error in aggregatePriorities:", err);
        context.closeWithFailure("Failed to aggregate priorities: " + err.message);
    }
};
