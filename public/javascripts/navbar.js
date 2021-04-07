//implement a ajax call to fetch all task which meet a regex search criteria
window.addEventListener("DOMContentedLoaded", (e) => {
    // when a search is entered
    const searchBtn = document.querySelector(".search__submit")

    searchBtn.addEventListener('click', async(e) => {
        //prevent refresh of page
        e.preventDefault()

        //grab input from search input to use as the regex
        const searchInpt = document.querySelector(".navbar__search_input").value

        // need to grab html element where i can display all tasks
        // with make variable let taskDisplay === html display element

        try {
            const res = await fetch('/tasks');
            const json = await res.json();
            //json should have ALL Tasks belonging to user (authenticated and authorized in backend)
            if(!res.ok) throw res;

            const results = json.tasks.filter(task => {
                return searchInpt.test(task.name)
            })

            // display results on task section display area
            results.forEach(result => {
                tasksDisplay.innerHtml = ''
                results.forEach(task => {
                    const newLi = document.querySelector("mikes  html element")
                    newLi.innerHTML = task.name
                    tasksDisplay.appendChild(newLi)
                })
            });


        } catch (err) {
            //display error somewhere in html
            console.log("error")
        }


    })
})
