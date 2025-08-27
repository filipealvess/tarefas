// ---------- CONSTANTS ---------- //
const DEFAULT_LISTS = ['Pessoal', 'Profissional'];


// ---------- ELEMENTS ---------- //
const lists = document.querySelector('.lists');


// ---------- STATES ---------- //
let currentList = null;


// ---------- FUNCTIONS ---------- //
function addList(text, active) {
    lists.insertAdjacentHTML('beforeend', `
        <button class="list-button ${active === true ? 'active' : ''}">
            <span>${text}</span>
            <div><i data-feather="x"></i></div>
        </button>
    `);
}

function fillLists() {
    const stored = localStorage.getItem('LISTS');
    const values = stored === null ? DEFAULT_LISTS : JSON.parse(stored);

    if (values.length === 0) {
        lists.innerHTML = `<p class="feedback">Nenhuma lista cadastrada</p>`;
        return;
    }

    values.forEach((list, index) => addList(list, index === 0));

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
