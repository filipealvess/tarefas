// ---------- CONSTANTS ---------- //
const DEFAULT_LISTS = ['Pessoal', 'Profissional'];


// ---------- MODULES ---------- //
const storage = {
    get: (key) => (JSON.parse(localStorage.getItem(key)) || null),
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
};

const dom = {
    get: (selector) => document.querySelector(selector),
    all: (selector) => Array.from(document.querySelectorAll(selector)),
};

const dragAndDrop = {
    getTarget: function(target) {
        const allTasks = Array.from(tasks.children);

        return allTasks.find(node => (
            node === target ||
            Array.from(node.childNodes).includes(target)
        ));
    },

    dragStart: function(event) {
        draggedNode = event.target;
        event.target.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
    },

    dragOver: function(event) {
        event.preventDefault();

        const target = this.getTarget(event.target);

        if (target !== draggedNode) {
            target?.classList?.add('over');
        }
    },

    dragLeave: function(event) {
        const target = this.getTarget(event.target);
        target?.classList?.remove('over');
    },

    drop: function(event) {
        event.preventDefault();

        const target = this.getTarget(event.target);
        target?.classList?.remove('over');

        if (event.target === draggedNode) {
            return;
        }

        const stored = storage.get('TASKS');
        const targetId = target.getAttribute('data-task-id');
        const targetChecked = target.getAttribute('data-checked');
        const draggedId = draggedNode.getAttribute('data-task-id');
        const draggedChecked = draggedNode.getAttribute('data-checked');

        if (target === undefined ||
            stored === null ||
            draggedChecked === 'true' ||
            targetChecked === 'true') {
            return;
        }

        let draggedIndex;
        let targetIndex;

        stored.forEach((task, index) => {
            if (task.id === draggedId) {
                draggedIndex = index;
            }

            if (task.id === targetId) {
                targetIndex = index;
            }
        });

        if (draggedIndex === undefined || targetIndex === undefined) {
            return;
        }

        const updated = [...stored];
        [updated[draggedIndex], updated[targetIndex]] = [updated[targetIndex], updated[draggedIndex]];

        storage.set('TASKS', updated);
        fillTasks();
    },

    dragEnd: function(event) {
      event.target.classList.remove('dragging');
    }
};


// ---------- ELEMENTS ---------- //
const lists = dom.get('.lists');
const newListInput = dom.get('#new-list-input');
const newListButton = dom.get('#new-list-button');
const tasks = dom.get('.tasks');
const newTaskInput = dom.get('#new-task-input');
const newTaskButton = dom.get('#new-task-button');
const tasksCounter = dom.get('#tasks-counter');
const clearButton = dom.get('#clear-button');


// ---------- STATES ---------- //
let currentList = null;
let draggedNode = null;


// ---------- FUNCTIONS - LISTS ---------- //
function setListsEmpty() {
    lists.innerHTML = `<p class="feedback">Nenhuma lista cadastrada</p>`;
}

function selectList(id, text) {
    const list = lists.querySelector(`.list-button[data-list-id="${id}"]`);

    if (list === null) {
        return;
    }

    const all = dom.all('.list-button');

    all.forEach(list => list.classList.remove('active'));
    list.classList.add('active');
    currentList = text;
    fillTasks();
}

function deleteList(id, text) {
    const list = dom.get(`.list-button[data-list-id="${id}"]`);

    if (list === null) {
        return;
    }

    const sibling = list.nextElementSibling ?? list.previousElementSibling;

    if (list.classList.contains('active') === true && sibling !== null) {
        sibling.classList.add('active');
        currentList = sibling.getAttribute('data-list-text');
    }

    const stored = storage.get('LISTS');

    if (stored !== null) {
        storage.set('LISTS', stored.filter(list => list !== text));
    }

    list.remove();

    if (sibling === null) {
        setListsEmpty();
        currentList = '';
    }

    fillTasks();
}

function addList(text, index) {
    lists.insertAdjacentHTML('beforeend', `
        <button
            class="list-button ${index === 0 ? 'active' : ''}"
            data-list-id="${index}"
            data-list-text="${text}"
            onClick="selectList(${index}, \'${text}\')"
        >
            <span>${text}</span>
            <div onClick="deleteList(${index}, \'${text}\')">
                <i data-feather="x"></i>
            </div>
        </button>
    `);
}

function fillLists() {
    const stored = storage.get('LISTS');
    const values = stored === null ? DEFAULT_LISTS : stored;

    if (values.length === 0) {
        setListsEmpty();
        return;
    }

    values.forEach((list, index) => addList(list, index));

    currentList = values[0];

    if (stored === null) {
        storage.set('LISTS', DEFAULT_LISTS);
    }
}

function submitList(event) {
    event.preventDefault();

    const stored = storage.get('LISTS') ?? [];
    const lastList = dom.all('.list-button').at(-1);
    let index = 0;

    if (lastList !== undefined) {
        index = lastList.getAttribute('data-list-id') ?? 0;
    }

    if (stored.length === 0) {
        lists.innerHTML = '';
    }

    const text = newListInput.value;
    const id = Number(index) + 1;

    addList(text, id);
    newListInput.value = '';
    feather.replace();
    storage.set('LISTS', [...stored, text]);

    if (stored.length === 0) {
        selectList(id, text);
    }
}

// ---------- FUNCTIONS - TASKS ---------- //
function updateTasksCounter(total, checked) {
    tasksCounter.innerHTML = `${checked} de ${total}`;
    clearButton.disabled = Number(checked) === 0;
}

function clearChecked() {
    const stored = storage.get('TASKS') ?? [];

    storage.set('TASKS', stored.filter(task => (
        task.list !== currentList || task.checked === false
    )));

    fillTasks();
}

function setTasksEmpty() {
    tasks.innerHTML = `<p class="feedback">Nenhuma tarefa cadastrada</p>`;
}

function checkTask(id) {
    const stored = storage.get('TASKS') ?? [];

    storage.set('TASKS', stored.map(task => ({
        ...task,
        checked: task.id === id ? !task.checked : task.checked,
    })));

    fillTasks();
}

function deleteTask(id) {
    const stored = storage.get('TASKS') ?? [];

    storage.set('TASKS', stored.filter(task => task.id !== id));

    fillTasks();
}

function updateTask(id) {
    const input = dom.get(`[data-task-id="${id}"] input`);

    if (input === null) {
        return;
    }

    const stored = storage.get('TASKS') ?? [];
    const value = input.value.trim().replaceAll('\'', '"');

    storage.set('TASKS', stored.map(task => ({
        ...task,
        text: task.id === id ? value || 'Tarefa' : task.text,
    })));

    fillTasks();
}

function enableUpdateTask(event, id) {
    const tag = event.target.tagName.toLowerCase();

    if (['li', 'p'].includes(tag) === false) {
        return;
    }

    const p = dom.get(`[data-task-id="${id}"] p`);

    if (p === null) {
        return;
    }

    p.insertAdjacentHTML('beforebegin', `
        <input
            autofocus
            value='${p.innerText}'
            placeholder="Tarefa"
            onBlur="updateTask(\'${id}\')"
            onKeyDown="event.key === 'Enter' && updateTask(\'${id}\')"
        />
    `);

    p.previousElementSibling?.focus();
    p.remove();
}

function addTask(task) {
    tasks.insertAdjacentHTML('beforeend', `
        <li
            class="task"
            data-task-id="${task.id}"
            data-checked="${task.checked}"
            draggable=${task.checked === true ? 'false' : 'true'}
            onClick="enableUpdateTask(event, \'${task.id}\')"
            onDragStart="dragAndDrop.dragStart(event)"
            onDragOver="dragAndDrop.dragOver(event)"
            onDragEnd="dragAndDrop.dragEnd(event)"
            onDragLeave="dragAndDrop.dragLeave(event)"
            onDrop="dragAndDrop.drop(event)"
        >
            <button onClick="checkTask(\'${task.id}\')">
                <i data-feather="${task.checked === true ? 'check-square' : 'square'}"></i>
            </button>
            
            <p>${task.text}</p>

            <button class="delete" onClick="deleteTask(\'${task.id}\')">
                <i data-feather="x"></i>
            </button>
        </li>
    `);
}

function fillTasks() {
    const stored = storage.get('TASKS') ?? [];

    tasks.innerHTML = '';

    const filtered = stored.filter(task => task.list === currentList);

    if (filtered.length === 0) {
        setTasksEmpty();
        updateTasksCounter(0, 0);
        return;
    }

    const checked = [];
    const unchecked = [];

    filtered.forEach(task => {
        if (task.checked === true) {
            checked.push(task);
        }

        else {
            unchecked.push(task);
        }
    });

    const all = [...unchecked, ...checked];
    all.forEach(task => addTask(task));
    updateTasksCounter(all.length, checked.length);

    feather.replace();
}

function submitTask(event) {
    event.preventDefault();

    const stored = storage.get('TASKS') ?? [];

    const id = newTaskInput.value.replace(/[\s_]/g, '-').replace(/['"]/g, '');
    const task = {
        id: `${id}_${currentList}`,
        text: newTaskInput.value.replaceAll('\'', '"'),
        list: currentList,
        checked: false,
    };

    newTaskInput.value = '';
    newTaskButton.disabled = true;

    storage.set('TASKS', [...stored, task]);

    fillTasks();
}

// ---------- EVENTS ---------- //
window.addEventListener('load', () => {
    fillLists();
    fillTasks();

    feather.replace();
});

window.addEventListener('keypress', (event) => {
    if (event.target.nodeName.toUpperCase() !== 'BODY' ||
        Number(event.key) === 0 ||
        Number.isNaN(Number(event.key)) === true) {
        return;
    }

    const lists = dom.all('.list-button');
    const selected = lists.at(Number(event.key) - 1);

    if (selected === undefined) {
        return;
    }

    const id = selected.getAttribute('data-list-id');
    const text = selected.getAttribute('data-list-text');

    selectList(id, text);
});

newListInput.addEventListener('input', (event) => {
    newListButton.disabled = event.target.value.trim().length === 0;
});

newTaskInput.addEventListener('input', (event) => {
    newTaskButton.disabled = event.target.value.trim().length === 0;
});
