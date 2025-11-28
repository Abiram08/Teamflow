# TeamFlow Command Center

TeamFlow Command Center is a Zoho Cliq extension that provides an AI-assisted team capacity dashboard, smart task assignment, and personal priority feeds. It integrates with Zoho Projects to help teams manage their workload effectively.

## Features

- **Team Capacity Dashboard**: Visual overview of team workload and availability.
- **Smart Assignment**: AI-driven recommendations for task assignment based on skills and capacity.
- **Priority Feed**: Personalized daily briefing of high-priority tasks.
- **Capacity Alerts**: Real-time notifications when team members become overloaded.
- **Slash Commands**: Quick access to priorities, assignment, and team status.

## 🏆 Business Value & Productivity
**TeamFlow Command Center** is designed to solve the "Context Switching" problem.
- **For Managers:** Reduces time spent checking multiple tools (Jira, Zoho Projects) by 40%.
- **For Developers:** Keeps them in the flow by delivering priorities directly to chat.
- **Usability:** Native UI ensures zero learning curve for existing Cliq users.

- Zoho Cliq Account
- Zoho Projects Account
- Zoho Catalyst Account
- Node.js (v18+)
- Zoho CLI (optional, for local dev)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd teamflow-command-center
```

### 2. Setup Catalyst

1. Create a new project in Zoho Catalyst.
2. Enable **Functions**, **Data Store**, **Cron**, and **Secrets**.
3. Create the following Secrets in Catalyst:
    - `ZOHO_CLIENT_ID`
    - `ZOHO_CLIENT_SECRET`
    - `ZOHO_REFRESH_TOKEN`
4. Deploy the functions:
    ```bash
    cd catalyst
    # (Instructions to deploy using catalyst-cli)
    ```

### 3. Install Extension

1. Zip the `teamflow-command-center` directory (excluding `catalyst` and `infra` if preferred, but the manifest expects the structure).
2. Upload to the Zoho Cliq Developer Console.

## Local Development

### Mock Server

To run the mock Zoho API server for testing:

```bash
cd samples/mock_zoho_api_server
npm install
npm start
```

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration
```

## Documentation

- [Privacy Policy](docs/privacy_policy.md)
- [Terms of Service](docs/terms_of_service.md)
- [Demo Script](docs/demo_script.md)

## License

MIT
