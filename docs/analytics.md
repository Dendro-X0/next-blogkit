# Analytics

The starter supports:

- Vercel Analytics and Speed Insights
- First‑party analytics (page views + custom events) with admin KPIs

## First‑Party Events

- Client helpers emit events (e.g., page view, subscribe click)
- Server receives and stores events for aggregation
- Admin dashboard surfaces KPIs and recent activity

## Adding a Custom Event

1. Create a client helper to dispatch the event
2. Add a server handler to persist it
3. Update admin KPIs to surface the new metric
