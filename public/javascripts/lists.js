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
            if (list.name !== "_hidden") {
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
            const inputCsurf = document.querySelector('#csurf')
            inputCsurf.value = csrfToken;
        })
    } catch (error) {
        console.log(error);
    }
}



//-------------------------------------------------------------------------------
//Display all tasks from the targeted list
async function fetchOneList(id) {

    // const ulTasks = document.querySelector('#tasks');
    try {
        const res = await fetch(`/lists/${id}`);
        if (!res.ok) {
            throw res;
        }
        const { list, tasks } = await res.json();
    }
    catch (err) {
        console.log(err);
    }
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

    const listAnchors = document.querySelectorAll('.list-anchors');
    const inputAddListBtn = document.querySelector('.list-add');
    const inputListValue = document.querySelector('.list-name--input');

    //------------------Rename Button Modal----------------------------------------------
    // Declare the modal
    let modal_rename;

    // Declare the <span> element that closes the modal
    let span_rename;

    // Declare the <input> element that closes the modal
    let btnCancel_rename;
    //---------------------------------------------------------------------------------

    //Listen for a click on each anchor element to display tasks
    listAnchors.forEach(list => {
        list.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await updateTasksSection(event.target.id);
        })
    })

    //listen for a click on the add btn to create a new list
    inputAddListBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        await createList(inputListValue.value);
        modal.style.display = "none";
        inputListValue.value = "";
    });

    //----------------------------------------------------------------------------------

    const rootDiv = document.getElementById("lists")
    let modalId;

    rootDiv.addEventListener('click', async (e) => {
        e.preventDefault()
        let btn = e.target
        // console.log("event.target btn: ", btn.classList)

        //Delete a list when "delete" btn is clicked
        if (btn.classList.contains('list__btn--delete')) {
            let deleteId = e.target.classList[1];
            await deleteList(deleteId);
        }

        //Display the modal when the "rename" btn is clicked
        if (btn.classList.contains('list__btn--rename')) {
            modalId = e.target.classList[1];

            //we can reassign the buttons
            modal_rename = document.querySelector(`#myModal-rename-${modalId}`);
            span_rename = document.querySelector(`#close-rename-${modalId}`);
            btnCancel_rename = document.querySelector(".list-cancel-rename");

            modal_rename.style.display = 'block';
        }

        //Rename the targeted list when "save" btn is clicked
        if (btn.classList.contains("list-rename")) {

            let inputVal = document.querySelector(`#rename-input-${modalId}`);
            // console.log("id:", modalId);
            // console.log(inputVal.value);

            await updateList(modalId, inputVal.value);

            modal_rename.style.display = "none";
            inputVal.value = "";
        }

        //Exit out of the modal when the "X" btn is clicked
        if (btn.classList.contains("close-rename")) {
            modal_rename.style.display = "none";
        }

        //Exit out of the modal when the "cancel" btn is clicked
        if (btn.classList.contains("list-cancel-rename")) {
            modal_rename.style.display = "none";
        }

        //Exit out of the modal
        if (btn.classList.contains("modal-rename")) {
            modal_rename.style.display = "none";
        }
    }, true)
});
