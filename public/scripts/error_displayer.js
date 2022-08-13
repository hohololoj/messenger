const note = document.getElementsByClassName('system-note')[0];

function fillNote(type, message){
    console.log(type);
    switch(type){
        case 'success':{
            note.classList.remove('error-note');
            note.classList.add('success-note');
            note.innerHTML = message;
            break;
        }
        case 'error':{
            note.classList.remove('success-note');
            note.classList.add('error-note');
            note.innerHTML = message;
            break;
        }
    }
}

function showNote(type, message) {
    fillNote(type, message);
    note.style.animationName = 'note-show';
    setTimeout(() => {
        note.style.animationName = 'note-hide';
           
    }, 6000);
}