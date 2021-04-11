///// Menu open/exit/hide/show //////////////


const searchExpandBtn = document.querySelector(".search__button--extend");
const searchInp = document.querySelector(".navbar__search_input");
const xIconExtended = document.querySelector(".x-icon")
const extendSearchDiv = document.querySelector('#search_bar-extend')

searchExpandBtn.addEventListener('click', async (e) => {
    //prevent refresh of page
    e.preventDefault()
    if (extendSearchDiv.classList.contains("search_bar-extend--hide")) {
        extendSearchDiv.classList.remove("search_bar-extend--hide")
        extendSearchDiv.classList.add("search_bar-extend--show")

    } else {
        extendSearchDiv.classList.remove(`search_bar-extend--show`)
        extendSearchDiv.classList.add(`search_bar-extend--hide`)
    }

})

xIconExtended.addEventListener('click', e => {
    extendSearchDiv.classList.remove(`search_bar-extend--show`)
    extendSearchDiv.classList.add(`search_bar-extend--hide`)
})


const hamburger = document.querySelector('.navbar__open--slide')
hamburger.addEventListener('click', e => {
    e.preventDefault()
    const colContainer = document.querySelector('.column__container')
    const listSection = document.querySelector('.list__column')

    if (listSection.classList.contains("show")) {
        listSection.classList.remove("show")
        listSection.classList.add("hide")
        colContainer.classList.remove("column__container--regular")
        colContainer.classList.add("column__container--expand")

    } else {
        listSection.classList.remove("hide")
        listSection.classList.add("show")
        colContainer.classList.remove('column__container--expand')
        colContainer.classList.add('column__container--regular')

    }

})


///////   Search and Extended Search /////////
const btnExtSubmit = document.querySelector('.extended_search-btn')
const navSearch = document.querySelector('.navbar__search_input')

searchInp.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const searchIncTerm = navSearch.value || null;
        console.log(searchIncTerm)

        try {
            let tasks = await getTasks();

            tasks = await filterTasks(tasks, {
                include: {
                    term: searchIncTerm,
                    includeNotes: false
                }
            });

            if (tasks.length === 0) {
                alert("No tasks matched your search");
            } else {
                await displayTasks(tasks);
            }
        } catch (err) {
            console.log(err)
        }
    }
})


const searchIncInp = document.querySelector('.extSearch__form--searchIncTerm')
const searchExcInp = document.querySelector('.extSearch__form--searchExcTerm')
const searchNotesInp = document.querySelector('.extSearch__form--notes')

btnExtSubmit.addEventListener('click', async (e) => {
    e.preventDefault()
    console.log("hi")
    const searchIncTerm = searchIncInp.value || null;
    const searchExcTerm = searchExcInp.value || null;
    const includeNotes = searchNotesInp.checked;

    try {
        let tasks = await getTasks();

        tasks = await filterTasks(tasks, {
            include: {
                term: searchIncTerm,
                includeNotes
            },
            exclude: {
                term: searchExcTerm,
                includeNotes
            }
        });

        if (tasks.length === 0) {
            alert("No tasks matched your search");
        } else {
            await displayTasks(tasks);
        }
    } catch (err) {
        console.log(err)
    }

})
