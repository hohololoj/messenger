const continueButton = document.getElementsByClassName('continue-button')[0];
continueButton.addEventListener('click', sendData, {passive: false, once: false})
const emailInput = document.getElementsByClassName('input-email')[0];

async function sendData(e) {
    e.preventDefault();
    let data = {
        "email": emailInput.value
    }
    let response = fetch('/auth?action=email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
    })
        .then(
            function (response) {
                response.json().then(function (data) {
                    if(data.result == "error"){showNote('error', data.message)}
                    if(data.result == "success"){
                        window.location.href = ('/code?email='+emailInput.value)
                    }
                })
            }
        )
}