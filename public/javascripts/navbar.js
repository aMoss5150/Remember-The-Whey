//implement a ajax call to fetch all task which meet a regex search criteria
// window.addEventListener("DOMContentedLoaded", (e) => {
// when a search is entered



////////////////////////////////         CODE FOR SEARCH                ///////////////////            REFACTOR WITH MICHAEL             //////////////////////////////
const searchBtn = document.querySelector(".search__submit")

searchBtn.addEventListener('click', async (e) => {
    //prevent refresh of page
    e.preventDefault()

    const taskDisplay = document.querySelector("#tasks-section__tasks-container");
    //grab input from search input to use as the regex
    console.log(taskDisplay)
    const searchInc = document.querySelector(".navbar__search_input").value
    // does not include code:
    // const searchNotInc = document.querySelector('classnameforNOTinpt').value

    // need to grab html element where i can display all tasks
    // with make variable let taskDisplay === html display element

    try {
        const res = await fetch('/tasks');
        const { tasks } = await res.json();
        //json should have ALL Tasks belonging to user (authenticated and authorized in backend)
        if (!res.ok) throw res;

        const results = tasks.filter(task => {
            return task.name.toLowerCase().includes(searchInc.toLowerCase())
            //doest include code:
            // return (task.name.includes(searchInc) && !(task.name.includes(searchNotInc)) )
        })

        if(results.length === 0) {
            alert("No tasks matched your search")
            return
        }

        // display results on task section display area
        const taskSearch = results.map(task => {
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

        taskDisplay.innerHTML = taskSearch.join('')

    } catch (err) {
        //display error somewhere in html
        console.log(err)
    }


})

const hamburger = document.querySelector('.navbar__open--slide')
hamburger.addEventListener('click', e => {
    e.preventDefault()
    const colContainer = document.querySelector('.column__container')
    const taskContainer = document.querySelector('.task__column')
    const listSection = document.querySelector('.list__column')

    if(listSection.classList.contains("show")) {
        listSection.classList.remove("show")
        listSection.classList.add("hide")
        colContainer.classList.remove("column__container--regular")
        colContainer.classList.add("column__container--expand")
        taskContainer.classList.remove("task__column--small")
        taskContainer.classList.add("task__column--big")

    } else {
        listSection.classList.remove("hide")
        listSection.classList.add("show")
        colContainer.classList.remove('column__container--expand')
        colContainer.classList.add('column__container--regular')
        taskContainer.classList.remove("task__column--big")
        taskContainer.classList.add("task__column--small")
    }
    console.log(colContainer)
    console.log(taskContainer)
    console.log(listSection)
    // const listSection
    //grab hectors list element
    //add class to hectors element opened
    //if
    //css styling for hiding hectors list section hidden
    // css to bring michaels task section to end of page


})
// })
