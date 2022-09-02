const socket = new WebSocket('ws://127.0.0.1:8000/app')
const editProfile_button = document.getElementsByClassName('edit-profile-settings-button')[0];
const editProfile_from = document.getElementsByClassName('form-settings-edit-profile')[0];
const section_loading = document.getElementsByClassName('section-loading')[0];
const emailChangeForm = document.getElementsByClassName('email-change-form')[0];
const emailChangeForm_button = document.getElementsByClassName('modal-window-change-email-submit-button')[0];
const emailChangeForm_input = document.getElementsByClassName('modal-window-change-email-input')[0];
const emailChangeModalCode = document.getElementsByClassName('modal-window-email-change-code')[0];
const emailChangeModalCodeSend_button = document.getElementsByClassName('modal-window-send-code-button')[0];
const emailChangeModalCodeSend_form = document.getElementsByClassName('send-code-form')[0];
const emailChangeModalCodeSend_input = document.getElementsByClassName('email-change-input-code')[0];
const changeEmail_emailContainer = document.getElementsByClassName('this-email-container')[0];
const logout_button = document.getElementsByClassName('logout-button')[0];
const privacySettings_options = document.getElementsByClassName('notification-settings-privacy-option');
const notificationSettingsCheckboxes = document.getElementsByClassName('notification-setting-switcher');
const notificationPreviewSettings = document.getElementsByClassName('notification-settings-group-item-input-checkbox');
const editCommunityButtons = document.getElementsByClassName('edit-community-button-secret');
const notification_container = document.getElementsByClassName('popup-notfication-block')[0];

socket.onopen = function () {
    socket.send('socket connection test')
}

const notifications_settings = localStorage.getItem('notifications_settings');
console.log(notifications_settings);
if(notifications_settings == undefined){
    fetch('/app?action=getNotificationsSettings',{
        method: 'POST'
    })
    .then(
        function (response){
            response.json().then(function(data){
                for(key in data){
                    localStorage.setItem(key, data[key])
                }
            })
        }
    )
}

socket.onmessage = function(e){
    let thisMessage = JSON.parse(e.data);
    console.log('notification received', thisMessage);
    switch(thisMessage.action){
        case 'notification':{
            console.log('notification received');
            showNotification(thisMessage);
            break;
        }
    }
}

function hideNotification(el){
    el.style.animationName = 'notification-hide';
    setTimeout(() => {
        el.parentNode.removeChild(el);
    }, 500);
}

function send_friendRequestResponse(type, from){
    let response_obj = {
        answer: type,
        from: from
    }
    fetch('app/?action=friendRequestResponse',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(response_obj)
    })
}

function showNotification(thisNotification){
    // action: "notification"
    // hide: "auto"
    // message: "This email is already in use"
    // title: "An error occurred"
    // type: "error"
    let html = '';
    console.log(`notification received`, thisNotification);
    switch(thisNotification.type){
        case 'error':{
            html+=`
            <div class="popup-notification popup-notification-error autohide">
                <h1 class="notification-title">${thisNotification.title}</h1>
                <span class="notification-description description-error">${thisNotification.message}</span>
            </div>`
            
            notification_container.innerHTML += html;
            let thisAutoHide_element = document.getElementsByClassName('autohide')[0];
            setTimeout(() => {
                hideNotification(thisAutoHide_element);
            }, 5000);
            break;
        }
        case 'friends':{
            html+=`
            <div class="popup-notification popup-notification-friend">
                <h1 class="notification-title">${thisNotification.title}</h1>
                <div class="buttons-container">
                    <button class="notification-button button-confirm friend-request-accept">Accept</button>
                    <button class="notification-button button-cancel friend-request-reject">Reject</button>
                </div>
            </div>`
            notification_container.innerHTML += html;
            const thisNotification_buttonAccept = document.getElementsByClassName('friend-request-accept')[0];
            const thisNotification_buttonReject = document.getElementsByClassName('friend-request-reject')[0];
            thisNotification_buttonAccept.addEventListener('click', function(){
                let from = this.parentNode.parentNode.getElementsByClassName('notification-title')[0].getElementsByClassName('account-notification-link')[0].getAttribute('uid');
                send_friendRequestResponse('accept', from);
                let thisNote = document.getElementsByClassName('popup-notification-friend')[0];
                hideNotification(thisNote);
            })
            thisNotification_buttonReject.addEventListener('click', function(){
                let from = this.parentNode.parentNode.getElementsByClassName('notification-title')[0].getElementsByClassName('account-notification-link')[0].getAttribute('uid');
                send_friendRequestResponse('reject', from);
                let thisNote = document.getElementsByClassName('popup-notification-friend')[0];
                hideNotification(thisNote);
            })
            break;
        }
        case 'alert':{
            html+= `
            <div class="popup-notification popup-notification-alert">
                <h1 class="notification-title">${thisNotification.title}</h1>
                <span class="notification-description">${thisNotification.message}</span>
                <button class="notification-button button-ok alert-button-ok">OK</button>
            </div>
            `
            notification_container.innerHTML += html;
            const buttonOK = document.getElementsByClassName('alert-button-ok')[0];
            const thisNote = document.getElementsByClassName('popup-notification-alert')[0];
            buttonOK.addEventListener('click', function() {
                hideNotification(thisNote);
            })
        }
    }
}

function sumbitCommunityChanges(form){
    let data = new FormData(form);
    showLoadingSection();
    fetch('/app?action=editCommunity',{
        method: 'POST',
        body: data
    })
    .then(
        function (response){
            response.json().then(function(data){
                if(data.success == 'error'){
                    alert(data.message);
                    hideLoadingSection();
                }
                else{
                    window.location.reload();
                }
            })
        }
    )
}

for(let i = 0; i < editCommunityButtons.length; i++){
    editCommunityButtons[i].addEventListener('click', function(){
        let thisGroup_id = this.getAttribute('groupid');
        fetch('/app?action=getGroupInfo',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({groupid: thisGroup_id})
        })
        .then(
            function (response){
                response.json().then(function(data){
                    if(data.status){
                        let response = data.data;
                        let form = modalEditCommunity.getElementsByClassName('edit-community-secret-form')[0];
                        form.innerHTML = '';
                        let html = `
                        <div class="edit-avatar-container edit-avatar-container-group">
                            <img src="${response.avatar_path}" class="edit-community-avatar avatar-default edit-community-avatar-default" alt=">
                            <img src="./imgs/avatar_hover.png" alt="" class="edit-community-avatar avatar-hover">
                            <input type="file" name="avatar" class="group-edit-avatar-input-element">
                        </div>
                        <h2 class="edit-community-subtitle">Info</h2>
                        <div class="info-inputs-container">
                            <div class="edit-community-input-container">
                                <span class="edit-community-placeholder">Name</span>
                                <input type="text" class="edit-community-input input-name" name="name" value="${response.name}">
                            </div>
                            <div class="edit-community-input-container">
                                <span class="edit-community-placeholder">Description</span>
                                <textarea class="edit-community-input input-description" name="description">${response.description}</textarea>
                            </div>
                        </div>
                        <h2 class="edit-community-subtitle">Settings</h2>
                        <div class="settings-inputs-container">

                            <div class="settings-input-container">
                                <div class="settings-input-placeholder-container">
                                    <img src="./icons/icon-nickname.svg" class="settings-input-placeholder-icon">
                                    <span class="settings-input-placeholder-placeholder">Shortname</span>
                                </div>
                                <input type="text" class="settings-input" name="shortname" value="${response.shortname}">
                            </div>

                            <div class="settings-input-container">
                                <div class="settings-input-placeholder-container">
                                    <img src="./icons/settings/wallet.svg" class="settings-input-placeholder-icon">
                                    <span class="settings-input-placeholder-placeholder">Payments</span>
                                </div>
                                <div class="settings-pseudo-input">${response.payments}</div>
                            </div>

                            <div class="settings-input-container">
                                <div class="settings-input-placeholder-container">
                                    <img src="./icons/icon-message.svg" class="settings-input-placeholder-icon">
                                    <span class="settings-input-placeholder-placeholder">Welcome message</span>
                                </div>
                                <input type="text" class="settings-input" maxlength="20" name="welcome_message" value="${response.welcome_message}">
                            </div>
                        </div>
                        <input type="hidden" class="groupid_edit_secret-input" value="${response.groupid}" name="groupid">
                        `
                        form.innerHTML = html;
                        form.getElementsByClassName('edit-avatar-container-group')[0].addEventListener('click', function () {
                            form.getElementsByClassName('group-edit-avatar-input-element')[0].click();
                            form.getElementsByClassName('group-edit-avatar-input-element')[0].addEventListener('input', function () {
                                let img = this.files[0];
                                if (img) {
                                    let reader = new FileReader();
                                    reader.readAsDataURL(img)
                                    reader.addEventListener('load', function () {
                                        form.getElementsByClassName('edit-community-avatar-default')[0].src = this.result;
                                    })
                                }
                            })
                        })
                        modalEditCommunity.classList.add('modal-edit-community_shown');
                        const deleteCommunityButton = modalEditCommunity.getElementsByClassName('delete-community-button')[0];
                        deleteCommunityButton.addEventListener('click', function(){
                            let thisGroupid = modalEditCommunity.getElementsByClassName('groupid_edit_secret-input')[0].value;
                            let confirm_val = confirm('You sure you want to delete this group?');
                            if(confirm_val){
                                fetch('/app?action=deleteCommunity',{
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json;charset=utf-8'
                                    },
                                    body: JSON.stringify({id: thisGroupid})
                                })
                                .then(function(response){
                                    response.json().then(function(data){
                                        if(data.status == 'error'){
                                            alert(data.message)
                                        }
                                        else{
                                            window.location.reload();
                                        }
                                    })
                                })
                            }
                        });
                        modalEditCommunity_buttonSubmit.addEventListener('click', function(){
                            sumbitCommunityChanges(editCommunity_form);
                        })
                    }
                    else{
                        alert(data.message);
                    }
                })
            }
        )
    })
}

function createNewCommunity_sendRequest(superSecretForm){
    console.log(superSecretForm);
    const body = new FormData(superSecretForm);
    console.log(body.avatar);
    for (var pair of body.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
    }
    console.log(body);
    showLoadingSection();
    fetch('/app?action=createCommunity',{
        method: 'POST',
        body: body
    })
    .then(
        function (response){
            response.json().then(function(data){
                hideLoadingSection();
                if(data.status == 'success'){
                    alert('Community created successfully. Customize it in settings for more convenient use');
                    window.location.reload();
                }
                if(data.status == 'error'){
                    alert(message);
                }
            })
        }
    )
}

for (let i = 0; i < notificationPreviewSettings.length; i++) {
    notificationPreviewSettings[i].addEventListener('click', function () {
        setTimeout(() => {
            const setting = document.getElementsByClassName('checkbox-on')[0].getAttribute('type');
            let settingValue;
            if (setting == 'NameAndText') {
                settingValue = 1;
            }
            if (setting == 'NameOnly') {
                settingValue = 2;
            }
            let thisSetting_obj = {
                name: 'NP',
                setting: settingValue
            }
            showLoadingSection();
            let response = fetch('/app?action=settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(thisSetting_obj)
            })
                .then(
                    function (response) {
                        response.json().then(function (data) {
                            hideLoadingSection()
                        })
                    }
                )
        }, 100);
    })
}

for (let i = 0; i < notificationSettingsCheckboxes.length; i++) {
    notificationSettingsCheckboxes[i].addEventListener('click', function () {
        setTimeout(() => {
            let thisSetting_name = this.getAttribute('setting');
            let thisSetting_value = (this.getAttribute('state') == 'off')
            let thisSetting_obj = {
                name: thisSetting_name,
                setting: thisSetting_value
            };
            showLoadingSection();
            fetch('/app?action=settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(thisSetting_obj)
            })
            .then(
                function (response) {
                    response.json().then(function (data) {
                        console.log('asd');
                        if (data.status == 'success') {
                            hideLoadingSection();
                        }
                        else {
                            alert(data.message)
                            window.location.reload();
                        }
                    })
                }
            )
        }, 100);
    })
}

for (let i = 0; i < privacySettings_options.length; i++) {
    privacySettings_options[i].addEventListener('click', function () {
        const setting = this.getAttribute('setting');
        const option = this.getAttribute('setting-value');
        let setting_obj = { name: setting, setting: option };
        console.log(setting_obj);
        showLoadingSection();
        let response = fetch('/app?action=settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(setting_obj)
        })
            .then(
                function (response) {
                    response.json().then(function (data) {
                        if (data.status == 'success') {
                            hideLoadingSection();
                        }
                        else {
                            alert(data.message);
                        }
                    })
                }
            )
    })
}

logout_button.addEventListener('click', function (e) {
    e.preventDefault();
    showLoadingSection()
    setTimeout(() => {
        window.location.reload();
    }, 1000);
    let response = fetch('/app?action=logout', {
        method: 'GET',
    })
})

function showSearchFullInfo(type, id) {
    // for(let i = 0; i < discoverBodies.length; i++){
    //     discoverBodies[i].classList.remove('discover-body-item_active');
    // }
    discoverUserInfo.classList.add('modal-user-info_active');
    fetch('/app?action=getFullInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ type: type, id: id })
    })
        .then(
            function (response) {
                response.json().then(function (data) {
                    fillUserInfoModal(data)
                })
            }
        )
}

function fillUserInfoModal(body) {
    const modal = document.getElementsByClassName('modal-user-info')[0].getElementsByClassName('user-info-container')[0];
    modal.innerHTML = '';
    let thisUser_onlineStatus = (body.online == 'online') ? 'online' : 'offline';
    let thisUser_onlineStatusContent = (body.online == 'online') ? 'online' : `last seen: ${body.online}`;
    let emailhref = (body.email != 'hidden') ? `mailto:${body.email}` : '" style="pointer-events: none;';
    let location = (body.location != '') ? `<a href="https://www.google.com/maps/place/${body.location}" target="_blank"><div class="user-quick-info-item"><img src="./icons/icon-location.svg"> ${body.location}</div></a>` : '';
    let vk = (body.vk != '') ? `<a href="https://www.${body.vk}" target="_blank"><div class="user-quick-info-item"><img src="./icons/icon-vk.svg"> ${body.vkshort}</div></a>` : '';
    let isFriend_toFill_content = ``;
    if(body.isFriend){
        isFriend_toFill_content = `<div class="user-actions-block-item button-remove-from-friends" uid="${body.id}"><img src="./icons/icon-remove-friend.svg"> Remove from contacts</div>`
    }
    if(!body.isFriend){
        isFriend_toFill_content = `<div class="user-actions-block-item button-add-to-friends" uid="${body.id}"><img src="./icons/icon-add-friend.svg"> Add to contacts</div>`
    }
    modal.innerHTML = `
    <div class="user-info-block-left">
            <img src="${body.avatar}" class="user-info-avatar">
            <div class="user-fullname-block">
                <p class="fullname">${body.fullname}</p>
                <p class="online-status online-status_${thisUser_onlineStatus}">${thisUser_onlineStatusContent}</p>
            </div>
            <button class="send-message-button" to="${body.id}">Send message</button>
            <div class="user-actions-block">
                <div class="user-actions-block-item"><img src="./icons/icon-mute.svg"> Mute notifications</div>
                ${isFriend_toFill_content}
                <div class="user-actions-block-item"><img src="./icons/icon-copy.svg"> Copy nickname</div>
                <div class="user-actions-block-item"><img src="./icons/icon-report.svg"> Report for spam</div>
            </div>
            </div>
            <div class="user-info-block-right">
                <h1 class="user-info-block-right-title">About</h1>
                <div class="about-user-container">
                    <p class="about">${body.about}</p>
                    <div class="user-quick-info">
                        <a class="copy-nickname"><div class="user-quick-info-item"><img src="./icons/icon-nickname.svg"> ${body.nickname}</div></a>
                        <a href="${emailhref}"><div class="user-quick-info-item"><img src="./icons/icon-email.svg"> ${body.email}</div></a>
                        ${location}
                        ${vk}
                        <div class="user-quick-info-item user-quick-info-item-noncu"><img src="./icons/icon-birthday.svg">${body.dateOfBirth}</div>
                        <div class="user-quick-info-item user-quick-info-item-noncu"><img src="./icons/icon-report.svg">Joined ${body.joined}</div>
                    </div>
                </div>
            </div>
    `
    document.getElementsByClassName('button-add-to-friends')[0].addEventListener('click', function(){
        let thisUser_id = this.getAttribute('uid');
        let response = fetch('/app?action=addToFriends',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({id: thisUser_id})
        })
        .then(
            function (response){
                response.json().then(function(data){
                    console.log(data);
                })
            }
        )
    })
}

//Приходящие данные
// {"id":1658475134827,
// "avatar":"/avatars/1658564870084.png",
// "fullname":"Grigory Gusev",
// "online":"02:08:2022",
// "about":"",
// "nickname":"hohololoj2",
// "location":"Ufa",
// "vk":"vk.com/hohololoj",
// "dateOfBirth":"19 undefined 2003, 19y.o.",
// "joined":"5 Jun 2022"}

function findOnlineStatus(str) {
    if (str == 'online') {
        return '<p class="online-status-online">online</p>';
    }
    else {
        return '<p class="online-status-last-seen">last seen ' + str.toString() + '</p>';
    }
}

async function sendSearchRequest(request, range, thisForm_searchIcon, thisForm_loadingIcon) {
    fetch('/app?action=search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ range: range, search_request: request })
    })
        .then(
            function (response) {
                response.json().then(function (data) {
                    thisForm_loadingIcon.classList.remove('loading-spinning-icon_shown');
                    thisForm_searchIcon.classList.add('icon-search_shown');
                    let html = '';
                    if (data.people.length != 0) {
                        html += `<h1 class="search-result-title">People</h1>`;
                        for (let i = 0; i < data.people.length; i++) {
                            let isFriend = ``;
                            if(data.people[i].isFriend == true){
                                isFriend = `
                                    <div class="search-result-isFriend">
                                        <img src="/icons/menu-icons/icon-friends.svg">
                                    </div>`;
                            }
                            html += `
                                <div class="search-result-item" type="user" uid=${data.people[i].id}>
                                    <img src="${data.people[i].avatar}" class="search-result-avatar">
                                    <div class="right-part-container">
                                        <div class="right-part">
                                            <p class="name">${data.people[i].fullname.toString()}</p>
                                            ${findOnlineStatus(data.people[i].online)}
                                        </div>
                                        ${isFriend}
                                    </div>
                                </div>
                            `
                        }
                    }
                    if(data.groups.length != 0){
                        html += `<h1 class="search-result-title">Groups</h1>`;
                        for (let i = 0; i < data.groups.length; i++) {
                            html += `
                                <div class="search-result-item" type="groups" gid=${data.groups[i].groupid}>
                                    <img src="${data.groups[i].avatar}" class="search-result-avatar">
                                    <div class="right-part">
                                        <p class="name">${data.groups[i].name.toString()}</p>
                                        <p class="online-status-last-seen">${data.groups[i].members} members</p>
                                    </div>
                                </div>
                            `
                        }
                    }
                    let searchResultContainer = document.getElementsByClassName(`search-results-container-${range}`)[0];
                    searchResultContainer.innerHTML = html;
                    const searchResults = document.getElementsByClassName('search-result-item');
                    for (let i = 0; i < searchResults.length; i++) {
                        searchResults[i].addEventListener('click', function () {
                            let type = this.getAttribute('type');
                            let id;
                            if (type == 'user') { id = this.getAttribute('uid'); }
                            if (type == 'group') { id = this.getAttribute('gid'); }
                            showSearchFullInfo(type, id)
                        });
                    }
                })
            }
        )
}

function sendChangeEmailCode(code) {
    showLoadingSection()
    let email = changeEmail_emailContainer.innerHTML;
    const body = {
        code: code,
        email: email
    }
    let response = fetch('/app?action=changeEmailCode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(body)
    })
        .then(
            function (response) {
                response.json().then(function (data) {
                    hideLoadingSection()
                    if (data.status == 'error') {
                        alert(data.message);
                    }
                    else {
                        alert(data.message);
                        window.location.reload();
                    }
                })
            }
        )
}

emailChangeModalCodeSend_button.addEventListener('click', function () {
    let code = emailChangeModalCodeSend_input.value;
    sendChangeEmailCode(code)
})

emailChangeModalCodeSend_form.addEventListener('submit', function (e) {
    e.preventDefault();
    let code = emailChangeModalCodeSend_input.value;
    sendChangeEmailCode(code)
})

function emailChange(email) {
    if (email == '') {
        alert('Please enter a valid email address');
        return false;
    }
    changeEmail_emailContainer.innerHTML = email;
    let body = { email: email };
    showLoadingSection();
    let response = fetch('/app?action=changeEmail', {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=utf-8' },
        body: JSON.stringify(body)
    })
        .then(
            function (response) {
                response.json().then(function (data) {
                    hideLoadingSection();
                    if (data.status != 'success') {
                        window.location.reload();
                        alert(data.message);
                    }
                    else {
                    }
                })
            }
        )
}

emailChangeForm_button.addEventListener('click', function (e) {
    let email = emailChangeForm_input.value;
    emailChange(email);
})

emailChangeForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let email = emailChangeForm_input.value;
    emailChange(email);
})

editProfile_button.addEventListener('click', function (e) {
    e.preventDefault();
    const body = new FormData(editProfile_from);
    showLoadingSection()
    let response = fetch('/app?action=editProfile', {
        method: 'POST',
        body: body
    })
        .then(
            function (response) {
                response.json().then(function (data) {
                    window.location.reload();
                })
            }
        )
})