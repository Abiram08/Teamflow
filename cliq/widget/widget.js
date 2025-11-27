// widget.js

// Mock Data for MVP if API fails or for initial render
const MOCK_DATA = {
    summary: { avg: 65, overloaded: 2, critical: "Deploy V1" },
    members: [
        { id: "u1", name: "Alice", capacity: 45, status: "Busy", tasks: ["Fix login bug", "Update docs"] },
        { id: "u2", name: "Bob", capacity: 92, status: "Critical", tasks: ["Server migration", "DB backup", "API rate limits"] },
        { id: "u3", name: "Charlie", capacity: 20, status: "Available", tasks: ["Research"] }
    ]
};

// API Endpoints (Catalyst Functions via Widget API or Direct)
// Since this is a Cliq Widget, we usually request data from the extension backend.
// We'll assume we have a proxy or we call Catalyst functions directly if public/authenticated.
// For MVP, we'll simulate the API call to our Catalyst backend.
const API_BASE = "/api/capacity"; // Placeholder

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    document.getElementById('refresh-btn').addEventListener('click', loadData);
    await loadData();
}

async function loadData() {
    const container = document.getElementById('members-container');
    container.innerHTML = '<div class="loading">Loading data...</div>';

    try {
        // In a real widget, we might use zcliq.callFunction() or fetch() to a Catalyst endpoint.
        // Here we simulate a fetch.
        // const data = await fetchSummary(); 
        const data = await simulateFetch(); // Using mock for reliable MVP demo in browser

        renderSummary(data.summary);
        renderMembers(data.members);
    } catch (err) {
        console.error("Failed to load data", err);
        container.innerHTML = '<div class="error">Failed to load data.</div>';
    }
}

function simulateFetch() {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_DATA), 500);
    });
}

function renderSummary(summary) {
    document.getElementById('avg-capacity').textContent = `${summary.avg}%`;
    document.getElementById('overloaded-count').textContent = summary.overloaded;
    document.getElementById('next-critical').textContent = summary.critical;
}

function renderMembers(members) {
    const container = document.getElementById('members-container');
    container.innerHTML = '';

    members.forEach(member => {
        const el = document.createElement('div');
        el.className = 'member-item';

        const colorClass = member.capacity >= 90 ? 'danger' : (member.capacity >= 70 ? 'warning' : '');

        el.innerHTML = `
            <div class="member-header" onclick="toggleDetails('${member.id}')">
                <span class="member-info">${member.name}</span>
                <div class="capacity-bar-container">
                    <div class="capacity-bar ${colorClass}" style="width: ${member.capacity}%"></div>
                </div>
                <span class="member-percent">${member.capacity}%</span>
            </div>
            <div id="details-${member.id}" class="member-details">
                <h4>Top Tasks</h4>
                <ul class="task-list">
                    ${member.tasks.map(t => `<li class="task-item">${t}</li>`).join('')}
                </ul>
                <div class="actions">
                    <button class="btn-small" onclick="assignTask('${member.id}')">Assign</button>
                    <button class="btn-small" onclick="messageUser('${member.id}')">Message</button>
                </div>
            </div>
        `;
        container.appendChild(el);
    });
}

window.toggleDetails = (id) => {
    const el = document.getElementById(`details-${id}`);
    if (el) el.classList.toggle('expanded');
};

window.assignTask = (id) => {
    // Invoke Cliq command or open form
    console.log("Assign to", id);
    alert(`Assign task to user ${id}`);
};

window.messageUser = (id) => {
    console.log("Message", id);
    alert(`Open chat with ${id}`);
};
