# Remeber the Whey
  Remember the Whey is a fitness organizational tool.  It enables a user to categorize and keep track of workouts by creating       customizable lists.  The user is also given the ability to customize each excercise or task on their custom list, while also       having easy access to a summary of the list or task info. 
![loginpage](https://user-images.githubusercontent.com/73197963/114326209-ac204280-9b01-11eb-86bd-1cf474da6e7f.JPG)
![homepage](https://user-images.githubusercontent.com/73197963/114340719-282c8180-9b26-11eb-809c-eef0d66ea1af.JPG)

## MVP
  * Ability to create new users and have user login with authorization
  * Ability to login as a demo user with full access to features
  * Users can create, update, delete a list unique to the user  
  * Users can create, update, delete a task to/from their list
  * Users have access to a summary of the list or task (excercise?)
  * Users can search through all excercises or tasks

## BONUS / STRETCH GOALS
  * Autocomplete SmartAdd of task properties
  * Subtasks
  * Tag system
  
## TECHNOLOGIES USED
  * Javascript
  * Express
  * Sequelize
  * PSQL Database
  * CSS
  * HTML
  
## DATABASE SCHEMA

![dataschema](https://user-images.githubusercontent.com/73197963/114215426-94935f00-9933-11eb-84ec-4680664f90ce.JPG)

## Technical Showcase

All of the information to display for a user is aquired, then displayed without requiring a reload to the web-page.  The information is fetched asynchronously, then used to render HTML to the user's homepage to smoothly present all information a user could have access to.
```javascript
const displayTasks = async (tasks, keepSelected = false) => {
    if (!tasks)
        tasks = await getTasks();

    // Update taskCount now bc they will not be filtered further before display
    taskCount = tasks.length;

    // Reset selectedTaskIds
    if (!keepSelected)
        selectedTaskIds = new Set();

    // Sort tasks before display
    sortTasks(tasks, selectedOrder);

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
                    <div class='divider'></div>
                    <input type="checkbox">
                    <div class="card-text">${taskStr}</div>
                </div>`;
    });
    tasksContainer.innerHTML = tasksHtml.join('');
    setTasksActiveState(true, selectedTaskIds);
};
```
Rendering the information without requiring a page reload means we cannot simply set event handlers for elements grabbed after the DOM content was loaded, since they could possibly be replaced or be missing from the page at a later time.  Since we cannot place event listeners on html elements rendered in the future, we used event capturing to work around this issue, and made a capture event (opposite of bubbling) on html elements that would not be manipulated by AJAX throughout the user's interaction with the site.
```javascript
rootDiv.addEventListener('click', async (e) => {
    e.preventDefault()
    let btn = e.target

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

        let inputVal = document.querySelector(`#rename-input-${modalId}`)

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
```
A robust search feature that is able to filter through all the user's task through a term to include, exclude, and also the option to search through other properties of a task, not just it's name

```javascript
const filterTasks = async (tasks, query) => {
    const filteredTasks = tasks.filter(task => {
        for (let prop in query) {
            // Filter by include search term
            // Options Obj = { term, includeNotes }
            if (prop === 'include') {
                let { term, includeNotes } = query[prop];
                if (term !== null) {
                    term = term.toLowerCase();
                    const inName = task['name'].toLowerCase().includes(term);
                    if (includeNotes && task.notes) {
                        if (!inName && !task['notes'].toLowerCase().includes(term))
                            return false;
                    }
                    else if (!inName)
                        return false;
                }
            }
            // Filter by exclude search term
            // Options Obj = { term, includeNotes }
            
            else if (prop === 'exclude') {
                let { term, includeNotes } = query[prop];
                if (term !== null) {
                    term = term.toLowerCase();
                    const inName = task['name'].toLowerCase().includes(term);
                    if (includeNotes && task.notes) {
                        if (inName || task['notes'].toLowerCase().includes(term))
                            return false;
                    }
                    else if (inName)
                        return false;
                }
            }
            // Filter by date property with options
            // Options Obj = { value, comparison }
            else if (prop === 'date' && typeof query[prop] === 'object') {
                let { value, comparison } = query[prop];
                if (value !== null) {
                    let taskDate = Date.parse(task['date']);
                    let propDate = Date.parse(value);

                    if (comparison === 'isAfter') {
                        if (taskDate >= propDate)
                            return false;
                    }
                }
            }
            // Check if a query prop/value matches a task prop/value
            else if (task[prop] !== query[prop])
                return false;
        }
        return true;
    });
    return filteredTasks;
}

```
Simple, clean, and modern styling features such as subtle color changes, hover effects, and menu transitions makes the webpage engaging, while keeping it clutter free to focus on the functionality of the webpage/tool.

```CSS
/*!SLIDEOUT*/
.summary__slideout {
    margin-top: 5px;
    grid-area: summary;
    display: flex;
    background-color: white;
    left: 0px;
    opacity: 1;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    transition-property: left;
    transition-duration: 2s;
    z-index: 0;
}

/*!TRANSITIONED STATE*/
.hidden__slide {
    margin-top: 5px;
    display: flex;
    position: relative;
    left: 1200px;
    background-color: white;
    z-index: -1;
    opacity: 1;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    transition-property: left;
    transition-duration: 2s;
}
```

## TABLE USERS
  * id (integer, primary key, not null)
  * firstName (string, not null)
  * lastName (string, not null)
  * email (string, unique, not null)
  * hashPW (string, not null)
  * created_at (dateTime, not null)
  * updated_at (dateTime, not null)
## TABLE LISTS
  * id (integer, primary key)
  * userId (integer, not null, foreign key)
  * name (string, not null)
  * created_at (dateTime, not null)
  * updated_at (dateTime, not null)
## TABLE TASKS
  * id (integer, primary key, not null)
  * name (string, not null)
  * complete (boolean, not null, default false)
  * date (dateOnly)
  * notes (text)
  * listId (integer, not null, foreign key)
  * sets (integer, not null)
  * reps (integer)
  * duration (integer)
  * repeats (integer, not null, default false)
  * created_at (dateTime, not null)
  * updated_at (dateTime, not null)

## BACKEND ROUTES    
  ### USERS
   * log-in user (GET & POST)
   * sign-up user (GET & POST)
   * log-out user (POST)
  ### LISTS
   * get all lists (GET)
   * get specific list (GET)
   * create new list (POST)
   * update specific list (PUT)
   * delete a list (DELETE)
  ### TASKS
   * get all tasks (GET)
   * get specific task (GET)
   * create new task (POST)
   * update task (PUT)
   * update task properties (PATCH)
   * delete task (DELETE)

## ENVIORNMENT DEPENDENCIES/INSTALLATION
   * Bcryptjs
   * Cookie parser
   * Csurf
   * Express validators
   * Heroku

