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
const contactsContainer = document.getElementsByClassName('chats-container-contacts')[0];
const chatContainer = document.getElementsByClassName('chats-body-user-empty')[0];
const chat_unselected_contentBody = document.getElementsByClassName('chats-body-unselected')[0];
const chatLoadingSpinner = document.getElementsByClassName('loading-spinning-icon')[0];
const sendChatMessage_superSecretForm = document.getElementsByClassName('sendChatMessage_superSecretForm')[0];
const chatMessages_container = document.getElementsByClassName('chat-messages-container')[0];
const chatMessages_line = document.getElementsByClassName('empty-chat-info-container')[0];
const chat_fileInput = document.getElementsByClassName('file-input-chat')[0];
const inmessage_attachments_container = document.getElementsByClassName('attachments-inmessage-container')[0];
const colorInputs = document.getElementsByClassName('color-item');
const themeBlocks = document.getElementsByClassName('appearance-block');

socket.onopen = function () {
    socket.send('socket connection test')
}

function deattach(thisButton){
    let attached_files = inmessage_attachments_container.childNodes;
    let index;
    let thisImg_container = thisButton.parentNode;
    for(let i = 0; i < attached_files.length; i++){
        if(attached_files[i] == thisImg_container){
            index = i;
            break;
        }
    }
    // исходя из индекса нажатой кнопки узнается индекс файла в массиве файлов  
    console.log('файлы в инпуте до удаления: ', chat_fileInput.files);
    inmessage_attachments_container.removeChild(thisImg_container);
    // удаляется визуальный элемент файла, в котором была нажата кнопка ужаления
    let files = new DataTransfer();
    for(let i = 0; i < chat_fileInput.files.length; i++){
        if(i != index){
            let file = new File(['files'], chat_fileInput.files[i].name);
            files.items.add(file)
        }
    }
    console.log(files);
    chat_fileInput.files = files.files;
    console.log('файлы в инпуте после удаления: ', chat_fileInput.files);
}

function addDeleteAttachmentEvents(deattach_buttons){
    for (let i = 0; i < deattach_buttons.length; i++) {
        deattach_buttons[i].addEventListener('click', function(e){
            deattach(this)
        });
    }
}

function calculateFileSize(fileSize_bytes){
    if(fileSize_bytes >= 1024){
        let fileSize_kbs = fileSize_bytes / 1024;
        if(fileSize_kbs >= 1024){
            let fileSize_mbs = fileSize_kbs / 1024;
            if(fileSize_mbs >= 1024){
                let fileSize_gbs = fileSize_mbs / 1024;
                if(fileSize_gbs >= 1){
                    return false;
                }
                else{
                    return(fileSize_gbs.toFixed(1)+'GB');
                }
            }
            else{
                return(fileSize_mbs.toFixed(1)+'MB')
            }
        }
        else{
            return(fileSize_kbs.toFixed(1)+'KB')
        }
    }
    else{
        return(fileSize_bytes.toFixed(1)+'B');
    }
}

chat_fileInput.addEventListener('input', function(e){
    console.log(chat_fileInput.files);
    let files = this.files;
    const img_exts = ['jpg', 'jpeg', 'png', 'gif', 'ico', 'svg', 'bmp'];
    const video_exts = ['mp4', 'webm', 'avi'];
    const audio_exts = ['mp3', 'wav', 'ogg'];
    const prohibited_exts = ['exe', 'bat', 'bin', 'cmd'];
    let promises = [];
    for (let i = 0; i < files.length; i++) {
        promises.push(new Promise((resolve, reject) => {
            let thisFile_name = files[i].name;
            let thisFile_ext = thisFile_name.split('.').reverse()[0];
            const reader = new FileReader();
            if (img_exts.includes(thisFile_ext)) {
                reader.readAsDataURL(files[i]);
                reader.addEventListener('load', function () {
                    inmessage_attachments_container.innerHTML += `<div class="attached-img-container"><button class="deattach-img-button"><img src="./icons/icon-close_white.svg"></button><img src="${this.result}"></div>`;
                    resolve()
                })
            }
            else if(audio_exts.includes(thisFile_ext)){
                reader.readAsDataURL(files[i]);
                reader.addEventListener('load', function () {
                    inmessage_attachments_container.innerHTML += `
                    <div class="attached-audio-container">
                    <button class="deattach-img-button"><img src="./icons/icon-close_white.svg"></button>
                    <div class="audio-container">
                        <audio src="${this.result}"></audio>
                        <div class="audio-controls-container">
                            <img src="./icons/icon-play-video.svg" class="audio-play-button">
                            <img src="./icons/icon-pause.svg" class="audio-play-button audio-play-button_hidden">
                            <img src="./icons/icon-video-volume.svg" class="volume-icon volume-icon-unmuted">
                            <img src="./icons/icon-video-volume-muted.svg" class="volume-icon volume-icon_hidden">
                            <input type="range" class="input-volume" value="50" max="100">
                            <progress value="0" max="100" class="audio-progress"></progress>
                        </div>
                    </div>
                </div>
                    `;
                    resolve()
                })
            }
            else if(video_exts.includes(thisFile_ext)){
                reader.readAsDataURL(files[i]);
                reader.addEventListener('load', function () {
                    inmessage_attachments_container.innerHTML += `<div class="attached-video-container"><button class="deattach-img-button"><img src="./icons/icon-close_white.svg"></button>
                    <div class="video-container">
                                            <video class="modal-window-fullscreen-content" src="${this.result}"></video>
                                            <div class="video-controls message-element_viewable">
                                                <img src="./icons/icon-play-video.svg" class="video-play-button">
                                                <div class="controls-container">
                                                    <progress value="0" max="100" class="video-progress-bar"></progress>
                                                    <div class="controls-container-buttons">
                                                        <div class="video-timer">
                                                            <div class="video-timer-current">
                                                                <p class="video-timer-current-hours video-timer-current-hours_hidden">00</p>
                                                                <p class="colon-hours colon-hours_hidden">:</p>
                                                                <p class="video-timer-current-minutes">00</p>
                                                                <p class="colon">:</p>
                                                                <p class="video-timer-current-seconds">00</p>
                                                            </div>
                                                            <p class="video-timer-separator">/</p>
                                                            <div class="video-timer-total">
                                                                <p class="video-timer-total-hours video-timer-total-hours_hidden">00</p>
                                                                <p class="colon colon-hours_hidden">:</p>
                                                                <p class="video-timer-total-minutes">00</p>
                                                                <p class="colon">:</p>
                                                                <p class="video-timer-total-seconds">00</p>
                                                            </div>
                                                        </div>
                                                        <div class="video-volume-controller">
                                                            <img src="./icons/icon-video-volume.svg" class="video-controls-volume video-unmuted">
                                                            <img src="./icons/icon-video-volume-muted.svg" class="video-controls-volume video-controls-volume_hidden">
                                                            <input type="range" value="50" max="100"class="video-volume-input">
                                                        </div>
                                                        <div class="video-controls-options">
                                                            <img src="./icons/icon-fullscreen-enter.svg" class="video-controls-fullscreen-enter">
                                                            <img src="./icons/icon-fullscreen-exit.svg" class="video-controls-fullscreen-enter icon_hidden">
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                    `
                    resolve()
                })
            }
            else if(prohibited_exts.includes(thisFile_ext)){
                showNotification({type: 'error', title: 'Failed to load file', message: 'This type of files is prohibited', hide: 'auto'})
            }
            else{
                let fileSize_bytes = files[i].size;
                let fileSize = calculateFileSize(fileSize_bytes);
                if(fileSize != false){
                    inmessage_attachments_container.innerHTML += 
                    `
                    <div class="attached-others-container"><button class="deattach-img-button"><img src="./icons/icon-close_white.svg"></button>
                    <div class="others-files-container">
                        <img src="./icons/icon-other-file.svg" class="other-files-icon">
                        <div class="others-file-info-container">
                            <p class="file-name">${files[i].name}</p>
                            <p class="file-size">${fileSize}</p>
                        </div>
                    </div>
                    </div>
                    `
                }
                else{
                    let files = new DataTransfer();
                    let index = i;
                    for(let j = 0; j < chat_fileInput.files.length; j++){
                        if(j != index){
                            let file = new File(['files'], chat_fileInput.files[j].name);
                            files.items.add(file)
                        }
                    }
                    chat_fileInput.files = files.files;
                showNotification({type: 'error', title: 'Failed to load file', message: 'This file is too big', hide: 'auto'})
                }
                resolve();
            }
        }))
    }
    Promise.all(promises)
        .then(() => {
            let attached_videos = inmessage_attachments_container.getElementsByClassName('attached-video-container');
            for(let i = 0; i < attached_videos.length; i++){
                attached_videos[i].addEventListener('click', function(){
                    let thisVideo_videoElement = attached_videos[i].getElementsByTagName('video')[0];
                    let videoplayer = new video(thisVideo_videoElement);
                    videoplayer.disableVolumeInput();
                    videoplayer.initialize();
                    let thisVideo_playButton = attached_videos[i].getElementsByClassName('video-play-button')[0];
                    thisVideo_playButton.click();
                })
            }
            let attached_audios = inmessage_attachments_container.getElementsByClassName('attached-audio-container');
            for(let i = 0; i < attached_audios.length; i++){
                let thisAudio = attached_audios[i].getElementsByTagName('audio')[0];
                let thisAudio_playButton = attached_audios[i].getElementsByClassName('audio-play-button')[0];
                thisAudio_playButton.addEventListener('click', function(){
                    let audioplayer = new audio(thisAudio);
                    audioplayer.initialize();
                    audioplayer.play();
                })
            }
            let deattach_buttons = document.getElementsByClassName('deattach-img-button');
            addDeleteAttachmentEvents(deattach_buttons)
        })
})

function updateQuickChats(){
    let quickAccessChats = document.getElementsByClassName('chat-item');
    for(let i = 0; i < quickAccessChats.length; i++){
        quickAccessChats[i].addEventListener('click', function(){
            let context = this.getAttribute('type');
            let thisUser_id = this.getAttribute('uid');
            chat_unselected_contentBody.classList.remove('chat_active');
            chatContainer.classList.add('chat_active');
            document.getElementsByClassName('actions-body_active')[0].classList.remove('actions-body_active');
            document.getElementsByClassName('chats-body')[0].classList.add('actions-body_active');
            // document.getElementsByClassName('menu-item-active')[0].classList.remove('menu-item-active');
            // document.getElementsByClassName('menu-item-chats')[0].classList.add('menu-item-active');
            chatLoadingSpinner.classList.add('chats-user-body-item_active');
            getChat_history(thisUser_id, context);
        })
    }
}

function sendChatMessage(message, files, user_toSend_id, context) {
    if(message != '') {
        sendChatMessage_superSecretForm.getElementsByClassName('input-message')[0].value = message;
        sendChatMessage_superSecretForm.getElementsByClassName('input-message')[0].setAttribute('name', 'message');
    }
    if(files != null){
        console.log(files);
        sendChatMessage_superSecretForm.getElementsByClassName('input-files')[0].setAttribute('type', 'file');
        sendChatMessage_superSecretForm.getElementsByClassName('input-files')[0].files = files;
        sendChatMessage_superSecretForm.getElementsByClassName('input-files')[0].setAttribute('name', 'files');
    }
    else{
        sendChatMessage_superSecretForm.getElementsByClassName('input-files')[0].setAttribute('type', 'text');
        sendChatMessage_superSecretForm.getElementsByClassName('input-files')[0].value = false;
    }
    sendChatMessage_superSecretForm.getElementsByClassName('input-uid')[0].value = user_toSend_id;
    sendChatMessage_superSecretForm.getElementsByClassName('input-uid')[0].setAttribute('name', 'id');

    let thisFormObject = new FormData(sendChatMessage_superSecretForm);

    if(message != '' || files != null){
        fetch(`/app?action=writeMessage&context=${context}`, {
            method: 'POST',
            body: thisFormObject
        })
        .then(()=>{
            sendChatMessage_superSecretForm.getElementsByClassName('input-files')[0].value = '';
            sendChatMessage_superSecretForm.getElementsByClassName('input-message')[0].value = '';
            sendChatMessage_superSecretForm.getElementsByClassName('input-uid')[0].value = '';
        })
    }
}

function fillModalChat(data, context){
    switch(context){
        case 'user':{
            let userInfo = data.userInfo;
            let chatHistory = data.chatHistory;

            chatContainer.getElementsByClassName('user-info-name')[0].innerHTML = userInfo.fullname;

            let lastOnline_container = chatContainer.getElementsByClassName('user-info-last-online')[0];
            if (userInfo.onlineStatus == 'online') {
                lastOnline_container.classList.add('onlineStatus_online');
                lastOnline_container.innerHTML = userInfo.onlineStatus;
            }
            else {
                lastOnline_container.classList.add('onlineStatus_offline');
                lastOnline_container.innerHTML = `last seen ${userInfo.onlineStatus}`;
            }

            chatContainer.getElementsByClassName('user-avatar')[0].src = userInfo.avatar;
            chatContainer.setAttribute('uid', userInfo.id);
            chatContainer.setAttribute('context', 'user');

            chatMessages_container.innerHTML = '';

            if (chatHistory.length == 0) {
                chatMessages_container.innerHTML +=
                `

                `
            }
            else {
                for (let i = 0; i < chatHistory.length; i++) {
                    console.log(chatHistory[i]);
                    let thisMessageDate_ms = chatHistory[i].time;
                    let thisMessageDate_date;
                    if (Date.now() - thisMessageDate_ms > 86400000) {
                        let date = new Date(thisMessageDate_ms);
                        let day = date.getUTCDate();
                        if (day < 10) { day = '0' + day }
                        let month = date.getUTCMonth();
                        if (month < 10) { month = '0' + month }
                        let year = date.getUTCFullYear();
                        thisMessageDate_date = `${day}.${month}.${year}`;
                    }
                    else {
                        let date = new Date(thisMessageDate_ms);
                        let hour_offset = new Date().getTimezoneOffset() / 60;
                        let hour = date.getUTCHours();
                        let minutes = date.getMinutes();
                        hour -= hour_offset;
                        if (hour < 10) { hour = '0' + hour }
                        if (minutes < 10) { minutes = '0' + minutes }
                        thisMessageDate_date = `${hour}:${minutes}`;
                    }
                    let thisMessage_html =
                        `
            <div class="chat-message">
            <div class="chat-message-avatar-container">
                <img src="${chatHistory[i].sender_avatar}">
            </div>
            <div class="chat-message-body">
            <div class="chat-message-header">
                <p class="user-name">${chatHistory[i].sender_fullname}</p>
                <p class="sent-date">${thisMessageDate_date}</p>
            </div>
            <div class="message-body">`
                    if (chatHistory[i].message != '') {
                        let message = chatHistory[i].message;
                        message = message.replace(/\r/gm, '<br>');
                        thisMessage_html += `<div class="message-element">${message}</div>`;
                    }
                    if (chatHistory[i].files.imgs.length != 0) {
                            for (let j = 0; j < chatHistory[i].files.imgs.length; j++) {
                            console.log(`картинка получена: ${chatHistory[i].files.imgs[j].path}\nШирина:${chatHistory[i].files.imgs[j].dimensions.width}\nВысота: ${chatHistory[i].files.imgs[j].dimensions.height}`);

                            let width = chatHistory[i].files.imgs[j].dimensions.width;
                            let height = chatHistory[i].files.imgs[j].dimensions.height;
                            let img_path = chatHistory[i].files.imgs[j].path;
                            let width_toSet;
                            let height_toSet;
                            if(width != height){
                                if(width > 680){
                                    width_toSet = 680;
                                }
                                else{
                                    width_toSet = width;
                                }
                                if(height > 360){
                                    height_toSet = 360;
                                }
                                else{
                                    height_toSet = height;
                                }
                            }
                            else{
                                if(height > 360){
                                    width_toSet = 360;
                                    height_toSet = 360;
                                }
                                else{
                                    width_toSet = height;
                                    height_toSet = height;
                                }
                            }
                            console.log(`картинка получена: ${chatHistory[i].files.imgs[j].path}\nШирина установлена:${width_toSet}\nВысота установлена: ${height_toSet}`);
                            
                            thisMessage_html +=
                                `<div class="message-element">
                                <div class="img-container">
                                    <img width="${width_toSet}" height="${height_toSet}" class="message-element-img message-element_viewable modal-window-fullscreen-content modal-window-fullscreen-content_img"src="./chat_files/imgs/${img_path}">
                                </div>
                            </div>`
                        }
                    }
                    if (chatHistory[i].files.videos.length != 0) {
                        for (let j = 0; j < chatHistory[i].files.videos.length; j++) {
                            thisMessage_html +=
                                `
                            <div class="message-element">
                                <div class="video-container">
                                    <video class="modal-window-fullscreen-content" src="./chat_files/videos/${chatHistory[i].files.videos[j]}"></video>
                                    <div class="video-controls message-element_viewable">
                                        <img src="./icons/icon-play-video.svg" class="video-play-button">
                                        <div class="controls-container">
                                            <progress value="0" max="100" class="video-progress-bar"></progress>
                                            <div class="controls-container-buttons">
                                                <div class="video-timer">
                                                    <div class="video-timer-current">
                                                        <p class="video-timer-current-hours video-timer-current-hours_hidden">00</p>
                                                        <p class="colon-hours colon-hours_hidden">:</p>
                                                        <p class="video-timer-current-minutes">00</p>
                                                        <p class="colon">:</p>
                                                        <p class="video-timer-current-seconds">00</p>
                                                    </div>
                                                    <p class="video-timer-separator">/</p>
                                                    <div class="video-timer-total">
                                                        <p class="video-timer-total-hours video-timer-total-hours_hidden">00</p>
                                                        <p class="colon colon-hours_hidden">:</p>
                                                        <p class="video-timer-total-minutes">00</p>
                                                        <p class="colon">:</p>
                                                        <p class="video-timer-total-seconds">00</p>
                                                    </div>
                                                </div>
                                                <div class="video-volume-controller">
                                                    <img src="./icons/icon-video-volume.svg" class="video-controls-volume video-unmuted">
                                                    <img src="./icons/icon-video-volume-muted.svg" class="video-controls-volume video-controls-volume_hidden">
                                                    <input type="range" value="50" max="100"class="video-volume-input">
                                                </div>
                                                <div class="video-controls-options">
                                                    <img src="./icons/icon-fullscreen-enter.svg" class="video-controls-fullscreen-enter">
                                                    <img src="./icons/icon-fullscreen-exit.svg" class="video-controls-fullscreen-enter icon_hidden">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `
                        }
                    }
                    if (chatHistory[i].files.audios.length != 0) {
                        for (let j = 0; j < chatHistory[i].files.audios.length; j++) {
                            thisMessage_html +=
                                `
                        <div class="message-element">
                            <div class="audio-container">
                                <audio src="./chat_files/audios/${chatHistory[i].files.audios[j]}"></audio>
                                <div class="audio-controls-container">
                                    <img src="./icons/icon-play-video.svg" class="audio-play-button">
                                    <img src="./icons/icon-pause.svg" class="audio-play-button audio-play-button_hidden">
                                    <img src="./icons/icon-video-volume.svg" class="volume-icon volume-icon-unmuted">
                                    <img src="./icons/icon-video-volume-muted.svg" class="volume-icon volume-icon_hidden">
                                    <input type="range" class="input-volume" value="50" max="100">
                                    <progress value="0" max="100" class="audio-progress"></progress>
                                </div>
                            </div>
                        </div>
                        `
                        }
                    }
                    if (chatHistory[i].files.others.length != 0) {
                        for (let j = 0; j < chatHistory[i].files.others.length; j++) {
                            thisMessage_html +=
                                `
                        <div class="message-element message-element_downloadable">
                            <div class="others-files-container">
                                <img src="./icons/icon-other-file.svg" class="other-files-icon">
                                <div class="others-file-info-container">
                                    <p class="file-name">${chatHistory[i].files.others[j].fileName}</p>
                                    <p class="file-size">${chatHistory[i].files.others[j].fileWeight}</p>
                                </div>
                            </div>
                        </div>
                        `
                        }
                    }
                    thisMessage_html +=
                        `
                </div>
            </div>
            </div>
            `;
                    chatMessages_container.innerHTML += thisMessage_html;
                }
                    let message_bodies = document.getElementsByClassName('message-body');
                    for(let i = 0; i < message_bodies.length; i++){
                        updateChatEvents(message_bodies[i]);
                    }
                    scrollIntoChatView(chatMessages_container)
            }
            discoverUserInfo.classList.remove('modal-user-info_active');
            break;
        }
        case 'group':{
            let groupInfo = data.groupInfo;
            let chatHistory = data.chatHistory;

            chatContainer.getElementsByClassName('user-info-name')[0].innerHTML = groupInfo.groupName;

            let lastOnline_container = chatContainer.getElementsByClassName('user-info-last-online')[0];
            lastOnline_container.innerHTML = `${groupInfo.members} members`;
            

            chatContainer.getElementsByClassName('user-avatar')[0].src = groupInfo.avatar;
            chatContainer.setAttribute('uid', groupInfo.id);
            chatContainer.setAttribute('context', 'group');

            chatMessages_container.innerHTML = '';

            if (chatHistory.length == 0) {
                chatMessages_container.innerHTML +=
                `

                `
            }
            else {
                for (let i = 0; i < chatHistory.length; i++) {
                    console.log(chatHistory[i]);
                    let thisMessageDate_ms = chatHistory[i].time;
                    let thisMessageDate_date;
                    if (Date.now() - thisMessageDate_ms > 86400000) {
                        let date = new Date(thisMessageDate_ms);
                        let day = date.getUTCDate();
                        if (day < 10) { day = '0' + day }
                        let month = date.getUTCMonth();
                        if (month < 10) { month = '0' + month }
                        let year = date.getUTCFullYear();
                        thisMessageDate_date = `${day}.${month}.${year}`;
                    }
                    else {
                        let date = new Date(thisMessageDate_ms);
                        let hour_offset = new Date().getTimezoneOffset() / 60;
                        let hour = date.getUTCHours();
                        let minutes = date.getMinutes();
                        hour -= hour_offset;
                        if (hour < 10) { hour = '0' + hour }
                        if (minutes < 10) { minutes = '0' + minutes }
                        thisMessageDate_date = `${hour}:${minutes}`;
                    }
                    let thisMessage_html =
                        `
            <div class="chat-message">
            <div class="chat-message-avatar-container">
                <img src="${chatHistory[i].sender_avatar}">
            </div>
            <div class="chat-message-body">
            <div class="chat-message-header">
                <p class="user-name">${chatHistory[i].sender_fullname}</p>
                <p class="sent-date">${thisMessageDate_date}</p>
            </div>
            <div class="message-body">`
                    if (chatHistory[i].message != '') {
                        let message = chatHistory[i].message;
                        message = message.replace(/\r/gm, '<br>');
                        thisMessage_html += `<div class="message-element">${message}</div>`;
                    }
                    if (chatHistory[i].files.imgs.length != 0) {
                            for (let j = 0; j < chatHistory[i].files.imgs.length; j++) {
                            console.log(`картинка получена: ${chatHistory[i].files.imgs[j].path}\nШирина:${chatHistory[i].files.imgs[j].dimensions.width}\nВысота: ${chatHistory[i].files.imgs[j].dimensions.height}`);

                            let width = chatHistory[i].files.imgs[j].dimensions.width;
                            let height = chatHistory[i].files.imgs[j].dimensions.height;
                            let img_path = chatHistory[i].files.imgs[j].path;
                            let width_toSet;
                            let height_toSet;
                            if(width != height){
                                if(width > 680){
                                    width_toSet = 680;
                                }
                                else{
                                    width_toSet = width;
                                }
                                if(height > 360){
                                    height_toSet = 360;
                                }
                                else{
                                    height_toSet = height;
                                }
                            }
                            else{
                                if(height > 360){
                                    width_toSet = 360;
                                    height_toSet = 360;
                                }
                                else{
                                    width_toSet = height;
                                    height_toSet = height;
                                }
                            }
                            console.log(`картинка получена: ${chatHistory[i].files.imgs[j].path}\nШирина установлена:${width_toSet}\nВысота установлена: ${height_toSet}`);
                            
                            thisMessage_html +=
                                `<div class="message-element">
                                <div class="img-container">
                                    <img width="${width_toSet}" height="${height_toSet}" class="message-element-img message-element_viewable modal-window-fullscreen-content modal-window-fullscreen-content_img"src="./chat_files/imgs/${img_path}">
                                </div>
                            </div>`
                        }
                    }
                    if (chatHistory[i].files.videos.length != 0) {
                        for (let j = 0; j < chatHistory[i].files.videos.length; j++) {
                            thisMessage_html +=
                                `
                            <div class="message-element">
                                <div class="video-container">
                                    <video class="modal-window-fullscreen-content" src="./chat_files/videos/${chatHistory[i].files.videos[j]}"></video>
                                    <div class="video-controls message-element_viewable">
                                        <img src="./icons/icon-play-video.svg" class="video-play-button">
                                        <div class="controls-container">
                                            <progress value="0" max="100" class="video-progress-bar"></progress>
                                            <div class="controls-container-buttons">
                                                <div class="video-timer">
                                                    <div class="video-timer-current">
                                                        <p class="video-timer-current-hours video-timer-current-hours_hidden">00</p>
                                                        <p class="colon-hours colon-hours_hidden">:</p>
                                                        <p class="video-timer-current-minutes">00</p>
                                                        <p class="colon">:</p>
                                                        <p class="video-timer-current-seconds">00</p>
                                                    </div>
                                                    <p class="video-timer-separator">/</p>
                                                    <div class="video-timer-total">
                                                        <p class="video-timer-total-hours video-timer-total-hours_hidden">00</p>
                                                        <p class="colon colon-hours_hidden">:</p>
                                                        <p class="video-timer-total-minutes">00</p>
                                                        <p class="colon">:</p>
                                                        <p class="video-timer-total-seconds">00</p>
                                                    </div>
                                                </div>
                                                <div class="video-volume-controller">
                                                    <img src="./icons/icon-video-volume.svg" class="video-controls-volume video-unmuted">
                                                    <img src="./icons/icon-video-volume-muted.svg" class="video-controls-volume video-controls-volume_hidden">
                                                    <input type="range" value="50" max="100"class="video-volume-input">
                                                </div>
                                                <div class="video-controls-options">
                                                    <img src="./icons/icon-fullscreen-enter.svg" class="video-controls-fullscreen-enter">
                                                    <img src="./icons/icon-fullscreen-exit.svg" class="video-controls-fullscreen-enter icon_hidden">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `
                        }
                    }
                    if (chatHistory[i].files.audios.length != 0) {
                        for (let j = 0; j < chatHistory[i].files.audios.length; j++) {
                            thisMessage_html +=
                                `
                        <div class="message-element">
                            <div class="audio-container">
                                <audio src="./chat_files/audios/${chatHistory[i].files.audios[j]}"></audio>
                                <div class="audio-controls-container">
                                    <img src="./icons/icon-play-video.svg" class="audio-play-button">
                                    <img src="./icons/icon-pause.svg" class="audio-play-button audio-play-button_hidden">
                                    <img src="./icons/icon-video-volume.svg" class="volume-icon volume-icon-unmuted">
                                    <img src="./icons/icon-video-volume-muted.svg" class="volume-icon volume-icon_hidden">
                                    <input type="range" class="input-volume" value="50" max="100">
                                    <progress value="0" max="100" class="audio-progress"></progress>
                                </div>
                            </div>
                        </div>
                        `
                        }
                    }
                    if (chatHistory[i].files.others.length != 0) {
                        for (let j = 0; j < chatHistory[i].files.others.length; j++) {
                            thisMessage_html +=
                                `
                        <div class="message-element message-element_downloadable">
                            <div class="others-files-container">
                                <img src="./icons/icon-other-file.svg" class="other-files-icon">
                                <div class="others-file-info-container">
                                    <p class="file-name">${chatHistory[i].files.others[j].fileName}</p>
                                    <p class="file-size">${chatHistory[i].files.others[j].fileWeight}</p>
                                </div>
                            </div>
                        </div>
                        `
                        }
                    }
                    thisMessage_html +=
                        `
                </div>
            </div>
            </div>
            `;
                    chatMessages_container.innerHTML += thisMessage_html;
                }
                    let message_bodies = document.getElementsByClassName('message-body');
                    for(let i = 0; i < message_bodies.length; i++){
                        updateChatEvents(message_bodies[i]);
                    }
                    scrollIntoChatView(chatMessages_container)
            }
            discoverUserInfo.classList.remove('modal-user-info_active');
            break;
        }
    }
}

function getChat_history(id, context) {
    fetch('/app?action=getChatHistory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ id: id, context: context })
    })
        .then(
            function (response) {
                response.json().then(function (data){
                    fillModalChat(data, context)
                });
            }
        )
}


function addChatEvents(context) {
    switch(context){
        case 'user':{
            const sendMessageButtons = document.getElementsByClassName('send-message-button');
            for (let i = 0; i < sendMessageButtons.length; i++) {
                sendMessageButtons[i].addEventListener('click', function () {
                    let user_toChat_id = this.getAttribute('to');
                    chat_unselected_contentBody.classList.remove('chat_active');
                    chatContainer.classList.add('chat_active');
                    document.getElementsByClassName('actions-body_active')[0].classList.remove('actions-body_active');
                    document.getElementsByClassName('chats-body')[0].classList.add('actions-body_active');
                    // document.getElementsByClassName('menu-item-active')[0].classList.remove('menu-item-active');
                    // document.getElementsByClassName('menu-item-chats')[0].classList.add('menu-item-active');
                    document.getElementsByClassName('modal-user-info_active')[0].classList.remove('modal-user-info_active');
                    chatLoadingSpinner.classList.add('chats-user-body-item_active');
                    getChat_history(user_toChat_id, 'user');
                })
            }
            break;
        }
        //bookmark
        case 'group': {
            const groupActionButton = document.getElementsByClassName('send-message-button')[0];
            const copyLinkButton = document.getElementsByClassName('button-copy-group-link')[0];
            const leaveGroupButton = document.getElementsByClassName('group-action_leave-button');
            const editCommunityButton = document.getElementsByClassName('edit-community-button-secret');
            for(let i = 0; i < editCommunityButton.length; i++){
                editCommunityButton[i].addEventListener('click', editCommunity);
            }
            if(leaveGroupButton[0] != undefined){
                leaveGroupButton[0].addEventListener('click', function(){
                    let chatsBlock = document.getElementsByClassName('chats-container')[0];
                    let chatItems = chatsBlock.getElementsByClassName('chat-item');
                    let thisGroup_id = groupActionButton.getAttribute('to');
                    for(let i = 0; i < chatItems.length; i++){
                        console.log({
                            thisItem_uid: chatItems[i].getAttribute('uid'),
                            thisGroup_id: thisGroup_id
                        })
                        if(chatItems[i].getAttribute('uid') == thisGroup_id){
                            chatsBlock.removeChild(chatItems[i]);
                            break;
                        }
                    }
                    fetch('/app?action=leaveGroup',{
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
                                    showSearchFullInfo('groups', thisGroup_id);
                                }
                                else{
                                    window.location.reload();
                                }
                            })
                        }
                    )
                })
            }
            copyLinkButton.addEventListener('click', function(){
                let thisLink = this.getAttribute('shortname');
                thisLink = '@'+thisLink;
                window.navigator.clipboard.writeText(thisLink);
                showNotification({type: 'alert', title: 'Link copied', message: 'Group link added to your clipboard!', hide: 'auto'})
            })
            groupActionButton.addEventListener('click', function(){
                let actionType = this.getAttribute('action');
                let thisGroup_id = this.getAttribute('to');
                switch(actionType){
                    case 'open-group':{
                        chat_unselected_contentBody.classList.remove('chat_active');
                        chatContainer.classList.add('chat_active');
                        document.getElementsByClassName('actions-body_active')[0].classList.remove('actions-body_active');
                        document.getElementsByClassName('chats-body')[0].classList.add('actions-body_active');
                        document.getElementsByClassName('modal-user-info_active')[0].classList.remove('modal-user-info_active');
                        chatLoadingSpinner.classList.add('chats-user-body-item_active');
                        getChat_history(thisGroup_id, 'group');
                        break;
                    }
                    case 'join-group':{
                        fetch('/app?action=joinGroup',{
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify({groupid: thisGroup_id})
                        })
                        .then(
                            function (response){
                                response.json().then(function(data){
                                    showSearchFullInfo('groups', thisGroup_id, true);
                                    let chatsBlock = document.getElementsByClassName('chats-container')[0];
                                    let html = `
                                    <div class="contacts-item contacts-item_{{onlineStatus_classPart}}">
                                    <div class="avatar">
                                        <img src="{{avatar_path}}" class="contacts-avatar" uid="{{uid}}">
                                        <div class="online-status"></div>
                                    </div>
                
                                    <div class="contacts-content">
                                        <div class="contacts-title">
                                            <div class="user-name">{{fullname}}</div>
                                            <div class="online-status-text">
                                                <p class="last-online">{{onlineStatus_text}}</p>
                                                <p class="online">{{onlineStatus_text}}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                    `
                                })
                            }
                        )
                        break;
                    }
                }
            })
            break;
        }
    }
}

async function checkUserSettings(){
    return new Promise((resolve, reject) => {
        let user_settings_local = localStorage.getItem('user_settings');
        fetch('/app?action=getUserSettings', {
            method: 'POST'
        })
        .then(
            function (response) {
                response.json().then(function (user_settings_saved) {
                    let isEqual_settings = (JSON.stringify(user_settings_saved) === JSON.stringify(user_settings_local));
                    if(user_settings_local == undefined || !isEqual_settings){
                        localStorage.removeItem('user_settings');
                        localStorage.setItem('user_settings', JSON.stringify(user_settings_saved));
                    }
                    resolve(user_settings_saved);
                })
            }
        )
    })
}
async function handleUserSettings(user_settings){
    // let user_settings = JSON.parse(localStorage.getItem('user_settings'));
    const root = document.querySelector(':root');
    let theme_radioInput;
    let color_accent = user_settings.theme_accent;
    root.style.setProperty('--accent', color_accent);
    switch(user_settings.theme_main){
        case 'System':{
            theme_radioInput = document.getElementsByClassName('appearance-theme-input_system')[0];
            let theme_isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if(theme_isDark){
                root.style.setProperty('--theme_bg', '#111214');
                root.style.setProperty('--theme_sidebar', '#242629');
                root.style.setProperty('--color_main', '#DEDEDE');
            }
            else{
                root.style.setProperty('--theme_bg', 'white');
                root.style.setProperty('--theme_sidebar', '#F2F3F5');
                root.style.setProperty('--color_main', '#171A1F');
            }
            break;
        }
        case 'Light':{
            theme_radioInput = document.getElementsByClassName('appearance-theme-input_light')[0];
            root.style.setProperty('--theme_bg', 'white');
            root.style.setProperty('--theme_sidebar', '#F2F3F5');
            root.style.setProperty('--color_main', '#171A1F');
            break;
        }
        case 'Dark':{
            theme_radioInput = document.getElementsByClassName('appearance-theme-input_dark')[0];
            root.style.setProperty('--theme_bg', '#111214');
            root.style.setProperty('--theme_sidebar', '#242629');
            root.style.setProperty('--color_main', '#DEDEDE');
            break;
        }
    }
    theme_radioInput.classList.add('checkbox-on');
    for(let i = 0; i < colorInputs.length; i++){
        if(colorInputs[i].getAttribute('this-color') == color_accent){
            colorInputs[i].classList.add('color-item_selected');
            break;
        }
    }
}
new Promise((resolve, reject) => {
    let user_settings_saved = checkUserSettings();
    resolve(user_settings_saved);
})
.then((user_settings_saved) => {
    handleUserSettings(user_settings_saved)
})

function scrollIntoChatView(chatMessages_container){
    let scroll_value = chatMessages_container.scrollHeight;
    chatMessages_container.scrollTo(0, scroll_value);
}

socket.onmessage = function (e) {
    let thisMessage = JSON.parse(e.data);
    switch (thisMessage.action) {
        case 'notification': {
            showNotification(thisMessage);
            break;
        }
        case 'system': {
            switch (thisMessage.context) {
                case 'contacts': {
                    let html = `
                        <div class="contacts-item contacts-item_${thisMessage.toadd.onlineStatus_classPart}">
                            <div class="avatar">
                                <img src="${thisMessage.toadd.avatar_path}" class="contacts-avatar" uid="${thisMessage.toadd.uid}">
                                <div class="online-status"></div>
                            </div>
                            <div class="contacts-content">
                                <div class="contacts-title">
                                    <div class="user-name">${thisMessage.toadd.fullname}</div>
                                    <div class="online-status-text">
                                        <p class="last-online">${thisMessage.toadd.onlineStatus}</p>
                                        <p class="online">${thisMessage.toadd.onlineStatus}</p>
                                    </div>
                                </div>
                            </div>
                        </div>`
                    contactsContainer.innerHTML += html;
                    addContactsEvents()
                    break;
                }
            }
        }
        case 'chatMessage': {
            let message = JSON.parse(thisMessage.message);
            console.log(message);
            let thisMessageTime_ms = message.timestamp;
            let thisMessageDate_date;
            if (Date.now() - thisMessageTime_ms > 86400000) {
                let date = new Date(thisMessageTime_ms);
                let day = date.getUTCDate();
                if (day < 10) { day = '0' + day }
                let month = date.getUTCMonth();
                if (month < 10) { month = '0' + month }
                let year = date.getUTCFullYear();
                thisMessageDate_date = `${day}.${month}.${year}`;
            }
            else {
                let date = new Date(thisMessageTime_ms);
                let hour_offset = new Date().getTimezoneOffset() / 60;
                let hour = date.getUTCHours();
                let minutes = date.getMinutes();
                hour -= hour_offset;
                if (hour < 10) { hour = '0' + hour }
                if (minutes < 10) { minutes = '0' + minutes }
                thisMessageDate_date = `${hour}:${minutes}`;
            }
            let thisMessage_html =
                `
                    <div class="chat-message">
                    <div class="chat-message-avatar-container">
                        <img src="${message.avatar}">
                    </div>
                    <div class="chat-message-body">
                    <div class="chat-message-header">
                        <p class="user-name">${message.fullname}</p>
                        <p class="sent-date">${thisMessageDate_date}</p>
                    </div>
                    <div class="message-body">`
            if (message.message != '') {
                let thisMessage = message.message;
                thisMessage = thisMessage.replace(/\r/gm, '<br>');
                thisMessage_html += `<p class="message-element">${thisMessage}</p>`;
            }
            if(message.files != null){
                if (message.files.imgs.length != 0) {
                    for (let j = 0; j < message.files.imgs.length; j++) {
                        let width = message.files.imgs[j].dimensions.width;
                                    let height = message.files.imgs[j].dimensions.height;
                                    let img_path = message.files.imgs[j].path;
                                    let width_toSet;
                                    let height_toSet;
                                    if(width != height){
                                        if(width > 680){
                                            width_toSet = 680;
                                        }
                                        if(height > 360){
                                            height_toSet = 360;
                                        }
                                    }
                                    else{
                                        if(height > 360){
                                            width_toSet = 360;
                                            height_toSet = 360;
                                        }
                                        else{
                                            width_toSet = height;
                                            height_toSet = height;
                                        }
                                    }
                        thisMessage_html +=
                            `<div class="message-element">
                                            <div class="img-container">
                                                <img width="${width_toSet}" height="${height_toSet}" class="message-element-img message-element_viewable modal-window-fullscreen-content modal-window-fullscreen-content_img"src="./chat_files/imgs/${img_path}">
                                            </div>
                                        </div>`
                    }
                }
                if (message.files.videos.length != 0) {
                    for (let j = 0; j < message.files.videos.length; j++) {
                        thisMessage_html +=
                            `
                                        <div class="message-element">
                                            <div class="video-container">
                                                <video class="modal-window-fullscreen-content" src="./chat_files/videos/${message.files.videos[j]}"></video>
                                                <div class="video-controls message-element_viewable">
                                                    <img src="./icons/icon-play-video.svg" class="video-play-button">
                                                    <div class="controls-container">
                                                        <progress value="0" max="100" class="video-progress-bar"></progress>
                                                        <div class="controls-container-buttons">
                                                            <div class="video-timer">
                                                                <div class="video-timer-current">
                                                                    <p class="video-timer-current-hours video-timer-current-hours_hidden">00</p>
                                                                    <p class="colon-hours colon-hours_hidden">:</p>
                                                                    <p class="video-timer-current-minutes">00</p>
                                                                    <p class="colon">:</p>
                                                                    <p class="video-timer-current-seconds">00</p>
                                                                </div>
                                                                <p class="video-timer-separator">/</p>
                                                                <div class="video-timer-total">
                                                                    <p class="video-timer-total-hours video-timer-total-hours_hidden">00</p>
                                                                    <p class="colon colon-hours_hidden">:</p>
                                                                    <p class="video-timer-total-minutes">00</p>
                                                                    <p class="colon">:</p>
                                                                    <p class="video-timer-total-seconds">00</p>
                                                                </div>
                                                            </div>
                                                            <div class="video-volume-controller">
                                                                <img src="./icons/icon-video-volume.svg" class="video-controls-volume video-unmuted">
                                                                <img src="./icons/icon-video-volume-muted.svg" class="video-controls-volume video-controls-volume_hidden">
                                                                <input type="range" value="50" max="100"class="video-volume-input">
                                                            </div>
                                                            <div class="video-controls-options">
                                                                <img src="./icons/icon-fullscreen-enter.svg" class="video-controls-fullscreen-enter">
                                                                <img src="./icons/icon-fullscreen-exit.svg" class="video-controls-fullscreen-enter icon_hidden">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `
                    }
                }
                if (message.files.audios.length != 0) {
                    for (let j = 0; j < message.files.audios.length; j++) {
                        thisMessage_html +=
                            `
                                    <div class="message-element">
                                        <div class="audio-container">
                                            <audio src="./chat_files/audios/${message.files.audios[j]}"></audio>
                                            <div class="audio-controls-container">
                                                <img src="./icons/icon-play-video.svg" class="audio-play-button">
                                                <img src="./icons/icon-pause.svg" class="audio-play-button audio-play-button_hidden">
                                                <img src="./icons/icon-video-volume.svg" class="volume-icon volume-icon-unmuted">
                                                <img src="./icons/icon-video-volume-muted.svg" class="volume-icon volume-icon_hidden">
                                                <input type="range" class="input-volume" value="50" max="100">
                                                <progress value="0" max="100" class="audio-progress"></progress>
                                            </div>
                                        </div>
                                    </div>
                                    `
                    }
                }
                if (message.files.others.length != 0) {
                    for (let j = 0; j < message.files.others.length; j++) {
                        thisMessage_html +=
                            `
                                    <div class="message-element message-element_downloadable">
                                        <div class="others-files-container">
                                            <img src="./icons/icon-other-file.svg" class="other-files-icon">
                                            <div class="others-file-info-container">
                                                <p class="file-name">${message.files.others[j].fileName}</p>
                                                <p class="file-size">${message.files.others[j].fileWeight}</p>
                                            </div>
                                        </div>
                                    </div>
                                    `
                    }
                }
            }
            thisMessage_html +=
                `
                        </div>
                    </div>
                    </div>
                    `;
            chatMessages_container.innerHTML += thisMessage_html;
            scrollIntoChatView(chatMessages_container)

            let message_elements = chatMessages_container.getElementsByClassName('message-body');
            for(let i = 0; i < message_elements.length; i++){
                updateChatEvents(message_elements[i]);
            }
        }
    }
}

function hideNotification(el) {
    el.style.animationName = 'notification-hide';
    setTimeout(() => {
        el.parentNode.removeChild(el);
    }, 500);
}

function addContactsEvents() {
    let contacts_content = document.getElementsByClassName('contacts-item');
    for (let i = 0; i < contacts_content.length; i++) {
        contacts_content[i].addEventListener('click', function () {
            let thisUser_id = this.getElementsByClassName('contacts-avatar')[0].getAttribute('uid');
            showSearchFullInfo('user', thisUser_id);
        })
    }
}

function send_friendRequestResponse(type, from) {
    let response_obj = {
        answer: type,
        from: from
    }
    fetch('app/?action=friendRequestResponse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(response_obj)
    })
}

function showNotification(thisNotification) {
    // action: "notification"
    // hide: "auto"
    // message: "This email is already in use"
    // title: "An error occurred"
    // type: "error"
    let html = '';
    switch (thisNotification.type) {
        case 'error': {
            html += `
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
        case 'friends': {
            html += `
            <div class="popup-notification popup-notification-friend">
                <h1 class="notification-title">${thisNotification.title}</h1>
                <div class="buttons-container">
                    <button class="notification-button button-confirm friend-request-accept">Accept</button>
                    <button class="notification-button button-cancel friend-request-reject">Reject</button>
                </div>
            </div>`
            notification_container.innerHTML += html;
            let thisNotes = document.getElementsByClassName('popup-notification-friend');
            for (let i = 0; i < thisNotes.length; i++) {
                thisNotes[i].getElementsByClassName('friend-request-accept')[0].addEventListener('click', function () {
                    let from = thisNotes[i].getElementsByClassName('notification-title')[0].getElementsByClassName('account-notification-link')[0].getAttribute('uid');
                    thisNotes[i].parentNode.removeChild(thisNotes[i]);
                    send_friendRequestResponse('accept', from);
                })
            }
            for (let i = 0; i < thisNotes.length; i++) {
                thisNotes[i].getElementsByClassName('friend-request-reject')[0].addEventListener('click', function () {
                    let from = thisNotes[i].getElementsByClassName('notification-title')[0].getElementsByClassName('account-notification-link')[0].getAttribute('uid');
                    thisNotes[i].parentNode.removeChild(thisNotes[i]);
                    send_friendRequestResponse('reject', from);
                })
            }
            break;
        }
        case 'alert': {
            html += `
            <div class="popup-notification popup-notification-alert">
                <h1 class="notification-title">${thisNotification.title}</h1>
                <span class="notification-description">${thisNotification.message}</span>
                <button class="notification-button button-ok alert-button-ok">OK</button>
            </div>
            `
            notification_container.innerHTML += html;
            const buttonOK = document.getElementsByClassName('alert-button-ok');
            for (let i = 0; i < buttonOK.length; i++) {
                buttonOK[i].addEventListener('click', function () {
                    let thisNote = this.parentNode;
                    console.log('thisNote = ', thisNote);
                    hideNotification(thisNote);
                })
            }
        }
    }
}

function sumbitCommunityChanges(form) {
    let data = new FormData(form);
    showLoadingSection();
    fetch('/app?action=editCommunity', {
        method: 'POST',
        body: data
    })
        .then(
            function (response) {
                response.json().then(function (data) {
                    if (data.success == 'error') {
                        alert(data.message);
                        hideLoadingSection();
                    }
                    else {
                        window.location.reload();
                    }
                })
            }
        )
}

function editCommunity(){
    let thisGroup_id = this.getAttribute('groupid');
    fetch('/app?action=getGroupInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ groupid: thisGroup_id })
    })
    .then(
        function (response) {
            response.json().then(function (data) {
                if (data.status) {
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
                    deleteCommunityButton.addEventListener('click', function () {
                        let thisGroupid = modalEditCommunity.getElementsByClassName('groupid_edit_secret-input')[0].value;
                        let confirm_val = confirm('You sure you want to delete this group?');
                        if (confirm_val) {
                            fetch('/app?action=deleteCommunity', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json;charset=utf-8'
                                },
                                body: JSON.stringify({ id: thisGroupid })
                            })
                                .then(function (response) {
                                    response.json().then(function (data) {
                                        if (data.status == 'error') {
                                            alert(data.message)
                                        }
                                        else {
                                            window.location.reload();
                                        }
                                    })
                                })
                        }
                    });
                    modalEditCommunity_buttonSubmit.addEventListener('click', function () {
                        sumbitCommunityChanges(editCommunity_form);
                    })
                }
                else {
                    alert(data.message);
                }
            })
        }
    )
}

for (let i = 0; i < editCommunityButtons.length; i++) {
    editCommunityButtons[i].addEventListener('click', editCommunity);
}

function createNewCommunity_sendRequest(superSecretForm) {
    const body = new FormData(superSecretForm);
    showLoadingSection();
    fetch('/app?action=createCommunity', {
        method: 'POST',
        body: body
    })
        .then(
            function (response) {
                response.json().then(function (data) {
                    hideLoadingSection();
                    if (data.status == 'success') {
                        alert('Community created successfully. Customize it in settings for more convenient use');
                        window.location.reload();
                    }
                    if (data.status == 'error') {
                        alert(message);
                    }
                })
            }
        )
}

for (let i = 0; i < notificationSettingsCheckboxes.length; i++) {
    notificationSettingsCheckboxes[i].addEventListener('click', function (){
        if(this.getAttribute('state') == 'false'){
            this.classList.remove('switcher-false');
            this.classList.add('switcher-true');
            this.setAttribute('state', 'true')
            this.getElementsByClassName('notifications-settins-input-element')[0].checked = 1;
        }
        else if(this.getAttribute('state') == 'true'){
            this.classList.remove('switcher-true');
            this.classList.add('switcher-false');
            this.setAttribute('state', 'false');
            this.getElementsByClassName('notifications-settins-input-element')[0].checked = 0;
        }
        let thisSetting_name = this.getAttribute('setting');
        let thisSetting_value = (this.getAttribute('state') == 'true')
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
        let settings = JSON.parse(localStorage.getItem('user_settings'));
        settings[thisSetting_name] = thisSetting_value;
        localStorage.removeItem('user_settings');
        localStorage.setItem('user_settings', JSON.stringify(settings));
    })
}

for (let i = 0; i < privacySettings_options.length; i++) {
    privacySettings_options[i].addEventListener('click', function () {
        const setting = this.getAttribute('setting');
        const option = this.getAttribute('setting-value');
        let setting_obj = { name: setting, setting: parseInt(option) };
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

function showSearchFullInfo(type, id, chatsContainer_toUpdate) {
    discoverUserInfo.classList.add('modal-user-info_active');
    let thisItem_data;
    fetch('/app?action=getFullInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({ type: type, id: id })
    })
        .then(
            function (response) {
                console.log(response);
                response.json().then(function (data) {
                    fillUserInfoModal(data, type)
                    thisItem_data = data
                })
                if(chatsContainer_toUpdate != undefined){
                    let chatsBlock = document.getElementsByClassName('chats-container')[0];
                    fetch(`/app?action=getLastMessage`,{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                        body: JSON.stringify({id: id, scope:type})
                    })
                    .then(
                        function (response){
                            response.json().then(function(data){
                                let lastMessage = data.lastMessage;
                                let lastMessage_time = data.lastMessage_date;
                                let html = `
                                <div class="chat-item" type="${type == 'groups' ? 'group':'user'}" uid="${thisItem_data.gid}">
                                    <div class="avatar">
                                        <img src="${thisItem_data.avatar}" class="avatar_img">
                                        <div class="{{this.friendInfo.onlineStatus}}"></div>
                                    </div>
                                    <div class="chat-content">
                                        <div class="chat-title">
                                            <div class="user-name">${thisItem_data.name}</div>
                                            <div class="message-time-sent">${lastMessage_time}</div>
                                        </div>
                                        <div class="chat-body">
                                            <div class="chat-message">${lastMessage}</div>
                                            
                                        </div>
                
                                    </div>
                                </div>
                                `;
                                chatsBlock.innerHTML += html;
                            })
                        }
                    )
                }
            }
        )
}

function fillUserInfoModal(body, type) {
    const modal = document.getElementsByClassName('modal-user-info')[0].getElementsByClassName('user-info-container')[0];
    modal.innerHTML = '';
    switch(type){
        case 'user':{
            let thisUser_onlineStatus = (body.online == 'online') ? 'online' : 'offline';
            let thisUser_onlineStatusContent = (body.online == 'online') ? 'online' : `last seen: ${body.online}`;
            let emailhref = (body.email != 'hidden') ? `mailto:${body.email}` : '" style="pointer-events: none;';
            let location = (body.location != '') ? `<a href="https://www.google.com/maps/place/${body.location}" target="_blank"><div class="user-quick-info-item"><img src="./icons/icon-location.svg"> ${body.location}</div></a>` : '';
            let vk = (body.vk != '') ? `<a href="https://www.${body.vk}" target="_blank"><div class="user-quick-info-item"><img src="./icons/icon-vk.svg"> ${body.vkshort}</div></a>` : '';
            let isFriend_toFill_content = ``;
            if (body.isFriend) {
                isFriend_toFill_content = `<div class="user-actions-block-item button-remove-from-friends contacts-user-action" action="remove" uid="${body.id}"><img src="./icons/icon-remove-friend.svg"> Remove from contacts</div>`
            }
            if (!body.isFriend) {
                isFriend_toFill_content = `<div class="user-actions-block-item button-add-to-friends contacts-user-action" action="add" uid="${body.id}"><img src="./icons/icon-add-friend.svg"> Add to contacts</div>`
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
            addChatEvents('user');
            document.getElementsByClassName('contacts-user-action')[0].addEventListener('click', function () {
                if (this.getAttribute('action') == 'add') {
                    let thisUser_id = this.getAttribute('uid');
                    let response = fetch('/app?action=addToFriends', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                        body: JSON.stringify({ id: thisUser_id })
                    })
                        .then(
                            function (response) {
                                response.json().then(function (data) {
                                    console.log(data);
                                })
                            }
                        )
                }
                if (this.getAttribute('action') == 'remove') {
                    let thisUser_id = this.getAttribute('uid');
                    fetch('/app?action=removeFromFriends', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                        body: JSON.stringify({ id: thisUser_id })
                    })
                        .then(
                            function (response) {
                                response.json().then(function (data) {
                                    console.log(data);
                                })
                            }
                        )
                }
            })
            break;
        }
//Приходящие данные:
// {
//     "gid":1670399478636,
//     "avatar":"/avatars/1670399478699.jpg",
//     "members_quantity":1,
//     "isMember":true,
//     "memberActions":"<div class=\"user-actions-block-item\"><img src=\"./icons/icon-mute.svg\"> Mute notifications</div><div class=\"user-actions-block-item\"><img src=\"./icons/icon-leave.svg\"> Leave the group</div>",
//     "ownerActions":"<div class=\"user-actions-block-item\"><img src=\"./icons/icon-edit.svg\"> Edit group</div>",
//     "shortName":"brawlTigers",
//     "about":"This group is about the brawl tigers",
//     "payments":"$Free",
//     "members_list":[{"id":1658641865843,"fullname":"Grigory Gusev","onlineStatus":"<div class=\"member-subtitle-text member-subtitle-text_online\">online</div>"}]}
        case 'groups':{
            console.log({fullInfoRecieved: body})
            let members = '';
            if(body.isMember){
                members += `<div class="group-members-item group-members-item-add-user"><img class="member-img" src="/icons/icon-plus.svg"><p class="member-title-text">Add people</p></div>`
            }
            for(let i = 0; i < body.members_list.length; i++){
                members += `
                <div class="group-members-item group-members-item-add-user" uid="${body.members_list[i].id}">
                    <img src="${body.members_list[i].avatar}" class="member-img">
                    <div class="member-info-container">
                        <p class="member-title-text">${body.members_list[i].fullname}</p>
                        ${body.members_list[i].onlineStatus}
                    </div>
                </div>
                `;
            }
            let action_toFill = '';
            if(body.isMember){
                action_toFill = `<button class="send-message-button" action="open-group" to="${body.gid}">Open chat</button>`;
            }
            else{
                action_toFill = `<button class="send-message-button" action="join-group" to="${body.gid}">Join group</button>`
            }
            modal.innerHTML = `
                <div class="user-info-block-left">
                <img src="${body.avatar}" class="user-info-avatar">
                <div class="user-fullname-block">
                    <p class="fullname">${body.name}</p>
                    <p class="group-info-memebers">${body.members_quantity} members</p>
                </div>
                ${action_toFill}
                <div class="user-actions-block">
                    <div class="user-actions-block-item button-copy-group-link" shortname="${body.shortName}"><img src="./icons/icon-copy.svg"> Copy link</div>
                    ${body.memberActions}
                    ${body.ownerActions}
                </div>
                </div>
                <div class="user-info-block-right">
                    <h1 class="user-info-block-right-title">About</h1>
                    <div class="about-user-container">
                        <p class="about">${body.about}</p>
                        <div class="user-quick-info">
                            <a class="copy-nickname"><div class="user-quick-info-item"><img src="./icons/icon-nickname.svg">${body.shortName}</div></a>
                            <a class="copy-nickname"><div class="user-quick-info-item"><img src="./icons/settings/wallet.svg">${body.payments}</div></a>
                        </div>
                        <div class="group-memebers-container">
                            <div class="group-memebers-title-container">
                                <h1 class="group-memebers-title">Members<span class="group-members-title-quantity">${body.members_quantity}</span></h1>
                                <div class="members-search-input-container">
                                    <img src="./icons/icon-search-magnifier.svg">
                                    <input type="text" class="member-search-input">
                                </div>
                            </div>
                            ${members}           
                        </div>
                    </div>
                </div>
            `;
            addChatEvents('group');
            break;
        }
    }
    
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
                            if (data.people[i].isFriend == true) {
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
                    if (data.groups.length != 0) {
                        html += `<h1 class="search-result-title">Groups</h1>`;
                        for (let i = 0; i < data.groups.length; i++) {
                            html += `
                                <div class="search-result-item" type="groups" gid=${data.groups[i].id}>
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
                            if (type == 'groups') { id = this.getAttribute('gid'); }
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

for(let i = 0; i < colorInputs.length; i++){
    colorInputs[i].addEventListener('click', function(){
        let root = document.querySelector(':root');
        let colorInput_active = document.getElementsByClassName('color-item_selected')[0];
        colorInput_active.classList.remove('color-item_selected');
        colorInputs[i].classList.add('color-item_selected');
        let color_toSet = this.getAttribute('this-color');
        showLoadingSection();
        let setting_obj = {
            name: 'theme_accent',
            setting: color_toSet
        }
        root.style.setProperty('--accent', color_toSet);
        fetch('/app?action=settings', {
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
                        window.location.reload();
                    }
                })
            }
        )
    })
}
for(let i = 0; i < themeBlocks.length; i++){
    themeBlocks[i].addEventListener('click', function(){
        let root = document.querySelector(':root');
        let theme_toSet = this.getAttribute('theme');
        let theme_radioInput;
        showLoadingSection();
        let setting_obj = {
            name: 'theme_main',
            setting: theme_toSet
        }
        switch(theme_toSet){
            case 'System':{
                theme_radioInput = document.getElementsByClassName('appearance-theme-input_system')[0];
                let theme_isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if(theme_isDark){
                    root.style.setProperty('--theme_bg', '#111214');
                    root.style.setProperty('--theme_sidebar', '#242629');
                    root.style.setProperty('--color_main', '#DEDEDE');
                }
                else{
                    root.style.setProperty('--theme_bg', 'white');
                    root.style.setProperty('--theme_sidebar', '#F2F3F5');
                    root.style.setProperty('--color_main', '#171A1F');
                }
                break;
            }
            case 'Light':{
                theme_radioInput = document.getElementsByClassName('appearance-theme-input_light')[0];
                root.style.setProperty('--theme_bg', 'white');
                root.style.setProperty('--theme_sidebar', '#F2F3F5');
                root.style.setProperty('--color_main', '#171A1F');
                break;
            }
            case 'Dark':{
                theme_radioInput = document.getElementsByClassName('appearance-theme-input_dark')[0];
                root.style.setProperty('--theme_bg', '#111214');
                root.style.setProperty('--theme_sidebar', '#242629');
                root.style.setProperty('--color_main', '#DEDEDE');
                break;
            }
            
            default:{
                window.location.reload();
                break;
            }
        }
        let theme_radioInputs = document.getElementsByClassName('appearance-theme-input');
        for(let j = 0; j < theme_radioInputs.length; j++){
            theme_radioInputs[j].classList.remove('checkbox-on');
        }
        theme_radioInput.classList.add('checkbox-on');
        fetch('/app?action=settings', {
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
                        window.location.reload();
                    }
                })
            }
        )
    })
}

addContactsEvents()
updateQuickChats()