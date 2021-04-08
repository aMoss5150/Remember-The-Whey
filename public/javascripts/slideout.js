let slideout = document.querySelector('.summary__slideout')
let slideoutBtn = document.querySelector('.slideout__closebtn');
function openSlideout() {
    // console.log('banana');
    // slideout.style.width = '250px';
    // document.querySelector('#main').style.marginLeft = "250px";
    slideout.classList.remove("hidden__slide")
}
function closeSlideout() {
    slideout.classList.add("hidden__slide")
    // slideout.classList.contains("hidden__slide")
    console.log('inside close slideout');
    // slideout.id = "hidden__slide"
    // console.log(slideout)
    // document.querySelector('#main').style.marginLeft = "0";
}

slideoutBtn.addEventListener('click', closeSlideout)
//MAKE SURE TO IMPLEMENT ID CHANGE TO BE ABLE TO TOGGLE SINCE
//I WILL NOT BE ABLE TO USE THE ONCLICK EVENT!
//!TEST SLIDEOUT

const testButton = document.querySelector('#button__test')

testButton.addEventListener("click", () => {
    closeSlideout()
})



