/* Safe Catering Records — app shell, router, dashboard, generic record pages, records browser */

/* ---------------- tiny DOM helper ---------------- */

function h(tag, cls, children) {
    const node = document.createElement(tag);
    if (cls) {
        node.className = cls;
    }
    if (children !== undefined && children !== null) {
        if (Array.isArray(children)) {
            children.forEach(child => {
                if (child === null || child === undefined) {
                    return;
                }
                node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
            });
        } else if (typeof children === 'string') {
            node.textContent = children;
        } else {
            node.appendChild(children);
        }
    }
    return node;
}

/* ---------------- toast & modal ---------------- */

let toastTimer = null;
function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.hidden = true;
    }, 2200);
}

function openSheet(title, buildContent) {
    const mask = document.getElementById('modalMask');
    const sheet = document.getElementById('modalSheet');
    sheet.innerHTML = '';
    sheet.appendChild(h('div', 'sheet-title', title));
    let saveHandler = null;
    const controls = buildContent(sheet, () => closeSheet()) || {};
    saveHandler = controls.save || null;

    const actions = h('div', 'sheet-actions');
    const cancel = h('button', 'btn', 'Cancel');
    cancel.addEventListener('click', closeSheet);
    const save = h('button', 'btn btn-primary', 'Save');
    save.addEventListener('click', () => {
        if (!saveHandler) {
            closeSheet();
            return;
        }
        const error = saveHandler();
        if (error) {
            let errNode = sheet.querySelector('.sheet-error');
            if (!errNode) {
                errNode = h('div', 'sheet-error');
                sheet.insertBefore(errNode, sheet.querySelector('.sheet-actions'));
            }
            errNode.textContent = error;
            errNode.scrollIntoView({ block: 'nearest' });
            return;
        }
        closeSheet();
        route();
    });
    actions.appendChild(cancel);
    actions.appendChild(save);
    sheet.appendChild(actions);

    if (controls.firstInput) {
        setTimeout(() => {
            try {
                controls.firstInput.focus({ preventScroll: true });
            } catch (error) {
                controls.firstInput.focus();
            }
        }, 60);
    }

    mask.hidden = false;
    sheet.hidden = false;
    mask.onclick = closeSheet;
}

function closeSheet() {
    document.getElementById('modalMask').hidden = true;
    document.getElementById('modalSheet').hidden = true;
    document.getElementById('modalSheet').innerHTML = '';
}

function confirmDialog(title, message, onConfirm) {
    const mask = document.getElementById('modalMask');
    const sheet = document.getElementById('modalSheet');
    sheet.innerHTML = '';
    sheet.appendChild(h('div', 'sheet-title', title));
    sheet.appendChild(h('p', 'record-sub', message));
    const actions = h('div', 'sheet-actions');
    const cancel = h('button', 'btn', 'Cancel');
    cancel.addEventListener('click', closeSheet);
    const ok = h('button', 'btn btn-danger', 'Delete');
    ok.addEventListener('click', () => {
        closeSheet();
        onConfirm();
    });
    actions.appendChild(cancel);
    actions.appendChild(ok);
    sheet.appendChild(actions);
    mask.hidden = false;
    sheet.hidden = false;
    mask.onclick = closeSheet;
}

function promptDialog(title, placeholder, initial, onConfirm) {
    const mask = document.getElementById('modalMask');
    const sheet = document.getElementById('modalSheet');
    sheet.innerHTML = '';
    sheet.appendChild(h('div', 'sheet-title', title));
    const input = h('input', 'field-input');
    input.placeholder = placeholder || '';
    input.value = initial || '';
    sheet.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Your initials'), input]));
    const actions = h('div', 'sheet-actions');
    const cancel = h('button', 'btn', 'Cancel');
    cancel.addEventListener('click', closeSheet);
    const ok = h('button', 'btn btn-primary', 'Confirm');
    ok.addEventListener('click', () => {
        const value = input.value.trim();
        if (!value) {
            toast('Initials required');
            return;
        }
        closeSheet();
        onConfirm(value);
    });
    actions.appendChild(cancel);
    actions.appendChild(ok);
    sheet.appendChild(actions);
    mask.hidden = false;
    sheet.hidden = false;
    mask.onclick = closeSheet;
    setTimeout(() => input.focus(), 60);
}

/* ---------------- top bar ---------------- */

function setTopbar(code, text, options) {
    document.getElementById('topbarCode').textContent = code || '';
    document.getElementById('topbarText').textContent = text || 'Safe Catering Records';
    document.getElementById('backBtn').hidden = !(options && options.back);
    document.getElementById('homeBtn').hidden = !(options && options.home);
}

/* ---------------- dashboard ---------------- */

const DAILY_CHECKS = [
    { key: 'delivery', label: 'Food Delivery Records (SC1)' },
    { key: 'fridge', label: 'Fridge Temperatures (SC2)' },
    { key: 'cooking', label: 'Cooking / Cooling / Reheating (SC3)' },
    { key: 'hothold', label: 'Hot Hold / Display (SC4)' },
];

const MODULE_CARDS = [
    { key: 'delivery', code: 'SC1', name: 'Food Delivery', desc: 'Supplier checks on arrival' },
    { key: 'fridge', code: 'SC2', name: 'Fridge Temperatures', desc: 'Fridge / cold room / display chill' },
    { key: 'cooking', code: 'SC3', name: 'Cooking / Cooling / Reheating', desc: 'Core temperature checks' },
    { key: 'hothold', code: 'SC4', name: 'Hot Hold / Display', desc: 'Hot food above 63°C' },
    { key: 'calibration', code: 'CAL', name: 'Thermometer Calibration', desc: 'Probe accuracy checks' },
    { key: 'hygiene', code: 'SC5', name: 'Hygiene Inspection', desc: 'Premises checklist' },
    { key: 'training', code: 'SC6', name: 'Hygiene Training', desc: 'Staff training records' },
    { key: 'fitness', code: 'SC7', name: 'Fitness to Work', desc: 'Sickness assessment' },
    { key: 'customer_delivery', code: 'SC9', name: 'Customer Delivery', desc: 'Outgoing food deliveries' },
    { key: 'cleaning', code: 'CS', name: 'Cleaning', desc: 'Schedule and daily log' },
];

function renderDashboard(container) {
    setTopbar('', 'Safe Catering Records', { home: false, back: false });
    const today = Store.todayString();
    const managerName = Store.kvGet('managerName', '');

    container.innerHTML = '';
    container.appendChild(h('div', 'hero', [
        h('div', 'eyebrow', 'SAFE CATERING · HSE / FSA RECORDS'),
        h('h1', '', today),
        h('p', '', 'Fill in your daily food safety records on your iPad — no more paper forms.'),
    ]));

    const card = h('div', 'card');
    const head = h('div', 'card-head-row');
    head.appendChild(h('div', 'card-title', "Today's Records"));
    const managerBtn = h('button', 'btn btn-verify btn-small', 'Manager: ' + (managerName || 'set name'));
    managerBtn.addEventListener('click', () => {
        promptDialog('Manager / Supervisor', 'Your name or initials', managerName, value => {
            Store.kvSet('managerName', value);
            route();
        });
    });
    head.appendChild(managerBtn);
    card.appendChild(head);

    DAILY_CHECKS.forEach(check => {
        const done = Store.hasOn(check.key, today);
        const row = h('div', 'check-item');
        row.appendChild(h('span', 'dot ' + (done ? 'dot-done' : 'dot-pending')));
        row.appendChild(h('span', 'check-label', check.label));
        row.appendChild(h('span', 'check-status ' + (done ? 'status-done' : 'status-pending'), done ? 'Recorded' : 'Pending'));
        card.appendChild(row);
    });
    card.appendChild(h('div', 'tip', 'Records should be checked and verified by a manager/supervisor, and kept for at least 12 months. Use the All Records page to review and sign off past entries.'));
    container.appendChild(card);

    const grid = h('div', 'module-grid');
    MODULE_CARDS.forEach(mod => {
        const cell = h('button', 'module-cell');
        cell.appendChild(h('div', 'module-code', mod.code));
        cell.appendChild(h('div', 'module-name', mod.name));
        cell.appendChild(h('div', 'module-desc', mod.desc));
        cell.addEventListener('click', () => {
            window.location.hash = '#/' + mod.key;
        });
        grid.appendChild(cell);
    });
    const recordsCell = h('button', 'module-cell');
    recordsCell.appendChild(h('div', 'module-code', 'LOG'));
    recordsCell.appendChild(h('div', 'module-name', 'All Records'));
    recordsCell.appendChild(h('div', 'module-desc', 'Browse, review, verify and back up'));
    recordsCell.addEventListener('click', () => {
        window.location.hash = '#/records';
    });
    grid.appendChild(recordsCell);
    container.appendChild(grid);
}

/* ---------------- generic record page (list + form) ---------------- */

function makeListPage(moduleKey) {
    return function renderPage(container) {
        const mod = MODULES[moduleKey];
        setTopbar(mod.code, mod.name, { back: true });

        container.innerHTML = '';
        container.appendChild(h('div', 'hero', [
            h('div', 'eyebrow', mod.code + ' · ' + mod.name.toUpperCase()),
            h('h1', '', mod.name),
            h('p', '', mod.subtitle),
        ]));

        if (moduleKey === 'training') {
            const staffCardWrap = h('div');
            CustomViews.staffBlock(staffCardWrap, () => renderPage(container));
            container.appendChild(staffCardWrap);
        }

        const items = Store.list(moduleKey);
        if (items.length === 0) {
            container.appendChild(h('div', 'card empty-state', [
                h('div', 'big', '○'),
                h('div', 't', 'No records yet'),
                h('div', 'd', 'Tap + to record the first entry.'),
            ]));
        }

        const card = h('div', 'card');
        items.forEach(item => {
            const view = mod.listItem(item);
            const row = h('div', 'record-item');
            const main = h('div', 'record-main');
            const titleRow = h('div');
            titleRow.appendChild(h('span', 'record-title', view.title));
            (view.badges || []).forEach(badge => {
                titleRow.appendChild(h('span', badge.cls, badge.text));
            });
            if (item.verifiedBy) {
                titleRow.appendChild(h('span', 'badge badge-verified', '✓ Verified'));
            }
            main.appendChild(titleRow);
            (view.subs || []).forEach(sub => {
                if (sub) {
                    main.appendChild(h('div', 'record-sub', sub));
                }
            });
            main.appendChild(h('div', 'record-meta', (view.meta || '') + (item.verifiedBy ? ' · Verified by ' + item.verifiedBy : '')));
            main.style.cursor = 'pointer';
            main.addEventListener('click', () => recordEditor(moduleKey, item));
            row.appendChild(main);

            const actions = h('div', 'item-actions');
            const verifyBtn = h('button', 'btn btn-verify btn-small', item.verifiedBy ? 'Unverify' : 'Verify');
            verifyBtn.addEventListener('click', () => {
                if (item.verifiedBy) {
                    Store.unverify(moduleKey, item.id);
                    toast('Verification removed');
                    renderPage(container);
                } else {
                    promptDialog('Manager check', 'Your initials', Store.kvGet('managerName', ''), value => {
                        Store.verify(moduleKey, item.id, value);
                        toast('Verified');
                        renderPage(container);
                    });
                }
            });
            actions.appendChild(verifyBtn);
            const delBtn = h('button', 'btn btn-danger btn-small', 'Delete');
            delBtn.addEventListener('click', () => {
                confirmDialog('Delete record', 'This record will be permanently removed. Continue?', () => {
                    Store.remove(moduleKey, item.id);
                    renderPage(container);
                });
            });
            actions.appendChild(delBtn);
            row.appendChild(actions);
            card.appendChild(row);
        });
        if (items.length > 0) {
            container.appendChild(card);
        }

        const fab = h('button', 'fab', '+');
        fab.setAttribute('aria-label', 'New record');
        fab.addEventListener('click', () => recordEditor(moduleKey, null));
        container.appendChild(fab);
    };
}

/* ---------------- form engine ---------------- */

function defaultFormValues(mod) {
    const values = {};
    mod.fields.forEach(field => {
        if (field.default !== undefined) {
            values[field.k] = field.default;
        } else if (field.defaultToday) {
            values[field.k] = Store.todayString();
        } else if (field.defaultFrom) {
            values[field.k] = Store.kvGet(field.defaultFrom, '');
        } else {
            values[field.k] = '';
        }
        if (field.type === 'yesno') {
            values[field.k] = '';
        }
        if (field.type === 'topics') {
            values[field.k] = {};
        }
        if (field.type === 'hygienecheck') {
            values[field.k] = { answers: {}, actions: {} };
        }
        if (field.type === 'fitnessquestions') {
            values[field.k] = {};
        }
        if (field.type === 'number') {
            values[field.k] = '';
        }
    });
    return values;
}

function fillFormFromRecord(mod, values, item) {
    mod.fields.forEach(field => {
        if (field.type === 'hygienecheck') {
            values[field.k] = { answers: Object.assign({}, item.answers || {}), actions: Object.assign({}, item.sectionActions || {}) };
        } else if (field.type === 'fitnessquestions') {
            values[field.k] = Object.assign({}, item.answers || {});
        } else if (field.type === 'topics') {
            const topics = Array.isArray(item.topics) ? item.topics : [];
            const map = {};
            topics.forEach(topic => {
                map[topic] = true;
            });
            values[field.k] = map;
        } else if (item[field.k] !== null && item[field.k] !== undefined) {
            values[field.k] = String(item[field.k]);
        }
    });
}

function recordEditor(moduleKey, item) {
    const mod = MODULES[moduleKey];
    openSheet(item ? 'Edit Record' : 'New Record', (sheet) => {
        const values = defaultFormValues(mod);
        if (item) {
            fillFormFromRecord(mod, values, item);
        }

        mod.fields.forEach(field => {
            const group = h('div', 'field-group');
            if (field.label) {
                const label = h('label', 'field-label', field.label);
                if (field.required) {
                    label.appendChild(h('span', 'required', ' *'));
                }
                group.appendChild(label);
            }

            if (field.type === 'text' || field.type === 'number') {
                const input = h('input', 'field-input');
                input.type = field.type === 'number' ? 'number' : 'text';
                if (field.type === 'number') {
                    input.inputMode = 'decimal';
                }
                input.placeholder = field.placeholder || '';
                if (field.maxlength) {
                    input.maxLength = field.maxlength;
                }
                input.value = values[field.k] || '';
                input.addEventListener('input', () => {
                    values[field.k] = input.value;
                });
                group.appendChild(input);
            } else if (field.type === 'textarea') {
                const area = h('textarea', 'field-textarea');
                area.placeholder = field.placeholder || '';
                area.value = values[field.k] || '';
                area.addEventListener('input', () => {
                    values[field.k] = area.value;
                });
                group.appendChild(area);
            } else if (field.type === 'date' || field.type === 'time') {
                const input = h('input', 'field-input');
                input.type = field.type;
                input.value = values[field.k] || '';
                input.addEventListener('change', () => {
                    values[field.k] = input.value;
                });
                group.appendChild(input);
            } else if (field.type === 'select') {
                const select = h('select', 'field-input');
                field.options.forEach(option => {
                    const opt = h('option', '', option);
                    opt.value = option;
                    select.appendChild(opt);
                });
                select.value = values[field.k] || field.default || field.options[0];
                select.addEventListener('change', () => {
                    values[field.k] = select.value;
                });
                group.appendChild(select);
            } else if (field.type === 'yesno') {
                const seg = h('div', 'seg');
                [['Yes', 'yes'], ['No', 'no']].forEach(pair => {
                    const btn = h('button', 'seg-item' + (values[field.k] === pair[1] ? (pair[1] === 'yes' ? ' active' : ' active-no') : ''), pair[0]);
                    btn.addEventListener('click', () => {
                        values[field.k] = pair[1];
                        seg.querySelectorAll('.seg-item').forEach(node => node.classList.remove('active', 'active-no'));
                        btn.classList.add(pair[1] === 'yes' ? 'active' : 'active-no');
                    });
                    seg.appendChild(btn);
                });
                group.appendChild(seg);
            } else if (field.type === 'topics') {
                const grid = h('div', 'topic-grid');
                TRAINING_TOPICS.forEach(topic => {
                    const chip = h('button', 'topic-chip' + (values[field.k][topic] ? ' topic-on' : ''), topic);
                    chip.addEventListener('click', () => {
                        if (values[field.k][topic]) {
                            delete values[field.k][topic];
                        } else {
                            values[field.k][topic] = true;
                        }
                        chip.classList.toggle('topic-on', !!values[field.k][topic]);
                    });
                    grid.appendChild(chip);
                });
                group.appendChild(grid);
            } else if (field.type === 'staffpicker') {
                const staff = Store.kvGet('staff', []);
                if (staff.length === 0) {
                    group.appendChild(h('div', 'tip tip-warn', 'No staff members yet — add them in the Staff Members list above first.'));
                } else {
                    const select = h('select', 'field-input');
                    select.appendChild(h('option', '', 'Select staff'));
                    staff.forEach(member => {
                        const opt = h('option', '', member.name);
                        opt.value = member.name;
                        select.appendChild(opt);
                    });
                    select.value = values[field.k] || '';
                    if (!values[field.k]) {
                        select.selectedIndex = 0;
                    }
                    select.addEventListener('change', () => {
                        values[field.k] = select.value === 'Select staff' ? '' : select.value;
                    });
                    group.appendChild(select);
                }
            } else if (field.type === 'hygienecheck') {
                HYGIENE_SECTIONS.forEach(section => {
                    const sectionEl = h('div', 'insp-section');
                    sectionEl.appendChild(h('div', 'section-title', section.title));
                    section.items.forEach((text, index) => {
                        const id = section.key + '_' + index;
                        const itemEl = h('div', 'insp-item');
                        itemEl.appendChild(h('span', 'insp-text', text));
                        const seg = h('div', 'seg');
                        [['Yes', 'yes'], ['No', 'no']].forEach(pair => {
                            const active = values[field.k].answers[id] === pair[1];
                            const btn = h('button', 'seg-item' + (active ? (pair[1] === 'yes' ? ' active' : ' active-no') : ''), pair[0]);
                            btn.addEventListener('click', () => {
                                values[field.k].answers[id] = pair[1];
                                seg.querySelectorAll('.seg-item').forEach(node => node.classList.remove('active', 'active-no'));
                                btn.classList.add(pair[1] === 'yes' ? 'active' : 'active-no');
                            });
                            seg.appendChild(btn);
                        });
                        itemEl.appendChild(seg);
                        sectionEl.appendChild(itemEl);
                    });
                    const actionArea = h('textarea', 'field-textarea');
                    actionArea.placeholder = "Details of action taken (required for any 'No' answers)…";
                    actionArea.value = values[field.k].actions[section.key] || '';
                    actionArea.addEventListener('input', () => {
                        values[field.k].actions[section.key] = actionArea.value;
                    });
                    sectionEl.appendChild(h('div', 'field-group', [h('label', 'field-label', 'Details of action taken'), actionArea]));
                    group.appendChild(sectionEl);
                });
            } else if (field.type === 'fitnessquestions') {
                FITNESS_QUESTIONS.forEach(question => {
                    const itemEl = h('div', 'insp-item');
                    itemEl.appendChild(h('span', 'insp-text', question.label));
                    const seg = h('div', 'seg');
                    [['Yes', 'yes'], ['No', 'no']].forEach(pair => {
                        const active = values[field.k][question.id] === pair[1];
                        const btn = h('button', 'seg-item' + (active ? (pair[1] === 'yes' ? ' active' : ' active-no') : ''), pair[0]);
                        btn.addEventListener('click', () => {
                            values[field.k][question.id] = pair[1];
                            seg.querySelectorAll('.seg-item').forEach(node => node.classList.remove('active', 'active-no'));
                            btn.classList.add(pair[1] === 'yes' ? 'active' : 'active-no');
                        });
                        seg.appendChild(btn);
                    });
                    itemEl.appendChild(seg);
                    group.appendChild(itemEl);
                });
                group.appendChild(h('div', 'tip tip-warn', 'If the answer to any question is "yes", the individual should not be permitted to handle food or enter food handling areas.'));
            }

            sheet.appendChild(group);
        });

        return {
            save() {
                // required validation
                for (const field of mod.fields) {
                    if (!field.required) {
                        continue;
                    }
                    if (field.type === 'topics') {
                        if (Object.keys(values[field.k] || {}).length === 0) {
                            return field.label ? field.label.replace(/ \(.*\)$/, '') + ' is required' : 'Selection required';
                        }
                        continue;
                    }
                    if (field.type === 'staffpicker') {
                        if (!values[field.k]) {
                            return 'Select a staff member';
                        }
                        continue;
                    }
                    if (String(values[field.k] || '').trim() === '') {
                        return field.label ? field.label.replace(/ \(.*\)$/, '') + ' is required' : 'This field is required';
                    }
                }

                const payload = {};
                mod.fields.forEach(field => {
                    if (field.type === 'hygienecheck') {
                        payload.answers = Object.assign({}, values[field.k].answers);
                        payload.sectionActions = Object.assign({}, values[field.k].actions);
                        let anyNo = false;
                        Object.keys(payload.answers).forEach(key => {
                            if (payload.answers[key] === 'no') {
                                anyNo = true;
                            }
                        });
                        payload.anyNo = anyNo;
                        payload.answeredCount = Object.keys(payload.answers).length;
                    } else if (field.type === 'fitnessquestions') {
                        payload.answers = Object.assign({}, values[field.k]);
                        let anyYes = false;
                        Object.keys(payload.answers).forEach(key => {
                            if (payload.answers[key] === 'yes') {
                                anyYes = true;
                            }
                        });
                        payload.anyYes = anyYes;
                        payload.answeredCount = Object.keys(payload.answers).length;
                    } else if (field.type === 'topics') {
                        payload.topics = Object.keys(values[field.k]);
                    } else if (field.type === 'number') {
                        payload[field.k] = tempOrNull(values[field.k]);
                    } else if (field.type === 'staffpicker') {
                        payload[field.k] = values[field.k];
                    } else {
                        payload[field.k] = String(values[field.k] === undefined || values[field.k] === null ? '' : values[field.k]).trim();
                    }
                });

                if (moduleKey === 'hygiene' && payload.answeredCount === 0) {
                    return 'Answer at least one question (Yes or No)';
                }

                if (item) {
                    Store.update(moduleKey, item.id, payload);
                } else {
                    Store.create(moduleKey, payload);
                }
                toast('Saved');
                return null;
            },
        };
    });
}

/* ---------------- records browser ---------------- */

function renderRecords(container) {
    setTopbar('', 'All Records', { back: true });
    let activeKey = RECORD_MODULE_ORDER[0];

    function render() {
        container.innerHTML = '';
        container.appendChild(h('div', 'hero', [
            h('div', 'eyebrow', 'ALL RECORDS · KEEP FOR AT LEAST 12 MONTHS'),
            h('h1', '', 'All Records'),
            h('p', '', 'Browse every record, review details and add your manager verification. Export a backup file any time.'),
        ]));

        const chips = h('div', 'chip-row');
        const CHIP_LABELS = {
            delivery: 'SC1',
            fridge: 'SC2',
            cooking: 'SC3',
            hothold: 'SC4',
            calibration: 'CAL',
            hygiene: 'SC5',
            training: 'SC6',
            fitness: 'SC7',
            customer_delivery: 'SC9',
            cleaning_log: 'LOG',
        };
        RECORD_MODULE_ORDER.forEach(key => {
            const btn = h('button', 'chip' + (activeKey === key ? ' active' : ''), CHIP_LABELS[key]);
            btn.addEventListener('click', () => {
                activeKey = key;
                render();
            });
            chips.appendChild(btn);
        });
        container.appendChild(chips);

        const storeKey = activeKey;
        const items = Store.list(storeKey);

        const exportRow = h('div', 'export-row');
        exportRow.appendChild(h('span', 'export-count', items.length + ' record(s)'));
        const backupBtn = h('button', 'btn btn-verify btn-small', 'Backup file');
        backupBtn.addEventListener('click', exportBackup);
        exportRow.appendChild(backupBtn);
        const excelBtn = h('button', 'btn btn-verify btn-small', 'Export Excel');
        excelBtn.addEventListener('click', exportExcel);
        exportRow.appendChild(excelBtn);
        const importBtn = h('button', 'btn btn-verify btn-small', 'Restore');
        importBtn.addEventListener('click', importBackup);
        exportRow.appendChild(importBtn);
        container.appendChild(exportRow);

        if (items.length === 0) {
            container.appendChild(h('div', 'card empty-state', [
                h('div', 'big', '○'),
                h('div', 't', 'No records in this module'),
                h('div', 'd', 'Records you fill daily will appear here.'),
            ]));
            return;
        }

        const card = h('div', 'card');
        items.forEach(item => {
            const view = formatRecordForList(storeKey, item);
            const row = h('div', 'record-item');
            const main = h('div', 'record-main');
            const titleRow = h('div');
            titleRow.appendChild(h('span', 'record-title', view.title));
            if (item.verifiedBy) {
                titleRow.appendChild(h('span', 'badge badge-verified', '✓ ' + item.verifiedBy));
            }
            main.appendChild(titleRow);
            if (view.sub) {
                main.appendChild(h('div', 'record-sub', view.sub));
            }
            main.appendChild(h('div', 'record-meta', item.date));
            main.style.cursor = 'pointer';
            main.addEventListener('click', () => showDetail(storeKey, item));
            row.appendChild(main);
            card.appendChild(row);
        });
        container.appendChild(card);
    }

    render();
}

function formatRecordForList(key, item) {
    if (key === 'fridge') {
        const fmt = v => (v === null || v === undefined ? '—' : v + '°C');
        return { title: item.unitName, sub: 'AM ' + fmt(item.am) + ' / PM ' + fmt(item.pm) };
    }
    if (key === 'cleaning_log') {
        return { title: item.itemName, sub: (item.time || '—') + ' · ' + (item.initials || '—') };
    }
    const mod = MODULES[key];
    const view = mod.listItem(item);
    return { title: view.title, sub: (view.subs || []).filter(Boolean).join(' · ') };
}

function recordDetailLines(key, item) {
    if (key === 'fridge') {
        const fmt = v => (v === null || v === undefined ? '' : v + '°C');
        return [
            ['Unit', item.unitName],
            ['Date', item.date],
            ['AM temperature', fmt(item.am)],
            ['PM temperature', fmt(item.pm)],
            ['Comments', item.comments],
            ['Signed', item.sign],
        ];
    }
    if (key === 'cleaning_log') {
        return [
            ['Item', item.itemName],
            ['Date', item.date],
            ['Time', item.time],
            ['Initials', item.initials],
        ];
    }
    return MODULES[key].detail(item);
}

function showDetail(key, item) {
    openSheet('Record detail', (sheet) => {
        const lines = recordDetailLines(key, item);
        lines.push(['Manager verified', item.verifiedBy || 'Not yet verified']);
        lines.forEach(pair => {
            if (pair[1] === null || pair[1] === undefined || String(pair[1]).trim() === '') {
                return;
            }
            sheet.appendChild(h('div', 'detail-line', [
                h('div', 'detail-label', pair[0]),
                h('div', 'detail-value', String(pair[1])),
            ]));
        });

        const actions = document.createElement('div');
        actions.className = 'sheet-actions';
        const closeBtn = h('button', 'btn', 'Close');
        closeBtn.addEventListener('click', closeSheet);
        const verifyBtn = h('button', 'btn ' + (item.verifiedBy ? 'btn-verify' : 'btn-primary'), item.verifiedBy ? 'Unverify' : 'Verify');
        verifyBtn.addEventListener('click', () => {
            if (item.verifiedBy) {
                Store.unverify(key, item.id);
                toast('Verification removed');
                closeSheet();
                route();
            } else {
                promptDialog('Manager check', 'Your initials', Store.kvGet('managerName', ''), value => {
                    Store.verify(key, item.id, value);
                    toast('Verified');
                    closeSheet();
                    route();
                });
            }
        });
        const delBtn = h('button', 'btn btn-danger', 'Delete');
        delBtn.addEventListener('click', () => {
            confirmDialog('Delete record', 'This record will be permanently removed. Continue?', () => {
                Store.remove(key, item.id);
                closeSheet();
                route();
            });
        });
        actions.appendChild(closeBtn);
        actions.appendChild(verifyBtn);
        actions.appendChild(delBtn);
        sheet.appendChild(actions);
    });
}

/* ---------------- backup export / import ---------------- */

const EXPORT_SHEETS = [
    { key: 'delivery', name: 'SC1 Delivery' },
    { key: 'fridge', name: 'SC2 Fridge Temps' },
    { key: 'cooking', name: 'SC3 Cooking' },
    { key: 'hothold', name: 'SC4 Hot Hold' },
    { key: 'calibration', name: 'CAL Thermometer Calibration' },
    { key: 'hygiene', name: 'SC5 Hygiene Inspection' },
    { key: 'training', name: 'SC6 Training' },
    { key: 'fitness', name: 'SC7 Fitness to Work' },
    { key: 'customer_delivery', name: 'SC9 Customer Delivery' },
    { key: 'cleaning_log', name: 'Cleaning Daily Log' },
];

function buildSheetAoa(key, items) {
    // One wide table: union of detail labels as headers, one row per record.
    const rows = items.map(item => {
        const lines = recordDetailLines(key, item).slice();
        lines.push(['Manager verified', item.verifiedBy || 'Not verified']);
        return lines;
    });
    const headers = [];
    rows.forEach(line => {
        line.forEach(pair => {
            if (headers.indexOf(pair[0]) === -1) {
                headers.push(pair[0]);
            }
        });
    });
    const aoa = [headers.concat('Verified at (local)')];
    rows.forEach(line => {
        const map = {};
        line.forEach(pair => {
            map[pair[0]] = pair[1] === null || pair[1] === undefined ? '' : String(pair[1]);
        });
        aoa.push(headers.map(label => map[label] || ''));
    });
    return { aoa, headers };
}

function exportExcel() {
    try {
        if (typeof XLSX === 'undefined') {
            toast('Excel library not loaded');
            return;
        }
        const wb = XLSX.utils.book_new();
        let sheetCount = 0;
        EXPORT_SHEETS.forEach(sheet => {
            const items = Store.list(sheet.key);
            if (items.length === 0) {
                return;
            }
            const built = buildSheetAoa(sheet.key, items);
            // append verified-at column values
            const headerRow = built.aoa[0];
            const verifyIdx = headerRow.indexOf('Verified at (local)');
            items.forEach((item, i) => {
                const row = built.aoa[i + 1];
                row[verifyIdx] = item.verifiedAt ? new Date(item.verifiedAt).toLocaleString() : '';
            });
            const ws = XLSX.utils.aoa_to_sheet(built.aoa);
            ws['!cols'] = headerRow.map(label => ({ wch: Math.max(12, Math.min(40, String(label).length + 8)) }));
            XLSX.utils.book_append_sheet(wb, ws, sheet.name.slice(0, 31));
            sheetCount += 1;
        });
        if (sheetCount === 0) {
            toast('No records to export yet');
            return;
        }
        const summary = [
            ['Safe Catering Records — Excel Export'],
            ['Exported', new Date().toLocaleString()],
            ['Sheets', sheetCount],
            [''],
            ['Sheet', 'Records'],
        ];
        EXPORT_SHEETS.forEach(sheet => {
            const n = Store.list(sheet.key).length;
            if (n > 0) {
                summary.push([sheet.name, n]);
            }
        });
        const summaryWs = XLSX.utils.aoa_to_sheet(summary);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        XLSX.writeFile(wb, 'safe-catering-records-' + Store.todayString() + '.xlsx');
        toast('Excel file downloaded');
    } catch (error) {
        toast('Excel export failed: ' + error.message);
    }
}

function exportBackup() {
    try {
        const payload = Store.exportAll();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'safe-catering-backup-' + Store.todayString() + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast('Backup file downloaded');
    } catch (error) {
        toast('Export failed: ' + error.message);
    }
}

function importBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                if (Store.importAll(data)) {
                    toast('Backup restored');
                    route();
                } else {
                    toast('Not a valid Safe Catering backup file');
                }
            } catch (error) {
                toast('Could not read backup file');
            }
        };
        reader.readAsText(file);
    });
    input.click();
}

/* ---------------- router ---------------- */

const ROUTES = {
    '': renderDashboard,
    delivery: makeListPage('delivery'),
    fridge: CustomViews.fridgePage,
    cooking: makeListPage('cooking'),
    hothold: makeListPage('hothold'),
    calibration: makeListPage('calibration'),
    hygiene: makeListPage('hygiene'),
    training: makeListPage('training'),
    fitness: makeListPage('fitness'),
    customer_delivery: makeListPage('customer_delivery'),
    cleaning: CustomViews.cleaningPage,
    records: renderRecords,
};

function route() {
    const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');
    const renderPage = ROUTES[hash] || renderDashboard;
    const container = document.getElementById('app');
    renderPage(container);
    window.scrollTo(0, 0);
}

document.getElementById('backBtn').addEventListener('click', () => {
    if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
        window.location.hash = '#/';
    } else {
        history.back();
    }
});

document.getElementById('homeBtn').addEventListener('click', () => {
    window.location.hash = '#/';
});

window.addEventListener('hashchange', route);
route();
