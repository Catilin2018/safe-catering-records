/* Safe Catering Records — local storage layer (browser localStorage) */
/* Same data model as the WeChat mini program version; records kept >= 12 months. */

const Store = (() => {
    function read(mod) {
        try {
            const raw = localStorage.getItem('sc_' + mod);
            const value = raw ? JSON.parse(raw) : [];
            return Array.isArray(value) ? value : [];
        } catch (error) {
            return [];
        }
    }

    function write(mod, items) {
        localStorage.setItem('sc_' + mod, JSON.stringify(items));
    }

    function makeId() {
        return String(Date.now()) + '-' + String(Math.floor(Math.random() * 100000));
    }

    function todayString() {
        const d = new Date();
        const p = n => (n < 10 ? '0' + n : String(n));
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
    }

    return {
        todayString,

        list(mod) {
            const items = read(mod);
            items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            return items;
        },

        listByDate(mod, date) {
            return read(mod)
                .filter(item => item.date === date)
                .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        },

        hasOn(mod, date) {
            return read(mod).some(item => item.date === date);
        },

        create(mod, payload) {
            const now = Date.now();
            const record = Object.assign({}, payload, {
                id: makeId(),
                date: payload && payload.date ? payload.date : todayString(),
                verifiedBy: '',
                verifiedAt: 0,
                createdAt: now,
                updatedAt: now,
            });
            const items = read(mod);
            items.unshift(record);
            write(mod, items);
            return record;
        },

        update(mod, id, patch) {
            const items = read(mod);
            const index = items.findIndex(item => item.id === id);
            if (index === -1) {
                return null;
            }
            items[index] = Object.assign({}, items[index], patch, { updatedAt: Date.now() });
            write(mod, items);
            return items[index];
        },

        remove(mod, id) {
            const items = read(mod);
            const next = items.filter(item => item.id !== id);
            const removed = next.length !== items.length;
            write(mod, next);
            return removed;
        },

        verify(mod, id, initials) {
            const name = typeof initials === 'string' ? initials.trim() : '';
            if (name === '') {
                return false;
            }
            return !!this.update(mod, id, { verifiedBy: name, verifiedAt: Date.now() });
        },

        unverify(mod, id) {
            return !!this.update(mod, id, { verifiedBy: '', verifiedAt: 0 });
        },

        kvGet(key, fallback) {
            try {
                const raw = localStorage.getItem('sc_kv_' + key);
                if (raw === null) {
                    return fallback;
                }
                return JSON.parse(raw);
            } catch (error) {
                return fallback;
            }
        },

        kvSet(key, value) {
            localStorage.setItem('sc_kv_' + key, JSON.stringify(value));
        },

        exportAll() {
            const modules = ['delivery', 'fridge', 'cooking', 'hothold', 'calibration', 'hygiene', 'training', 'fitness', 'customer_delivery', 'cleaning_schedule', 'cleaning_log'];
            const data = {};
            modules.forEach(mod => {
                data[mod] = read(mod);
            });
            data._kv = {
                units: this.kvGet('units', []),
                staff: this.kvGet('staff', []),
                managerName: this.kvGet('managerName', ''),
            };
            return {
                app: 'safe-catering-records',
                version: 1,
                exportedAt: new Date().toISOString(),
                data,
            };
        },

        importAll(backup) {
            if (!backup || backup.app !== 'safe-catering-records' || !backup.data) {
                return false;
            }
            const modules = ['delivery', 'fridge', 'cooking', 'hothold', 'calibration', 'hygiene', 'training', 'fitness', 'customer_delivery', 'cleaning_schedule', 'cleaning_log'];
            modules.forEach(mod => {
                if (Array.isArray(backup.data[mod])) {
                    write(mod, backup.data[mod]);
                }
            });
            if (backup.data._kv) {
                if (Array.isArray(backup.data._kv.units)) {
                    this.kvSet('units', backup.data._kv.units);
                }
                if (Array.isArray(backup.data._kv.staff)) {
                    this.kvSet('staff', backup.data._kv.staff);
                }
                if (typeof backup.data._kv.managerName === 'string') {
                    this.kvSet('managerName', backup.data._kv.managerName);
                }
            }
            return true;
        },
    };
})();
