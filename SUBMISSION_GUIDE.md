# TeamFlow Command Center - Submission Guide

This guide provides step-by-step instructions to take the generated code and deploy it as a live Zoho Cliq Extension powered by Zoho Catalyst.

## Prerequisites
1.  **Zoho Account** with access to [Catalyst](https://catalyst.zoho.com/) and [Cliq Developer Console](https://cliq.zoho.com/developer-console).
2.  **Node.js v18+** installed locally.
3.  **Zoho Catalyst CLI** installed:
    ```bash
    npm install -g zcatalyst-cli
    ```

---

## Phase 1: Catalyst Backend Setup

### 1. Create Catalyst Project
1.  Log in to [Zoho Catalyst Console](https://catalyst.zoho.com/).
2.  Click **Create Project**.
3.  Name it `teamflow-command-center`.
4.  Click **Access Project**.

### 2. Enable Services
1.  In the left sidebar, ensure the following are enabled (click "Get Started" or "Enable" if needed):
    *   **Compute** > **Functions**
    *   **Cloud Scale** > **Data Store**
    *   **Cloud Scale** > **Cache** (Optional, but good for performance)
    *   **Amplify** > **Cron**
    *   **Amplify** > **ZCQL**

### 3. Create Data Store Tables
You need to manually create the tables defined in our schema.
1.  Go to **Cloud Scale** > **Data Store**.
2.  Click **Create Table**.
3.  Create the following tables with the exact column names:

    **Table: `team_members`**
    *   `user_id` (VarChar, 100)
    *   `name` (VarChar, 100)
    *   `email` (VarChar, 100)
    *   `skills` (VarChar, 500) - *Note: Store as comma-separated string or JSON*
    *   `role` (VarChar, 100)
    *   `last_synced` (DateTime)

    **Table: `capacity_cache`**
    *   `user_id` (VarChar, 100)
    *   `weighted_load` (Double)
    *   `capacity_percent` (Int)
    *   `active_task_count` (Int)
    *   `status` (VarChar, 50)
    *   `last_updated` (DateTime)

    **Table: `priority_scores`**
    *   `item_id` (VarChar, 100)
    *   `user_id` (VarChar, 100)
    *   `score` (Int)
    *   `source` (VarChar, 50)
    *   `metadata` (JSON)
    *   `timestamp` (DateTime)

    **Table: `settings`**
    *   `org_id` (VarChar, 100)
    *   `channel_id` (VarChar, 100)
    *   `scheduler_interval_minutes` (Int)
    *   `alert_threshold_percent` (Int)
    *   `max_capacity_base` (Int)

    **Table: `tasks`** (Implicitly required by `fetchTeamData`)
    *   `task_id` (VarChar, 100)
    *   `name` (VarChar, 200)
    *   `user_id` (VarChar, 100)
    *   `status` (VarChar, 50)
    *   `priority` (VarChar, 50)
    *   `due_date` (DateTime)
    *   `project_id` (VarChar, 100)
    *   `last_updated` (DateTime)

### 4. Configure Secrets
1.  Go to **Settings** (Gear Icon) > **Project Settings** > **Secrets** (or **Amplify** > **Secrets** depending on UI version).
2.  Add the following secrets (values can be placeholders for now, but needed for code to run):
    *   `ZOHO_CLIENT_ID`: (From Zoho Developer Console)
    *   `ZOHO_CLIENT_SECRET`: (From Zoho Developer Console)
    *   `ZOHO_REFRESH_TOKEN`: (Generated via OAuth)

---

## Phase 2: Deploy Backend Code

1.  Open your terminal in the `teamflow-command-center` directory.
2.  Login to Catalyst CLI:
    ```bash
    catalyst login
    ```
3.  Initialize the project linkage:
    ```bash
    catalyst init
    ```
    *   Select the project you created in Phase 1.
    *   Select **Functions** to associate.
4.  Deploy the functions:
    ```bash
    catalyst deploy
    ```
    *   Confirm that all 6 functions (`fetchTeamData`, `calculateCapacity`, etc.) are deployed successfully.

---

## Phase 3: Cliq Extension Setup

### 1. Package the Extension
1.  Navigate to the `teamflow-command-center` folder.
2.  Select the following files and folders:
    *   `manifest.json`
    *   `cliq/` folder
    *   `LICENSE`
    *   `README.md`
3.  **Zip them** into a file named `teamflow-extension.zip`.
    *   *Ensure `manifest.json` is at the root of the zip, not inside a subfolder.*

### 2. Create Extension in Cliq
1.  Go to [Zoho Cliq Developer Console](https://cliq.zoho.com/developer-console).
2.  Click **Create Extension**.
3.  Name: **TeamFlow Command Center**.
4.  Choose **Upload Package**.
5.  Upload `teamflow-extension.zip`.
6.  Click **Create**.

### 3. Associate Catalyst Project
1.  In the Extension details page, look for **Catalyst Integration** or **Connections**.
2.  Enable **Catalyst**.
3.  Select your `teamflow-command-center` project.
4.  This allows your Deluge scripts to use `zoho.catalyst.invokeFunction`.

---

## Phase 4: Final Configuration

### 1. Configure Widget URL (Optional but Recommended)
*   The current `manifest.json` points to `cliq/widget/index.html`. This works for "Packaged" extensions.
*   If you want to host the widget on Catalyst (for faster updates without re-uploading extension):
    1.  Enable **Web Client Hosting** in Catalyst.
    2.  Upload the contents of `cliq/widget/` to the `client/` folder in Catalyst.
    3.  Deploy: `catalyst deploy`.
    4.  Update `manifest.json` -> `widget` -> `url` to your Catalyst Web App URL.
    5.  Re-upload the extension zip.

### 2. Connect Real Data
*   **Widget**: Open `cliq/widget/widget.js`.
    *   Find `const API_BASE = "/api/capacity";`.
    *   In a real extension, you often use `zoho.cliq.getWidgetContext()` to get user info and then call your backend.
    *   For the MVP submission, the **Mock Data** in `widget.js` is acceptable for demonstration if you cannot set up the full OAuth flow immediately.
    *   To go live, replace `simulateFetch()` with a real `fetch()` call to your Catalyst Function URL (e.g., `https://<project-domain>.catalystserverless.com/server/fetchTeamData`).

### 3. Run the Schedulers
1.  Go to Catalyst Console > **Amplify** > **Cron**.
2.  You should see `capacity-refresh` and `morning-brief`.
3.  You can manually **Run** them to populate data (after you have added some users to `team_members` table or run `fetchTeamData`).

---

## Submission Checklist
- [ ] Catalyst Project created and Functions deployed.
- [ ] Data Store tables created.
- [ ] Extension uploaded to Cliq Developer Console.
- [ ] Privacy Policy and Terms URLs (in `docs/`) added to Extension listing.
- [ ] Test the `/team-status` command in Cliq to verify connectivity.

**Congratulations! Your TeamFlow Command Center is ready.**
