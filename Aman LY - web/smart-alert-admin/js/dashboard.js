api('/dashboard/summary').then(s => { put('s_', s);['normal', 'warning', 'critical', 'emergency'].forEach(k => $('lv_' + k).classList.toggle('on', k == s.overall_status)) }).catch(() => { });
Table({ id: 'al', ep: '/alerts', sort: 'created_at', dir: 'desc' });
api('/reports?page_size=3&sort=submitted_at&dir=desc').then(d => list('recentReports', 'tplReport', d.items)).catch(() => { });
api('/dashboard/activity-log?limit=5').then(d => list('activityLog', 'tplLog', d)).catch(() => { });
api('/dashboard/activity?days=7').then(d => lineChart('activityChart', d)).catch(() => { });
api('/dashboard/risk-distribution').then(d => doughnutChart('riskChart', d)).catch(() => { });
