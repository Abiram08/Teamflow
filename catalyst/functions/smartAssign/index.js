/**
 * smartAssign
 * 
 * Responsibilities:
 * - Combine availability (50%), skills (40%), performance (10%).
 * - Return top 3 candidates.
 * 
 * Input:
 * - task_description (string)
 * - project_id (string, optional)
 * 
 * Algorithms:
 * - inferSkillsFromText: Rule-based mapping.
 * - matchSkills: 0-40 score.
 * - Availability Score: <40%->50, 40-60%->40, 60-80%->30, >80%->10.
 * - Performance: completion rate * 10 (MVP: random or fixed 1.0 if not tracked).
 */

const catalyst = require('zcatalyst-sdk-node');

// Skill Mapping Table
const SKILL_MAP = {
    "react": ["react", "frontend", "ui", "javascript"],
    "node": ["node", "backend", "api", "express"],
    "design": ["design", "figma", "ui/ux", "css"],
    "database": ["sql", "mongo", "db", "database"],
    "marketing": ["seo", "content", "social", "marketing"]
};

// Helper: Infer Skills
function inferSkillsFromText(text) {
    const inferred = new Set();
    const lowerText = text.toLowerCase();

    for (const [skill, keywords] of Object.entries(SKILL_MAP)) {
        for (const kw of keywords) {
            if (lowerText.includes(kw)) {
                inferred.add(skill);
                break;
            }
        }
    }
    return Array.from(inferred);
}

// Helper: Match Skills (0-40)
function matchSkills(userSkills, taskSkills) {
    if (!taskSkills || taskSkills.length === 0) return 5; // Default if no skills inferred

    const uSkills = (userSkills || []).map(s => s.toLowerCase());
    const matches = taskSkills.filter(s => uSkills.includes(s));

    if (matches.length === taskSkills.length) return 40; // Exact match (all required skills present)
    if (matches.length >= taskSkills.length / 2) return 25; // Partial >= 50%
    if (matches.length > 0) return 15; // Partial < 50%
    return 5; // None
}

// Helper: Availability Score (0-50)
function getAvailabilityScore(capacityPercent) {
    if (capacityPercent < 40) return 50;
    if (capacityPercent < 60) return 40;
    if (capacityPercent < 80) return 30;
    return 10;
}

module.exports = async (event, context) => {
    const app = catalyst.initialize(context);
    const datastore = app.datastore();
    const zcql = app.zcql();

    try {
        const { task_description, project_id } = event.data || {}; // Assuming input via event body

        if (!task_description) {
            throw new Error("Task description is required.");
        }

        // 1. Infer Skills
        const requiredSkills = inferSkillsFromText(task_description);

        // 2. Fetch Candidates (Join team_members and capacity_cache)
        // ZCQL JOIN is limited. We might fetch separately or use a view if available.
        // MVP: Fetch all team members and their capacity.
        // Let's fetch capacity_cache and then enrich with team_members details if needed, or vice-versa.
        // Better: Fetch team_members, then map capacity.

        const teamRows = await datastore.table('team_members').getPagedRows({ max_rows: 100 });
        const users = teamRows.data;

        const capacityRows = await datastore.table('capacity_cache').getPagedRows({ max_rows: 100 });
        const capacityMap = {};
        capacityRows.data.forEach(c => {
            capacityMap[c.user_id] = c;
        });

        // 3. Score Candidates
        const candidates = users.map(user => {
            const cap = capacityMap[user.user_id] || { capacity_percent: 0 };

            // Availability (50%)
            const availScore = getAvailabilityScore(cap.capacity_percent);

            // Skills (40%)
            // 'skills' in team_members is array of strings
            const skillScore = matchSkills(user.skills, requiredSkills);

            // Performance (10%)
            // MVP: Random 0.8-1.0 or fixed. Let's assume 1.0 (10 points) for now.
            const perfScore = 10;

            const totalScore = availScore + skillScore + perfScore;

            return {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                score: totalScore,
                breakdown: { availability: availScore, skills: skillScore, performance: perfScore },
                skills: user.skills,
                capacity_percent: cap.capacity_percent
            };
        });

        // 4. Sort and Return Top 3
        candidates.sort((a, b) => b.score - a.score);
        const top3 = candidates.slice(0, 3);

        context.closeWithSuccess(top3);
    } catch (err) {
        console.error("Error in smartAssign:", err);
        context.closeWithFailure("Failed to assign: " + err.message);
    }
};
