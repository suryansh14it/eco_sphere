/**
 * Constants shared by server (models, APIs) and client (components).
 * Keep this file free of mongoose or any other server-only import -
 * anything here gets bundled into the browser too.
 */
export const PROJECT_STATUSES = ['open', 'closed', 'completed'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
