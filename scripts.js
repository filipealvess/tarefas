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


// ---------- STATES ---------- //
let currentList = null;


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
    }

    const stored = JSON.parse(localStorage.getItem('LISTS'));

    if (stored !== null) {
        localStorage.setItem(
            'LISTS',
            JSON.stringify(stored.filter(list => list !== text)),
        );
    }

    list.remove();

    if (sibling === null) {
        setListsEmpty();
    }
}

function addList(text, index) {
    lists.insertAdjacentHTML('beforeend', `
        <button
            class="list-button ${index === 0 ? 'active' : ''}"
            data-id="${index}"
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
    const stored = localStorage.getItem('LISTS');
    const values = stored === null ? DEFAULT_LISTS : JSON.parse(stored);

    if (values.length === 0) {
        setListsEmpty();
        return;
    }

    values.forEach((list, index) => addList(list, index));

    currentList = values[0];

    if (stored === null) {
        localStorage.setItem('LISTS', JSON.stringify(DEFAULT_LISTS));
    }
}

function submitList(event) {
    event.preventDefault();

    const lastList = Array.from(document.querySelectorAll('.list-button')).at(-1);
    let index = 0;

    if (lastList !== undefined) {
        index = lastList.getAttribute('data-id') ?? 0;
    }

    const text = newListInput.value;
    addList(text, Number(index) + 1);
    newListInput.value = '';
    feather.replace();

    const stored = JSON.parse(localStorage.getItem('LISTS')) ?? [];
    localStorage.setItem('LISTS', JSON.stringify([...stored, text]));
}

// ---------- FUNCTIONS - TASKS ---------- //
function setTasksEmpty() {
    tasks.innerHTML = `<p class="feedback">Nenhuma tarefa cadastrada</p>`;
}

function addTask(text, checked) {
    tasks.insertAdjacentHTML('beforeend', `
        <li class="task" data-task="${text}" data-checked="${checked ?? false}">
            <button>
                <i data-feather="${checked === true ? 'check-square' : 'square'}"></i>
            </button>
            
            <p>${text}</p>

            <button class="delete">
                <i data-feather="x"></i>
            </button>
        </li>
    `);
}

function fillTasks() {
    let empty = true;
    const stored = JSON.parse(localStorage.getItem('TASKS')) ?? [];
    let checked = 0;
    let total = 0;

    tasks.innerHTML = '';

    stored.forEach(task => {
        if (task.list !== currentList) {
            return;
        }

        if (task.checked === true) {
            checked += 1;
        }

        empty = false;
        total += 1;
        addTask(task.text, task.checked);
    });

    tasksCounter.innerHTML = `${checked} de ${total}`;

    if (empty === true) {
        setTasksEmpty();
        return;
    }

    feather.replace();
}

function submitTask(event) {
    event.preventDefault();

    const stored = JSON.parse(localStorage.getItem('TASKS')) ?? [];

    if (stored.length === 0) {
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

    localStorage.setItem('TASKS', JSON.stringify([...stored, task]));

    const [checked, total] = tasksCounter.innerHTML.split(' de ');
    tasksCounter.innerHTML = `${checked} de ${Number(total) + 1}`;
}

// ---------- EVENTS ---------- //
window.addEventListener('load', () => {
    fillLists();
    fillTasks();

    feather.replace();
});

newListInput.addEventListener('input', (event) => {
    newListButton.disabled = event.target.value.trim().length === 0;
});

newTaskInput.addEventListener('input', (event) => {
    newTaskButton.disabled = event.target.value.trim().length === 0;
});
