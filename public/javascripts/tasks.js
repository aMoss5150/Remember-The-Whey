const tasksForm = document.querySelector('#tasks-section__form');
const tasksContainer = document.querySelector('#tasks-section__tasks-container');

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

const getAllTasks = async () => {
    const res = await fetch('http://localhost:8080/tasks', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });
    const { tasks } = await res.json();

    let id = 0;
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

        return `<div id=task-${id++} class="tasks-section__task">
                    <div class="handle">
                        <i class="fas fa-ellipsis-v"></i>
                    </div>
                    <input type="checkbox">
                    <div class="card-text">${taskStr}</div>
                </div>`;
    })
    tasksContainer.innerHTML = tasksHtml.join('');
};

const clearTaskFields = () => {
    for (let el of tasksForm)
        el.value = '';
}

tasksForm.addEventListener('submit', async ev => {
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
            credentials: 'include',
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
});

tasksContainer.addEventListener('click', async ev => {
    const currTask = ev.target.closest('.tasks-section__task');

    // Handle user click of input checkbox
    if (ev.target.type === 'checkbox'){
        console.log('input clicked', currTask,ev.target)
        if (ev.target.checked === true) {
            currTask.classList.remove('tasks-section__task--active');
            ev.target.checked = false;
        }
        else {
            currTask.classList.add('tasks-section__task--active');
            ev.target.checked = true;
        }
        return;
    }

    // Handle user click of clickable task area
    const taskDivs = document.querySelectorAll('.tasks-section__task');

    for (let taskDiv of taskDivs) {
        taskDiv.classList.remove('tasks-section__task--active');
        taskDiv.children[1].checked = false;
    }

    currTask.classList.add('tasks-section__task--active');
    currTask.children[1].checked = true;
})

getAllTasks();

new Sortable(tasksContainer, {
    handle: '.handle',
    animation: 150
});
