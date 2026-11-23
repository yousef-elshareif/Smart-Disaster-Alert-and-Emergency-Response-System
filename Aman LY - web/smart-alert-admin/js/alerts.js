Form('alertEdit', { ep: '/alerts' });
Table({
    id: 'al', ep: '/alerts', sort: 'created_at', dir: 'desc', filters: { status: 'al_status' }, actions: {
        view: { run: r => { put('v_', r); Show('viewModal') } },
        edit: { run: r => openForm('alertEdit', r) },
        publish: Status('active', r => r.status == 'draft', 'Publish this alert to citizens?|نشر هذا التحذير للمواطنين؟'),
        cancel: Status('cancelled', r => r.status == 'active', 'Cancel this active alert?|إلغاء هذا التحذير النشط؟'),
        delete: { when: r => r.status == 'draft', ask: 'Delete this draft permanently?|حذف هذه المسودة نهائياً؟', call: (r, ep) => api(`${ep}/${r.id}`, { method: 'DELETE' }) }
    }
});
