Options('user_role_id', '/roles').catch(() => { });
Form('user', { ep: '/users' }); $('btnAddUser').onclick = () => openForm('user');
Table({ id: 'us', ep: '/users', actions: { edit: { run: r => openForm('user', r) }, toggle: Status(r => r.status == 'active' ? 'disabled' : 'active', null, 'Change the status of this user?|تغيير حالة هذا المستخدم؟') } });
(async () => {
    const [a, b] = await Promise.all([api('/roles'), api('/permissions')]), R = a.items || a, Pm = b.items || b;
    R.forEach(r => { const n = $('tplRoleTh').content.cloneNode(true); fillRow(n, r); $('permHead').append(n) });
    Pm.forEach(p => { const n = $('tplPermRow').content.cloneNode(true), row = n.querySelector('tr'); fillRow(n, p); R.forEach(r => row.append($(r.permissions.includes(p.code) ? 'tplYes' : 'tplNo').content.cloneNode(true))); $('permBody').append(n) }); tr($('permBody'))
})().catch(() => { });
