const timer = document.getElementsByClassName('time')[0];
const timer_body = document.getElementsByClassName('timer')[0];
const resend_button = document.getElementsByClassName('resend_inactive')[0];

resend_button.addEventListener('click', makeResendInactive, true)

let current_sec = 5;

function resend_code(){
    fetch('/code?action=resend',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
    })
}

function makeResendInactive(){
    resend_code();
    current_sec = 5;
    timer.innerHTML = current_sec;
    timer_body.style = '';
    resend_button.classList.remove('resend_active');
    resend_button.classList.add('resend_inactive');
}

function makeResendActive(){
    timer_body.style.display = 'none';
    resend_button.classList.remove('resend_inactive');
    resend_button.classList.add('resend_active');
}

setInterval(() => {
    timer.innerHTML = current_sec;
    current_sec--;
    if(current_sec == -1){
        makeResendActive()
    }
}, 1000);