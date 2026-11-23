-- Smart Alert & Flooding Emergency System – database schema (PostgreSQL syntax; easy to port to SQL Server / MySQL)
-- Conventions: *_ar / *_en = bilingual text · codes (status, severity...) are stored in English snake_case and translated by the UI.

CREATE TABLE roles(id SERIAL PRIMARY KEY, code VARCHAR(40) UNIQUE NOT NULL, name_ar VARCHAR(100) NOT NULL, name_en VARCHAR(100) NOT NULL);
CREATE TABLE permissions(id SERIAL PRIMARY KEY, code VARCHAR(60) UNIQUE NOT NULL, name_ar VARCHAR(100) NOT NULL, name_en VARCHAR(100) NOT NULL);
CREATE TABLE role_permissions(role_id INT REFERENCES roles ON DELETE CASCADE, permission_id INT REFERENCES permissions ON DELETE CASCADE, PRIMARY KEY(role_id,permission_id));

CREATE TABLE users(
 id SERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL,              -- U-01
 full_name_ar VARCHAR(150), full_name_en VARCHAR(150), email VARCHAR(150) UNIQUE NOT NULL, phone VARCHAR(30),
 password_hash VARCHAR(255) NOT NULL, role_id INT NOT NULL REFERENCES roles,
 status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK(status IN('active','disabled')),
 last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE login_activity(id BIGSERIAL PRIMARY KEY, user_id INT REFERENCES users, ip_address VARCHAR(45), user_agent VARCHAR(255),
 result VARCHAR(10) NOT NULL CHECK(result IN('success','failed')), logged_in_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE areas(id SERIAL PRIMARY KEY, name_ar VARCHAR(100) NOT NULL, name_en VARCHAR(100) NOT NULL,
 latitude NUMERIC(9,6) NOT NULL, longitude NUMERIC(9,6) NOT NULL, zone_radius_m INT DEFAULT 800,
 risk_level VARCHAR(10) NOT NULL DEFAULT 'normal' CHECK(risk_level IN('normal','low','medium','high','critical')));

CREATE TABLE data_sources(id SERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL, name_ar VARCHAR(150), name_en VARCHAR(150) NOT NULL,
 source_type VARCHAR(20) NOT NULL CHECK(source_type IN('weather','flood','official','seismic','other')), category VARCHAR(100),
 endpoint_url VARCHAR(500), status VARCHAR(10) NOT NULL DEFAULT 'disabled' CHECK(status IN('active','disabled')),
 connection_status VARCHAR(10) NOT NULL DEFAULT 'offline' CHECK(connection_status IN('online','offline')), last_success_at TIMESTAMPTZ);
CREATE TABLE data_source_updates(id BIGSERIAL PRIMARY KEY, source_id INT NOT NULL REFERENCES data_sources ON DELETE CASCADE,
 received_at TIMESTAMPTZ NOT NULL DEFAULT now(), records_count INT DEFAULT 0, status VARCHAR(10) CHECK(status IN('success','failed')), message VARCHAR(300));

CREATE TABLE monitoring_stations(id SERIAL PRIMARY KEY, name_ar VARCHAR(120), name_en VARCHAR(120) NOT NULL, area_id INT REFERENCES areas,
 latitude NUMERIC(9,6), longitude NUMERIC(9,6), data_source_id INT REFERENCES data_sources,
 status VARCHAR(10) NOT NULL DEFAULT 'online' CHECK(status IN('online','offline')),
 data_origin VARCHAR(10) NOT NULL DEFAULT 'live' CHECK(data_origin IN('live','simulated')));   -- UI shows live vs simulated
CREATE TABLE water_level_readings(id BIGSERIAL PRIMARY KEY, station_id INT NOT NULL REFERENCES monitoring_stations ON DELETE CASCADE,
 measured_at TIMESTAMPTZ NOT NULL, level_m NUMERIC(6,2) NOT NULL,
 risk_level VARCHAR(10) NOT NULL CHECK(risk_level IN('normal','low','medium','high','critical')));
CREATE INDEX ix_readings_station_time ON water_level_readings(station_id, measured_at DESC);

CREATE TABLE alerts(id BIGSERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL,                  -- AL-1042
 title_ar VARCHAR(200), title_en VARCHAR(200), description_ar TEXT, description_en TEXT, recommendations_ar TEXT, recommendations_en TEXT,
 alert_type VARCHAR(20) NOT NULL CHECK(alert_type IN('flood','heavy_rain','storm','other_emergency')),
 severity VARCHAR(10) NOT NULL CHECK(severity IN('low','medium','high','critical')), area_id INT NOT NULL REFERENCES areas,
 starts_at TIMESTAMPTZ, expires_at TIMESTAMPTZ, status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK(status IN('draft','active','expired','cancelled')),
 attachment_url VARCHAR(500), created_by INT REFERENCES users, published_at TIMESTAMPTZ, cancelled_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX ix_alerts_status ON alerts(status, created_at DESC);

CREATE TABLE citizens(id BIGSERIAL PRIMARY KEY, full_name VARCHAR(150) NOT NULL, phone VARCHAR(30), email VARCHAR(150), area_id INT REFERENCES areas,
 device_token VARCHAR(255), registered_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE notifications(id BIGSERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL, alert_id BIGINT REFERENCES alerts, title_ar VARCHAR(200), title_en VARCHAR(200),
 channel VARCHAR(10) NOT NULL CHECK(channel IN('push','sms')), area_id INT REFERENCES areas, recipients_count INT NOT NULL DEFAULT 0,
 status VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK(status IN('pending','sent','delivered','failed')), failure_reason VARCHAR(300), sent_at TIMESTAMPTZ);
CREATE INDEX ix_notifications_alert ON notifications(alert_id);

CREATE TABLE emergency_reports(id BIGSERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL, citizen_id BIGINT NOT NULL REFERENCES citizens,
 report_type VARCHAR(30) NOT NULL CHECK(report_type IN('road_flooding','blocked_drain','trapped_residents','power_line_down','leakage','other')),
 area_id INT REFERENCES areas, description TEXT, latitude NUMERIC(9,6), longitude NUMERIC(9,6),
 priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK(priority IN('low','medium','high','critical')),
 status VARCHAR(15) NOT NULL DEFAULT 'pending' CHECK(status IN('pending','under_review','verified','rejected','resolved')),
 submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(), reviewed_by INT REFERENCES users);
CREATE INDEX ix_reports_status ON emergency_reports(status, submitted_at DESC);
CREATE TABLE report_attachments(id BIGSERIAL PRIMARY KEY, report_id BIGINT NOT NULL REFERENCES emergency_reports ON DELETE CASCADE, url VARCHAR(500) NOT NULL);
CREATE TABLE report_notes(id BIGSERIAL PRIMARY KEY, report_id BIGINT NOT NULL REFERENCES emergency_reports ON DELETE CASCADE, user_id INT REFERENCES users, text TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE report_status_history(id BIGSERIAL PRIMARY KEY, report_id BIGINT NOT NULL REFERENCES emergency_reports ON DELETE CASCADE, status VARCHAR(15) NOT NULL, changed_by INT REFERENCES users, changed_at TIMESTAMPTZ NOT NULL DEFAULT now());

CREATE TABLE response_teams(id SERIAL PRIMARY KEY, name_ar VARCHAR(100), name_en VARCHAR(100) NOT NULL, leader_name VARCHAR(120), phone VARCHAR(30),
 status VARCHAR(10) NOT NULL DEFAULT 'available' CHECK(status IN('available','busy','offline')), current_area_id INT REFERENCES areas,
 availability VARCHAR(12) NOT NULL DEFAULT 'available' CHECK(availability IN('available','unavailable')));
CREATE TABLE emergency_tasks(id BIGSERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL, title_ar VARCHAR(200), title_en VARCHAR(200), description TEXT,
 team_id INT REFERENCES response_teams, area_id INT REFERENCES areas, report_id BIGINT REFERENCES emergency_reports,
 priority VARCHAR(10) NOT NULL CHECK(priority IN('low','medium','high','critical')),
 status VARCHAR(12) NOT NULL DEFAULT 'assigned' CHECK(status IN('pending','assigned','in_progress','completed','cancelled')),
 assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ, created_by INT REFERENCES users);
CREATE TABLE emergency_centers(id SERIAL PRIMARY KEY, name_ar VARCHAR(120), name_en VARCHAR(120) NOT NULL, area_id INT REFERENCES areas,
 latitude NUMERIC(9,6), longitude NUMERIC(9,6), capacity INT NOT NULL DEFAULT 0, occupancy INT NOT NULL DEFAULT 0, is_open BOOLEAN NOT NULL DEFAULT TRUE);

CREATE TABLE admin_notifications(id BIGSERIAL PRIMARY KEY, user_id INT NOT NULL REFERENCES users, title_ar VARCHAR(200), title_en VARCHAR(200), is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE audit_log(id BIGSERIAL PRIMARY KEY, user_id INT REFERENCES users, action VARCHAR(50), entity VARCHAR(50), entity_id VARCHAR(30), message_ar VARCHAR(300), message_en VARCHAR(300), created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE system_settings(key VARCHAR(60) PRIMARY KEY, value VARCHAR(500) NOT NULL);   -- system_name, default_language, timezone, alert_default_expiry_hours, push_enabled, sms_enabled, session_timeout_min

-- Seed: roles and permissions used by the permissions matrix
INSERT INTO roles(code,name_en,name_ar) VALUES('super_admin','Super Admin','مدير عام'),('emergency_manager','Emergency Manager','مدير الطوارئ'),('monitoring_officer','Monitoring Officer','مسؤول المراقبة'),('report_reviewer','Report Reviewer','مراجع البلاغات');
INSERT INTO permissions(code,name_en,name_ar) VALUES('publish_alerts','Publish alerts','نشر التحذيرات'),('review_reports','Review reports','مراجعة البلاغات'),('view_monitoring','View monitoring','عرض المراقبة'),('manage_users','Manage users','إدارة المستخدمين');
