// Shared helpers. Elements are found BY ID and filled from API data; no page markup lives here.
// Repeated things (table rows, cards, list items) are <template> tags in the HTML; JS only clones and fills them.
const $ = id => document.getElementById(id), QA = (s, r = document) => [...r.querySelectorAll(s)];
async function api(path, o = {}) {
    try {
        const fd = o.body instanceof FormData;
        const r = await fetch(CFG.API + path, { method: o.method || 'GET', headers: { 'Accept-Language': LANG, ...(fd || !o.body ? {} : { 'Content-Type': 'application/json' }), ...(localStorage.token ? { Authorization: 'Bearer ' + localStorage.token } : {}) }, body: o.body ? (fd ? o.body : JSON.stringify(o.body)) : undefined });
        if (!r.ok) { let m; try { m = (await r.json()).message } catch (e) { } throw new Error(m || 'Error ' + r.status) }
        return r.status == 204 ? null : r.json()
    } catch (e) { if (e instanceof TypeError) { document.body.classList.add('api-down'); $('apiUrl').textContent = CFG.API } throw e }
}
const nm = (x, k) => x[k + '_' + LANG] ?? x[k + '_' + (LANG == 'ar' ? 'en' : 'ar')] ?? x[k];
const FMT = { t: nm, label: (x, k) => lbl(x[k]), date: (x, k) => String(x[k] ?? '').replace('T', ' ').slice(0, 16), num: (x, k) => (+x[k] || 0).toLocaleString(LANG == 'ar' ? 'ar-LY' : 'en-US') };
const COL = ['#DC3545', '#2878B5', '#F59E0B', '#16A34A'], LC = { critical: '#B42318', high: '#DC3545', medium: '#F59E0B', low: '#2878B5', normal: '#16A34A' };
// put one value into one element (text, or an attribute when data-attr is set; data-fmt picks the format)
function bind(el, x, k) { if (!el) return; const f = el.dataset.fmt || 't', v = f == 'badge' ? FMT.label(x, k) : FMT[f](x, k); if (v === undefined) return; if (el.dataset.attr) el.setAttribute(el.dataset.attr, v); else el.textContent = v; if (f == 'badge') el.className = 'bdg ' + (BC[x[k]] || 'mute') }
const put = (prefix, x) => QA(`[id^="${prefix}"]`).forEach(el => bind(el, x, el.id.slice(prefix.length)));   // ids like v_title <- x.title
const fillRow = (root, x) => QA('[data-f]', root).forEach(el => bind(el, x, el.dataset.f));                  // repeated elements can't share an id, so rows use data-f
function list(containerId, tplId, rows, after) { const c = $(containerId); c.replaceChildren(); (rows || []).forEach(r => { const n = $(tplId).content.cloneNode(true); fillRow(n, r); if (after) after(n, r); c.append(n) }); tr(c) }
const loaders = [], reg = f => { loaders.push(f); f().catch(() => { }) }, reloadAll = () => loaders.forEach(f => f().catch(() => { }));
const toast = m => { const t = $('toast'); t.textContent = T(m); t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 2800) };
const Show = id => bootstrap.Modal.getOrCreateInstance($(id)).show(), Hide = id => { const m = $(id); if (m) bootstrap.Modal.getInstance(m)?.hide() };
const ask = msg => new Promise(res => { $('confirmMsg').textContent = T(msg); $('confirmOk').onclick = () => { Hide('confirmModal'); res(true) }; $('confirmModal').addEventListener('hidden.bs.modal', () => res(false), { once: true }); Show('confirmModal') });
async function Options(selectId, ep) { const d = await api(ep), s = $(selectId); (d.items || d).forEach(x => s.add(new Option(nm(x, 'name') || nm(x, 'title') || x.code || x.id, x.id))) }
const Status = (to, when, askMsg) => ({ when, ask: askMsg, call: (r, ep) => api(`${ep}/${r.id}/status`, { method: 'PATCH', body: { status: typeof to == 'function' ? to(r) : to } }) });

// ----- table: ids are <id>_search _head _body _row(template) _empty _pager _count _prev _page _next -----
const act = async (a, r, c) => { try { if (a.run) return await a.run(r, c); if (a.ask && !await ask(a.ask)) return; const res = await a.call(r, c.ep); toast(res?.message || 'Done|تم'); reloadAll() } catch (x) { toast(x.message) } };
function Table(c) {
    const st = { page: 1, sort: c.sort || '', dir: c.dir || 'asc' }, size = c.size || 5, e = s => $(c.id + '_' + s), acts = c.actions || {}; let h;
    const qs = () => { const p = new URLSearchParams({ page: st.page, page_size: size }); if (st.sort) { p.set('sort', st.sort); p.set('dir', st.dir) } if (e('search') && e('search').value.trim()) p.set('q', e('search').value.trim()); Object.entries(c.filters || {}).forEach(([k, i]) => { if ($(i).value) p.set(k, $(i).value) }); return p };
    const load = async () => {
        const d = await api(c.ep + '?' + qs()), body = e('body'); body.replaceChildren();
        d.items.forEach(r => { const n = e('row').content.cloneNode(true); fillRow(n, r); QA('[data-a]', n).forEach(b => { const a = acts[b.dataset.a]; if (a.when && !a.when(r)) b.remove(); else b.onclick = () => act(a, r, c) }); body.append(n) });
        e('empty').hidden = !!d.items.length;
        if (e('pager')) { const n = Math.max(1, Math.ceil(d.total / size)); e('count').textContent = d.total; e('page').textContent = st.page + ' / ' + n; e('prev').disabled = st.page <= 1; e('next').disabled = st.page >= n }
        tr(body)
    }, go = () => { st.page = 1; load().catch(() => { }) };
    const h0 = QA('th[data-sort]', e('head')); h0.forEach(t => { if (t.dataset.sort == st.sort) t.dataset.d = st.dir; t.onclick = () => { const k = t.dataset.sort; st.dir = st.sort == k && st.dir == 'asc' ? 'desc' : 'asc'; st.sort = k; h0.forEach(x => x.removeAttribute('data-d')); t.dataset.d = st.dir; go() } });
    if (e('search')) e('search').oninput = () => { clearTimeout(h); h = setTimeout(go, 300) };
    Object.values(c.filters || {}).forEach(i => $(i).onchange = go);
    if (e('pager')) { e('prev').onclick = () => { st.page--; load().catch(() => { }) }; e('next').onclick = () => { st.page++; load().catch(() => { }) } }
    reg(load)
}

// ----- forms: <name>Form (and <name>Modal when it is a modal). Validation, POST/PUT, multipart when the form says so -----
function fillForm(f, r) { QA('[name]', f).forEach(i => { const v = nm(r, i.name); if (i.type == 'checkbox') i.checked = !!v; else if (i.type != 'file') i.value = v == null ? '' : i.type == 'datetime-local' ? String(v).slice(0, 16) : v }) }
function openForm(name, row) { const f = $(name + 'Form'); f.reset(); f.classList.remove('was-validated'); f.dataset.id = row ? row.id : ''; if (row) fillForm(f, row); Show(name + 'Modal') }
function Form(name, c) {
    const f = $(name + 'Form');
    f.addEventListener('submit', async e => {
        e.preventDefault(); const b = e.submitter, draft = b && b.hasAttribute('formnovalidate');
        f.classList.add('was-validated'); if (draft ? !f.elements.title.value.trim() : !f.checkValidity()) return;
        if (c.match) { const [a, d] = c.match.split(','); if (f.elements[a].value != f.elements[d].value) return toast('Passwords do not match.|كلمتا المرور غير متطابقتين.') }
        const s = f.elements.starts_at, x = f.elements.expires_at; if (s && x && s.value && x.value && x.value <= s.value) return toast('Expiration must be after start.|يجب أن يكون الانتهاء بعد البداية.');
        if (b && b.dataset.confirm && !await ask(b.dataset.confirm)) return;
        let body; if (f.enctype == 'multipart/form-data') { body = new FormData(f); body.append('lang', LANG); if (b && b.dataset.status) body.set('status', b.dataset.status) }
        else { body = { lang: LANG }; new FormData(f).forEach((v, k) => body[k] = v); QA('input[type=checkbox]', f).forEach(i => body[i.name] = i.checked); QA('input[type=number]', f).forEach(i => body[i.name] = +i.value); if (b && b.dataset.status) body.status = b.dataset.status }
        const id = f.dataset.id; try { await api(c.ep + (id ? '/' + id : ''), { method: c.method || (id ? 'PUT' : 'POST'), body }); Hide(name + 'Modal'); toast('Saved|تم الحفظ'); if (c.after) location.href = c.after; else reloadAll() } catch (err) { toast(err.message) }
    });
    if (c.preview) { const up = () => Object.entries(c.preview).forEach(([k, id]) => bind($(id), { [k]: f.elements[k].value }, k)); f.addEventListener('input', up); f.addEventListener('change', up); up() }
    if (c.load) { const l = async () => fillForm(f, await api(c.load)); reg(l); f.addEventListener('reset', () => setTimeout(() => l().catch(() => { }), 0)) }
}

// ----- layout shared by every page (all elements are in the page HTML) -----
tr();
$('btnSide').onclick = $('shade').onclick = () => innerWidth < 992 ? document.body.classList.toggle('open') : document.body.classList.toggle('col');
$('btnLang').onclick = () => { localStorage.lang = LANG == 'ar' ? 'en' : 'ar'; location.reload() };
$('gs').oninput = e => { const s = QA('input[id$="_search"]')[0]; if (s) { s.value = e.target.value; s.dispatchEvent(new Event('input')) } };
setInterval(() => $('clk').textContent = new Date().toLocaleString(LANG == 'ar' ? 'ar-LY' : 'en-GB'), 1000);
api('/admin-notifications/unread').then(d => { $('bellCount').textContent = d.count; $('bellCount').classList.toggle('d-none', !d.count); list('bellList', 'tplBell', d.items) }).catch(() => { });
api('/me').then(d => bind($('meName'), d, 'full_name')).catch(() => { });
$('btnReadAll').onclick = e => { e.preventDefault(); api('/admin-notifications/read-all', { method: 'POST' }).then(() => location.reload()).catch(x => toast(x.message)) };
$('btnLogout').onclick = e => { e.preventDefault(); api('/auth/logout', { method: 'POST' }).then(() => location.reload()).catch(x => toast(x.message)) };
