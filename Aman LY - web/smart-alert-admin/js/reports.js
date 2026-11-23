let cur, last;
async function openReport(id) { const d = await api('/reports/' + id); cur = id; last = d; put('r_', d); list('repAtt', 'tplAtt', d.attachments); list('repNotes', 'tplNote', d.notes); list('repHist', 'tplHist', d.history); Show('reportModal') }
const toMap = r => { sessionStorage.foc = JSON.stringify([r.latitude, r.longitude]); location.href = 'map.html' };
Table({ id: 'rp', ep: '/reports', sort: 'submitted_at', dir: 'desc', filters: { status: 'rp_status' }, actions: { open: { run: r => openReport(r.id) }, map: { run: toMap } } });
['under_review', 'verified', 'rejected', 'resolved'].forEach(s => $('rs_' + s).onclick = async () => { try { await api(`/reports/${cur}/status`, { method: 'PATCH', body: { status: s } }); await openReport(cur); reloadAll() } catch (x) { toast(x.message) } });
$('btnRepMap').onclick = () => toMap(last);
$('noteForm').onsubmit = async e => { e.preventDefault(); const v = $('noteText').value.trim(); if (!v) return; try { await api(`/reports/${cur}/notes`, { method: 'POST', body: { text: v } }); $('noteText').value = ''; openReport(cur) } catch (x) { toast(x.message) } };
