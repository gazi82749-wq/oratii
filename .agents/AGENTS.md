# Workspace Customization Rules for Oratii (ppt-analyzer)

## Mandatory Context Maintenance
- Whenever creating, modifying, or deleting features, routes, API endpoints, or database models in this codebase:
  1. Inspect `PROJECT_CONTEXT.md` first to align with existing architecture and data flow.
  2. Automatically update `PROJECT_CONTEXT.md` before completing the task to ensure it remains the accurate single source of truth for the project.
- Always ensure all Admin Panel pages and live site components consume real database endpoints from Supabase or `/api/admin/*` routes without hardcoded dummy arrays.
