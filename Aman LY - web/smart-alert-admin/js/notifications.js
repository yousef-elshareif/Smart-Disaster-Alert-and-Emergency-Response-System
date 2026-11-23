Options('nt_alert', '/alerts?page_size=100&sort=created_at&dir=desc').catch(() => { });
Table({ id: 'nt', ep: '/notifications', sort: 'sent_at', dir: 'desc', filters: { status: 'nt_status', channel: 'nt_channel', date: 'nt_date', alert_id: 'nt_alert' }, actions: { view: { run: r => { put('v_', r); Show('viewModal') } } } });
