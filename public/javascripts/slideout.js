let slideout = document.querySelector('.summary__slideout')
let slideoutBtn = document.querySelector('.slideout__closebtn');

function openSlideout() {
    console.log('banana');
    slideout.style.width = '250px';
    // document.querySelector('#main').style.marginLeft = "250px";
}

// console.log(openSlideout);

function closeSlideout() {
    slideout.style.position = 'relative'
    slideout.style.left = "2000px";
    // document.querySelector('#main').style.marginLeft = "0";
}

// slideout.addEventListener('click', () => {

//     //checking id status, if so, run
// })

slideoutBtn.addEventListener('click', closeSlideout)


//MAKE SURE TO IMPLEMENT ID CHANGE TO BE ABLE TO TOGGLE SINCE
//I WILL NOT BE ABLE TO USE THE ONCLICK EVENT!
