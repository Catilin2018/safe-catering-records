/* Safe Catering Records — module definitions (forms, validation, list rendering) */

const HYGIENE_SECTIONS = [
    {
        key: 'rooms',
        title: 'Hygiene of Food Rooms & Equipment',
        items: [
            'Are food rooms and equipment in good condition and well maintained?',
            'Are food rooms clean and tidy and do staff clean as they go, including difficult areas?',
            'Is equipment easy to clean and kept in a clean condition?',
            'Are all food and hand contact surfaces (work surfaces, slicers, fridge handles, probe thermometers) in good condition and cleaned/disinfected regularly?',
            'Are suitable BS EN approved cleaning chemicals available and stored correctly, and are proper cleaning methods used?',
            'Are separate cleaning cloths used in clean areas? If re-used, are they laundered in a boil wash?',
        ],
    },
    {
        key: 'storage',
        title: 'Food Storage',
        items: [
            'Are deliveries appropriately stored immediately?',
            'Is ready-to-eat food stored above/separate from raw food in the fridges and freezers?',
            'Is food in fridges/freezers covered?',
            'Are high risk foods date coded, codes checked daily and stock rotated?',
            'Are dried goods stored correctly (suitable room, off the floor, covered containers)?',
            'Is outer packaging removed from ready-to-eat food before being placed into a clean area?',
            'Are freezers working properly?',
            'Are fridges and freezers defrosted regularly?',
        ],
    },
    {
        key: 'handling',
        title: 'Food Handling Practices',
        items: [
            'Are ready-to-eat foods prepared in separate clean areas?',
            'Are separate utensils and equipment used for ready-to-eat foods unless disinfected in a dishwasher?',
            'Is the dishwasher in good working order and regularly serviced?',
            'Is wrapping and packaging for ready-to-eat food kept in the clean area?',
            'Do separate staff handle ready-to-eat food, or are controls followed for clothing change and hand washing?',
            'Is separate complex equipment provided for ready-to-eat food and located in the clean area?',
            'Are staff handling food as little as possible (e.g. using tongs)?',
            'Is colour coded equipment (utensils, chopping boards) correctly used?',
            'Are high risk foods prepared in small batches and placed in the fridge immediately after preparation?',
            'Is food cooled as quickly as possible, away from raw food and other contamination sources?',
            'Are vegetables/fruit/salads trimmed and washed thoroughly unless labelled ready-to-eat?',
            'Are ready-to-eat foods kept separate on display and screened from customers?',
            'Are adequate clean utensils available for self service?',
            'Are frozen foods defrosted safely?',
            'Are controls in place to prevent contamination by chemicals or foreign bodies (glass, packaging, bolts, rust)?',
            'Are staff aware of food allergy hazards?',
            'Do staff wash hands after handling raw food and before touching surfaces such as the cash register?',
            'Is a separate probe thermometer used for ready-to-eat foods, properly cleaned/disinfected before use?',
        ],
    },
    {
        key: 'personal',
        title: 'Personal Hygiene',
        items: [
            'Are staff fit to work, wearing clean suitable protective clothing and following personal hygiene rules, particularly hand washing?',
            'Are wash hand basins clean with hot water, soap and hygienic hand drying facilities?',
            'Are wash hand basins used for hand washing only, and is effective handwashing regularly observed?',
            'Are staff toilets and changing facilities clean and tidy?',
        ],
    },
    {
        key: 'pest',
        title: 'Pest Control',
        items: [
            'Are premises pest proofed and free from any signs of pests?',
            'Where necessary, are external doors/windows fitted with suitable flyscreens?',
            'Are insectocutors (if provided) properly maintained?',
            'Is food properly protected from risk of contamination by pests?',
        ],
    },
    {
        key: 'waste',
        title: 'Waste Control',
        items: [
            'Is waste in food rooms stored correctly?',
            'Is food waste stored correctly outside and is the refuse area kept clean?',
            'Is unfit food clearly labelled and stored separately from other foods?',
        ],
    },
    {
        key: 'checks',
        title: 'Checks and Record Keeping',
        items: [
            'Are all checks properly taken and recorded?',
            'Has appropriate corrective action been taken where necessary?',
            'Are record sheets up-to-date, checked and verified?',
            'Are equipment time/temperature combinations regularly cross-checked?',
        ],
    },
    {
        key: 'review',
        title: 'Review (4 weekly)',
        items: [
            'Any new suppliers and approved list updated?',
            'Any new menu items and steps in Safe Catering updated?',
            'Any new food handling methods or equipment and steps in Safe Catering updated?',
        ],
    },
];

const TRAINING_TOPICS = [
    'Basic hygiene rules',
    'Purchase / delivery / receipt',
    'Storage',
    'Preparation and handling',
    'Cold serve / display',
    'Defrosting',
    'Cooking',
    'Cooling / freezing',
    'Reheating',
    'Hot hold / display',
    'Transport and delivery',
    'Physical / chemical contamination',
    'Food allergies',
    'Cleaning',
    'Pest control',
    'Waste',
    'Maintenance',
    'Personal hygiene rules',
    'Thermometer use',
    'Safe Catering pack overview',
];

const FITNESS_QUESTIONS = [
    { id: 'q1', label: 'Have you suffered from diarrhoea and/or vomiting within the last 48 hours?' },
    { id: 'q1b', label: 'If no: in the last 48 hours have you taken any medication to control diarrhoea and/or vomiting?' },
    { id: 'q2i', label: 'At present are you suffering from infected wounds, skin infections or sores?' },
    { id: 'q2ii', label: 'At present are you suffering from boils, styes or septic fingers?' },
    { id: 'q2iii', label: 'At present do you have any discharge from eye, ear or gums/mouth?' },
    { id: 'q3', label: 'Have you ever had, or are you known to be a carrier of, typhoid or paratyphoid?' },
    { id: 'q4', label: 'In the last 21 days have you been in contact with anyone, at home or abroad, who may have been suffering from typhoid or paratyphoid?' },
];

const CLEANING_FREQUENCIES = ['Daily', 'Every shift', 'Weekly', 'Other'];

function tempOrNull(value) {
    const raw = String(value === null || value === undefined ? '' : value).trim();
    if (raw === '') {
        return null;
    }
    const num = Number(raw);
    return Number.isNaN(num) ? null : num;
}

const MODULES = {
    delivery: {
        code: 'SC1',
        name: 'Food Delivery Records',
        subtitle: 'Record high-risk ready-to-eat foods on arrival. Chilled food max 8°C, hot food min 63°C. For large deliveries, check one or two items.',
        fields: [
            { k: 'date', label: 'Date', type: 'date', defaultToday: true },
            { k: 'foodItem', label: 'Food item (high-risk ready-to-eat)', type: 'text', required: true, placeholder: 'e.g. Cooked ham, smoked salmon' },
            { k: 'supplier', label: 'Supplied by', type: 'text', placeholder: 'Supplier name' },
            { k: 'type', label: 'Food type', type: 'select', options: ['Chilled', 'Hot', 'Ambient'], default: 'Chilled' },
            { k: 'temp', label: 'Temperature (°C)', type: 'number', placeholder: 'e.g. 4' },
            { k: 'useBy', label: 'Use-by date', type: 'date' },
            { k: 'batchCode', label: 'Batch code', type: 'text', placeholder: 'e.g. LOT20261112' },
            { k: 'comments', label: 'Comments / action', type: 'textarea', placeholder: 'Any problems, rejected items, actions taken…' },
            { k: 'sign', label: 'Signature (initials)', type: 'text', required: true, placeholder: 'Your initials', maxlength: 8 },
        ],
        listItem(item) {
            let badge = { cls: 'badge-ok', text: 'Temp OK' };
            if (item.temp !== null && item.temp !== undefined) {
                if (item.type === 'Chilled' && Number(item.temp) > 8) {
                    badge = { cls: 'badge-warn', text: 'Temp out of range' };
                } else if (item.type === 'Hot' && Number(item.temp) < 63) {
                    badge = { cls: 'badge-warn', text: 'Temp out of range' };
                }
            }
            const subs = [
                (item.supplier || 'Unknown supplier') + ' · ' + (item.type || 'Chilled') + ' · ' + (item.temp !== null && item.temp !== undefined ? item.temp + '°C' : 'no temp'),
                item.useBy ? 'Use by ' + item.useBy : 'No use-by date',
            ];
            if (item.batchCode) {
                subs.push('Batch code: ' + item.batchCode);
            }
            if (item.comments) {
                subs.push(item.comments);
            }
            return {
                title: item.foodItem,
                badges: [badge],
                subs,
                meta: item.date + ' · Signed ' + (item.sign || ''),
            };
        },
        detail(item) {
            return [
                ['Date', item.date],
                ['Food item', item.foodItem],
                ['Supplied by', item.supplier],
                ['Food type', item.type],
                ['Temperature', item.temp !== null && item.temp !== undefined ? item.temp + '°C' : ''],
                ['Use-by date', item.useBy],
                ['Batch code', item.batchCode],
                ['Comments / action', item.comments],
                ['Signed', item.sign],
            ];
        },
    },

    cooking: {
        code: 'SC3',
        name: 'Cooking / Cooling / Re-heating Records',
        subtitle: 'Core temperature must be above 75°C. Time started is optional if core temperature is checked.',
        fields: [
            { k: 'date', label: 'Date', type: 'date', defaultToday: true },
            { k: 'food', label: 'Food', type: 'text', required: true, placeholder: 'e.g. Chicken casserole' },
            { k: 'timeStarted', label: 'Time started (optional)', type: 'time' },
            { k: 'timeFinished', label: 'Time finished', type: 'time' },
            { k: 'coreTemp', label: 'Core temperature (°C) — must be above 75', type: 'number' },
            { k: 'coolingDate', label: 'Cooling — date into chill', type: 'date' },
            { k: 'coolingTime', label: 'Cooling — time into chill', type: 'time' },
            { k: 'coolingMethod', label: 'Cooling method', type: 'select', options: ['Blast chiller', 'Fridge', 'Freezer'], default: 'Blast chiller' },
            { k: 'reheatDate', label: 'Re-heating — date', type: 'date' },
            { k: 'reheatTemp', label: 'Re-heating — core temp (°C)', type: 'number' },
            { k: 'comments', label: 'Comments / action', type: 'textarea', placeholder: 'Any problems, actions taken…' },
            { k: 'sign', label: 'Signature (initials)', type: 'text', required: true, placeholder: 'Your initials', maxlength: 8 },
        ],
        listItem(item) {
            const flagged = item.coreTemp !== null && item.coreTemp !== undefined && Number(item.coreTemp) < 75;
            const subs = [
                item.coreTemp !== null && item.coreTemp !== undefined ? 'Core temp ' + item.coreTemp + '°C' + (flagged ? ' (below 75°C)' : ' ✓') : 'Cooking not recorded',
            ];
            if (item.coolingTime) {
                subs.push('Cooled into ' + (item.coolingMethod || 'chill') + ' at ' + item.coolingTime);
            }
            if (item.reheatTemp !== null && item.reheatTemp !== undefined) {
                subs.push('Reheated to ' + item.reheatTemp + '°C');
            }
            if (item.comments) {
                subs.push(item.comments);
            }
            return {
                title: item.food,
                badges: [{ cls: flagged ? 'badge-warn' : 'badge-ok', text: flagged ? 'Below 75°C' : 'Temp OK' }],
                subs,
                meta: item.date + ' · Signed ' + (item.sign || ''),
            };
        },
        detail(item) {
            return [
                ['Date', item.date],
                ['Food', item.food],
                ['Time started', item.timeStarted],
                ['Time finished', item.timeFinished],
                ['Core temperature', item.coreTemp !== null && item.coreTemp !== undefined ? item.coreTemp + '°C' : ''],
                ['Cooling date', item.coolingDate],
                ['Time into chill', item.coolingTime],
                ['Cooling method', item.coolingMethod],
                ['Reheat date', item.reheatDate],
                ['Reheat temp', item.reheatTemp !== null && item.reheatTemp !== undefined ? item.reheatTemp + '°C' : ''],
                ['Comments', item.comments],
                ['Signed', item.sign],
            ];
        },
    },

    hothold: {
        code: 'SC4',
        name: 'Hot Hold / Display Records',
        subtitle: 'For food held hot for more than 2 hours. Keep hot food above 63°C — record core temperature after 2, 4 and 6 hours on display.',
        fields: [
            { k: 'date', label: 'Date', type: 'date', defaultToday: true },
            { k: 'food', label: 'Food', type: 'text', required: true, placeholder: 'e.g. Soup of the day' },
            { k: 'timeInto', label: 'Time into hot hold', type: 'time' },
            { k: 'temp2', label: 'Core temp after 2 hrs (°C)', type: 'number' },
            { k: 'temp4', label: 'Core temp after 4 hrs (°C)', type: 'number' },
            { k: 'temp6', label: 'Core temp after 6 hrs (°C)', type: 'number' },
            { k: 'comments', label: 'Comments / action', type: 'textarea', placeholder: 'Any food below 63°C — action taken…' },
            { k: 'sign', label: 'Signature (initials)', type: 'text', required: true, placeholder: 'Your initials', maxlength: 8 },
        ],
        listItem(item) {
            const temps = [];
            let flagged = false;
            [['2h', item.temp2], ['4h', item.temp4], ['6h', item.temp6]].forEach(pair => {
                if (pair[1] !== null && pair[1] !== undefined) {
                    if (Number(pair[1]) < 63) {
                        flagged = true;
                    }
                    temps.push(pair[0] + ' ' + pair[1] + '°C');
                }
            });
            const subs = [
                item.timeInto ? 'Into hot hold at ' + item.timeInto : 'No time recorded',
                temps.length ? temps.join(' · ') : 'No temperature checks recorded',
            ];
            if (item.comments) {
                subs.push(item.comments);
            }
            return {
                title: item.food,
                badges: [{ cls: flagged ? 'badge-warn' : 'badge-ok', text: flagged ? 'Below 63°C' : 'Temp OK' }],
                subs,
                meta: item.date + ' · Signed ' + (item.sign || ''),
            };
        },
        detail(item) {
            return [
                ['Date', item.date],
                ['Food', item.food],
                ['Time into hot hold', item.timeInto],
                ['Temp after 2 hrs', item.temp2 !== null && item.temp2 !== undefined ? item.temp2 + '°C' : ''],
                ['Temp after 4 hrs', item.temp4 !== null && item.temp4 !== undefined ? item.temp4 + '°C' : ''],
                ['Temp after 6 hrs', item.temp6 !== null && item.temp6 !== undefined ? item.temp6 + '°C' : ''],
                ['Comments', item.comments],
                ['Signed', item.sign],
            ];
        },
    },

    customer_delivery: {
        code: 'SC9',
        name: 'Customer Delivery Record',
        subtitle: 'Monitor ready-to-eat food deliveries to customers. Chilled max 8°C (preferably 5°C or below), hot food min 63°C. Raw and ready-to-eat foods must be separated during transport.',
        fields: [
            { k: 'date', label: 'Date', type: 'date', defaultToday: true },
            { k: 'foods', label: 'Foods delivered (ready-to-eat only)', type: 'text', required: true, placeholder: 'e.g. Sandwich platters' },
            { k: 'quantity', label: 'Quantity', type: 'text', placeholder: 'e.g. 4 boxes' },
            { k: 'batchCode', label: 'Batch code / use-by date', type: 'text', placeholder: 'Reference' },
            { k: 'customer', label: 'Customer details (name / address)', type: 'text', required: true },
            { k: 'deliveryTemp', label: 'Delivery temperature (°C)', type: 'number', placeholder: 'e.g. 5' },
            { k: 'separation', label: 'Adequate separation of raw & ready-to-eat foods', type: 'yesno' },
            { k: 'comments', label: 'Comments', type: 'textarea', placeholder: 'Anything noteworthy…' },
            { k: 'sign', label: 'Signature (initials)', type: 'text', required: true, placeholder: 'Your initials', maxlength: 8 },
        ],
        listItem(item) {
            const badges = [];
            if (item.deliveryTemp !== null && item.deliveryTemp !== undefined) {
                const inDanger = Number(item.deliveryTemp) > 8 && Number(item.deliveryTemp) < 63;
                badges.push({ cls: inDanger ? 'badge-warn' : 'badge-ok', text: inDanger ? 'Temp in danger zone' : 'Temp OK' });
            }
            if (item.separation === 'No') {
                badges.push({ cls: 'badge-warn', text: 'Separation fail' });
            }
            const subs = [
                (item.customer || 'Unknown customer') + (item.quantity ? ' · qty ' + item.quantity : ''),
                item.batchCode ? 'Batch/use-by: ' + item.batchCode : '',
                item.deliveryTemp !== null && item.deliveryTemp !== undefined ? item.deliveryTemp + '°C (chilled max 8°C · hot min 63°C)' : 'No temp recorded',
                item.separation ? 'Raw & RTE separated: ' + item.separation : 'Raw/RTE separation not recorded',
            ].filter(Boolean);
            if (item.comments) {
                subs.push(item.comments);
            }
            return {
                title: item.foods,
                badges,
                subs,
                meta: item.date + ' · Signed ' + (item.sign || ''),
            };
        },
        detail(item) {
            return [
                ['Date', item.date],
                ['Foods delivered', item.foods],
                ['Quantity', item.quantity],
                ['Batch / use-by', item.batchCode],
                ['Customer', item.customer],
                ['Delivery temperature', item.deliveryTemp !== null && item.deliveryTemp !== undefined ? item.deliveryTemp + '°C' : ''],
                ['Raw/RTE separation', item.separation],
                ['Comments', item.comments],
                ['Signed', item.sign],
            ];
        },
    },

    hygiene: {
        code: 'SC5',
        name: 'Hygiene Inspection Checklist',
        subtitle: 'Simple checks of the premises carried out by the proprietor or manager — weekly, fortnightly or monthly. Review items apply every 4 weeks.',
        custom: 'hygiene',
        fields: [
            { k: 'date', label: 'Date', type: 'date', defaultToday: true },
            { k: 'frequency', label: 'Frequency', type: 'select', options: ['Weekly', 'Fortnightly', 'Monthly'], default: 'Weekly' },
            { k: 'checklist', label: '', type: 'hygienecheck' },
            { k: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Your name', defaultFrom: 'managerName' },
            { k: 'position', label: 'Position', type: 'text', placeholder: 'e.g. Owner, Manager' },
            { k: 'sign', label: 'Signature (initials)', type: 'text', required: true, placeholder: 'Your initials', maxlength: 8 },
        ],
        listItem(item) {
            const answers = item.answers || {};
            const total = Object.keys(answers).length;
            let noCount = 0;
            Object.keys(answers).forEach(key => {
                if (answers[key] === 'no') {
                    noCount += 1;
                }
            });
            return {
                title: item.frequency + ' inspection',
                badges: [{ cls: noCount > 0 ? 'badge-warn' : 'badge-ok', text: noCount > 0 ? 'Action needed' : 'Satisfactory' }],
                subs: [
                    total + ' checks answered · ' + (noCount === 0 ? 'all satisfactory' : noCount + ' need action'),
                    'By ' + (item.name || '') + (item.position ? ' (' + item.position + ')' : ''),
                ],
                meta: item.date + ' · Signed ' + (item.sign || ''),
            };
        },
        detail(item) {
            const answers = item.answers || {};
            const noAnswers = Object.keys(answers).filter(id => answers[id] === 'no');
            const lines = [
                ['Date', item.date],
                ['Frequency', item.frequency],
                ['Carried out by', (item.name || '') + (item.position ? ' (' + item.position + ')' : '')],
                ['Questions answered', String(Object.keys(answers).length)],
                ['"No" answers', noAnswers.length === 0 ? 'None — all satisfactory' : noAnswers.join(', ')],
            ];
            const actions = item.sectionActions || {};
            Object.keys(actions).forEach(section => {
                if (actions[section]) {
                    lines.push(['Action (' + section + ')', actions[section]]);
                }
            });
            lines.push(['Signed', item.sign]);
            return lines;
        },
    },

    fitness: {
        code: 'SC7',
        name: 'Fitness to Work Assessment',
        subtitle: 'For existing food handlers, new staff on recruitment, and return to work after illness. If any answer is "yes", the person must not handle food — seek advice from your EHO or doctor.',
        custom: 'fitness',
        fields: [
            { k: 'date', label: 'Date of assessment', type: 'date', defaultToday: true },
            { k: 'employeeName', label: 'Employee name', type: 'text', required: true, placeholder: 'Full name' },
            { k: 'reason', label: 'Reason for assessment', type: 'select', options: ['Existing food handler', 'Pre-employment assessment', 'Return to work after illness'], default: 'Existing food handler' },
            { k: 'questions', label: '', type: 'fitnessquestions' },
            { k: 'actionTaken', label: 'Action taken', type: 'textarea', placeholder: 'What happened next…' },
            { k: 'managerName', label: 'Owner / manager', type: 'text', defaultFrom: 'managerName' },
            { k: 'managerDate', label: 'Manager date', type: 'date' },
            { k: 'employeeSign', label: 'Employee signature (initials)', type: 'text', required: true, placeholder: 'I declare the information given is correct', maxlength: 8 },
        ],
        listItem(item) {
            const answers = item.answers || {};
            let yesCount = 0;
            Object.keys(answers).forEach(key => {
                if (answers[key] === 'yes') {
                    yesCount += 1;
                }
            });
            return {
                title: item.employeeName,
                badges: [{ cls: item.anyYes ? 'badge-warn' : 'badge-ok', text: item.anyYes ? 'Not fit — do not handle food' : 'Fit for work' }],
                subs: [
                    item.reason + ' · ' + (yesCount === 0 ? 'no risk factors declared' : yesCount + ' "yes" answer(s)'),
                    item.actionTaken ? 'Action: ' + item.actionTaken : '',
                ].filter(Boolean),
                meta: item.date + ' · Signed ' + (item.employeeSign || ''),
            };
        },
        detail(item) {
            return [
                ['Employee', item.employeeName],
                ['Date', item.date],
                ['Reason', item.reason],
                ['Any "yes" answers', item.anyYes ? 'Yes — not fit to handle food' : 'No — fit for work'],
                ['Action taken', item.actionTaken],
                ['Manager', item.managerName],
                ['Manager date', item.managerDate],
                ['Employee signed', item.employeeSign],
            ];
        },
    },

    training: {
        code: 'SC6',
        name: 'Hygiene Training Records',
        subtitle: 'Record in-house hygiene instruction and further training for each member of staff. Copies of certificates should be kept with this record.',
        custom: 'training',
        fields: [
            { k: 'date', label: 'Date', type: 'date', defaultToday: true },
            { k: 'staffName', label: 'Staff member', type: 'staffpicker', required: true },
            { k: 'trainer', label: 'Trainer', type: 'text', placeholder: 'Who gave the training', defaultFrom: 'managerName' },
            { k: 'topics', label: 'Training topics (select all covered)', type: 'topics', required: true },
            { k: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Optional notes, certificates awarded…' },
            { k: 'sign', label: 'Employee signature (initials)', type: 'text', required: true, placeholder: 'Initials', maxlength: 8 },
        ],
        listItem(item) {
            const topics = Array.isArray(item.topics) ? item.topics : [];
            return {
                title: item.staffName,
                badges: [],
                subs: [
                    topics.join(' · '),
                    item.trainer ? 'Trainer: ' + item.trainer : '',
                    item.notes || '',
                ].filter(Boolean),
                meta: item.date + ' · Signed ' + (item.sign || ''),
            };
        },
        detail(item) {
            return [
                ['Staff member', item.staffName],
                ['Date', item.date],
                ['Trainer', item.trainer],
                ['Topics', Array.isArray(item.topics) ? item.topics.join(', ') : ''],
                ['Notes', item.notes],
                ['Employee signed', item.sign],
            ];
        },
    },
    calibration: {
        code: 'CAL',
        name: 'Thermometer Calibration Record',
        subtitle: 'Probe thermometers must be checked regularly for accuracy. Test against an ice point (0°C) or boiling water (100°C). If the error is more than ±1°C, adjust, service or replace the thermometer before use.',
        fields: [
            { k: 'date', label: 'Date', type: 'date', defaultToday: true },
            { k: 'thermometer', label: 'Thermometer', type: 'text', required: true, placeholder: 'e.g. Probe thermometer #1' },
            { k: 'method', label: 'Calibration method', type: 'select', options: ['Ice point (0°C)', 'Boiling water (100°C)', 'Against reference thermometer'], default: 'Ice point (0°C)' },
            { k: 'reading', label: 'Reading (°C)', type: 'number', placeholder: 'e.g. 1' },
            { k: 'action', label: 'Result / action taken', type: 'select', options: ['Pass — no adjustment needed', 'Adjusted and re-tested OK', 'Sent for service / calibration', 'Replaced'], default: 'Pass — no adjustment needed' },
            { k: 'nextDue', label: 'Next calibration due', type: 'date' },
            { k: 'comments', label: 'Comments', type: 'textarea', placeholder: 'Optional notes…' },
            { k: 'sign', label: 'Signature (initials)', type: 'text', required: true, placeholder: 'Your initials', maxlength: 8 },
        ],
        listItem(item) {
            const expected = item.method === 'Boiling water (100°C)' ? 100 : (item.method === 'Ice point (0°C)' ? 0 : null);
            let badge = null;
            if (item.reading !== null && item.reading !== undefined && expected !== null) {
                const error = Math.abs(Number(item.reading) - expected);
                if (error > 1) {
                    badge = { cls: 'badge-warn', text: 'Error ' + error.toFixed(1) + '°C — action needed' };
                } else {
                    badge = { cls: 'badge-ok', text: 'Accurate (±' + error.toFixed(1) + '°C)' };
                }
            }
            const subs = [
                item.method,
                item.reading !== null && item.reading !== undefined ? 'Reading ' + item.reading + '°C' + (expected !== null ? ' (expected ' + expected + '°C)' : '') : 'No reading recorded',
                item.action,
                item.nextDue ? 'Next due ' + item.nextDue : '',
            ].filter(Boolean);
            if (item.comments) {
                subs.push(item.comments);
            }
            return {
                title: item.thermometer,
                badges: badge ? [badge] : [],
                subs,
                meta: item.date + ' · Signed ' + (item.sign || ''),
            };
        },
        detail(item) {
            const expected = item.method === 'Boiling water (100°C)' ? 100 : (item.method === 'Ice point (0°C)' ? 0 : null);
            let errorText = '';
            if (item.reading !== null && item.reading !== undefined && expected !== null) {
                const error = Math.abs(Number(item.reading) - expected);
                errorText = error.toFixed(1) + '°C' + (error > 1 ? ' (over tolerance)' : ' (within tolerance)');
            }
            return [
                ['Date', item.date],
                ['Thermometer', item.thermometer],
                ['Method', item.method],
                ['Reading', item.reading !== null && item.reading !== undefined ? item.reading + '°C' : ''],
                ['Expected', expected !== null ? expected + '°C' : ''],
                ['Error', errorText],
                ['Result / action', item.action],
                ['Next calibration due', item.nextDue],
                ['Comments', item.comments],
                ['Signed', item.sign],
            ];
        },
    },
};

const FRIDGE_MAX_UNITS = 8;
const RECORD_MODULE_ORDER = ['delivery', 'fridge', 'cooking', 'hothold', 'calibration', 'hygiene', 'training', 'fitness', 'customer_delivery', 'cleaning_log'];
