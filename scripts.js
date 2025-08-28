// ---------- CONSTANTS ---------- //
const DEFAULT_LISTS = ['Pessoal', 'Profissional'];


// ---------- ELEMENTS ---------- //
const lists = document.querySelector('.lists');


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


// ---------- EVENTS ---------- //
window.addEventListener('load', () => {
    fillLists();

    feather.replace();
});
