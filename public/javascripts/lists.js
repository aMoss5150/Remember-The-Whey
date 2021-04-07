// Get the modal
let modal = document.getElementById("myModal");

// Get the button that opens the modal
let btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

//----------------------------------------------------------------
async function fetchLists () {
    const ulLists = document.querySelector('#lists');
    // console.log(ulLists);
    //fetch all lists from the server
    // console.dir(document.createElement('li'));
    try {
        const res = await fetch('/lists');
        if (!res.ok) {
            throw lists;
        }
        const {lists} = await res.json();
        // console.log(lists);
        //create a list item and append to the ul parent
        lists.forEach(list => {
            const li = document.createElement('li');
            const btnRename = document.createElement('button');
            const btnDelete = document.createElement('button');
            li.innerHTML = list.name;
            btnRename.innerHTML = 'Rename';
            btnDelete.innerHTML = "Delete";
            ulLists.appendChild(li);
            li.appendChild(btnRename);
            li.appendChild(btnDelete);
        })
    }
    catch (error) {
        let err = await error.json();
        // console.log(err);
    }
}

async function fetchOneList (id) {
    //when a user clicks on a list, display tasks on tasks section
    //display list summary on summary section
    const ulTasks = document.querySelector('#tasks');
    //store the id on the dom element

    try {
        const res = await fetch(`/lists/${id}`);
        if (!res.ok) {
            throw list;
        }
        const {list, tasks} = await res.json();
        console.log(tasks);
        console.log(list);
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = task.name;
            ulTasks.appendChild(li);
        });
    }
    catch (err) {
        let error = await err.json();
    }
}

async function createList (name) {

    try {
        const res = await fetch('/lists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name})
        });
        if (!res.ok) {
            throw new Error();
        }
        const list = await res.json();
        console.log(list);
    }
    catch (err) {
        const error = err.json();
    }
}

async function updateList (id, name) {
    try {
        const res = await fetch(`/lists/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name})
        });
        if (!res.ok) {
            throw new Error();
        }
        const json = await res.json();
        console.log(json);
    }
    catch (err) {
        const error = err.json();
    }
}

async function deleteList (id, name) {
    try {
        const res = await fetch(`/lists/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name})
        })
        const json = res.json();
    }
    catch (err) {
        const error = err.json();
    }
}


window.addEventListener('DOMContentLoaded', event => {
    const lists = document.querySelectorAll('#lists');
    const submitNewList = document.querySelector('.list-form');
    const inputNewList = document.querySelector('.list-name--input');

    //grab all the user's lists when DOM is loaded
    fetchLists();

    //Listen for a click on a targeted list
    lists.forEach(list => {
        list.addEventListener('click', event => {
            console.log("this is event.target", event.target)
            //how to find the id of the list ?
            // fetchOneList(2);
        })
    })

    //listen for the button to create a new list
    submitNewList.addEventListener('submit', event => {
        event.preventDefault();
        createList(inputNewList.value);
    });


});
