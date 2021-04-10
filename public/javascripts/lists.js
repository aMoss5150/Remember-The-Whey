//--------------------Create a New List Button Modal------------------------------
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

//-----------------------DOM Content----------------------------------------

//fetch all lists from the server
async function fetchLists() {
    //when you reload the DOM, the ul already has child nodes.
    const divLists = document.querySelector('#lists');
    try {
        const res = await fetch('/lists');
        if (!res.ok) {
            throw res;
        }
        const { lists, csrfToken } = await res.json();
        //create a list item and append to the ul parent
        lists.forEach(list => {

            const anchor = document.createElement('anchor');
            const btnRename = document.createElement('button');
            const btnDelete = document.createElement('button');

            anchor.setAttribute('id', list.id);
            anchor.setAttribute('class', "list-anchors")
            anchor.setAttribute('href', `http://localhost:8080/lists/${list.id}`);
            btnRename.setAttribute('class', `list__btn--rename ${list.id}`);

            anchor.innerText = list.name;
            // btnRename.innerHTML = 'Rename';
            btnDelete.innerHTML = "Delete";
            //Creating the modal for the rename btn
            btnRename.innerHTML = `Rename <div id="myModal-rename-${list.id}" class="modal-rename ${list.id}">
                                        <div class="modal-content-rename">
                                            <form class="list-rename-form">
                                                <span class="close-rename">X</span>
                                                <p class="add-list-rename">Rename List</p>
                                                <label class="list-label-rename"> List name </label>
                                                <br>
                                                <input type="text" name="name" class="list-name-rename--input" required>
                                                <br>
                                                <input type="submit" value="Save" id="${list.id}" class="list-rename">
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
    //clear the innerHTML of the ul element to empty

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
        const emptyObj = await res.json();

        divLists.innerHTML = "";
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
        if (!res.ok) {
            throw res;
        }
        const { list } = await res.json();

        let anchor = document.getElementById(id);

        anchor.innerHTML = list.name;
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




window.addEventListener('DOMContentLoaded', async (event) => {

    //grab the user's lists when DOM is loaded
    await fetchLists();

    //------------------Rename Button Modal----------------------------------------------
    // Get the modal
    // let modal_renames = document.querySelectorAll(`.modal-rename`); //return a node list
    let modal_rename = document.querySelector(`.modal-rename`); //return a node list
    // let modal_rename = document.querySelector("#myModal-rename"); //return a node list

    // Get the button that opens the modal
    let btn_rename = document.querySelectorAll(".list__btn--rename"); //return a node list

    // Get the <span> element that closes the modal
    let span_rename = document.getElementsByClassName("close-rename")[0];

    // Get the <input> element that closes the modal
    let btnCancel_rename = document.getElementsByClassName("list-cancel-rename")[0];

    console.log("modal_rename: ", modal_rename);
    // console.log("btn_rename: ", btn_rename);
    // console.log("span: ", span_rename);
    // console.log("btnCancel: ", btnCancel_rename);


    // When the user clicks on the button, open the modal
    btn_rename.forEach(btn => {
        btn.addEventListener('click', event => {
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
    })

    //-----For some reason, window object does not work----------
    // window.addEventListener('click', event => {
        // event.stopPropagation();
        // if (event.target === modal_rename) {
            // modal_rename.style.display = "none";
        // }
    // });
    //---------------------------------------------------------------------------------------



    const listAnchors = document.querySelectorAll('.list-anchors');
    const inputAddListBtn = document.querySelector('.list-add');
    const inputListValue = document.querySelector('.list-name--input');

    const inputRenameSingle = document.querySelector('.list-rename');
    const inputRenameBtn = document.querySelectorAll('.list-rename');
    const inputRenameValue = document.querySelector('.list-name-rename--input');

    let modal_renames = document.querySelectorAll(`.modal-rename`); //return a node list
    console.log(modal_renames);

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
    inputRenameBtn.forEach(btn => {
        // console.log(btn);
        btn.addEventListener('click', async (event) => {
            event.stopPropagation();
            event.preventDefault();
            console.log(btn);
            // console.log(inputRenameValue.value);

            // await updateList(event.target.id, inputRenameList.value);
            modal_rename.style.display = "none";
            inputRenameValue.value = "";
        });
    });

    // inputRenameSingle.addEventListener('click', async (event) => {
    //     event.stopPropagation();
    //     event.preventDefault();
    //     console.log(inputRenameSingle);

    //     modal_rename.style.display = "none";
    //     inputRenameValue.value = "";
    // })




    //think of of way to implement a unique modal to each rename button
    //so I can grab the unique id in order to pass it in the update function

});
