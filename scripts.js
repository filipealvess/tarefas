// ---------- CONSTANTS ---------- //
const DEFAULT_LISTS = ['Pessoal', 'Profissional'];


// ---------- ELEMENTS ---------- //
const lists = document.querySelector('.lists');
const newListInput = document.querySelector('#new-list-input');
const newListButton = document.querySelector('#new-list-button');
const tasks = document.querySelector('.tasks');
const newTaskInput = document.querySelector('#new-task-input');
const newTaskButton = document.querySelector('#new-task-button');
const tasksCounter = document.querySelector('#tasks-counter');
const clearButton = document.querySelector('#clear-button');


// ---------- STATES ---------- //
let currentList = null;


// ---------- MODULES ---------- //
const storage = {
    get: (key) => (JSON.parse(localStorage.getItem(key)) || null),
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
};


// ---------- FUNCTIONS - LISTS ---------- //
function setListsEmpty() {
    lists.innerHTML = `<p class="feedback">Nenhuma lista cadastrada</p>`;
}

function selectList(id, text) {
    const list = lists.querySelector(`.list-button[data-id="${id}"]`);

    if (list === null) {
        return;
    }

    const all = Array.from(document.querySelectorAll('.list-button'));

    all.forEach(list => list.classList.remove('active'));
    list.classList.add('active');
    currentList = text;
    fillTasks();
}

function deleteList(id, text) {
    const list = lists.querySelector(`.list-button[data-id="${id}"]`);

    if (list === null) {
        return;
    }

    const sibling = list.nextElementSibling ?? list.previousElementSibling;

    if (list.classList.contains('active') === true && sibling !== null) {
        sibling.classList.add('active');
        currentList = sibling.getAttribute('data-list');
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
            data-id="${index}"
            data-list="${text}"
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
    const lastList = Array.from(document.querySelectorAll('.list-button')).at(-1);
    let index = 0;

    if (lastList !== undefined) {
        index = lastList.getAttribute('data-id') ?? 0;
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

function checkTask(text) {
    const stored = storage.get('TASKS') ?? [];

    storage.set('TASKS', stored.map(task => ({
        ...task,
        checked: task.text === text ? !task.checked : task.checked,
    })));

    fillTasks();
}

function deleteTask(text) {
    const stored = storage.get('TASKS') ?? [];

    storage.set('TASKS', stored.filter(task => task.text !== text));

    fillTasks();
}

function addTask(text, checked) {
    tasks.insertAdjacentHTML('beforeend', `
        <li class="task" data-task="${text}" data-checked="${checked ?? false}">
            <button onClick="checkTask(\'${text}\')">
                <i data-feather="${checked === true ? 'check-square' : 'square'}"></i>
            </button>
            
            <p>${text}</p>

            <button class="delete" onClick="deleteTask(\'${text}\')">
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

    all.forEach(task => {
        addTask(task.text, task.checked);
    });

    updateTasksCounter(all.length, checked.length);

    feather.replace();
}

function submitTask(event) {
    event.preventDefault();

    const stored = storage.get('TASKS') ?? [];
    const filtered = stored.filter(task => task.list === currentList);

    if (filtered.length === 0) {
        tasks.innerHTML = '';
    }

    const task = {
        text: newTaskInput.value,
        checked: false,
        list: currentList,
    };

    addTask(task.text);
    feather.replace();
    newTaskInput.value = '';
    newTaskButton.disabled = true;

    storage.set('TASKS', [...stored, task]);

    const [checked, total] = tasksCounter.innerHTML.split(' de ');
    updateTasksCounter(Number(total) + 1, checked);
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

    const lists = Array.from(document.querySelectorAll('.list-button'));
    const selected = lists.at(Number(event.key) - 1);

    if (selected === undefined) {
        return;
    }

    const id = selected.getAttribute('data-id');
    const text = selected.getAttribute('data-list');

    selectList(id, text);
});

newListInput.addEventListener('input', (event) => {
    newListButton.disabled = event.target.value.trim().length === 0;
});

newTaskInput.addEventListener('input', (event) => {
    newTaskButton.disabled = event.target.value.trim().length === 0;
});
