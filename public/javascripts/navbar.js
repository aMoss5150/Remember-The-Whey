//implement a ajax call to fetch all task which meet a regex search criteria
// window.addEventListener("DOMContentedLoaded", (e) => {
// when a search is entered



////////////////////////////////         CODE FOR SEARCH                ///////////////////            REFACTOR WITH MICHAEL             //////////////////////////////
const searchBtn = document.querySelector(".search__submit");
const searchInp = document.querySelector(".navbar__search_input");

searchBtn.addEventListener('click', async (e) => {
    //prevent refresh of page
    e.preventDefault()

    // grab input from search input to use as the regex
    const searchIncTerm = searchInp.value;
    const searchExcTerm = '';
    const fieldToSearch = 'name';

    // need to grab html element where i can display all tasks
    // with make variable let tasksContainer === html display element

    try {
        // json should have ALL Tasks belonging to user (authenticated and authorized in backend)
        let tasks = await getTasks();

        tasks = await filterTasks(tasks, {
            include: {
                term: searchIncTerm,
                from: fieldToSearch
            },
            exclude: {
                term: searchExcTerm,
                from: fieldToSearch
            }
        });

        if (tasks.length === 0) {
            alert("No tasks matched your search");
        }
        else {
            // display results on task section display area
            await displayTasks(tasks);
        }
    }
    catch (err) {
        // display error somewhere in html
        console.log(err)
    }
})

const hamburger = document.querySelector('.navbar__open--slide')
hamburger.addEventListener('click', e => {
    e.preventDefault()

    const listSection = document.querySelector('.list__column')

    if(listSection.classList.contains("show")) {
        listSection.classList.remove("show")
        listSection.classList.add("hide")
    } else {
        listSection.classList.remove("hide")
        listSection.classList.add("show")
    }

    console.log(listSection)
    // const listSection
    //grab hectors list element
    //add class to hectors element opened
    //if
    //css styling for hiding hectors list section hidden
    // css to bring michaels task section to end of page


})
// })
