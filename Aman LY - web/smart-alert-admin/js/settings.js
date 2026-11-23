Form('settings', { ep: '/settings', method: 'PUT', load: '/settings' });
Form('pwd', { ep: '/auth/change-password', match: 'new_password,confirm_password' });
Table({ id: 'lg', ep: '/auth/login-activity' });
