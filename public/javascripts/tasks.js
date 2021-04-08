const toolbarSelector = document.querySelector('#toolbar__selector');
const toolbarComplete = document.querySelector('#toolbar__complete');
const toolbarDuplicate = document.querySelector('#toolbar__duplicate');
const toolbarDelete = document.querySelector('#toolbar__delete');
const tasksForm = document.querySelector('#tasks-section__form');
const tasksContainer = document.querySelector('#tasks-section__tasks-container');

let selectedTaskIds = new Set();

///////////////////////////////////////////////////////////////////////////////////////////
// Helper functions

const clearTaskFields = () => {
    for (let el of tasksForm)
        el.value = '';
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
        if (ev.target.id === 'selector__all'){
            setAllTasksActiveState(true);
            console.log(ev.target)
            inp.checked = true;
            closeDropdowns();
        }
        else if (ev.target.id === 'selector__none') {
            setAllTasksActiveState(false);
            inp.checked = false;
            closeDropdowns();
        }
        else {
            document.querySelector('#toolbar__selector .dropdown-content').classList.add('open');
        }
    }
}

const toolbarCompleteHandler = async (ev) => {
    const formData = new FormData(tasksForm);
    const body = {
        _csrf: formData.get('_csrf'),
        complete: true
    };
    for (let id of selectedTaskIds) {
        try {
            const res = await fetch(`http://localhost:8080/tasks/${id}`, {
                method: 'PATCH',
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

const toolbarDuplicateHandler = async (ev) => {
    //TODO
};

const toolbarDeleteHandler = async (ev) => {
    const formData = new FormData(tasksForm);
    const body = {
        _csrf: formData.get('_csrf')
    };
    for (let id of selectedTaskIds) {
        try {
            const res = await fetch(`http://localhost:8080/tasks/${id}`, {
                method: 'DELETE',
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
tasksForm.addEventListener('submit', taskFormSubmitHandler);
tasksContainer.addEventListener('click',taskSelectHandler);
window.addEventListener('click', closeDropdowns);

getAllTasks();

new Sortable(tasksContainer, {
    handle: '.handle',
    animation: 150
});
