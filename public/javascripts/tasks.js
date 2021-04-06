const tasksForm = document.querySelector('#tasks-section__form');
const tasksContainer = document.querySelector('#tasks-section__tasks-container');

const getAllTasks = async () => {
    const res = await fetch('http://localhost:8080/tasks', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });
    const { tasks } = await res.json();

    const tasksHtml = tasks.map(task => {
        return `<div class="card">
                    <div class="card-body">
                        <p class="card-text">${task.name}</p>
                    </div>
                </div>`;
    })
    tasksContainer.innerHTML = tasksHtml.join('');
};

const clearTaskFields = () => {
    for (let el of tasksForm)
        el.value = '';
}

getAllTasks();

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
        console.log('Error:',err)
    }
});
