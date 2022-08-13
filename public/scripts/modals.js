const modalWindow_container = document.getElementsByClassName('app-modal-window-container')[0];
const modals = document.getElementsByClassName('modal-window-content');
const modalWindowOpenButtons = [];

modalWindowOpenButtons.push(document.getElementsByClassName('add-phone-button')[0]);
modalWindowOpenButtons.push(document.getElementsByClassName('add-email-button')[0]);
modalWindowOpenButtons.push(document.getElementsByClassName('modal-window-change-email-submit-button')[0]);
modalWindowOpenButtons.push(document.getElementsByClassName('modal-window-code-button-cancel')[0]);

function closeModals(){
    for(let i = 0; i < modals.length; i++){
        modals[i].classList.remove('modal-window-content_active');
    }
}

for(let i = 0; i < modalWindowOpenButtons.length; i++){
    modalWindowOpenButtons[i].addEventListener('click', function(){
        closeModals();
        let thisWindow = this.getAttribute('action');
        thisWindow = document.getElementsByClassName(thisWindow)[0];
        thisWindow.classList.add('modal-window-content_active');
        modalWindow_container.classList.add('modal-window_active');
        let thisWindow_buttons =  thisWindow.getElementsByClassName('modal-window-button');
        for(let i = 0; i<thisWindow_buttons.length; i++){
            thisWindow_buttons[i].addEventListener('click', function(){
                let thisButton_action = this.getAttribute('action');
                switch(thisButton_action){
                    case 'close':{
                        modalWindow_container.classList.remove('modal-window_active');
                        thisWindow.classList.remove('modal-window-content_active');
                        break;  
                    }
                    default:{
                        //Заполнить дефолт действия для сортировки
                        break;
                    }
                }
            })
        }
    })
}