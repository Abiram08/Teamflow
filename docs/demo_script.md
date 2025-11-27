# Demo Script

## Scenario 1: Manager Assigns a Task

1. **Manager** opens the **TeamFlow Dashboard** widget.
2. Sees that **Alice** is "Available" (30%) and **Bob** is "Overloaded" (90%).
3. Manager types `/assign "Fix login bug"` in the chat.
4. Bot returns 3 candidates. **Alice** is top ranked due to availability and 'React' skill match.
5. Manager clicks **[Assign]** on Alice's card.
6. Bot confirms assignment and creates the task in Zoho Projects (simulated).

## Scenario 2: Morning Brief

1. It is 09:00 AM.
2. **TeamFlow Bot** sends a DM to **Alice**.
3. Message contains "Top Priorities for Today":
    - **Fix login bug** (High Priority, Due Today)
    - **Update Documentation** (Medium Priority)
4. Alice clicks **[Mark Done]** on the first item.

## Scenario 3: Overload Alert

1. **Bob** gets assigned a new "High Priority" task with a deadline of tomorrow.
2. The `calculateCapacity` scheduler runs (or is triggered).
3. Bob's capacity score jumps from 75% to 92% ("Critical").
4. **TeamFlow Bot** posts in the **#management** channel:
    > "⚠️ **Capacity Alert**: Bob is now **Critical** (92%)."
5. Manager sees the alert and reassigns some of Bob's tasks using the Dashboard.
