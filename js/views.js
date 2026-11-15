/* Safe Catering Records — custom views (fridge temperatures, cleaning, staff manager) */
/* Uses helpers (h, el, toast, openSheet, closeSheet, confirmDialog) provided by app.js */

const CustomViews = {

    /* ---------------- Fridge temperatures (SC2) ---------------- */

    fridgePage(container) {
        const units = Store.kvGet('units', [{ id: 'u1', name: 'Fridge 1' }]);
        const state = { tab: 'daily', units };

        function saveUnits() {
            Store.kvSet('units', state.units);
        }

        function render() {
            container.innerHTML = '';
            container.appendChild(h('div', 'hero', [
                h('div', 'eyebrow', 'SC2 · FRIDGE / COLD ROOM / DISPLAY CHILL'),
                h('h1', '', 'Fridge Temperatures'),
                h('p', '', 'Food temperature must not exceed 8°C. Check at least once per day (AM recommended; PM optional).'),
            ]));

            const chipRow = h('div', 'chip-row');
            [['daily', "Today's Check"], ['history', 'History'], ['units', 'Units']].forEach(pair => {
                const btn = h('button', 'chip' + (state.tab === pair[0] ? ' active' : ''), pair[1]);
                btn.addEventListener('click', () => {
                    state.tab = pair[0];
                    render();
                });
                chipRow.appendChild(btn);
            });
            container.appendChild(chipRow);

            if (state.tab === 'daily') {
                renderDaily(container);
            } else if (state.tab === 'history') {
                renderHistory(container);
            } else {
                renderUnits(container);
            }
        }

        function renderDaily(container) {
            const today = Store.todayString();
            const existing = Store.listByDate('fridge', today);
            const rows = state.units.map(unit => {
                const found = existing.find(item => item.unitId === unit.id);
                return {
                    unit,
                    am: found && found.am !== null && found.am !== undefined ? String(found.am) : '',
                    pm: found && found.pm !== null && found.pm !== undefined ? String(found.pm) : '',
                    recordId: found ? found.id : '',
                };
            });
            const withComments = existing.find(item => item.comments);
            const withSign = existing.find(item => item.sign);

            const card = h('div', 'card');
            card.appendChild(h('div', 'card-title', today));

            rows.forEach(row => {
                const rowEl = h('div', 'temp-row');
                rowEl.appendChild(h('div', 'temp-unit', row.unit.name));
                const inputs = h('div', 'temp-inputs');
                [['AM', 'am'], ['PM', 'pm']].forEach(pair => {
                    const wrap = h('div', 'temp-input-wrap');
                    wrap.appendChild(h('span', 'temp-label', pair[0]));
                    const input = h('input', 'temp-input');
                    input.type = 'number';
                    input.inputMode = 'decimal';
                    input.placeholder = '°C';
                    input.value = row[pair[1]];
                    input.addEventListener('input', () => {
                        row[pair[1]] = input.value;
                    });
                    wrap.appendChild(input);
                    inputs.appendChild(wrap);
                });
                rowEl.appendChild(inputs);
                card.appendChild(rowEl);
            });

            const comments = h('textarea', 'field-textarea');
            comments.placeholder = 'Any unit out of range? Action taken…';
            comments.value = withComments ? withComments.comments : '';
            const sign = h('input', 'field-input');
            sign.placeholder = 'Your initials';
            sign.maxLength = 8;
            sign.value = withSign ? withSign.sign : (Store.kvGet('managerName', '') || '');

            card.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Comments / action'), comments]));
            card.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Signature (initials) *'), sign]));

            const saveBtn = h('button', 'btn btn-primary', "Save Today's Temperatures");
            saveBtn.style.cssText = 'width:100%;margin-top:16px;';
            saveBtn.addEventListener('click', () => {
                if (!sign.value.trim()) {
                    toast('Your initials (signature) are required');
                    return;
                }
                const hasAny = rows.some(row => row.am.trim() !== '' || row.pm.trim() !== '');
                if (!hasAny && !comments.value.trim()) {
                    toast('Enter at least one temperature, or a comment explaining why none was taken');
                    return;
                }
                rows.forEach(row => {
                    const am = tempOrNull(row.am);
                    const pm = tempOrNull(row.pm);
                    const payload = {
                        date: today,
                        unitId: row.unit.id,
                        unitName: row.unit.name,
                        am,
                        pm,
                        comments: comments.value.trim(),
                        sign: sign.value.trim(),
                    };
                    if (am === null && pm === null && row.recordId) {
                        Store.remove('fridge', row.recordId);
                        return;
                    }
                    if (row.recordId) {
                        Store.update('fridge', row.recordId, payload);
                    } else if (am !== null || pm !== null) {
                        Store.create('fridge', payload);
                    }
                });
                toast('Saved');
                render();
            });
            card.appendChild(saveBtn);
            container.appendChild(card);
        }

        function renderHistory(container) {
            const all = Store.list('fridge');
            const byDate = {};
            all.forEach(item => {
                if (!byDate[item.date]) {
                    byDate[item.date] = [];
                }
                byDate[item.date].push(item);
            });
            const dates = Object.keys(byDate).sort().reverse().slice(0, 31);
            if (dates.length === 0) {
                container.appendChild(h('div', 'card empty-state', [
                    h('div', 'big', '○'),
                    h('div', 't', 'No temperatures recorded yet'),
                ]));
                return;
            }
            dates.forEach(date => {
                const rows = byDate[date];
                const anyFlag = rows.some(item => (item.am !== null && Number(item.am) > 8) || (item.pm !== null && Number(item.pm) > 8));
                const card = h('div', 'card');
                const head = h('div', 'card-head-row');
                head.appendChild(h('div', 'card-title', date));
                const badge = h('span', 'badge ' + (anyFlag ? 'badge-warn' : 'badge-ok'), anyFlag ? 'Check needed' : 'All OK');
                head.appendChild(badge);
                card.appendChild(head);
                rows.forEach(item => {
                    const row = h('div', 'history-row');
                    row.appendChild(h('div', 'history-unit', item.unitName));
                    const flag = (item.am !== null && Number(item.am) > 8) || (item.pm !== null && Number(item.pm) > 8);
                    const amText = item.am === null || item.am === undefined ? '—' : item.am + '°C';
                    const pmText = item.pm === null || item.pm === undefined ? '—' : item.pm + '°C';
                    row.appendChild(h('div', 'history-temp' + (flag ? ' temp-flagged' : ''), 'AM ' + amText + ' · PM ' + pmText));
                    if (item.verifiedBy) {
                        row.appendChild(h('span', 'badge badge-verified', '✓'));
                    }
                    card.appendChild(row);
                });
                container.appendChild(card);
            });
        }

        function renderUnits(container) {
            const card = h('div', 'card');
            const head = h('div', 'card-head-row');
            head.appendChild(h('div', 'card-title', 'Temperature Units (max ' + FRIDGE_MAX_UNITS + ')'));
            const addBtn = h('button', 'btn btn-verify btn-small', '+ Add');
            addBtn.addEventListener('click', () => unitEditor(null));
            head.appendChild(addBtn);
            card.appendChild(head);

            state.units.forEach(unit => {
                const row = h('div', 'record-item');
                const main = h('div', 'record-main');
                main.appendChild(h('div', 'record-title', unit.name));
                main.style.cursor = 'pointer';
                main.addEventListener('click', () => unitEditor(unit));
                row.appendChild(main);
                const del = h('button', 'btn btn-danger btn-small', 'Delete');
                del.addEventListener('click', () => {
                    if (state.units.length <= 1) {
                        toast('Keep at least one unit');
                        return;
                    }
                    confirmDialog('Delete unit', 'Past temperature records for this unit will remain. Continue?', () => {
                        state.units = state.units.filter(item => item.id !== unit.id);
                        saveUnits();
                        render();
                    });
                });
                row.appendChild(del);
                card.appendChild(row);
            });
            card.appendChild(h('div', 'tip', 'Set up one entry per fridge, cold room or display chill. Names appear on the daily check form.'));
            container.appendChild(card);
        }

        function unitEditor(unit) {
            openSheet('Unit name *', (sheet, done) => {
                const name = h('input', 'field-input');
                name.placeholder = 'e.g. Walk-in fridge, Display chiller 2';
                name.maxLength = 30;
                name.value = unit ? unit.name : '';
                sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Unit name *'), name]));
                sheet.appendChild(h('div', 'tip', 'Used on the daily temperature check form.'));
                return {
                    save() {
                        const value = name.value.trim();
                        if (!value) {
                            return 'Unit name is required';
                        }
                        if (unit) {
                            state.units = state.units.map(item => (item.id === unit.id ? Object.assign({}, item, { name: value }) : item));
                        } else {
                            if (state.units.length >= FRIDGE_MAX_UNITS) {
                                return 'Maximum ' + FRIDGE_MAX_UNITS + ' units supported';
                            }
                            state.units.push({ id: 'u' + Date.now(), name: value });
                        }
                        saveUnits();
                        render();
                        return null;
                    },
                    firstInput: name,
                };
            });
        }

        render(container);
    },

    /* ---------------- Cleaning (schedule + daily log) ---------------- */

    cleaningPage(container) {
        const state = { tab: 'schedule', logDate: Store.todayString(), logRows: [] };

        function freqText(selectedFreq) {
            if (!selectedFreq) {
                return '';
            }
            return Object.keys(selectedFreq).join(', ');
        }

        function render() {
            container.innerHTML = '';
            container.appendChild(h('div', 'hero', [
                h('div', 'eyebrow', 'CLEANING SCHEDULE & RECORD'),
                h('h1', '', 'Cleaning'),
                h('p', '', 'Plan what needs cleaning, with which chemicals and how often — then log each clean with time and initials.'),
            ]));

            const chipRow = h('div', 'chip-row');
            [['schedule', 'Cleaning Schedule'], ['log', 'Daily Log']].forEach(pair => {
                const btn = h('button', 'chip' + (state.tab === pair[0] ? ' active' : ''), pair[1]);
                btn.addEventListener('click', () => {
                    state.tab = pair[0];
                    render();
                });
                chipRow.appendChild(btn);
            });
            container.appendChild(chipRow);

            if (state.tab === 'schedule') {
                renderSchedule(container);
            } else {
                renderLog(container);
            }
        }

        function renderSchedule(container) {
            const items = Store.list('cleaning_schedule');
            if (items.length === 0) {
                container.appendChild(h('div', 'card empty-state', [
                    h('div', 'big', '○'),
                    h('div', 't', 'No schedule items yet'),
                    h('div', 'd', 'Walk through your premises and add every area and piece of equipment that needs cleaning.'),
                ]));
            }
            const card = h('div', 'card');
            items.forEach(item => {
                const row = h('div', 'record-item');
                const main = h('div', 'record-main');
                main.appendChild(h('div', 'record-title', item.item));
                if (item.chemicals) {
                    main.appendChild(h('div', 'record-sub', 'Chemicals: ' + item.chemicals));
                }
                if (item.method) {
                    main.appendChild(h('div', 'record-sub', 'Method: ' + item.method));
                }
                if (item.precautions) {
                    main.appendChild(h('div', 'record-sub', 'Precautions: ' + item.precautions));
                }
                if (freqText(item.selectedFreq)) {
                    main.appendChild(h('div', 'record-meta', 'Frequency: ' + freqText(item.selectedFreq)));
                }
                main.style.cursor = 'pointer';
                main.addEventListener('click', () => itemEditor(item));
                row.appendChild(main);
                const del = h('button', 'btn btn-danger btn-small', 'Delete');
                del.addEventListener('click', () => {
                    confirmDialog('Delete schedule item', 'Past cleaning logs for this item will remain. Continue?', () => {
                        Store.remove('cleaning_schedule', item.id);
                        render();
                    });
                });
                row.appendChild(del);
                card.appendChild(row);
            });
            container.appendChild(card);

            const fab = h('button', 'fab', '+');
            fab.setAttribute('aria-label', 'Add schedule item');
            fab.addEventListener('click', () => itemEditor(null));
            container.appendChild(fab);
        }

        function itemEditor(item) {
            openSheet(item ? 'Edit Schedule Item' : 'Add Schedule Item', (sheet) => {
                const name = h('input', 'field-input');
                name.placeholder = 'e.g. Work surface, Slicing machine';
                name.value = item ? item.item : '';
                const chemicals = h('textarea', 'field-textarea');
                chemicals.placeholder = 'e.g. X detergent diluted 4:1';
                chemicals.value = item ? item.chemicals || '' : '';
                const method = h('textarea', 'field-textarea');
                method.placeholder = 'Step by step instructions…';
                method.value = item ? item.method || '' : '';
                const precautions = h('input', 'field-input');
                precautions.placeholder = 'e.g. wear gloves';
                precautions.value = item ? item.precautions || '' : '';

                const selected = Object.assign({}, item ? item.selectedFreq : {});
                const grid = h('div', 'topic-grid');
                CLEANING_FREQUENCIES.forEach(freq => {
                    const chip = h('button', 'topic-chip' + (selected[freq] ? ' topic-on' : ''), freq);
                    chip.addEventListener('click', () => {
                        if (selected[freq]) {
                            delete selected[freq];
                        } else {
                            selected[freq] = true;
                        }
                        chip.classList.toggle('topic-on', !!selected[freq]);
                    });
                    grid.appendChild(chip);
                });

                sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Area / equipment *'), name]));
                sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Chemical(s) used (include dilution)'), chemicals]));
                sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Method of cleaning'), method]));
                sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Precautions (e.g. wear gloves)'), precautions]));
                sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Frequency of cleaning'), grid]));

                return {
                    save() {
                        if (!name.value.trim()) {
                            return 'Area / equipment name is required';
                        }
                        const payload = {
                            item: name.value.trim(),
                            chemicals: chemicals.value.trim(),
                            method: method.value.trim(),
                            precautions: precautions.value.trim(),
                            selectedFreq: selected,
                        };
                        if (item) {
                            Store.update('cleaning_schedule', item.id, payload);
                        } else {
                            Store.create('cleaning_schedule', payload);
                        }
                        render();
                        return null;
                    },
                    firstInput: name,
                };
            });
        }

        function renderLog(container) {
            const schedule = Store.list('cleaning_schedule');
            const existing = Store.listByDate('cleaning_log', state.logDate);
            state.logRows = schedule.map(entry => {
                const found = existing.find(item => item.scheduleItemId === entry.id);
                return {
                    id: entry.id,
                    name: entry.item,
                    time: found ? found.time || '' : '',
                    initials: found ? found.initials || '' : '',
                    recordId: found ? found.id : '',
                };
            });

            const card = h('div', 'card');
            const dateInput = h('input', 'field-input');
            dateInput.type = 'date';
            dateInput.value = state.logDate;
            dateInput.addEventListener('change', () => {
                state.logDate = dateInput.value || Store.todayString();
                renderLog(container);
            });
            card.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Date'), dateInput]));

            if (schedule.length === 0) {
                card.appendChild(h('div', 'tip', 'Add cleaning schedule items first (Cleaning Schedule tab) to enable the daily log.'));
            }

            state.logRows.forEach(row => {
                const rowEl = h('div', 'log-row');
                rowEl.appendChild(h('div', 'log-name', row.name));
                const inputs = h('div', 'log-inputs');
                const timeInput = h('input');
                timeInput.type = 'time';
                timeInput.value = row.time;
                timeInput.addEventListener('input', () => {
                    row.time = timeInput.value;
                });
                const initialsInput = h('input');
                initialsInput.placeholder = 'Initials';
                initialsInput.value = row.initials;
                initialsInput.addEventListener('input', () => {
                    row.initials = initialsInput.value;
                });
                inputs.appendChild(timeInput);
                inputs.appendChild(initialsInput);
                rowEl.appendChild(inputs);
                card.appendChild(rowEl);
            });

            if (schedule.length > 0) {
                const saveBtn = h('button', 'btn btn-primary', 'Save Cleaning Log');
                saveBtn.style.cssText = 'width:100%;margin-top:16px;';
                saveBtn.addEventListener('click', () => {
                    state.logRows.forEach(row => {
                        const time = (row.time || '').trim();
                        const initials = (row.initials || '').trim();
                        if (time === '' && initials === '') {
                            if (row.recordId) {
                                Store.remove('cleaning_log', row.recordId);
                            }
                            return;
                        }
                        const payload = {
                            date: state.logDate,
                            scheduleItemId: row.id,
                            itemName: row.name,
                            time,
                            initials,
                        };
                        if (row.recordId) {
                            Store.update('cleaning_log', row.recordId, payload);
                        } else {
                            Store.create('cleaning_log', payload);
                        }
                    });
                    toast('Saved');
                    render();
                });
                card.appendChild(saveBtn);
            }
            container.appendChild(card);
        }

        render(container);
    },

    /* ---------------- Staff manager (used by SC6 training page) ---------------- */

    staffBlock(container, onChange) {
        const staff = Store.kvGet('staff', []);
        const card = h('div', 'card');
        const head = h('div', 'card-head-row');
        head.appendChild(h('div', 'card-title', 'Staff Members'));
        const addBtn = h('button', 'btn btn-verify btn-small', '+ Add');
        addBtn.addEventListener('click', () => staffEditor(null));
        head.appendChild(addBtn);
        card.appendChild(head);

        if (staff.length === 0) {
            card.appendChild(h('div', 'record-sub', 'No staff added yet. Add your team so you can record their training.'));
        }
        staff.forEach(member => {
            const row = h('div', 'record-item');
            const main = h('div', 'record-main');
            main.appendChild(h('div', 'record-title', member.name));
            main.appendChild(h('div', 'record-sub', (member.position ? member.position : 'Position not set') + (member.employedAt ? ' · employed ' + member.employedAt : '')));
            main.style.cursor = 'pointer';
            main.addEventListener('click', () => staffEditor(member));
            row.appendChild(main);
            const del = h('button', 'btn btn-danger btn-small', 'Delete');
            del.addEventListener('click', () => {
                confirmDialog('Delete staff member', 'Their training records will remain in the list. Continue?', () => {
                    Store.kvSet('staff', staff.filter(item => item.id !== member.id));
                    onChange();
                });
            });
            row.appendChild(del);
            card.appendChild(row);
        });
        container.appendChild(card);

        function staffEditor(member) {
            openSheet(member ? 'Edit Staff Member' : 'Add Staff Member', (sheet) => {
                const name = h('input', 'field-input');
                name.placeholder = 'Full name';
                name.value = member ? member.name : '';
                const position = h('input', 'field-input');
                position.placeholder = 'e.g. Chef, Server';
                position.value = member ? member.position || '' : '';
                const employed = h('input', 'field-input');
                employed.type = 'date';
                employed.value = member ? member.employedAt || Store.todayString() : Store.todayString();

                sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Name *'), name]));
                sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Position'), position]));
                sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Date of employment'), employed]));

                return {
                    save() {
                        if (!name.value.trim()) {
                            return 'Name is required';
                        }
                        const current = Store.kvGet('staff', []);
                        const payload = {
                            name: name.value.trim(),
                            position: position.value.trim(),
                            employedAt: employed.value || '',
                        };
                        if (member) {
                            Store.kvSet('staff', current.map(item => (item.id === member.id ? Object.assign({}, item, payload) : item)));
                        } else {
                            payload.id = 's' + Date.now();
                            current.push(payload);
                            Store.kvSet('staff', current);
                        }
                        onChange();
                        return null;
                    },
                    firstInput: name,
                };
            });
        }
    },
};
