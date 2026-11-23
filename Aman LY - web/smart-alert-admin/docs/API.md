# API contract (what the HTML pages call)

Base URL: `js/config.js` → `CFG.API` (e.g. `http://localhost:5000/api`). JSON everywhere; the UI sends `Accept-Language: ar|en` and `Authorization: Bearer <localStorage.token>` if present.
Serve the pages from a web server (not `file://`) and enable **CORS** for it.

**Conventions**
- Bilingual text comes as `x_ar` / `x_en` (e.g. `title_ar`, `title_en`, `area_name_ar`, `area_name_en`). The UI shows the current language and falls back to the other one. Plain keys (`phone`, `code`) are also accepted.
- Coded values are English snake_case from the schema (`status:"under_review"`, `severity:"critical"`). The UI translates them.
- Dates: ISO 8601 (`2026-11-14T06:40:00`). Coordinates: `latitude`, `longitude`.
- **Lists** → `{ "items":[...], "total": 42 }`, query: `page`, `page_size`, `sort`, `dir` (`asc|desc`), `q` (search), plus the filters below.
- Errors → non-2xx with `{ "message": "..." }` (shown to the user as a toast).
- `id` is the numeric primary key (used in URLs); `code` is the display id (`AL-1042`).
- Forms send the UI language as `lang`: store free text into the `_ar` or `_en` column that matches it. `create-alert` and `settings` are sent as `multipart/form-data` (file upload); unchecked checkboxes are simply absent; numbers arrive as strings. All other forms are JSON.

## Dashboard
| Endpoint | Response |
|---|---|
| `GET /dashboard/summary` | `{overall_status:"normal\|warning\|critical\|emergency", active_alerts, critical_alerts, affected_areas, active_emergencies, pending_reports, registered_citizens}` |
| `GET /dashboard/activity?days=7` | `{labels:["2026-11-08",…], datasets:[{label_en,label_ar,data:[…]},{…}]}` (dataset 1 = alerts, 2 = reports) |
| `GET /dashboard/risk-distribution` | `{labels:["critical","high","medium","low"], datasets:[{data:[1,2,1,1]}]}` |
| `GET /dashboard/activity-log?limit=5` | `[{created_at, message_ar, message_en}]` |
| `GET /me` | `{full_name_ar, full_name_en, role}` |
| `GET /admin-notifications/unread` · `POST /admin-notifications/read-all` | `{count, items:[{title_ar,title_en}]}` · 204 |
| `POST /auth/logout` | 204 |

## Alerts  (`/alerts`)
- `GET /alerts` filters: `status`. Item: `id, code, title_*, description_*, recommendations_*, alert_type, severity, area_id, area_name_*, created_at, expires_at, status`.
- `POST /alerts` (multipart): `title, description, alert_type, severity, area_id, starts_at, expires_at, recommendations, attachment?, status("draft"|"active"), lang`.
- `PUT /alerts/{id}`: `{title, expires_at, lang}` · `PATCH /alerts/{id}/status`: `{status}` (`active` = publish, `cancelled`) · `DELETE /alerts/{id}` (drafts only).
- `GET /areas` → `[{id,name_ar,name_en,latitude,longitude}]`.

## Flood monitoring & map
- `GET /stations` filters: `risk_level`. Item: `id, name_*, area_name_*, water_level_m, risk_level, risk_rank (int, for sorting), last_reading_at, status, data_origin("live"|"simulated"), latitude, longitude`.
- `GET /stations/water-levels?hours=12&limit=3` → `{labels:["2026-11-14T00:00",…], datasets:[{label_ar,label_en,data:[…]}]}`.
- `GET /map/features` → `[{layer:"zone|alert|report|center|station", id, name_*, level:"critical…", detail_*, latitude, longitude, radius_m?}]` (zones come from `areas`, alerts = active alerts, etc.).

## Reports  (`/reports`)
- `GET /reports` filters: `status`. Item: `id, code, citizen_name, report_type, area_name_*, submitted_at, priority, status, latitude, longitude`.
- `GET /reports/{id}` → item + `citizen_phone, description, attachments:[{url}], notes:[{created_at,author,text}], history:[{changed_at,status,changed_by}]`.
- `PATCH /reports/{id}/status` `{status}` (writes `report_status_history`) · `POST /reports/{id}/notes` `{text}`.

## Response
- `GET /teams` item: `id, name_*, leader_name, phone, status, area_name_*, availability`.
- `GET /tasks` filters: `status`. Item: `id, code, title_*, team_name_*, area_name_*, priority, assigned_at, status`. `POST /tasks` `{title, description, team_id, area_id, priority}` · `PATCH /tasks/{id}/status`.
- `GET /centers` (`{items}` or array): `name_*, area_name_*, capacity, occupancy`.

## Notifications
`GET /notifications` filters: `status`, `channel` (`push|sms`), `date` (YYYY-MM-DD), `alert_id`. Item: `id, code, title_*, alert_code, area_name_*, recipients_count, sent_at, status`.

## Users
- `GET /users`: `id, code, full_name_*, email, phone, role_name_*, status, created_at` · `POST /users` / `PUT /users/{id}` `{full_name,email,phone,role_id}` · `PATCH /users/{id}/status` `{status:"active|disabled"}`.
- `GET /roles` → `[{id,name_*,permissions:["publish_alerts",…]}]` · `GET /permissions` → `[{code,name_*}]`.

## Data sources  (`/data-sources`)
- `GET`: `id, name_*, source_type, connection_status, last_success_at, category, status`. `POST` / `PUT /{id}`: `{name,source_type,category,endpoint_url}` · `PATCH /{id}/status` `{status}`.
- `POST /data-sources/{id}/test` → `{ok:true, message:"…"}` · `GET /data-sources/{id}/updates` → `{items:[{received_at,records_count,status,message}]}`.

## Settings
`GET /settings` → `{system_name, default_language, timezone, alert_default_expiry_hours, push_enabled, sms_enabled, session_timeout_min}` · `PUT /settings` (multipart, includes `system_logo?`) · `POST /auth/change-password` `{current_password,new_password,confirm_password}` · `GET /auth/login-activity` (list): `ip_address, user_agent, logged_in_at, result`.
