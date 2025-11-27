const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mock Data
const PORTAL_ID = "123456";
const PROJECT_ID = "789012";

const USERS = [
    { id: "u1", name: "Alice", email: "alice@example.com", role: "Developer" },
    { id: "u2", name: "Bob", email: "bob@example.com", role: "Manager" },
    { id: "u3", name: "Charlie", email: "charlie@example.com", role: "Designer" }
];

const TASKS = [
    { id: "t1", name: "Fix login bug", status: { name: "Open" }, priority: "High", end_date: new Date().toISOString(), details: { owners: [{ id: "u1" }] } },
    { id: "t2", name: "Update docs", status: { name: "Open" }, priority: "Medium", end_date: new Date(Date.now() + 86400000).toISOString(), details: { owners: [{ id: "u1" }] } },
    { id: "t3", name: "Server migration", status: { name: "Open" }, priority: "High", end_date: new Date().toISOString(), details: { owners: [{ id: "u2" }] } }
];

// Routes

// Get Portals
app.get('/restapi/portals/', (req, res) => {
    res.json({ portals: [{ id: PORTAL_ID, name: "Mock Portal" }] });
});

// Get Users
app.get(`/restapi/portal/${PORTAL_ID}/users/`, (req, res) => {
    res.json({ users: USERS });
});

// Get Projects
app.get(`/restapi/portal/${PORTAL_ID}/projects/`, (req, res) => {
    res.json({ projects: [{ id: PROJECT_ID, name: "Mock Project" }] });
});

// Get Tasks
app.get(`/restapi/portal/${PORTAL_ID}/projects/${PROJECT_ID}/tasks/`, (req, res) => {
    res.json({ tasks: TASKS });
});

// Create Task
app.post(`/restapi/portal/${PORTAL_ID}/projects/${PROJECT_ID}/tasks/`, (req, res) => {
    const newTask = {
        id: "t" + (TASKS.length + 1),
        name: req.body.name,
        status: { name: "Open" },
        priority: "Low",
        end_date: null,
        details: { owners: [{ id: req.body.person_responsible }] }
    };
    TASKS.push(newTask);
    res.status(201).json({ tasks: [newTask] });
});

app.listen(port, () => {
    console.log(`Mock Zoho API Server running at http://localhost:${port}`);
});
