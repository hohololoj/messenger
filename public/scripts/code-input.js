const inputs = document.getElementsByClassName('input-code');
let current_input = 0;
let isDone = false;
mark_current();

function isNumber(str){
    let nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for(let i = 0; i<nums.length; i++){
        if(str == nums[i]){
            return true;
        }
    }
    return false;
}

for(let i = 0; i < inputs.length; i++){
    inputs[i].addEventListener('keyup', function(e){
        let val = inputs[i].value;
        let key = e.keyCode; 
        console.log(key);
        switch(key){
            case 8:{
                current_input--;
                break;
            }
            default:{
                if(isNumber(val)){
                    current_input++; 
                }
                else{
                    inputs[i].value = '';
                }
            }
        }
        if(current_input < 0){
            current_input = 0;
        }
        if(current_input > 5){
            current_input = 5;
            getCode();
        }
        mark_current();
    })
}

function mark_current(){
    for(let i = 0; i < inputs.length; i++){
        inputs[i].classList.remove('input-code-marked');
    }
    if(!isDone){
        inputs[current_input].classList.add('input-code-marked');
        inputs[current_input].select();
    }
    if(current_input > 5){
        isDone = true;
    }
}

function getCode(){
    let code = '';
    for(let i = 0; i<6; i++){
        code += inputs[i].value;
    }
    let date = new Date();
    let timezone_offset = date.getTimezoneOffset();
    let response = fetch('/auth?action=code',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({code: code, timezone_offset: timezone_offset})
    })
    .then(
        function (response){
            response.json().then(function(data){
                if(!data.status){
                    window.location.reload();
                    alert('Wrong code');
                }
                else{
                    window.location.href = '/register';
                }
            })
        }
    )
}