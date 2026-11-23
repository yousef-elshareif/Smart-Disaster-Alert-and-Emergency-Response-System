Options('area_id', '/areas').catch(() => { });
Form('create', { ep: '/alerts', after: 'alerts.html', preview: { title: 'pv_title', description: 'pv_description', severity: 'pv_severity', recommendations: 'pv_recommendations' } });
