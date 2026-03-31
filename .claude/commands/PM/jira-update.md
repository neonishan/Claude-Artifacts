# Jira Update

A single unified Jira command for anyone in the 7EDGE org. Automatically detects what you want based on what you type and runs the right check.

---

## How to Use

| What you type | What you get |
|---|---|
| `/PM/jira-update` | Your own pending tasks + comments awaiting your reply |
| `/PM/jira-update [person name]` | All pending Jira items assigned to that person |
| `/PM/jira-update [board or project name]` | Full board status — all active tickets, assignees, latest comments |
| `/PM/jira-update [person name] [board or project name]` | Pending items for that person on that specific board |

---

## Step 1 — Identify the Current User

Always start by calling the Atlassian MCP "get current user" endpoint to get the current user's display name and account ID. Use this dynamically throughout. Never hardcode any name or ID.

---

## Step 2 — Detect Intent from Input

Read whatever the user typed after `/PM/jira-update` and determine:

- **No input** → run My Check (see below)
- **A person's name only** → run Person Check (see below)
- **A board or project name only** → run Board Check (see below)
- **A person's name + a board or project name** → run Person + Board Check (see below)

If the input is ambiguous (e.g. a single word that could be a name or a project), try resolving it as both via MCP and pick the one that returns a valid result. If both match, ask the user to clarify.

---

## Step 3 — Run the Right Check

### My Check (no input)
Fetch all Jira issues where:
- Assignee = current user's account ID
- Status NOT IN: Done, Deployed, Closed, Released, Resolved

Also fetch issues where:
- A comment mentions the current user
- The last comment mentioning them was NOT written by them (someone is waiting for a reply)

**Output:**
Greet the user by first name.

📌 **Assigned & Pending (X items)**
For each: ticket key (link) · summary · status · project · priority · last updated

💬 **Needs My Reply (X items)**
For each: ticket key (link) · summary · mentioned by · when · project

> One-line summary: "You have X pending tasks and Y unacknowledged mentions. Priority item: [ticket]."

---

### Person Check ([person name])
Use MCP to resolve the person's name to their account ID.
Fetch all issues where:
- Assignee = resolved person's account ID
- Status NOT IN: Done, Deployed, Closed, Released, Resolved

**Output:**
📋 **Pending items for [Person Name] — X items**
For each: ticket key (link) · summary · status · project · priority · last updated · latest comment (author + text)

> One-line summary: "[Person Name] has X pending items. [Any blockers or dependencies from latest comments.]"

---

### Board Check ([board or project name])
Use MCP to resolve the board/project name to its project key.
Fetch all issues in that project where:
- Status NOT IN: Done, Deployed, Closed, Released, Resolved

**Output:**
🗂️ **Board Status: [Project Name] — X active tickets**

Group tickets by status (In Progress → In Review → To Do → Blocked).
For each ticket:
```
[KEY] Summary
Assignee: Name | Status: X | Priority: Y | Updated: Date
💬 Latest comment (Author, Date): "comment text..."
```

> Dependency summary: "Blockers or dependencies detected: [list tickets where latest comment flags a blocker, waiting on someone, or unresolved dependency]."

---

### Person + Board Check ([person name] [board or project name])
Use MCP to resolve both the person's name and the board/project name.
Fetch all issues where:
- Assignee = resolved person's account ID
- Project = resolved project key
- Status NOT IN: Done, Deployed, Closed, Released, Resolved

**Output:**
📋 **Pending items for [Person Name] on [Project Name] — X items**
For each: ticket key (link) · summary · status · priority · last updated · latest comment (author + text)

> One-line summary: "[Person Name] has X pending items on [Project Name]. [Any blockers or dependencies from latest comments.]"

---

## General Rules

- Always use Atlassian MCP for all lookups — never hardcode IDs, names, or project keys
- Always include direct ticket links: https://7edge.atlassian.net/browse/[KEY]
- Show the latest comment on every ticket in Board and Person checks so dependency context is always visible
- If a person or project cannot be resolved, tell the user clearly and ask for clarification
- Keep output concise and actionable
