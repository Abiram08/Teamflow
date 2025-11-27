Write-Host "Initializing Git..."
if (-not (Test-Path .git)) {
    git init
}

Write-Host "Configuring Branch..."
# Ensure we are on main, create if needed
git checkout -b main 2>$null
if ($LASTEXITCODE -ne 0) {
    git checkout main 2>$null
}

Write-Host "Adding Remote..."
git remote remove origin 2>$null
git remote add origin https://github.com/Abiram08/Teamflow.git

Write-Host "Commit 1: Init"
git add README.md LICENSE .gitignore
git commit -m "chore: Initial project setup with license and readme"

Write-Host "Commit 2: Docs"
git add SUBMISSION_GUIDE.md docs/ build_report.md
git commit -m "docs: Add submission guide and project documentation"

Write-Host "Commit 3: Infra"
git add infra/
git commit -m "ci: Configure GitHub Actions workflow"

Write-Host "Commit 4: Catalyst Data"
git add catalyst/functions/fetchTeamData catalyst/functions/calculateCapacity
git commit -m "feat(catalyst): Implement data fetching and capacity calculation functions"

Write-Host "Commit 5: Catalyst Logic"
git add catalyst/functions/aggregatePriorities catalyst/functions/smartAssign
git commit -m "feat(catalyst): Add priority aggregation and smart assignment logic"

Write-Host "Commit 6: Catalyst Alerts"
git add catalyst/functions/detectOverload catalyst/functions/sendNotification
git commit -m "feat(catalyst): Implement overload detection and notification system"

Write-Host "Commit 7: Manifest"
git add manifest.json
git commit -m "config: Add Cliq extension manifest"

Write-Host "Commit 8: Cliq Bot/Commands"
git add cliq/bot cliq/commands
git commit -m "feat(cliq): Implement bot handler and slash commands"

Write-Host "Commit 9: Cliq Widget"
git add cliq/widget
git commit -m "feat(cliq): Create dashboard widget with capacity and priority views"

Write-Host "Commit 10: Finalize"
git add .
git commit -m "chore: Finalize project structure and add remaining files"

Write-Host "Pushing..."
git push -u origin main --force
