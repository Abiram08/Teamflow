# 🚀 TeamFlow Command Center
### The Ultimate Productivity Hub for Engineering Teams


TeamFlow Command Center is a powerful **Native Zoho Cliq Extension** designed to eliminate context switching for engineering teams. It brings project management, capacity planning, and task prioritization directly into the chat interface where developers live.

---

## 🎯 The Problem: Context Switching Fatigue
Engineers and Managers spend **40% of their time** jumping between tools:
-   *Chat (Cliq)* for communication.
-   *Jira / Zoho Projects* for tasks.
-   *Spreadsheets* for capacity planning.

This fragmentation kills productivity and breaks the "flow" state.

## 💡 The Solution: TeamFlow
TeamFlow centralizes these workflows into a **Single Pane of Glass** within Cliq.
-   **For Managers:** Instantly see who is overloaded without running reports.
-   **For Developers:** Get your daily priorities pushed to you without searching Jira.

---

## ✨ Key Features

### 📊 Interactive Command Center (Widget)
A native dashboard that gives you a real-time pulse of the team.
-   **Visual Workload Charts:** A native Bar Chart showing capacity utilization per member.
-   **Status Table:** Detailed breakdown of who is `Available`, `Busy`, or `Overloaded`.
-   **Zero Latency:** Loads instantly within Cliq.

### 🤖 Smart Bot Assistant
A friendly bot that guides you through your day.
-   **Onboarding:** Welcomes new users with a rich interactive card.
-   **Smart Menus:** One-click access to status reports and priorities.
-   **Visual Cues:** Uses banner images and intuitive icons for a premium UX.

### ⚡ Slash Commands
Execute complex workflows with simple commands:
-   `/priority` - **My Priorities:** Instantly lists your top 3 urgent tasks.
-   `/assign` - **Smart Assignment:** AI-driven suggestion for the best assignee based on current load.
-   `/team-status` - **Quick Report:** Generates a text-based summary of team health.

---

## 🛠️ Technical Architecture
Built entirely as a **Native Extension** using **Zoho Deluge**.
-   **No External Servers:** Runs 100% on Zoho infrastructure.
-   **Secure:** Uses native Zoho OAuth and permission models.
-   **Lightweight:** No heavy frontend frameworks; uses native Cliq UI components.

### File Structure
```
TeamFlow_Extension/
├── Bots/               # Interactive Bot Logic
├── Commands/           # Slash Command Handlers
├── Widgets/            # Dashboard & Chart Rendering
└── Functions/          # Shared Business Logic (Team_Utils)
```

---

## 🚀 Installation Guide

1.  **Download:** Get the latest `TeamFlow_Command_Center.zip` from the releases.
2.  **Upload:**
    -   Go to [Zoho Cliq Developer Console](https://cliq.zoho.com/developer).
    -   Click **Upload Extension**.
    -   Select the `.zip` file.
3.  **Install:** Click **Install** (Sandbox) to enable it for your organization.
4.  **Verify:**
    -   Type `/team-status` in any chat.
    -   Open the **TeamFlow Command Center** widget from the sidebar.

---



## 📄 License
MIT License. Open source and ready to customize.
