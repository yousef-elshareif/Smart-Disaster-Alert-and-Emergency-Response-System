Table({ id: 'st', ep: '/stations', filters: { risk_level: 'st_risk' } });
api('/stations?page_size=3&sort=risk_rank&dir=desc').then(d => list('stationCards', 'tplStation', d.items)).catch(() => { });
api('/stations/water-levels?hours=12&limit=3').then(d => lineChart('levelChart', d)).catch(() => { });
