const menuItems = document.getElementsByClassName('menu-item');
const actionsBlocks = document.getElementsByClassName('actions-block');
const actionsBodies = document.getElementsByClassName('actions-body');
const sliders = document.getElementsByClassName('discover-home-slider');
const discoverNavItems = document.getElementsByClassName('discover-nav-item');
const discoverMenuItems = document.getElementsByClassName('discover-item');
const discoverBodies = document.getElementsByClassName('discover-body-item');
const avatar_input = document.getElementsByClassName('avatar-input-profile')[0];
const avatar_inputElement = document.getElementsByClassName('avatar-input-element-profile')[0];
const settingsInputs = document.getElementsByClassName('edit-profile-input-container');
const copySharingLink_button = document.getElementsByClassName('invite-friends-copy-button')[0];
const notificationSettings_switchers = document.getElementsByClassName('notification-settings-group-item-input');
const notificationSettings_checkboxes = document.getElementsByClassName('notification-settings-group-item-input-checkbox');
const settingsNavItems = document.getElementsByClassName('settings-item');
const fileDrop_window = document.getElementsByClassName('modal-file-drop-window')[0];
const fileDrop_input = document.getElementById('fileDropInput');
const modalWindowActions = document.getElementsByClassName('user-actions-modal')[0];
const userChatOpenActions_button = document.getElementsByClassName('user-button-actions')[0];
const userProfileEdit_inputs = document.getElementsByClassName('edit-profile-input-default');
const avatarChange_input = document.getElementsByClassName('avatar-change-input')[0];
const notificationSettingsCheckboxes_container = document.getElementsByClassName('notification-settings-group-checkboxes')[0];
const searchInputs = document.getElementsByClassName('search-input');
const discoverSearchForm = document.getElementsByClassName('discover-search-form')[0];
const searchResultsContainer_discover = document.getElementsByClassName('search-results-container-discover')[0];
const searchResultsContainer_contacts = document.getElementsByClassName('search-results-container-contacts')[0];
const actionsContainer_discover = document.getElementsByClassName('chats-container-discover')[0];
const actionsContainer_contacts = document.getElementsByClassName('chats-container-contacts')[0];
const discoverUserInfo = document.getElementsByClassName('modal-user-info')[0];
const modalUserInfo_closeButton = document.getElementsByClassName('modal-user-info-close')[0];
const createCommunity_modal = document.getElementsByClassName('modal-create-community')[0];
const avatarInputGroup = document.getElementsByClassName('avatar-input-group')[0];
const createCommunityButton = document.getElementsByClassName('create-community-button')[0];
const createCommunity_select = document.getElementsByClassName('select-price');
const createCommunity_pricingSubscription = document.getElementsByClassName('subscription-price-container-subscription')[0];
const createCommunity_pricingOneTimePayment = document.getElementsByClassName('subscription-price-container-onetime')[0];
const createCommunity_pricing_elements = document.getElementsByClassName('subscription-price-container');
const communitySelectCategory = document.getElementsByClassName('select-category')[0];
const communitySelectPrivacy = document.getElementsByClassName('select-privacy')[0];
const communityCreate_button_close = document.getElementsByClassName('create-community-button-close')[0];
const communityCreate_button_submit = document.getElementsByClassName('submit-community-creation-button ')[0];
const editCommunity_form = document.getElementsByClassName('edit-community-secret-form')[0];
const modalEditCommunity = document.getElementsByClassName('modal-edit-community')[0];
const modalEditCommunity_buttonClose = document.getElementsByClassName('edit-community-button-close')[0];
const modalEditCommunity_buttonSubmit = document.getElementsByClassName('edit-community-button-done')[0];
const contactsSearchForm = document.getElementsByClassName('contacts-search-form')[0];
const messageContainer = document.getElementsByClassName('message-input')[0];
const attachFile_button = document.getElementsByClassName('attachment-button-file')[0];
const chatFileInput_element = document.getElementsByClassName('file-input-chat')[0];
const fullScreen_modalWindow = document.getElementsByClassName('modal-window-fullscreen-content-view')[0];
const fullScreen_modalWindow_closeButton = document.getElementsByClassName('modal-fullscreen-button-close')[0];
const fullScreen_slider = document.getElementsByClassName('fullscreen-slider')[0];
const fullScreen_sliderLine = document.getElementsByClassName('fullscreen-slider-line')[0];
const fullScreen_slider_slideLeft_button = document.getElementsByClassName('fullscreen-slider-arrow-left')[0];
const fullScreen_slider_slideRight_button = document.getElementsByClassName('fullscreen-slider-arrow-right')[0];
const message_textContainer = document.getElementsByClassName('message-text-container')[0];
const fileDrop_area = document.getElementsByClassName('file-drop-area')[0];
const fullScreenSlider_previewContainer = document.getElementsByClassName('fullscreen-slider-content-preview-container')[0];
const attachSticker_button = document.getElementsByClassName('attach-sticker-button')[0];
const stickersContainer = document.getElementsByClassName('stickers-container_top')[0];
const stickersContainer_closeButton = document.getElementsByClassName('sticker-container-close-button')[0];
const chatUserBar = document.getElementsByClassName('chats-user-bar')[0];

let fullScreenSlider_videoObjects = [];
let audioObjects = [];

let isScrolling = false;
let isAbleToDrag = false;

chatUserBar.addEventListener('click', function(){
    let chat_container = this.parentNode;
    let uid = parseInt(chat_container.getAttribute('uid'));
    let context = chat_container.getAttribute('context');
    if(context == 'user'){
        showSearchFullInfo('user', uid);
    }
    else{
        showSearchFullInfo('groups', uid);
    }
    modalUserInfo_closeButton.addEventListener('click', function(){
        discoverUserInfo.classList.remove('modal-user-info_active');
    }, {once: true});
})

attachFile_button.addEventListener('click', function(){
    chatFileInput_element.click();
})

function moveFullscreenSliderPreview(direction){
    if(direction == 'right'){
        let currentPreview = fullScreenSlider_previewContainer.getElementsByClassName('content-preview-container-item_active')[0];
        if(currentPreview.nextSibling.nextSibling != undefined){
            currentPreview.classList.remove('content-preview-container-item_active');
            currentPreview.nextSibling.nextSibling.classList.add('content-preview-container-item_active');
        }
    }
    if(direction == 'left'){
        let currentPreview = fullScreenSlider_previewContainer.getElementsByClassName('content-preview-container-item_active')[0];
        if(currentPreview.previousSibling.previousSibling != undefined){
            currentPreview.classList.remove('content-preview-container-item_active');
            currentPreview.previousSibling.previousSibling.classList.add('content-preview-container-item_active');
        }
    }
}

fullScreen_slider_slideLeft_button.addEventListener('click', function(){
    fullScreenSlider_scroll('left');
    moveFullscreenSliderPreview('left')
});
fullScreen_slider_slideRight_button.addEventListener('click', function(){
    fullScreenSlider_scroll('right')
    moveFullscreenSliderPreview('right')
});

function fullScreen_modalWindow_close(){
    window.removeEventListener('keyup', handleSliderEvents, false);
    fullScreen_modalWindow.classList.remove('modal-window-fullscreen-content-view_shown');
    for(let i = 0; i < fullScreenSlider_videoObjects.length; i++){
        fullScreenSlider_videoObjects.shift();
    }
}

fullScreen_modalWindow_closeButton.addEventListener('click', fullScreen_modalWindow_close, false);

function fullScreenSlider_scroll(direction){
    if(direction == 'right'){
        let hperc = window.innerWidth;
        let sliderLine_width = fullScreen_sliderLine.clientWidth;
        let maxScroll = sliderLine_width/hperc*(-100) + 100;
        let left = fullScreen_sliderLine.style.left;
        left = left.split('%')[0];
        left = parseInt(left);
        if(fullScreenSlider_videoObjects.length != 0){
            fullScreenSlider_videoObjects.shift();
        }
        if(left != maxScroll){
            left -= 100;
            left += '%';
            fullScreen_sliderLine.style.left = left;   
        }
        else{
            fullScreen_modalWindow_close();
        }
    }
    if(direction == 'left'){
        let minScroll = 0;
        let left = fullScreen_sliderLine.style.left;
        left = left.split('%')[0];
        left = parseInt(left);
        if(fullScreenSlider_videoObjects.length != 0){
            fullScreenSlider_videoObjects.shift();
        }
        if(left != minScroll){
            left += 100;
            left += '%';
            fullScreen_sliderLine.style.left = left;   
        }
        else{
            fullScreen_modalWindow_close();
        }
    }
}

function handleSliderEvents(e){
    if(e.key == 'ArrowRight'){
        fullScreenSlider_scroll('right');
        moveFullscreenSliderPreview('right')
    }
    if(e.key == 'ArrowLeft'){
        fullScreenSlider_scroll('left');
        moveFullscreenSliderPreview('left')
    }
}

function addFullScreenSliderEvents(){
    window.addEventListener('keyup', handleSliderEvents, false);
    fullScreen_sliderLine.style.left = '0%';
    let thisSlider_items = fullScreen_sliderLine.getElementsByClassName('fullscreen-slider-item');
    let slider_videoItems = fullScreen_sliderLine.getElementsByTagName('video');
    for(let i = 0; i < slider_videoItems.length; i++){
        let videoplayer = new video(slider_videoItems[i]);
        fullScreenSlider_videoObjects.push(videoplayer);
        slider_videoItems[i].addEventListener('loadedmetadata', function(){
            videoplayer.initialize();
        })
    }
}
function showFullScreenSlider(thisMessage_viewableFiles, context){
    //fullScreenSlider_previewContainer
    console.log(thisMessage_viewableFiles);
    console.log(context);
    fullScreen_sliderLine.innerHTML = '';
    let context_toScroll;
    fullScreenSlider_previewContainer.innerHTML = '';
    for(let i = 0; i < thisMessage_viewableFiles.length; i++){
        let innerHTML = thisMessage_viewableFiles[i].parentNode.parentNode.innerHTML;
        let isActive = false;
        if(context == thisMessage_viewableFiles[i]){
            context_toScroll = i;
            isActive = true;
        }
        fullScreen_sliderLine.innerHTML += 
        `<div class="fullscreen-slider-item">
            ${innerHTML}  
        </div>`;
        let contentPreview_html;
        if(thisMessage_viewableFiles[i].tagName == 'IMG'){
            let className = 'content-preview-container-item';
            if(isActive){
                className += ' content-preview-container-item_active';
            }
            contentPreview_html = 
        `
            <div class="${className}">
                <img src="${thisMessage_viewableFiles[i].src}">
            </div>
        `
        }
        if(thisMessage_viewableFiles[i].tagName == 'DIV'){
            let video = thisMessage_viewableFiles[i].previousSibling.previousSibling;
            let className = 'content-preview-container-item';
            if(isActive){
                className += ' content-preview-container-item_active';
            }
            contentPreview_html = 
        `
            <div class="${className}">
                <video src="${video.src}">
            </div>
        `
        }
        fullScreenSlider_previewContainer.innerHTML += contentPreview_html;
    }
    addFullScreenSliderEvents();
    for(let i = 0; i < context_toScroll; i++){
        fullScreenSlider_scroll('right');
    }
}

function updateChatEvents(thisMessage_body){
    console.log('element получен в updateChatEvents: ', thisMessage_body);
    let thisMessage_viewableFiles = thisMessage_body.getElementsByClassName('message-element_viewable');
    let thisMessage_downloadableFiles = thisMessage_body.getElementsByClassName('message-element_downloadable');
    let thisMessage_audios = thisMessage_body.getElementsByClassName('audio-container');
    fullScreen_sliderLine.innerHTML = '';
    for(let i = 0; i < thisMessage_viewableFiles.length; i++){
        thisMessage_viewableFiles[i].addEventListener('click', function(){
            showFullScreenSlider(thisMessage_viewableFiles, thisMessage_viewableFiles[i]);
            fullScreen_modalWindow.classList.add('modal-window-fullscreen-content-view_shown');
        })
    }
    for(let i = 0; i < thisMessage_downloadableFiles.length; i++){
        thisMessage_downloadableFiles[i].addEventListener('click', function(){
            let fileName = this.getElementsByClassName('file-name')[0].innerText;
            let url = `http://93.95.97.124:8000/app?action=download&fileName=${fileName}`
            window.open(url, '_blank');
        })
    }
    for(let i = 0; i < thisMessage_audios.length; i++){
        let thisAudio = thisMessage_audios[i].getElementsByTagName('audio')[0];
        thisAudio.addEventListener('loadedmetadata', function(){
            let audioplayer = new audio(thisAudio);
            audioplayer.initialize();
        })
    }
}

message_textContainer.addEventListener('keydown', function(e){
    if(e.key == 'Enter' && e.shiftKey){
        message_textContainer.innerText += '\n';
        message_textContainer.focus();
        const range = document.createRange();
        range.selectNodeContents(message_textContainer);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        console.log('enter + shift');
    }
    else if(e.key == 'Enter'){
        console.log('enter');
        e.preventDefault();
        let message = message_textContainer.innerText;
        let images = message_textContainer.getElementsByTagName('img');
        for(let i = 0; i < images.length; i++){

        }
        let user_toSend_id = document.getElementsByClassName('chat_active')[0].getAttribute('uid');
        let files = [];
        if(chatFileInput_element.files.length != 0){
            files = chatFileInput_element.files;
        }
        else{
            files = null;
        }
        message_textContainer.textContent = '';
        inmessage_attachments_container.innerHTML = '';
        let context = chatContainer.getAttribute('context');
        sendChatMessage(message, files, user_toSend_id, context);
    }
    else{
        
    }
})

modalEditCommunity_buttonClose.addEventListener('click', function(){
    modalEditCommunity.classList.remove('modal-edit-community_shown');
})

avatarInputGroup.addEventListener('click', function(){
    this.getElementsByClassName('avatar-input-element')[0].click();
})

avatarInputGroup.getElementsByClassName('avatar-input-element')[0].addEventListener('input', function(){
    let img = this.files[0];
    if(img){
        let reader = new FileReader();
        reader.readAsDataURL(img)
        reader.addEventListener('load', function(){
            avatarInputGroup.getElementsByClassName('avatar-default')[0].src = this.result;
        })
    }
})

createCommunityButton.addEventListener('click', function(){
    createCommunity_modal.classList.add('modal-create-community_active');
})

communityCreate_button_close.addEventListener('click', function(){
    createCommunity_modal.classList.remove('modal-create-community_active');
})

communityCreate_button_submit.addEventListener('click', function(e){
    e.preventDefault();
    let thisForm = this.parentNode;
    let paymentsForm = thisForm.getElementsByClassName('select-value-show-price')[0].value;
    let pricing;
    if(paymentsForm == 'Subscription'){
        pricing = thisForm.getElementsByClassName('input-subscription-price')[0].value;
    }
    else if(paymentsForm == 'One-time payment'){
        pricing = thisForm.getElementsByClassName('input-one-time-payment-price')[0].value;
    }
    else{
        pricing = 0;
    }
    let thisFormObj = {
        avatar: thisForm.getElementsByClassName('avatar-input-element')[0].files,
        name: thisForm.getElementsByClassName('input-group-name')[0].value,
        payments: thisForm.getElementsByClassName('select-value-show-price')[0].value,
        pricing: pricing,
        visibility: thisForm.getElementsByClassName('input-visibility')[0].value,
        category: thisForm.getElementsByClassName('select-value-show-category')[0].value
    }
    if(thisFormObj.avatar == '' || thisFormObj.avatar == undefined){
        alert('Please pick an avatar for your community');
        return 0;
    }
    else if(thisFormObj.name == '' || thisFormObj.name == undefined){
        alert('Please enter a name for your community');
        return 0;
    }
    else if((thisFormObj.payments == 'Subscription' || thisFormObj.payments == 'One-time payment') && (thisFormObj.pricing == '' || thisFormObj.pricing == undefined)){
        alert('Please appoint a price for joining your community');
        return 0;
    }
    else if(thisFormObj.visibility == '' || thisFormObj.visibility == undefined){
        alert('Please appoint a visibility for your community');
        return 0;
    }
    else if(thisFormObj.category == '' || thisFormObj.category == undefined){
        alert('Please select a category of your community');
        return 0;
    }
    else{
        const superSecretForm = document.getElementsByClassName('create-community-super-secret-form')[0];
        superSecretForm.getElementsByClassName('create-community-super-secret-form-avatar')[0].files = thisFormObj.avatar;
        superSecretForm.getElementsByClassName('create-community-super-secret-form-name')[0].value = thisFormObj.name;
        superSecretForm.getElementsByClassName('create-community-super-secret-form-payments')[0].value = thisFormObj.payments;
        superSecretForm.getElementsByClassName('create-community-super-secret-form-pricing')[0].value = thisFormObj.pricing;
        superSecretForm.getElementsByClassName('create-community-super-secret-form-visibility')[0].value = thisFormObj.visibility;
        superSecretForm.getElementsByClassName('create-community-super-secret-form-category')[0].value = thisFormObj.category;
        createNewCommunity_sendRequest(superSecretForm)
    }
})

communitySelectCategory.addEventListener('click', function(e){
    e.stopPropagation();
    this.classList.add('select-category_opened');
    let options = this.getElementsByClassName('select-option');
    let thisFormSearch = communitySelectCategory.getElementsByClassName('select-value-show-category')[0];
    thisFormSearch.addEventListener('input', function(){
        let inputs = thisFormSearch.value;
        let regexp = new RegExp(`.*?${inputs}\.*?`, "gi");
        for(let i = 0; i < options.length; i++){
            if(regexp.test(options[i].innerHTML) == false){
                options[i].style.display = 'none';
            }
            if(regexp.test(options[i].innerHTML) == true){
                options[i].style.display = 'flex';
            }
        }
    });
    for(let i = 0; i < options.length; i++){
        options[i].addEventListener('click', function(e){
            e.stopPropagation();
            let selected = this.getAttribute('value')
            communitySelectCategory.classList.remove('input_empty-container');
            communitySelectCategory.classList.remove('select-category_opened');
            communitySelectCategory.getElementsByClassName('select-value-show-category')[0].value = selected;
        })
    }
})

communitySelectPrivacy.addEventListener('click', function(e){
    e.stopPropagation();
    this.classList.add('select-privacy_opened');
    let options = this.getElementsByClassName('select-option');
    for(let i = 0; i < options.length; i++){
        options[i].addEventListener('click', function(e){
            e.stopPropagation();
            let selected = this.getAttribute('value')
            communitySelectPrivacy.classList.remove('input_empty-container');
            communitySelectPrivacy.classList.remove('select-privacy_opened');
            communitySelectPrivacy.getElementsByClassName('input-visibility')[0].value = selected;
        })
    }
})

for(let i = 0; i < createCommunity_select.length; i++){
    let thisSelectOptions = createCommunity_select[i].getElementsByClassName('select-option');
    for(let j = 0; j < thisSelectOptions.length; j++){
        thisSelectOptions[j].addEventListener('click', function(e){
            e.stopPropagation();
            let thisOptionValue = this.getAttribute('value');
            createCommunity_select[i].classList.remove('select-price_opened');
            createCommunity_select[i].getElementsByClassName('select-value-show')[0].value = thisOptionValue;
            createCommunity_select[i].classList.remove('input_empty-container');
            if(thisOptionValue == 'Subscription'){
                createCommunity_pricingSubscription.classList.add('subscription-price-container_active');
            }
            else if(thisOptionValue == 'One-time payment'){
                createCommunity_pricingOneTimePayment.classList.add('subscription-price-container_active')
            }
            else{
                createCommunity_pricingSubscription.classList.remove('subscription-price-container_active');
            }
        })
    }
    createCommunity_select[i].addEventListener('click', function(e){
        e.stopPropagation();
        this.classList.add('select-price_opened');
        for(let x = 0; x < createCommunity_pricing_elements.length; x++){
            createCommunity_pricing_elements[x].classList.remove('subscription-price-container_active');
        }
    })
}
//bookmark
const stickers = stickersContainer.getElementsByClassName('sticker-item-container');
for(let i = 0; i < stickers.length; i++){
    stickers[i].addEventListener('click', function(){
        let emoji = this.innerText;
        message_textContainer.innerText+=emoji;
    })
}
attachSticker_button.addEventListener('click', function(e){
    stickersContainer.classList.add('stickers-container_top_shown');
    stickersContainer_closeButton.addEventListener('click', function(){
        stickersContainer.classList.remove('stickers-container_top_shown');
    }, {once: true})
})
createCommunityButton.addEventListener('click', function(){

})

modalUserInfo_closeButton.addEventListener('click', function(){
    discoverUserInfo.classList.remove('modal-user-info_active');
})

function discoverSearchForm_handler(e){
    e.preventDefault();
    let thisForm_searchIcon = this.parentNode.getElementsByClassName('search-icon')[0].getElementsByClassName('icon-search')[0];
    let thisForm_loadingIcon = this.parentNode.getElementsByClassName('search-icon')[0].getElementsByClassName('loading-spinning-icon')[0];
    let thisForm_input = this.getElementsByClassName('search-input')[0];
    thisForm_searchIcon.classList.remove('icon-search_shown');
    thisForm_loadingIcon.classList.add('loading-spinning-icon_shown');
    actionsContainer_discover.classList.remove('chats-container_shown');
    searchResultsContainer_discover.classList.add('search-results-container_shown');
    let input_value = thisForm_input.value;
    sendSearchRequest(input_value, 'discover', thisForm_searchIcon, thisForm_loadingIcon);
}

function contactSearchForm_handler(e){
    e.preventDefault();
    let thisForm_searchIcon = this.parentNode.getElementsByClassName('search-icon')[0].getElementsByClassName('icon-search')[0];
    let thisForm_loadingIcon = this.parentNode.getElementsByClassName('search-icon')[0].getElementsByClassName('loading-spinning-icon')[0];
    let thisForm_input = this.getElementsByClassName('search-input')[0];
    thisForm_searchIcon.classList.remove('icon-search_shown');
    thisForm_loadingIcon.classList.add('loading-spinning-icon_shown');
    actionsContainer_contacts.classList.remove('chats-container_shown');
    searchResultsContainer_contacts.classList.add('search-results-container_shown');
    let input_value = thisForm_input.value;
    sendSearchRequest(input_value, 'contacts', thisForm_searchIcon, thisForm_loadingIcon);
}

contactsSearchForm.addEventListener('submit', contactSearchForm_handler)
discoverSearchForm.addEventListener('submit', discoverSearchForm_handler)

for(let i = 0; i < searchInputs.length; i++){
    searchInputs[i].addEventListener('click', function(){
        let thisInput_pageContainer = this.parentNode.parentNode.parentNode.parentNode;
        let thisForm_button_closeSearch = this.parentNode.getElementsByClassName('icon-close-search')[0]
        let thisForm_loadingIcon = this.parentNode.parentNode.getElementsByClassName('search-icon')[0].getElementsByClassName('loading-spinning-icon')[0];
        let thisForm_searchIcon = this.parentNode.parentNode.getElementsByClassName('search-icon')[0].getElementsByClassName('icon-search')[0];
        thisForm_button_closeSearch.classList.add('icon-close-search_shown');
        thisForm_button_closeSearch.addEventListener('click', function(){
            thisForm_button_closeSearch.classList.remove('icon-close-search_shown')
            searchInputs[i].value = '';
            thisForm_loadingIcon.classList.remove('loading-spinning-icon_shown');
            thisForm_searchIcon.classList.add('icon-search_shown');
            let thisPage_searchResult_container = thisInput_pageContainer.getElementsByClassName('search-results-container')[0];
            thisPage_searchResult_container.classList.remove('search-results-container_shown');
            let thisPage_chatsContainer = thisInput_pageContainer.getElementsByClassName('chats-container')[0];
            thisPage_chatsContainer.classList.add('chats-container_shown');
            // document.getElementsByClassName('search-results-container-discover')[0].classList.remove('search-results-container_shown')
            // document.getElementsByClassName('chats-container-discover')[0].classList.add('chats-container_shown')
        })
    })
}

const checkboxes_container_classList = notificationSettingsCheckboxes_container.classList;
if(checkboxes_container_classList[2] == 'state-1'){
    document.getElementsByClassName('NameAndText')[0].classList.remove('checkbox-off');
    document.getElementsByClassName('NameAndText')[0].classList.add('checkbox-on');
}
else{
    document.getElementsByClassName('NameOnly')[0].classList.remove('checkbox-off');
    document.getElementsByClassName('NameOnly')[0].classList.add('checkbox-on');
}

avatar_input.addEventListener('click', function(){
    avatar_inputElement.click();
})

function showLoadingSection(){
    section_loading.style.display = 'flex';
    section_loading.style.animationName = 'show';
}

function hideLoadingSection(){
    section_loading.style.animationName = 'show';
    setTimeout(() => {
        section_loading.style.display = 'none';
    }, 1000);
}

for(let i = 0; i < userProfileEdit_inputs.length; i++){
    let curVal = userProfileEdit_inputs[i].value;
    if(curVal == '' || curVal == undefined){
        userProfileEdit_inputs[i].parentNode.classList.add('input_empty-container');
    }
}

userChatOpenActions_button.addEventListener('click', function(){
    console.log(1);
    modalWindowActions.classList.add('user-actions-modal_active');
    setTimeout(() => {
        document.addEventListener('click', function(){
            modalWindowActions.classList.remove('user-actions-modal_active');
            console.log(2);
        }, {once: true});
    }, 100);
})

copySharingLink_button.addEventListener('click', function(){
    let link = document.getElementsByClassName('link-output')[0].innerHTML;
    window.navigator.clipboard.writeText(link);
})
chatContainer.addEventListener('dragover', function(e){
    e.preventDefault();
    e.stopPropagation();
    fileDrop_window.classList.add('modal-file-drop-window_active');
})
fileDrop_area.addEventListener('dragleave', function(e){
    e.preventDefault();
    e.stopPropagation();
    fileDrop_window.classList.remove('modal-file-drop-window_active');
})
fileDrop_window.addEventListener('dragover', (e)=>{e.preventDefault()}, false);
fileDrop_window.addEventListener('drop', function(e){
    let input_event = new Event('input');
    fileDrop_window.classList.remove('modal-file-drop-window_active');
    let thisFiles = e.dataTransfer.files;
    chat_fileInput.value = '';
    chat_fileInput.files = thisFiles;
    chat_fileInput.dispatchEvent(input_event);
    e.preventDefault();
})

message_textContainer.onpaste = function(e){
    console.log('paste');
    let pasteText = e.clipboardData.getData('text/plain');
    message_textContainer.innerText += pasteText;
    message_textContainer.focus();
    const range = document.createRange();
    range.selectNodeContents(message_textContainer);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return false;
}
message_textContainer.ondrop = function (e) {
    fileInput = e.dataTransfer.files;
    let thisFileInput = this.parentNode.getElementsByClassName('file-input')[0];
    thisFileInput.files = fileInput;
    return false;
}


for(let i = 0; i < settingsNavItems.length; i++){
    settingsNavItems[i].addEventListener('click', function(){
        if(document.getElementsByClassName('settings-item_active')[0] != undefined){
            document.getElementsByClassName('settings-item_active')[0].classList.remove('settings-item_active');
        }
        this.classList.add('settings-item_active');
        
        let setting = this.getAttribute('setting');
        if(document.getElementsByClassName('settings-body-item_active')[0] != undefined){
            document.getElementsByClassName('settings-body-item_active')[0].classList.remove('settings-body-item_active');
        }
        document.getElementsByClassName(`settings-body-${setting}`)[0].classList.add('settings-body-item_active');
    })
}

for(let i = 0; i<notificationSettings_checkboxes.length; i++){
    notificationSettings_checkboxes[i].addEventListener('click', function(){
        // Классы: checkbox-off checkbox-on
        // Атрибут state: on/off
        // settings:{email_visibility: 0,
        // id: 1658641865843,
        // notification_preview: 0,
        // phone_visibility: 0,
        // play_comment_sound: true,
        // play_direct_sound: true,
        // play_group_sound: true,
        // show_comment_notification: true,
        // show_direct_notifications: true,
        // show_group_notifications: true,
        // theme_accent: "#398FE5",
        // theme_main: "#FFF"}
        let type = this.getAttribute('type');
        let state = this.getAttribute('state');
        let settings = JSON.parse(localStorage.getItem('user_settings'));
        for(let j = 0; j < notificationSettings_checkboxes.length; j++){
            notificationSettings_checkboxes[j].classList.remove('checkbox-on');
            notificationSettings_checkboxes[j].setAttribute('state', 'off');
            notificationSettings_checkboxes[j].classList.add('checkbox-off');
        }
        this.classList.add('checkbox-on');
        this.setAttribute('state', 'on');
        switch(type){
            case 'NameAndText':{
                if(state == 'off'){
                    settings.notification_preview = 0;
                }
                break;
            }
            case 'NameOnly':{
                if(state == 'off'){
                    settings.notification_preview = 1;
                }
                break;
            }
            default:{
                return 0;
            }
        }
        localStorage.removeItem('user_settings');
        localStorage.setItem('user_settings', JSON.stringify(settings));
        showLoadingSection();
        fetch('/app?action=settings',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name: 'notification_preview', setting: settings.notification_preview})
        })
        .then((response)=>{
            response.json()
            .then((data)=>{
                if(data.status != 'success'){
                    window.location.reload();
                }
                else{
                    hideLoadingSection();
                }
            })
        })  
        
    })
}

for(let i = 0; i < settingsInputs.length; i++){
    settingsInputs[i].getElementsByClassName('edit-profile-input-default')[0].addEventListener('focusout', function(){
        if(this.value != '' && this.value != undefined){
            settingsInputs[i].classList.remove('input_empty-container');
        }
        else{
            settingsInputs[i].classList.add('input_empty-container');
        }
    })
}

avatar_inputElement.addEventListener('input', function(){
    avatarChange_input.value = 'true';
    let img = this.files[0];
    if(img){
        let reader = new FileReader();
        reader.readAsDataURL(img)
        reader.addEventListener('load', function(){
            avatar_input.getElementsByClassName('avatar-default')[0].src = this.result;
        })
    }
})

for(let i = 0; i < sliders.length; i++){
    sliders[i].getElementsByClassName('slider-button-left')[0].addEventListener('click', function(){
        slider_slideLeft(sliders[i]);
    })
    sliders[i].getElementsByClassName('slider-button-right')[0].addEventListener('click', function(){
        slider_slideRight(sliders[i]);
    })
}

for(let i = 0; i<discoverNavItems.length; i++){
    discoverNavItems[i].addEventListener('click', function(){
        let thisAction = this.getAttribute('action');
        for(let i = 0; i < discoverBodies.length; i++){
            discoverBodies[i].classList.remove('discover-body-item_active');
        }
        document.getElementsByClassName(`discover-body-${thisAction}`)[0].classList.add('discover-body-item_active');
        for(let j = 0; j<discoverMenuItems.length; j++){
            if(discoverMenuItems[j].getAttribute('action') == thisAction){
                discoverMenuItems[j].classList.add('discover-item_active');
            }
            else{
                discoverMenuItems[j].classList.remove('discover-item_active');
            }
        }
    })
}

function slider_slideLeft(thisSlider){
    if(!isScrolling){
        isScrolling = true;
        let thisLine = thisSlider.getElementsByClassName('discover-slider-line')[0];
        let currentScroll = parseInt(window.getComputedStyle(thisLine).left.split('px')[0]);
        if(currentScroll != 0){
            thisLine.style.left = `${currentScroll+600}px`;
        }
        setTimeout(() => {
            isScrolling = false;
        }, 500);
    }
}

function slider_slideRight(thisSlider){
    if(!isScrolling){
        isScrolling = true;
        let thisLine = thisSlider.getElementsByClassName('discover-slider-line')[0];
        let maxScroll = parseInt(window.getComputedStyle(thisLine).width.split('px')[0]);
        let currentScroll = window.getComputedStyle(thisLine).left.split('px')[0];
        if(currentScroll*-1 != (maxScroll-600)){
            thisLine.style.left = `${currentScroll-600}px`;
        }
        else{
            //Сделать функцию загрузки новых слайдов
        }
        setTimeout(() => {
            isScrolling = false;
        }, 500);
    }
}

for(let i = 0; i<menuItems.length; i++){
    menuItems[i].addEventListener('click', function(){
        makeActive(this);
        console.log(this)
    })
}

function makeActive(el){
    for(let i = 0; i<menuItems.length; i++){
        menuItems[i].classList.remove('menu-item-active');
    }
    el.classList.add('menu-item-active');
    let thisBlock = el.getAttribute('action');
    for(let i = 0; i<actionsBlocks.length; i++){
        actionsBlocks[i].classList.remove('actions-block_active');
    }
    document.getElementsByClassName(thisBlock)[0].classList.add('actions-block_active')
    for(let i = 0; i < actionsBodies.length; i++){
        actionsBodies[i].classList.remove('actions-body_active');
    }
    document.getElementsByClassName(`${thisBlock}-body`)[0].classList.add('actions-body_active');
}