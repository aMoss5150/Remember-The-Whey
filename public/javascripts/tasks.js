const toolbarSelector = document.querySelector('#toolbar__selector');
const toolbarComplete = document.querySelector('#toolbar__complete');
const toolbarDuplicate = document.querySelector('#toolbar__duplicate');
const toolbarDelete = document.querySelector('#toolbar__delete');
const toolbarDate = document.querySelector('#toolbar__date');
const toolbarList = document.querySelector('#toolbar__list');
const tasksForm = document.querySelector('#tasks-section__form');
const tasksFormInputs = tasksForm.querySelectorAll('input');
const tasksContainer = document.querySelector('#tasks-section__tasks-container');

let selectedTaskIds = new Set();
const toolbarDateIds = ['date_today', 'date_tomorrow', 'date_plus-2', 'date_plus-3', 'date_plus-4', 'date_one-week'];
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

///////////////////////////////////////////////////////////////////////////////////////////
// Helper functions

const clearTaskFields = () => {
    for (let i = 1; i < tasksFormInputs.length; i++) {
        tasksFormInputs[i].value = '';
    }
}

const closeDropdowns = () => {
    const dropdownMenus = document.querySelectorAll('.dropdown-content');

    for (let dropdown of dropdownMenus) {
        dropdown.classList.remove('open');
    }
}

const convertSeconds = seconds => {
    seconds = parseInt(seconds, 10);

    let sec = seconds % 60;
    if (sec < 10) sec = `0${sec}`;
    let min = Math.floor(seconds / 60) % 60;
    if (min < 10) min = `0${min}`;
    let hr = Math.floor(seconds / 3600) % 60;
    if (hr < 10) hr = `0${hr}`;

    return [hr, min, sec];
}

// Add or remove active state based on val
// @param {bool} val
const setTaskActiveState = (task, val) => {
    if (val) {
        task.classList.add('active');
        task.children[1].checked = true;
        selectedTaskIds.add(task.id.split('-')[1]);
    }
    else if (val === false) {
        task.classList.remove('active');
        task.children[1].checked = false;
        selectedTaskIds.delete(task.id.split('-')[1]);
    }
    else {
        // Flip active state
        if (task.classList.contains('active')) {
            task.classList.remove('active');
            task.children[1].checked = false;
            selectedTaskIds.delete(task.id.split('-')[1]);
        }
        else {
            task.classList.add('active');
            task.children[1].checked = true;
            selectedTaskIds.add(task.id.split('-')[1]);
        }
    }
}

const setAllTasksActiveState = (val) => {
    const taskDivs = document.querySelectorAll('.tasks-section__task');

    for (let task of taskDivs)
        setTaskActiveState(task, val);
}

const getAllTasks = async () => {
    const res = await fetch('http://localhost:8080/tasks', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });
    const { tasks } = await res.json();

    // Reset selectedTaskIds
    selectedTaskIds = new Set();

    const tasksHtml = tasks.map(task => {
        let taskStr = '';
        if (task.sets)
            taskStr += `${task.sets} `;
        if (task.reps)
            taskStr += `x ${task.reps} `;
        taskStr += task.name;
        if (task.duration) {
            const dur = convertSeconds(task.duration);
            taskStr += ` for ${dur[0]}:${dur[1]}:${dur[2]}`
        }
       
        return `<div id=task-${task.id} class="tasks-section__task">
                    <div class="handle">
                        <i class="fas fa-ellipsis-v"></i>
                    </div>
                    <input type="checkbox">
                    <div class="card-text">${taskStr}</div>
                </div>`;
    });
    tasksContainer.innerHTML = tasksHtml.join('');
};

const getDateInfo = () => {
    const date = new Date();
    const dates = {};
    for (let i = 0; i < 5; i++) {
        dates[toolbarDateIds[i]] = [[date.getFullYear(), date.getMonth(), date.getDate()], date.getDay()];
        date.setDate(date.getDate() + 1);
    }
    date.setDate(date.getDate() + 3);
    dates[toolbarDateIds[5]] = [[date.getFullYear(), date.getMonth(), date.getDate()], date.getDay()];
    return dates;
}

///////////////////////////////////////////////////////////////////////////////////////////
// Event Handlers

const toolbarSelectorHandler = (ev) => {
    const inp = document.querySelector('#toolbar__selector input');

    ev.stopPropagation();
    closeDropdowns();

    // Handle user click of input checkbox
    if (ev.target.type === 'checkbox') {
        if (ev.target.checked)
            setAllTasksActiveState(true);
        else
            setAllTasksActiveState(false);
    }
    else {
        if (ev.target.classList.contains('selector_opt')) {
            if (ev.target.id === 'selector_all') {
                setAllTasksActiveState(true);
                inp.checked = true;
            }
            else {
                setAllTasksActiveState(false);
                inp.checked = false;

                console.log("TODO - today, tomorrow, overdue handlers")

                if (ev.target.id === 'selector_today') {

                }
                else if (ev.target.id === 'selector_tomorrow') {

                }
                else if (ev.target.id === 'selector_overdue') {

                }
            }

            closeDropdowns();
        }
        else {
            document.querySelector('#toolbar__selector .dropdown-content').classList.add('open');
        }
    }
}

const fetchHelper = async (method, body = {}) => {
    const formData = new FormData(tasksForm);
    const responses = [];

    for (let id of selectedTaskIds) {
        try {
            const initObj = {
                method: method.toUpperCase(),
                headers: {
                    "Content-Type": "application/json"
                }
            }
            // Only attach a body to initObj on non-GET requests
            if (method.toUpperCase() !== 'GET') {
                body['_csrf'] = formData.get('_csrf');
                initObj['body'] = JSON.stringify(body);
            }

            const res = await fetch(`http://localhost:8080/tasks/${id}`, initObj);
            if (!res.ok) {
                console.log('RES NOT OKAY')
            }
            else {
                if (res.status !== 204) {
                    const obj = await res.json();
                    responses.push(obj);
                }
                await getAllTasks();
            }
        }
        catch (err) {
            console.log('Error:', err)
        }
    }

    return responses;
}

const toolbarCompleteHandler = async (ev) => {
    fetchHelper('PATCH', { complete: true });
};

const toolbarDuplicateHandler = async (ev) => {
    const formData = new FormData(tasksForm);
    const tasks = await fetchHelper('GET');

    for (let task of tasks) {
        const body = {
            _csrf: formData.get('_csrf'),
            listId: task.listId,
            name: task.name,
            sets: task.sets,
            reps: task.reps,
            duration: task.duration,
            complete: task.complete,
            date: task.date,
            notes: task.notes
        }
        try {
            const res = await fetch('http://localhost:8080/tasks', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                console.log('RES NOT OKAY')
            }
            else {
                await getAllTasks();
            }
        }
        catch (err) {
            console.log('Error:', err)
        }
    }
};

const toolbarDeleteHandler = async (ev) => {
    fetchHelper('DELETE');
};



const toolbarDateHandler = async (ev) => {
    ev.stopPropagation();
    closeDropdowns();

    const dates = getDateInfo();

    const currTarget = ev.target.closest('A');

    if (currTarget) {
        let res;
        if (currTarget.id === 'date_no-date')
            res = await fetchHelper('PATCH', { date: null });
        else if (currTarget.id === 'date_calendar') {
            console.log('TODO');
        }
        else
            res = await fetchHelper('PATCH', { date: dates[currTarget.id][0].join('-') });

        closeDropdowns();
    }
    else {
        const dropdownContent = document.querySelector('#toolbar__date .dropdown-content');
        let dateOptionsHTML = `<a id='date_today' class='date_opt'>
                                    <div> Today </div>
                                    <div> ${months[dates['date_today'][0][1]]} ${dates['date_today'][0][2]} </div>
                                </a>
                                <a id='date_tomorrow' class='date_opt'>
                                    <div> Tomorrow </div>
                                    <div> ${months[dates['date_tomorrow'][0][1]]} ${dates['date_tomorrow'][0][2]} </div>
                                </a>`;
        for (let i = 2; i < 5; i++) {
            dateOptionsHTML += `<a id='date_plus-${i}' class='date_opt'>
                                    <div> ${weekDays[dates['date_plus-' + i][1]]} </div>
                                    <div> ${months[dates['date_plus-' + i][0][1]]} ${dates['date_plus-' + i][0][2]} </div>
                                </a>`
        }
        dateOptionsHTML += `<a id='date_one-week' class='date_opt'>
                                <div> 1 Week </div>
                                <div> ${months[dates['date_one-week'][0][1]]} ${dates['date_one-week'][0][2]} </div>
                            </a>
                            <a id='date_no-date' class='date_opt'>
                                <div> No Date </div>
                                <div> Never </div>
                            </a>
                            <hr>
                            <a id='date_calendar' class='date_opt'>
                                <div> Calendar Picker </div>
                                <i class="fas fa-caret-right"></i>
                            </a>`;

        dropdownContent.innerHTML = dateOptionsHTML;
        dropdownContent.classList.add('open');
    }
}

const toolbarListHandler = async (ev) => {

    ev.stopPropagation();
    closeDropdowns();

    // TODO - Need list api routes to continue working here

    if (ev.target.id === 'a') {

    }
    else if (ev.target.id === 'aa') {

    }
    else {
        document.querySelector('#toolbar__list .dropdown-content').classList.add('open');
    }
};

const taskFormSubmitHandler = async (ev) => {
    ev.preventDefault();

    const formData = new FormData(tasksForm);

    const body = {
        _csrf: formData.get('_csrf'),
        reps: formData.get('reps'),
        sets: formData.get('sets'),
        name: formData.get('name'),
        duration: formData.get('duration')
    };

    try {
        const res = await fetch('http://localhost:8080/tasks', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            console.log('RES NOT OKAY')
        }
        else {
            clearTaskFields();
            await getAllTasks();
        }
    }
    catch (err) {
        console.log('Error:', err)
    }
}

const taskSelectHandler = (ev) => {
    const currTask = ev.target.closest('.tasks-section__task');

    // Handle user click of input checkbox
    if (ev.target.type === 'checkbox') {
        setTaskActiveState(currTask);
    }
    // Handle user click of clickable task area
    else {
        setAllTasksActiveState(false);
        setTaskActiveState(currTask, true);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////
// Event Listeners

toolbarSelector.addEventListener('click', toolbarSelectorHandler);
toolbarComplete.addEventListener('click', toolbarCompleteHandler);
toolbarDuplicate.addEventListener('click', toolbarDuplicateHandler);
toolbarDelete.addEventListener('click', toolbarDeleteHandler);
toolbarDate.addEventListener('click', toolbarDateHandler);
toolbarList.addEventListener('click', toolbarListHandler);
tasksForm.addEventListener('submit', taskFormSubmitHandler);
tasksContainer.addEventListener('click', taskSelectHandler);
window.addEventListener('click', closeDropdowns);

getAllTasks();

new Sortable(tasksContainer, {
    handle: '.handle',
    animation: 150
});
