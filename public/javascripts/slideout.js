let slideout = document.querySelector('.summary__slideout')
let slideoutBtn = document.querySelector('.slideout__closebtn');
function openSlideout() {
    slideout.classList.remove("hidden__slide")
    slideout.classList.add("shown__slide")
}

function closeSlideout() {
    slideout.classList.add("hidden__slide")
    slideout.classList.remove('shown__slide')
}

slideoutBtn.addEventListener('click', closeSlideout)
//MAKE SURE TO IMPLEMENT ID CHANGE TO BE ABLE TO TOGGLE SINCE
//I WILL NOT BE ABLE TO USE THE ONCLICK EVENT!
//!TEST SLIDEOUT

// const testButton = document.querySelector('#button__test')

// testButton.addEventListener("click", () => {
//     closeSlideout()
// })
export { closeSlideout, openSlideout }