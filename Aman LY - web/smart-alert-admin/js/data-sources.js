Form('src', { ep: '/data-sources' }); $('btnAddSrc').onclick = () => openForm('src');
Table({
    id: 'sr', ep: '/data-sources', actions: {
        test: { call: (r, ep) => api(`${ep}/${r.id}/test`, { method: 'POST' }) },
        updates: { run: async r => { const d = await api(`/data-sources/${r.id}/updates`); list('updList', 'tplUpd', d.items || d); Show('updatesModal') } },
        edit: { run: r => openForm('src', r) },
        toggle: Status(r => r.status == 'active' ? 'disabled' : 'active', null, 'Change the status of this source?|تغيير حالة هذا المصدر؟')
    }
});
