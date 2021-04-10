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

            const anchor = document.createElement('anchor');
            const btnRename = document.createElement('button');
            const btnDelete = document.createElement('button');

            anchor.setAttribute('id', list.id);
            anchor.setAttribute('class', "list-anchors")
            anchor.setAttribute('href', `http://localhost:8080/lists/${list.id}`);
            btnRename.setAttribute('class', `list__btn--rename ${list.id}`);
            btnDelete.setAttribute('class', `list__btn--delete' ${list.id}`);

            anchor.innerText = list.name;
            btnDelete.innerText = "Delete";

            //Create the modal for the rename btn
            btnRename.innerHTML = `Rename <div id="myModal-rename-${list.id}" class="modal-rename ${list.id}">
                                        <div class="modal-content-rename">
                                            <form class="list-rename-form">
                                                <span class="close-rename">X</span>
                                                <p class="add-list-rename">Rename List</p>
                                                <label class="list-label-rename"> List name </label>
                                                <br>
                                                <input type="text" name="name" class="list-name-rename--input" required>
                                                <br>
                                                <input type="submit" value="Save" class="list-rename">
                                                <input type="button" value="Cancel" id="cancel-${list.id}" class="list-cancel-rename">
                                        </div>
                                    </div>`;

            divLists.appendChild(anchor);
            divLists.appendChild(btnRename);
            divLists.appendChild(btnDelete);
        });

        const inputCsurf = document.querySelector('#csurf')
        inputCsurf.setAttribute('value', csrfToken);
    } catch (error) {
        console.log(error);
    }
}

//Display all the tasks from the targeted list
//Display all the summary of the targeted list
async function fetchOneList(id) {

    const ulTasks = document.querySelector('#tasks');

    try {
        const res = await fetch(`/lists/${id}`);
        if (!res.ok) {
            throw res;
        }
        const { list, tasks } = await res.json();
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = task.name;
            ulTasks.appendChild(li);
        });
    }
    catch (err) {
        console.log(err);
    }
}

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
    // console.log("id: ", id);
    // console.log("name: ", name);

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
        if (!res.ok) {
            throw res;
        }
        const { list } = await res.json();

        let anchor = document.getElementById(id);
        // console.log("anchor html element: ", anchor);

        anchor.innerText = list.name;
    }
    catch (err) {
        console.log(err);
    }
}

//Delete a list
async function deleteList(id) {
    try {
        const res = await fetch(`/lists/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        })
        const json = res.json();
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
    btn_rename.forEach(btn => {
        btn.addEventListener('click', event => {
            // console.log(event.target);
            renameBtnId = event.target.classList[1];
            event.stopPropagation();
            modal_rename.style.display = "block";
        })
    })

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
    modal_rename.addEventListener('click', event => {
        //event.target returns an html element
        event.stopPropagation();
        if (event.target === modal_rename) {
            modal_rename.style.display = "none";
        }
    });

    //-----For some reason, window object does not work----------
    // window.addEventListener('click', event => {
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


    //Listen for a click on each anchor element to display tasks
    listAnchors.forEach(list => {
        list.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await fetchOneList(event.target.id);
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

    inputRenameSingle.addEventListener('click', async (event) => {
        event.stopPropagation();
        event.preventDefault();

        await updateList(renameBtnId, inputRenameValue.value);
        modal_rename.style.display = "none";
        inputRenameValue.value = "";
    });

    //Listen for a click on the delete btn


});
