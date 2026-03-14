Project agent rules (AGENTS.md)

1. Use full words only
   - Do not use shorthands such as "repo". Use "repository". Use full verbs and nouns everywhere in code, comments, routes, controllers, commit messages, and documentation.

2. Tool-calling and intent reporting
   - Always call report_intent on the first tool-calling turn after a user message.
   - When calling report_intent, invoke it first and in parallel with other tool calls.
   - Pre-tool preamble: before invoking tools, briefly explain the next action and why.

3. File operations
   - Use the create tool to add new files (path must be absolute) and the edit tool to modify existing files.
   - Do not use create on an existing path; use edit instead.
   - When making multiple edits to the same file, batch them in one response using multiple sequential edit calls.

4. Git and commits
   - Every commit must include this trailer at the end of the commit message exactly:
     Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
   - Stage changes explicitly (git add) and use git rm for deletions.

5. Dependencies and builds
   - When adding or updating dependencies, update package.json and run the package manager (npm install) and then run the build script when appropriate.

6. Security and secrets
   - Never commit secrets, credentials, or environment variables to source control.
   - Refuse to execute shell commands that dynamically construct commands from injected variables or use unsafe shell expansion patterns.

7. Middleware, routes, and naming
   - Use full names for files, controllers, and repositories (for example, InvestmentsRepository, InvestmentController, not shortened variants).
   - Keep middleware names explicit (authenticate, authorizeUserAccess).

8. Communication and style
   - Keep user-facing responses concise (prefer under 100 words). For sub-agent prompts, provide comprehensive context.
   - When needing user input, use the ask_user tool (do not ask clarifying questions in plain text output).

9. Project process rules
   - For multi-file or non-trivial tasks, create a plan.md in the session plan folder before implementing changes.
   - Use the session SQL tables (todos, todo_deps) to track multi-step work.

10. Tool preferences
   - Prefer code-search tools (glob/grep or higher-level code intelligence) before opening files.
   - Use the bash tool for builds, installs, and git operations when necessary, chaining commands with &&.

11. Error handling
   - If making changes that affect runtime (package.json, docker-compose), validate by running the relevant build or start command and fix issues before finishing.

If any rule here conflicts with a direct user instruction, follow the user's instruction but ask for clarification when necessary.
