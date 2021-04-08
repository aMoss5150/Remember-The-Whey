//--------------------Create a New List Modal------------------------------
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
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
//-------------------Rename Button Modal------------------------------

// Get the modal
let modal_rename = document.getElementById("myModal-rename");

// Get the button that opens the modal
let btn_rename = document.getElementById("btn-rename-list");

// Get the <span> element that closes the modal
let span_rename = document.getElementsByClassName("close-rename")[0];

// Get the <input> element that closes the modal
let btnCancel_rename = document.getElementsByClassName("list-cancel-rename")[0];

// When the user clicks on the button, open the modal
btn_rename.onclick = function () {
    modal_rename.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span_rename.onclick = function () {
    modal_rename.style.display = "none";
}

// When the user clicks on <input> "cancel", close the modal
btnCancel_rename.onclick = function () {
    modal_rename.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal_rename) {
        modal_rename.style.display = "none";
    }
}


//-----------------------DOM Content----------------------------------------

//fetch all lists from the server
async function fetchLists() {
    //when you reload the DOM, the ul already has child nodes.
    const ulLists = document.querySelector('#lists');
    // console.dir(document.createElement('li'));
    try {
        const res = await fetch('/lists');
        if (!res.ok) {
            throw res;
        }
        const { lists, csrfToken } = await res.json();
        //create a list item and append to the ul parent
        lists.forEach(list => {

            const li = document.createElement('li');
            const btnRename = document.createElement('button');
            const btnDelete = document.createElement('button');
            const anchor = document.createElement('anchor');

            anchor.setAttribute('id', list.id);
            anchor.setAttribute('href', `/lists/${list.id}`);
            btnRename.setAttribute('class', `list__btn--rename ${list.id}`);

            anchor.innerHTML = list.name;
            btnRename.innerHTML = 'Rename';
            btnDelete.innerHTML = "Delete";

            ulLists.appendChild(li);
            li.appendChild(anchor);
            li.appendChild(btnRename);
            li.appendChild(btnDelete);
        })
        const inputCsurf = document.querySelector('#csurf')
        inputCsurf.setAttribute('value', csrfToken);
    }
    catch (error) {
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
    const ulLists = document.querySelector('#lists');

    const newListForm = document.querySelector('.list-form');

    const formData = new FormData(newListForm);

    const body = {
        name,
        _csrf: formData.get('_csrf'),
    }
    // console.log("This is the csurf token: ", body._csrf);

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
        const { lastList } = await res.json();

        //get the single last row(list) and append it to ul

        const li = document.createElement('li');
        const btnRename = document.createElement('button');
        const btnDelete = document.createElement('button');
        const anchor = document.createElement('anchor');

        anchor.setAttribute('id', lastList.id);
        anchor.setAttribute('href', `/lists/${lastList.id}`);
        btnRename.setAttribute('class', `list__btn--rename ${lastList.id}`);

        anchor.innerHTML = lastList.name;
        btnRename.innerHTML = 'Rename';
        btnDelete.innerHTML = "Delete";

        ulLists.appendChild(li);
        li.appendChild(anchor);
        li.appendChild(btnRename);
        li.appendChild(btnDelete);

        // const inputCsurf = document.querySelector('#csurf')
        // inputCsurf.setAttribute('value', csrfToken);

    }
    catch (err) {
        console.log(err)
    }
}

// await fetch(/list/id)
// list.update({name})
// res.json{all user lists}

//Rename a list
async function updateList(id, name) {

    const newListForm = document.querySelector('.list-form');
    const formData = new FormData(newListForm);
    const body = {
        name,
        _csrf: formData.get('_csrf'),
    }
    // console.log("rename form: ", newListForm);
    // console.log("id: ", id);
    // console.log("body", body);

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
        console.log(list);
        //get the targeted list name innerText property
        let anchor = document.getElementById(id);
        console.log(anchor);
        anchor.innerHTML = list.name;
        console.log(anchor);
    }
    catch (err) {
        console.log(err);
    }
}

//Delete a list
async function deleteList(id, name) {
    try {
        const res = await fetch(`/lists/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        })
        const json = res.json();
    }
    catch (err) {
        const error = err.json();
    }
}


window.addEventListener('DOMContentLoaded', async (event) => {
    //grab all the user's lists when DOM is loaded
    await fetchLists();

    const ulLists = document.querySelectorAll('#lists');
    const inputSubmitNewList = document.querySelector('.list-add');
    const inputNewList = document.querySelector('.list-name--input');
    const renameBtns = document.querySelectorAll('.list__btn--rename');

    //Listen for a click on a targeted list to display tasks
    ulLists.forEach(list => {
        list.addEventListener('click', event => {
            // console.log("this is event.target:", event.target.id)
            fetchOneList(event.target.id);
        })
    })

    //listen for the button to create a new list
    inputSubmitNewList.addEventListener('click', event => {
        event.preventDefault();

        createList(inputNewList.value);
        modal.style.display = "none";
    });

    //listen for a button click to rename the list name
    renameBtns.forEach(btn => {
        // console.log(btn);
        btn.addEventListener('click', event => {
            event.preventDefault();
            const id = event.target.classList[1];
            // console.dir(event.target.classList[1]);
            updateList(id, "Hector is awesome");
        });
    })


});
