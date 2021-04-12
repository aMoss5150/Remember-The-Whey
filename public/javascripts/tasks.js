
const utilsIncomplete = document.querySelector('#utils__incomplete');
const utilsCompleted = document.querySelector('#utils__completed');
const utilsSort = document.querySelector('#utils__sort');
const toolbarBtnGroup2 = document.querySelector('#toolbar_group-2');
const toolbarBtnGroup3 = document.querySelector('#toolbar_group-3');
const toolbarSelector = document.querySelector('#toolbar__selector');
const selectorInp = document.querySelector('#toolbar__selector input');
const toolbarComplete = document.querySelector('#toolbar__complete');
const toolbarUncomplete = document.querySelector('#toolbar__uncomplete');
const toolbarDuplicate = document.querySelector('#toolbar__duplicate');
const toolbarDelete = document.querySelector('#toolbar__delete');
const toolbarDate = document.querySelector('#toolbar__date');
const toolbarList = document.querySelector('#toolbar__list');
const tasksForm = document.querySelector('#tasks-section__form');
const tasksFormInputs = tasksForm.querySelectorAll('input');
const tasksContainer = document.querySelector('#tasks-section__tasks-container');
const tasksEmpties = document.querySelector('#tasks-section__tasks-empties');

const toolbarDateIds = ['date_today', 'date_tomorrow', 'date_plus-2', 'date_plus-3', 'date_plus-4', 'date_one-week'];
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let taskCount = 0;                  // # of tasks in tasks container
let viewCompleted = false;          // Display completed/incomplete sections
let _hiddenId = null;               // Holds the Id of the _hidden list which holds any task not assigned to another list
let selectedListId = null;          // Holds the Id for the currently selected list in lists container
let selectedTaskIds = new Set();    // Holds the Ids for the currently selected tasks in tasks container
let selectedQuery = {               // Holds the currently applied query object
    complete: false
};
let selectedOrder = {               // Holds the currently applied order object
    value: 'name',
    direction: 'ascending'
}

///////////////////////////////////////////////////////////////////////////////////////////
// Helper functions

const getHiddenId = async () => {
    const res = await fetch('/lists', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });
    const obj = await res.json();
    for (let list of obj['lists']) {
        if (list['name'] === '_hidden')
            return `${list['id']}`;
    }
}

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
        tasks = document.querySelectorAll('.tasks-section__task');
    else {
        for (let taskId of taskIds)
            tasks.push(document.querySelector(`#task-${taskId}`));
    }

    for (let task of tasks) {
        const taskInp = document.querySelector(`#${task.id} input`)
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
    if (taskCount === selectedTaskCount && selectedTaskCount > 0)
        selectorInp.checked = true;
    else if (selectedTaskCount > 0)
        selectorInp.indeterminate = true;

    // Show toolbar only when something is selected
    if (selectedTaskCount === 0) {
        toolbarBtnGroup2.style.visibility = 'hidden';
        toolbarBtnGroup3.style.visibility = 'hidden';
    }
    else {
        toolbarBtnGroup2.style.visibility = 'initial';
        toolbarBtnGroup3.style.visibility = 'initial';
    }
}

const getTasks = async (listId = null) => {
    if (listId === null || parseInt(listId, 10) === parseInt(_hiddenId, 10))
        listId = '';

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
                    if (includeNotes && task.notes) {
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
                    if (includeNotes && task.notes) {
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

const sortTasks = async (tasks, orderBy) => {
    if (orderBy['value'] === 'name') {
        if (orderBy['direction'] === 'ascending') {
            tasks.sort((a, b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase())
                    return -1;
                else if (a.name.toLowerCase() > b.name.toLowerCase())
                    return 1;
                return 0;
            })
        }
    }
    if (orderBy['value'] === 'date') {
        if (orderBy['direction'] === 'ascending') {
            tasks.sort((a, b) => {
                let aDate = Date.parse(a.date);
                let bDate = Date.parse(b.date);

                if (aDate < bDate)
                    return -1;
                else if (aDate > bDate)
                    return 1;
                return 0;
            })
        }
    }
};

const displayTasks = async (tasks, keepSelected = false) => {
    if (!tasks)
        tasks = await getTasks();

    // Update taskCount now bc they will not be filtered further before display
    taskCount = tasks.length;

    // Reset selectedTaskIds
    if (!keepSelected)
        selectedTaskIds = new Set();

    // console.log(selectedListId, selectedQuery, keepSelected)

    // Sort tasks before display
    sortTasks(tasks, selectedOrder);

    const tasksHtml = tasks.map(task => {
        let taskStr = '';

        if (task.sets) taskStr += `${task.sets} `;
        if (task.reps) taskStr += `x ${task.reps} `;
        taskStr += task.name;
        if (task.duration) {
            const dur = convertSeconds(task.duration);
            taskStr += ` for ${dur[0]}:${dur[1]}:${dur[2]}`
        }

        const dates = getDateInfo();
        console.log(dates)

        let dateStr = '<div></div>';
        if (task.date) {
            let currDate = Date.parse(task.date);
            let todayDate = Date.parse(getDateString(dates['date_today'][0]));
            console.log(currDate, todayDate )
            if (currDate === todayDate){
                dateStr = '<div style="color:#0060bf;">Today</div>';
            }
            else if (currDate === Date.parse(getDateString(dates['date_tomorrow'][0]))){
                dateStr = '<div style="color:#6e6e6e;">Tomorrow</div>';
            }

            else {
                let date = task.date.split('-');
                let color = '#ea5200;'; // Red
                if (currDate > todayDate)
                    color = '#b1b1b1'; // Grey
                dateStr = `<div style="color:${color}">${months[parseInt(date[1], 10) - 1]} ${date[2]}</div>`;
            }
        }

        let noteVisibile = '';
        if (task.notes)
            noteVisibile = 'active';

        return `<div id=task-${task.id} class="tasks-section__task">
                    <div>
                        <div class="handle">
                            <i class="fas fa-ellipsis-v"></i>
                        </div>
                        <div class='divider'></div>
                        <input type="checkbox">
                        <div>${taskStr}</div>
                    </div>
                    <div>
                        ${dateStr}
                        <div class='note-icon ${noteVisibile}'>
                            <i class='fas fa-sticky-note'></i>
                        </div>
                    </div>
                </div>`;
    });

    // Insert some empty task divs
    let emptiesHTML = '';
    for (let i = 0; i < 30; i++)
        emptiesHTML += `<div class="tasks-section__task-empty"></div>`;
    tasksEmpties.innerHTML = emptiesHTML;

    tasksContainer.innerHTML = tasksHtml.join('');

    setTasksActiveState(true, selectedTaskIds);
};

const updateTasksSection = async (listId = null, query = {}, keepSelected = false) => {
    let tasks = await getTasks(listId);
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
    if (viewCompleted) {
        viewCompleted = false;
        utilsIncomplete.classList.add('active');
        utilsCompleted.classList.remove('active');
        tasksForm.style.display = 'block';
        toolbarComplete.style.display = 'block';
        toolbarUncomplete.style.display = 'none';
        selectedQuery['complete'] = false;
        updateTasksSection(selectedListId, selectedQuery, false);
    }
}

const utilsCompletedHandler = async (ev) => {
    if (!viewCompleted) {
        viewCompleted = true;
        utilsIncomplete.classList.remove('active');
        utilsCompleted.classList.add('active');
        tasksForm.style.display = 'none';
        toolbarComplete.style.display = 'none';
        toolbarUncomplete.style.display = 'block';
        selectedQuery['complete'] = true;
        updateTasksSection(selectedListId, selectedQuery, false);
    }
}

const utilsSortHandler = async (ev) => {
    ev.stopPropagation();
    closeDropdowns();

    const currTarget = ev.target.closest('A');

    if (currTarget) {
        let res;
        if (currTarget.id === 'utils_name') {
            selectedOrder.value = 'name';
        }
        else if (currTarget.id === 'utils_date') {
            selectedOrder.value = 'date';
        }

        updateTasksSection(selectedListId, selectedQuery, true);

        closeDropdowns();
    }
    else {
        const dropdownContent = document.querySelector('#utils__sort .dropdown-content');
        dropdownContent.classList.add('open');
    }
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
                    tasks = await filterTasks(tasks, { date: date, complete: selectedQuery.complete });

                    const taskIds = tasks.map(task => task.id);

                    setTasksActiveState(false);
                    if (taskIds.length)
                        setTasksActiveState(true, taskIds);
                }
                else if (ev.target.id === 'selector_tomorrow') {
                    let date = dates['date_tomorrow'][0];
                    date = getDateString(date);

                    let tasks = await getTasks(selectedListId);
                    tasks = await filterTasks(tasks, { date: date, complete: selectedQuery.complete });

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
                        },
                        complete: selectedQuery.complete
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

    let multSlideout = document.querySelector('.summary__mult')
    let taskNumber = document.querySelector('.tasks__container-number')
    taskNumber.innerHTML = taskCount
    multSlideout.innerText = `${selectedTaskIds.size} tasks selected`
    multSlideout.style.display = "flex"
    closeSlideout()

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
    updateTasksSection(selectedListId, selectedQuery, true);

    return responses;
}

const toolbarCompleteHandler = async (ev) => {
    await fetchHelper('PATCH', { complete: true });
    selectedTaskIds = new Set();
    (async () => {
        let tasks = await getTasks();
        let compCount = 0
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].complete) {
                compCount++
            }
        }
        // console.log('tasks:', tasks)
        let taskNum = document.querySelector('.tasks__container-number')
        let completedNum = document.querySelector('.completed__container-number')
        completedNum.innerText = compCount
        taskNum.innerText = tasks.length
    })();
    closeSlideout()
};

const toolbarUncompleteHandler = async (ev) => {
    fetchHelper('PATCH', { complete: false });
    selectedTaskIds = new Set();

    (async () => {
        let tasks = await getTasks();
        let compCount = 0
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].complete) {
                compCount++
            }
        }
        // console.log('tasks:', tasks)
        let taskNum = document.querySelector('.tasks__container-number')
        let completedNum = document.querySelector('.completed__container-number')
        completedNum.innerText = compCount
        taskNum.innerText = tasks.length
    })();
    closeSlideout()

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
                updateTasksSection(selectedListId, selectedQuery, true);
            }
        }
        catch (err) {
            console.log('Error:', err)
        }
    }
    const pageLoadTaskUpdate = (async () => {
        let tasks = await getTasks();
        // console.log('tasks:', tasks)
        let taskNum = document.querySelector('.tasks__container-number')
        taskNum.innerText = tasks.length
    })()
};

const toolbarDeleteHandler = async (ev) => {
    await fetchHelper('DELETE');
    selectedTaskIds = new Set();
    const pageLoadTaskUpdate = (async () => {
        let tasks = await getTasks();
        // console.log('tasks:', tasks)
        let taskNum = document.querySelector('.tasks__container-number')
        taskNum.innerText = tasks.length
    })()
    closeSlideout()
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

    const currTarget = ev.target.closest('A');

    if (currTarget) {
        res = await fetchHelper('PATCH', { listId: currTarget.id.split('-')[1] });
        selectedTaskIds = new Set();
        closeDropdowns();
    }
    else {
        const dropdownContent = document.querySelector('#toolbar__list .dropdown-content');
        const res = await fetch(`/lists`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) throw res;
        const { lists } = await res.json();

        let dateOptionsHTML = [];

        for (let list of lists) {
            if (list.name === '_hidden')
                dateOptionsHTML.unshift(`<a id=edit_listId-${list.id}> Unassign </a>`);
            else
                dateOptionsHTML.push(`<a id=edit_listId-${list.id}> ${list.name} </a>`);
        }

        dropdownContent.innerHTML = dateOptionsHTML.join('');
        dropdownContent.classList.add('open');
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
            updateTasksSection(selectedListId, selectedQuery, true);
        }
    }
    catch (err) {
        console.log('Error:', err)
    }
}

const taskSelectHandler = async (ev) => {
    const currTask = ev.target.closest('.tasks-section__task');
    if (currTask === null)
        return;
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
    if (!selectedTaskIds.size) {
        closeSlideout()
        let multSlideout = document.querySelector('.summary__mult')
        let taskNumber = document.querySelector('.tasks__container-number')
        taskNumber.innerHTML = taskCount
        multSlideout.style.display = "none"
    }
    if (selectedTaskIds.size === 1) {
        openSlideout()
        let multSlideout = document.querySelector('.summary__mult')
        multSlideout.innerText = `${selectedTaskIds.size} tasks selected`
        multSlideout.style.display = "none"
        let taskNumber = document.querySelector('.tasks__container-number')
        taskNumber.innerHTML = taskCount
    }
    if (selectedTaskIds.size > 1) {
        closeSlideout()
        //grab whole slideout div, change in
        let multSlideout = document.querySelector('.summary__mult')

        let taskNumber = document.querySelector('.tasks__container-number')
        taskNumber.innerHTML = taskCount
        //!CLUTch-------------
        multSlideout.innerText = `${selectedTaskIds.size} tasks selected`
        multSlideout.style.display = "flex"

        // innerHtml = `${selectedTaskIds.size} tasks selected`
    }
}


///////////////////////////////////////////////////////////////////////////////////////////
//!--start--SUMMARY SECTION ANDREW

//!SLIDEOUT CONSOLIDATED
let slideout = document.querySelector('.summary__slideout')
let slideoutBtn = document.querySelector('.slideout__closebtn');
function openSlideout() {
    slideout.classList.remove("hidden__slide")
    slideout.classList.add("shown__slide")
}

function closeSlideout() {
    slideout.classList.add("hidden__slide")
    slideout.classList.remove('shown__slide')
}

slideoutBtn.addEventListener('click', closeSlideout)
//MAKE SURE TO IMPLEMENT ID CHANGE TO BE ABLE TO TOGGLE SINCE
//I WILL NOT BE ABLE TO USE THE ONCLICK EVENT!
//!TEST SLIDEOUT

// const testButton = document.querySelector('#button__test')

// testButton.addEventListener("click", () => {
//     closeSlideout()
// })


// console.log('closeSlideout:', closeSlideout)
document.addEventListener('DOMContentLoaded', () => {
    //!.SUMMARY ELEMENTS

    // let taskNumber = document.querySelector('.title__container')
    // let overdueNum = document.querySelector('.overdue__container-number')
    // let completedNum = document.querySelector('.completed__container-number')



    let taskTooltip = document.querySelector('.info__tooltip')
    let taskInput = document.querySelector('.update__task')
    let listInput = document.querySelector('.update__list')
    let repsInput = document.querySelector('.update__reps')
    let setsInput = document.querySelector('.update__sets')
    let durationInput = document.querySelector('.update__duration')
    let notesInput = document.querySelector('.update__notes')

    let taskInputForm = document.querySelector('.form__update-task')
    let listInputForm = document.querySelector('.form__update-list')
    let repsInputForm = document.querySelector('.form__update-reps')
    let setsInputForm = document.querySelector('.form__update-sets')
    let durationInputForm = document.querySelector('.form__update-duration')
    let notesInputForm = document.querySelector('.form__update-notes')
    //!.summary SLIDEOUT ELEMENTS


    //!HELPERS
    //FETCH
    const summaryFetchHelper = async (method, inputForm, field) => {
        const formData = new FormData(inputForm);
        const responses = [];
        let req = {}
        let body = {}
        try {

            req.method = method.toUpperCase()
            req.headers = {
                "Content-Type": "application/json"
            }
            body[field] = formData.get(field)
            body['_csrf'] = formData.get('_csrf');
            req['body'] = JSON.stringify(body);
            //FETCH REQUEST TO UPDATE DB
            const res = await fetch(`/tasks/${Array.from(selectedTaskIds)[0]}`, req); //grab the ID from selectedTaskIds SET

            if (!res.ok) {
                console.log('RES NOT OKAY')
            }
            else {
                if (res.status !== 204) {
                    const obj = await res.json();
                    responses.push(obj);
                }
                await updateTasksSection([], [], true);
                await summaryDisplayTasks()
            }
        }
        catch (err) {
            console.log('Error:', err)
        }
        // return responses;
        return
    }

    //!HELPERS
    //UPDATE DISPLAY!!!!

    const summaryDisplayTasks = async () => {
        try {
            const task = await (await fetch(`/tasks/${Array.from(selectedTaskIds)[0]}`)).json()
            const list = await (await fetch(`/lists/${task.listId}`)).json()
            // console.log('task:', task)
            // console.log("list:", list)
            // if (!tasks) tasks = await getTasks();
            taskInput.value = task.name
            listInput.value = list.list.name
            repsInput.value = task.reps
            setsInput.value = task.sets
            durationInput.value = task.duration
            notesInput.value = task.notes
        } catch (err) {
            return
        }
    };

    document.body.addEventListener('click', summaryDisplayTasks)

    //create a tooltip display for this as well!
    //!TASKS  -E
    taskInputForm.addEventListener('submit', (e) => {
        e.preventDefault()
        summaryFetchHelper("PATCH", taskInputForm, "name")
    })
    //!LISTS  -E  NEEDS TO BE COMPLETED
    //need fetch call to grab and populate lists dropdown

    //! need to access table to get access to name at the listId.... simple query and include lists
    listInputForm.addEventListener('submit', (e) => {
        e.preventDefault()
    })

    // listInputForm.addEventListener('submit', async (e) => {
    //     e.preventDefault();
    //     const formData = new FormData(listInputForm);
    //     const responses = [];
    //     let req = {}
    //     let body = {}
    //     try {

    //         req.method = "PATCH"
    //         req.headers = {
    //             "Content-Type": "application/json"
    //         }
    //         body["name"] = formData.get("name")
    //         body['_csrf'] = formData.get('_csrf');
    //         req['body'] = JSON.stringify(body);
    //         //FETCH REQUEST TO UPDATE DB
    //         const task = await (await fetch(`/tasks/${Array.from(selectedTaskIds)[0]}`)).json() //grab the ID from selectedTaskIds SET
    //         const res = await fetch(`/lists/${task.listId}`, req)
    //         console.log('res:', res)

    //         if (!res.ok) {
    //             console.log('RES NOT OKAY')
    //         }
    //         else {
    //             if (res.status !== 204) {
    //                 const obj = await res.json();
    //                 responses.push(obj);
    //             }
    //             await summaryDisplayTasks()
    //             await updateTasksSection([], [], true);
    //         }
    //     }
    //     catch (err) {
    //         console.log('Error:', err)
    //     }
    //     // return responses;
    //     return




    // })
    //!COMPLETE THE LIST DISPLAY SECTION ^^^^^^^^^^^^^^
    //!REPS  -E

    repsInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        summaryFetchHelper('PATCH', repsInputForm, 'reps')
    })

    //!SETS  -E

    setsInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        summaryFetchHelper('PATCH', setsInputForm, 'sets')
    })

    //!DURATION  -E

    durationInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        summaryFetchHelper('PATCH', durationInputForm, 'duration')
    })

    //!NOTES  -E

    notesInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        summaryFetchHelper('PATCH', notesInputForm, 'notes')
        const addNote = () => {

        }
    })

    //!--end--SUMMARY SECTION ANDREW


})

// Event Listeners

utilsIncomplete.addEventListener('click', utilsIncompleteHandler);
utilsCompleted.addEventListener('click', utilsCompletedHandler);
utilsSort.addEventListener('click', utilsSortHandler);
toolbarSelector.addEventListener('click', toolbarSelectorHandler);
toolbarComplete.addEventListener('click', toolbarCompleteHandler);
toolbarUncomplete.addEventListener('click', toolbarUncompleteHandler);
toolbarDuplicate.addEventListener('click', toolbarDuplicateHandler);
toolbarDelete.addEventListener('click', toolbarDeleteHandler);
toolbarDate.addEventListener('click', toolbarDateHandler);
toolbarList.addEventListener('click', toolbarListHandler);
tasksForm.addEventListener('submit', taskFormSubmitHandler);
tasksContainer.addEventListener('click', taskSelectHandler);
window.addEventListener('click', closeDropdowns);

///////////////////////////////////////////////////////////////////////////////////////////
// Run at start

updateTasksSection(selectedListId, selectedQuery, true);

(async () => {
    _hiddenId = await getHiddenId();
    selectedListId = _hiddenId;
})();


(async () => {
    let tasks = await getTasks();
    let compCount = 0
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].complete) {
            compCount++
        }
    }
    // console.log('tasks:', tasks)
    let taskNum = document.querySelector('.tasks__container-number')
    let completedNum = document.querySelector('.completed__container-number')
    completedNum.innerText = compCount
    taskNum.innerText = tasks.length
})();

new Sortable(tasksContainer, {
    handle: '.handle',
    animation: 150,
    dragoverBubble: false
});
