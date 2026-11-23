Options('task_team_id', '/teams').catch(() => { }); Options('task_area_id', '/areas').catch(() => { });
Form('task', { ep: '/tasks' }); $('btnAddTask').onclick = () => openForm('task');
Table({ id: 'tm', ep: '/teams' });
Table({
    id: 'tk', ep: '/tasks', sort: 'assigned_at', dir: 'desc', filters: { status: 'tk_status' }, actions: {
        start: Status('in_progress', r => r.status == 'assigned'), done: Status('completed', r => ['assigned', 'in_progress'].includes(r.status)),
        tcancel: Status('cancelled', r => !['completed', 'cancelled'].includes(r.status), 'Cancel this task?|إلغاء هذه المهمة؟')
    }
});
api('/centers').then(d => list('centers', 'tplCenter', d.items || d, (n, r) => { n.querySelector('.progress-bar').style.width = (r.capacity ? Math.round(r.occupancy / r.capacity * 100) : 0) + '%' })).catch(() => { });
