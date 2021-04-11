const utilsIncomplete = document.querySelector('#utils__incomplete');
const utilsCompleted = document.querySelector('#utils__completed');
const toolbarSelector = document.querySelector('#toolbar__selector');
const selectorInp = document.querySelector('#toolbar__selector input');
const toolbarComplete = document.querySelector('#toolbar__complete');
const toolbarDuplicate = document.querySelector('#toolbar__duplicate');
const toolbarDelete = document.querySelector('#toolbar__delete');
const toolbarDate = document.querySelector('#toolbar__date');
const toolbarList = document.querySelector('#toolbar__list');
const tasksForm = document.querySelector('#tasks-section__form');
const tasksFormInputs = tasksForm.querySelectorAll('input');
const tasksContainer = document.querySelector('#tasks-section__tasks-container');

const toolbarDateIds = ['date_today', 'date_tomorrow', 'date_plus-2', 'date_plus-3', 'date_plus-4', 'date_one-week'];
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let taskCount = 0;                  // # of tasks in tasks container
let viewCompleted = false;          // Display completed/incomplete sections
let selectedListId = null;          // Holds the Id for the currently selected list in lists container
let selectedTaskIds = new Set();    // Holds the Ids for the currently selected tasks in tasks container
let selectedQueries = [];           // Holds the currently applied query objects


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
const setTasksActiveState = (state, taskIds = []) => {
    let tasks = [];

    // Populate tasks with task elements
    if (taskIds.length === 0)
        tasks = document.querySelectorAll('.tasks-section__task')
    else {
        for (let taskId of taskIds)
            tasks.push(document.querySelector(`#task-${taskId}`));
    }

    for (let task of tasks) {
        const taskInp = document.querySelector(`#${task.id}  input`)
        if (state === true) {
            task.classList.add('active');
            taskInp.checked = true;
            selectedTaskIds.add(task.id.split('-')[1]);
        }
        else if (state === false) {
            task.classList.remove('active');
            taskInp.checked = false;
            selectedTaskIds.delete(task.id.split('-')[1]);
        }
        else {
            // Flip active state
            if (task.classList.contains('active')) {
                task.classList.remove('active');
                taskInp.checked = false;
                selectedTaskIds.delete(task.id.split('-')[1]);
            }
            else {
                task.classList.add('active');
                taskInp.checked = true;
                selectedTaskIds.add(task.id.split('-')[1]);
            }
        }
    }

    // Alter input checkbox on toolbar_selector based on how many tasks are selected
    const selectedTaskCount = document.querySelectorAll('.tasks-section__task.active').length;
    selectorInp.checked = false;
    selectorInp.indeterminate = false;
    if (taskCount === selectedTaskCount)
        selectorInp.checked = true;
    else if (selectedTaskCount > 0)
        selectorInp.indeterminate = true;
}

const getTasks = async (listId = null) => {
    if (listId === null) listId = '';
    const res = await fetch(`/tasks?listId=${listId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!res.ok)
        throw res;
    const { tasks } = await res.json();
    return tasks;
}

const filterTasks = async (tasks, query) => {
    const filteredTasks = tasks.filter(task => {
        for (let prop in query) {
            // Filter by include search term
            // Options Obj = { term, includeNotes }
            if (prop === 'include') {
                let { term, includeNotes } = query[prop];
                if (term !== null) {
                    term = term.toLowerCase();
                    const inName = task['name'].toLowerCase().includes(term);
                    if (includeNotes) {
                        if (!inName && !task['notes'].toLowerCase().includes(term))
                            return false;
                    }
                    else if (!inName)
                        return false;
                }
            }
            // Filter by exclude search term
            // Options Obj = { term, includeNotes }
            else if (prop === 'exclude') {
                let { term, includeNotes } = query[prop];
                if (term !== null) {
                    term = term.toLowerCase();
                    const inName = task['name'].toLowerCase().includes(term);
                    if (includeNotes) {
                        if (inName || task['notes'].toLowerCase().includes(term))
                            return false;
                    }
                    else if (inName)
                        return false;
                }
            }
            // Filter by date property with options
            // Options Obj = { value, comparison }
            else if (prop === 'date' && typeof query[prop] === 'object') {
                let { value, comparison } = query[prop];
                if (value !== null) {
                    let taskDate = Date.parse(task['date']);
                    let propDate = Date.parse(value);

                    if (comparison === 'isAfter') {
                        if (taskDate >= propDate)
                            return false;
                    }
                }
            }
            // Check if a query prop/value matches a task prop/value
            else if (task[prop] !== query[prop])
                return false;
        }
        return true;
    });

    return filteredTasks;
}

const displayTasks = async (tasks, keepSelected = false) => {
    if (!tasks) tasks = await getTasks();

    // Update taskCount now bc they will not be filtered further before display
    taskCount = tasks.length;

    // Reset selectedTaskIds
    if (!keepSelected)
        selectedTaskIds = new Set();

    const tasksHtml = tasks.map(task => {
        let taskStr = '';

        if (task.sets) taskStr += `${task.sets} `;
        if (task.reps) taskStr += `x ${task.reps} `;
        taskStr += task.name;
        if (task.duration) {
            const dur = convertSeconds(task.duration);
            taskStr += ` for ${dur[0]}:${dur[1]}:${dur[2]}`
        }

        return `<div id=task-${task.id} class="tasks-section__task">
                    <div class="handle">
                        <i class="fas fa-ellipsis-v"></i>
                    </div>
                    <div class='divider'></div>
                    <input type="checkbox">
                    <div class="card-text">${taskStr}</div>
                </div>`;
    });

    tasksContainer.innerHTML = tasksHtml.join('');

    setTasksActiveState(true, selectedTaskIds);
};

const updateTasksSection = async (listId = null, queries = [], keepSelected = false) => {
    let tasks = await getTasks(listId);
    for (let query of queries)
        tasks = await filterTasks(tasks, query);
    await displayTasks(tasks, keepSelected);
}

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

const getDateString = (dateArr) => {
    dateArr[1]++;
    if (dateArr[1] < 10) dateArr[1] = `0${dateArr[1]}`;
    if (dateArr[2] < 10) dateArr[2] = `0${dateArr[2]}`;
    return dateArr.join('-');
}

///////////////////////////////////////////////////////////////////////////////////////////
// Event Handlers

const utilsIncompleteHandler = async (ev) => {
    closeDropdowns();
    viewCompleted = false;
    tasksForm.style.display = 'initial';
    console.log('incomplete');
}

const utilsCompletedHandler = async (ev) => {
    closeDropdowns();
    viewCompleted = true;
    tasksForm.style.display = 'none';
    console.log('completed');
}

const toolbarSelectorHandler = async (ev) => {
    ev.stopPropagation();
    closeDropdowns();

    const dates = getDateInfo();

    // Handle user click of input checkbox
    if (ev.target.type === 'checkbox') {
        if (ev.target.checked)
            setTasksActiveState(true);
        else
            setTasksActiveState(false);
    }
    else {
        if (ev.target.classList.contains('selector_opt')) {
            if (ev.target.id === 'selector_all') {
                setTasksActiveState(true);
            }
            else {
                setTasksActiveState(false);

                if (ev.target.id === 'selector_today') {
                    let date = dates['date_today'][0];
                    date = getDateString(date);

                    let tasks = await getTasks(selectedListId);
                    tasks = await filterTasks(tasks, { date: date });

                    const taskIds = tasks.map(task => task.id);

                    setTasksActiveState(false);
                    if (taskIds.length)
                        setTasksActiveState(true, taskIds);
                }
                else if (ev.target.id === 'selector_tomorrow') {
                    let date = dates['date_tomorrow'][0];
                    date = getDateString(date);

                    let tasks = await getTasks(selectedListId);
                    tasks = await filterTasks(tasks, { date: date });

                    const taskIds = tasks.map(task => task.id);

                    setTasksActiveState(false);
                    if (taskIds.length)
                        setTasksActiveState(true, taskIds);
                }
                else if (ev.target.id === 'selector_overdue') {
                    let dateToday = dates['date_today'][0];
                    dateToday = getDateString(dateToday);

                    let tasks = await getTasks(selectedListId);
                    tasks = await filterTasks(tasks, {
                        date: {
                            value: dateToday,
                            comparison: 'isAfter'
                        }
                    });

                    const taskIds = tasks.map(task => task.id);

                    setTasksActiveState(false);
                    if (taskIds.length)
                        setTasksActiveState(true, taskIds);
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

            const res = await fetch(`/tasks/${id}`, initObj);
            if (!res.ok) {
                console.log('RES NOT OKAY')
            }
            else {
                if (res.status !== 204) {
                    const obj = await res.json();
                    responses.push(obj);
                }

            }
        }
        catch (err) {
            console.log('Error:', err)
        }
    }

    // Re-display the tasks
    updateTasksSection(selectedListId, [], true);

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
            const res = await fetch('/tasks', {
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
                updateTasksSection(selectedListId, [], true);
            }
        }
        catch (err) {
            console.log('Error:', err)
        }
    }
};

const toolbarDeleteHandler = async (ev) => {
    fetchHelper('DELETE');
    selectedTaskIds = new Set();
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
        else {
            const date = dates[currTarget.id][0];
            res = await fetchHelper('PATCH', {
                date: getDateString(date)
            });
        }

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
        listId: selectedListId,
        reps: formData.get('reps'),
        sets: formData.get('sets'),
        name: formData.get('name'),
        duration: formData.get('duration')
    };

    try {
        const res = await fetch('/tasks', {
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
            updateTasksSection(selectedListId, [], true);
        }
    }
    catch (err) {
        console.log('Error:', err)
    }
}

const taskSelectHandler = (ev) => {
    const currTask = ev.target.closest('.tasks-section__task');
    const taskId = currTask.id.split('-')[1];

    // Handle user click of input checkbox
    if (ev.target.type === 'checkbox') {
        setTasksActiveState(null, [taskId]);
    }
    // Handle user click of clickable task area
    else {
        setTasksActiveState(false);
        setTasksActiveState(true, [taskId]);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////
// Event Listeners

utilsIncomplete.addEventListener('click', utilsIncompleteHandler);
utilsCompleted.addEventListener('click', utilsCompletedHandler);
toolbarSelector.addEventListener('click', toolbarSelectorHandler);
toolbarComplete.addEventListener('click', toolbarCompleteHandler);
toolbarDuplicate.addEventListener('click', toolbarDuplicateHandler);
toolbarDelete.addEventListener('click', toolbarDeleteHandler);
toolbarDate.addEventListener('click', toolbarDateHandler);
toolbarList.addEventListener('click', toolbarListHandler);
tasksForm.addEventListener('submit', taskFormSubmitHandler);
tasksContainer.addEventListener('click', taskSelectHandler);
window.addEventListener('click', closeDropdowns);

updateTasksSection(selectedListId, selectedQueries, true);

new Sortable(tasksContainer, {
    handle: '.handle',
    animation: 150,
    dragoverBubble: false
});
