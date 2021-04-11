//-----------------------------------Modal for the Add New List Button-----------------------------------
// Get the modal
let modal = document.getElementById("myModal");

// Get the button that opens the modal
let btn = document.getElementById("btn-create-list");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// Get the <input> element that closes the modal
let btnCancel = document.getElementsByClassName("list-cancel")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks on <input> "cancel", close the modal
btnCancel.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

//----------------------------------Helper Functions To Fetch Calls To The Backend----------------------------------------

//fetch all the lists from the server
async function fetchLists() {

    const divLists = document.querySelector('#lists');
    try {
        const res = await fetch('/lists');
        if (!res.ok) {
            throw res;
        }
        const { lists, csrfToken } = await res.json();
        //create an anchor, rename btn, and delete btn to each list item
        lists.forEach(list => {
            if(list.name !== "_hidden") {
                const anchor = document.createElement('anchor');
                const btnRename = document.createElement('button');
                const btnDelete = document.createElement('button');
                const divContainer = document.createElement('div');

                divContainer.setAttribute('id', `div-container-${list.id}`);
                divContainer.setAttribute('class', `list__div-container`)

                anchor.setAttribute('id', list.id);
                anchor.setAttribute('class', "list-anchors")
                anchor.setAttribute('href', `http://localhost:8080/lists/${list.id}`);
                btnRename.setAttribute('class', `list__btn--rename ${list.id}`);
                btnDelete.setAttribute('class', `list__btn--delete ${list.id}`);

                anchor.innerText = list.name;
                btnDelete.innerText = `x`;

                //Create the modal for the rename btn
                btnRename.innerHTML = `+ <div id="myModal-rename-${list.id}" class="modal-rename ${list.id}">
                                            <div class="modal-content-rename">
                                                <form class="list-rename-form">
                                                    <span class="close-rename">X</span>
                                                    <p class="add-list-rename">Rename List</p>
                                                    <label class="list-label-rename"> List name </label>
                                                    <br>
                                                    <input type="text" name="name" class="list-name-rename--input-${list.id}" required>
                                                    <br>
                                                    <input type="submit" value="Save" class="list-rename ${list.id}">
                                                    <input type="button" value="Cancel" id="cancel-${list.id}" class="list-cancel-rename">
                                            </div>
                                        </div>`;

                divLists.appendChild(divContainer);
                divContainer.appendChild(anchor);
                divContainer.appendChild(btnRename);
                divContainer.appendChild(btnDelete);
            };

        });

        const inputCsurf = document.querySelector('#csurf')
        inputCsurf.value = csrfToken;
    } catch (error) {
        console.log(error);
    }
}

//-------------------------------------------------------------------------------

const tasksContainer = document.querySelector('#tasks-section__tasks-container');
let selectedTaskIds = new Set();
//Display all tasks from the targeted list
//Display all summary of the targeted list
// async function fetchOneList(id) {

//     // const ulTasks = document.querySelector('#tasks');
//     try {
//         // const res = await fetch(`/lists/${id}`);
//         // if (!res.ok) {
//         //     throw res;
//         // }
//         // const { list, tasks } = await res.json();
//         const res = await fetch(`/tasks?listIds=${[id]}`);
//         if (!res.ok) {
//             throw res;
//         }
//         const json = await res.json();
//         console.log(json);
//         // tasks.forEach(task => {
//         //     const li = document.createElement('li');
//         //     li.innerHTML = task.name;
//         //     ulTasks.appendChild(li);
//         // });
//     }
//     catch (err) {
//         console.log(err);
//     }
// }


const getTasks = async (listIds = []) => {
    const res = await fetch(`/tasks?listIds=${[...listIds]}`, {
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
    return tasks.filter(task => {
        for (let prop in query) {
            // Include must store an object with props: term and from
            if (prop === 'include') {
                const { term, from } = query[prop];
                if (!task[from].toLowerCase().includes(term.toLowerCase()))
                    return false;
            }
            // Exclude must store an object with props: term and from
            else if (prop === 'exclude') {
                const { term, from } = query[prop];
                if (task[from].toLowerCase().includes(term.toLowerCase()))
                    return false;
            }
            // Check if a query prop/value matches a task prop/value
            else if (task[prop] !== query[prop])
                return false;
        }
        return true;
    });
}

const displayTasks = async (tasks) => {
    if (!tasks) tasks = await getTasks();

    // Reset selectedTaskIds
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
                    <input type="checkbox">
                    <div class="card-text">${taskStr}</div>
                </div>`;
    });

    tasksContainer.innerHTML = tasksHtml.join('');
};

const updateTasksSection = async (listIds, queries = []) => {
    let tasks = await getTasks(listIds);
    for (let query of queries)
        tasks = await filterTasks(tasks, query);
    await displayTasks(tasks);
}






//---------------------------------------------------------------------

//Create a new list
async function createList(name) {

    const divLists = document.querySelector('#lists');

    const newListForm = document.querySelector('.list-form');

    const formData = new FormData(newListForm);

    const body = {
        name,
        _csrf: formData.get('_csrf'),
    }
    try {
        const res = await fetch('/lists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            throw res
        }

        //clear the innerHTML of the div(parent) element
        divLists.innerHTML = "";
        //Fetch all the lists again with the updated version
        await fetchLists();
    }
    catch (err) {
        console.log(err)
    }
}

//Rename a list
async function updateList(id, name) {

    const newListForm = document.querySelector('.list-form');
    const formData = new FormData(newListForm);
    const body = {
        name,
        _csrf: formData.get('_csrf'),
    }

    try {
        const res = await fetch(`/lists/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        console.log(res)
        if (!res.ok) {
            throw res;
        }
        console.log('before')
        const { list } = await res.json();
        console.log('after')

        // let anchor = document.getElementById(`${id}`);

        // anchor.innerText = list.name;
    }
    catch (err) {
        console.log(err);
    }
}

//Delete a list
async function deleteList(id) {

    const divLists = document.querySelector('#lists');  // check how we are selecting div based on id

    const form = document.querySelector('.list-form');
    const formData = new FormData(form);
    const body = {
        _csrf: formData.get('_csrf'),
    }

    try {
        const res = await fetch(`/lists/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            throw res;
        }

        //clear the innerHTML of the div(parent) element
        divLists.innerHTML = "";
        //Fetch all the lists again with the updated version
        await fetchLists();
    }
    catch (err) {
        console.log(err);
    }
}

//-----------------------------------------------------DOM CONTENT--------------------------------------------------------

window.addEventListener('DOMContentLoaded', async (event) => {

    //grab the user's lists when DOM is loaded
    await fetchLists();

    //------------------Rename Button Modal----------------------------------------------
    // Get the modal
    let modal_rename = document.querySelector(`.modal-rename`); //return a node list

    // Get the button that opens the modal
    let btn_rename = document.querySelectorAll(".list__btn--rename"); //return a node list

    // Get the <span> element that closes the modal
    let span_rename = document.getElementsByClassName("close-rename")[0];

    // Get the <input> element that closes the modal
    let btnCancel_rename = document.getElementsByClassName("list-cancel-rename")[0];

    //define the rename btn unique id
    let renameBtnId;

    // When the user clicks on the button, open the modal
    // btn_rename.forEach(btn => {
    //     btn.addEventListener('click', event => {
    //         // console.log(event.target);
    //         renameBtnId = event.target.classList[1];
    //         event.stopPropagation();
    //         modal_rename.style.display = "block";
    //     })
    // })

    // When the user clicks on <span> (x), close the modal


    span_rename.addEventListener('click', event => {
            event.stopPropagation();
            modal_rename.style.display = "none";
        })


    // When the user clicks on <input> "cancel", close the modal
    btnCancel_rename.addEventListener('click', event => {
        event.stopPropagation();
        modal_rename.style.display = "none";
    })

    // When the user clicks anywhere outside of the modal, close it
    // modal_rename.addEventListener('click', event => {
    //     //event.target returns an html element
    //     event.stopPropagation();
    //     if (event.target === modal_rename) {
    //         modal_rename.style.display = "none";
    //     }
    // });

    //---------------------------------------------------------------------------------------

    const listAnchors = document.querySelectorAll('.list-anchors');
    const inputAddListBtn = document.querySelector('.list-add');
    const inputListValue = document.querySelector('.list-name--input');

    const inputRenameSingle = document.querySelector('.list-rename');
    const inputRenameValue = document.querySelector('.list-name-rename--input');

    let deleteBtns = document.querySelectorAll('.list__btn--delete');

    //Listen for a click on each anchor element to display tasks
    listAnchors.forEach(list => {
        list.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await updateTasksSection(event.target.id);
            // await fetchOneList(event.target.id);
        })
    })

    //listen for a click on the add btn to create a new list
    inputAddListBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        await createList(inputListValue.value);
        modal.style.display = "none";
        inputListValue.value = "";
    });

    // listen for a click on the save btn to rename the list
    /*There is a bug where the modal will not pop up anymore when the
    rename btn is clicked only after creating a new list. */
    // inputRenameSingle.addEventListener('click', async (event) => {
    //     event.stopPropagation();
    //     event.preventDefault();

    //     await updateList(renameBtnId, inputRenameValue.value);
    //     modal_rename.style.display = "none";
    //     inputRenameValue.value = "";
    // });

    //Listen for a click on the delete btn
    // deleteBtns.addEventListener('click', e => {
    //     e.preventDefault()
    //     const id = event.target.classList[1];

    // })


    // deleteBtns.forEach( btn => {
    //     console.log("hi")
    //     btn.addEventListener('click', async (event) => {
    //         const divLists = document.querySelector('#lists')
    //         event.stopPropagation()
    //         event.preventDefault()

    //         const deleteId = event.target.classList[1];

    //         try{
    //             await deleteList(deleteId);

    //         } catch (err) {
    //             console.log(err)
    //         }
    //     })
    // });


    /// we are adding event listeners only elements
    /// that were rerendered first
    /// cannot addeventlisteners to future html elements that would be appended after fetchLists() repopulates lists section

    // used event capturing to div#lists so whenever a click occurs
    // we get the capture of the clicked element

    const rootDiv = document.getElementById("lists")
    rootDiv.addEventListener('click', async (e) => {
        e.preventDefault()
        let btn = e.target
        console.log(btn)
        let modalId
        if(btn.classList.contains('list__btn--delete')){
            let deleteId = e.target.classList[1];
            await deleteList(deleteId);
        }
        if(btn.classList.contains("list__btn--rename")) {
            modalId = e.target.classList[1]
            console.log("hi", modalId)
            let modal_rename = document.querySelector(`#myModal-rename-${modalId}`)
            console.log(`modal window to open, ${modal_rename.id}`)
            modal_rename.style.display = "block"
        }
        if(btn.classList.contains("list-rename")) {
            let renameBtnId = e.target.classList[1]
            console.log(renameBtnId)
            let inputVal = document.querySelector(`.list-name-rename--input-${renameBtnId}`)
            console.log(inputVal)
            console.log(inputVal.value)
            await updateList(renameBtnId, inputVal.value);
            await fetchLists()
            // modal.style.display = "none";
            // inputListValue.value = "";
            // modal_rename.style.display = "none";
            // inputRenameValue.value = "";
        }
        if(e.target.classList.contains("modal-rename") ) {
            console.log('hi')
            modalId = e.target.classList[1]
            let modal_rename = document.querySelectorAll(`modal-content-rename`)
            modal_rename.forEach(modal => {
                modal.style.display = "none"
            })
        }
    }, true)
    ////// from yours truly, Earl ///////

});
