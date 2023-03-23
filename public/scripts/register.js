window.addEventListener('load', function () {
    const avatar = document.getElementsByClassName('avatar')[0];
    const file_input = document.getElementsByClassName('image-input')[0];
    let src_default = './imgs/avatar_default.png';
    let src_hover = './imgs/avatar_hover.png';
    const submit_button = document.getElementsByClassName('continue-button')[0];
    const input_name = document.getElementsByClassName('input-name')[0];
    const input_surname = document.getElementsByClassName('input-last-name')[0];
    const input_nickname = document.getElementsByClassName('input-nickname')[0];
    const form = document.getElementsByClassName('input_form')[0];

    submit_button.addEventListener('click', send, true)
    avatar.addEventListener('mouseenter', avatar_hover, true);
    avatar.addEventListener('mouseleave', avatar_unhover, true);

    function avatar_hover() {
        avatar.src = src_hover;
    }
    function avatar_unhover() {
        avatar.src = src_default;
    }

    avatar.addEventListener('click', function(){
        file_input.click();
    })

    function name_validate(str){
        str = str.toLowerCase();
        const symbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'g', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
        let isPossible;
        for(let i = 0; i < str.length; i++){
            isPossible = false;
            for(let j = 0; j < symbols.length; j++){
                if(str[i] == symbols[j]){
                    isPossible = true;
                    console.log(`${str[i]}: ${isPossible}`);
                }
            }
            if(!isPossible){
                return false;
            }
        }
        return true;
    }

    file_input.addEventListener('input', function(){
        let img = this.files[0];
        if(img){
            const reader = new FileReader();
            reader.readAsDataURL(img)
            reader.addEventListener('load', function(){
                avatar.src = this.result;
                src_default = this.result;
            })
        }
    })

    function send(){
        const name = input_name.value;
        const surname = input_surname.value;
        const nickname = input_nickname.value;
        form.getElementsByClassName('name-input-form')[0].value = name;
        form.getElementsByClassName('surname-input-form')[0].value = surname;
        form.getElementsByClassName('nickname-input-form')[0].value = nickname;
        let date = new Date();
        let timezone_offset = date.getTimezoneOffset();
        if(file_input.files[0]){
            if(name_validate(name) && name != ''){
                if(name_validate(surname) && surname != ''){
                    let body = new FormData(form);
                    body = Object.assign(body, {timezone_offset: timezone_offset});
                    console.log(body)
                    let response = fetch('/register?action=register',{
                        method: 'POST',
                        body: body
                    })
                    .then(
                        function (response){
                            response.json().then(function(data){
                                if(data.status){
                                    window.location = '/app'
                                }
                                else{
                                    alert('register failed: ' + data.message);
                                }
                            })
                        }
                    )
                }
                else{
                    alert('Please type correct surname');
                }
            }
            else{
                alert('Please type correct name');
            }
        }
        else{
            alert('Please pick the avatar');
        }
    }
})