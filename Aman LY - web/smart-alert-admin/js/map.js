(async () => {
    const d = await api('/map/features'), map = L.map('map').setView([32.1117, 20.07], 12), G = {}, LAY = { zone: '#DC3545', alert: '#B42318', report: '#F59E0B', center: '#16A34A', station: '#2878B5' };
    L.tileLayer(CFG.TILE, { attribution: '© OpenStreetMap' }).addTo(map);
    d.forEach(x => {
        const c = LC[x.level] || LAY[x.layer], p = [x.latitude, x.longitude], pop = $('tplPopup').content.firstElementChild.cloneNode(true),
        m = x.layer == 'zone' ? L.circle(p, { radius: x.radius_m || 800, color: c, fillOpacity: .2 }) : L.circleMarker(p, { radius: 8, color: '#fff', weight: 2, fillColor: c, fillOpacity: 1 });
        fillRow(pop, x);
        m.bindPopup(pop).on('click', () => { put('sel_', x); $('sel_coords').textContent = p.join(', '); $('selEmpty').hidden = true; $('selBox').hidden = false }).addTo(G[x.layer] ??= L.layerGroup().addTo(map))
    });
    Object.keys(G).forEach(k => { const cb = $('layer_' + k); if (cb) cb.onchange = () => cb.checked ? map.addLayer(G[k]) : map.removeLayer(G[k]) });
    if (sessionStorage.foc) { map.setView(JSON.parse(sessionStorage.foc), 15); sessionStorage.removeItem('foc') }
})().catch(() => { });
