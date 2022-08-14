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
const messageInput = document.getElementsByClassName('message-input');
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
const editCommunity_form = document.getElementsByClassName('edit-community-secret-form ')[0];
const modalEditCommunity = document.getElementsByClassName('modal-edit-community')[0];
const modalEditCommunity_buttonClose = document.getElementsByClassName('edit-community-button-close')[0];
const modalEditCommunity_buttonSubmit = document.getElementsByClassName('edit-community-button-done')[0];
const contactsSearchForm = document.getElementsByClassName('contacts-search-form')[0];

let isScrolling = false;
let isAbleToDrag = false;

modalEditCommunity_buttonClose.addEventListener('click', function(){
    modalEditCommunity.classList.remove('modal-edit-community_shown');
})

avatarInputGroup.addEventListener('click', function(){
    console.log('click-1');
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
    console.log(thisForm.getElementsByClassName('avatar-input-element')[0].files);
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
        console.log(superSecretForm.getElementsByClassName('create-community-super-secret-form-avatar')[0].files);
        createNewCommunity_sendRequest(superSecretForm)
    }
})

communitySelectCategory.addEventListener('click', function(e){
    console.log('клик по селекту');
    e.stopPropagation();
    this.classList.add('select-category_opened');
    let options = this.getElementsByClassName('select-option');
    let thisFormSearch = communitySelectCategory.getElementsByClassName('select-value-show-category')[0];
    thisFormSearch.addEventListener('input', function(){
        let inputs = thisFormSearch.value;
        let regexp = new RegExp(`.*?${inputs}\.*?`, "gi");
        for(let i = 0; i < options.length; i++){
            console.log(`${regexp}.test(${options[i].innerHTML}): ${(regexp.test(options[i].innerHTML))}`);
            if(regexp.test(options[i].innerHTML) == false){
                console.log(`${options[i].innerHTML}: style.display = 'none`);
                options[i].style.display = 'none';
            }
            if(regexp.test(options[i].innerHTML) == true){
                console.log(`${options[i].innerHTML}: style.display = 'flex`);
                options[i].style.display = 'flex';
            }
        }
    });
    for(let i = 0; i < options.length; i++){
        options[i].addEventListener('click', function(e){
            console.log('клик по опшну');
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
    console.log('state-1');
    document.getElementsByClassName('NameAndText')[0].classList.remove('checkbox-off');
    document.getElementsByClassName('NameAndText')[0].classList.add('checkbox-on');
}
else{
    console.log('state-2');
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
    console.log('hidesection');
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
    modalWindowActions.classList.add('user-actions-modal_active');
})

copySharingLink_button.addEventListener('click', function(){
    let link = document.getElementsByClassName('link-output')[0].innerHTML;
    window.navigator.clipboard.writeText(link);
})

document.getElementsByTagName('body')[0].ondragover = function(e){
    e.preventDefault();
    e.stopPropagation();
    if(isAbleToDrag){
        fileDrop_window.classList.add('modal-file-drop-window_active');
    }
}
document.getElementsByTagName('body')[0].ondrop = function(){
    e.preventDefault();
    e.stopPropagation();
}
fileDrop_window.ondrop = function(e){
    e.preventDefault();
    e.stopPropagation();
    if(isAbleToDrag){
        fileInput = e.dataTransfer.files;
        fileDrop_window.classList.remove('modal-file-drop-window_active');
        fileDrop_input.files = fileInput;
    }
    //Дописать отправку файлов

}
fileDrop_window.ondragout = function(){
    fileDrop_window.classList.remove('modal-file-drop-window_active');
}

for(let i = 0; i < messageInput.length; i++){
    messageInput[i].onpaste = function(e){
        let pasteText = e.clipboardData.getData('text/plain');
        messageInput[i].textContent += pasteText;
        messageInput[i].focus();
        const range = document.createRange();
        range.selectNodeContents(messageInput[i]);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return false;
    }
    messageInput[i].ondrop = function(e){
        fileInput = e.dataTransfer.files;
        let thisFileInput = this.parentNode.getElementsByClassName('file-input')[0];
        thisFileInput.files = fileInput;
        return false;
    }
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
        if(this.getAttribute('state') == 'off'){
            this.classList.remove('checkbox-off');
            this.classList.add('checkbox-on');
            this.setAttribute('state', 'on')
            this.getElementsByClassName('notifications-settins-input-element')[0].checked = 1;
            if(this.getAttribute('type') == 'NameAndText'){
                let oppositeCheckBox = document.getElementsByClassName('NameOnly')[0];
                oppositeCheckBox.classList.remove('checkbox-on');
                oppositeCheckBox.classList.add('checkbox-off');
                oppositeCheckBox.getElementsByClassName('notifications-settins-input-element')[0].checked = 0;
            }
            else if(this.getAttribute('type') == 'NameOnly'){
                let oppositeCheckBox = document.getElementsByClassName('NameAndText')[0];
                oppositeCheckBox.classList.remove('checkbox-on');
                oppositeCheckBox.classList.add('checkbox-off');
                oppositeCheckBox.getElementsByClassName('notifications-settins-input-element')[0].checked = 0;
            }
        }
        else if(this.getAttribute('state') == 'on'){
            this.classList.remove('checkbox-on');
            this.classList.add('checkbox-off');
            this.setAttribute('state', 'off');
            this.getElementsByClassName('notifications-settins-input-element')[0].checked = 0;
            if(this.getAttribute('type') == 'NameAndText'){
                let oppositeCheckBox = document.getElementsByClassName('NameOnly')[0];
                oppositeCheckBox.classList.remove('checkbox-off');
                oppositeCheckBox.classList.add('checkbox-on');
                oppositeCheckBox.getElementsByClassName('notifications-settins-input-element')[0].checked = 1;
            }
            else if(this.getAttribute('type') == 'NameOnly'){
                let oppositeCheckBox = document.getElementsByClassName('NameAndText')[0];
                oppositeCheckBox.classList.remove('checkbox-off');
                oppositeCheckBox.classList.add('checkbox-on');
                oppositeCheckBox.getElementsByClassName('notifications-settins-input-element')[0].checked = 1;
            }
        }
    })
}

for(let i = 0; i<notificationSettings_switchers.length; i++){
    if(notificationSettings_switchers[i].classList[2] == 'switcher-true'){
        notificationSettings_switchers[i].setAttribute('state', 'on')
    }
    notificationSettings_switchers[i].addEventListener('click', function(){
        if(this.getAttribute('state') == 'off'){
            this.classList.remove('switcher-false');
            this.classList.add('switcher-true');
            this.setAttribute('state', 'on')
            this.getElementsByClassName('notifications-settins-input-element')[0].checked = 1;
        }
        else if(this.getAttribute('state') == 'on'){
            this.classList.remove('switcher-true');
            this.classList.add('switcher-false');
            this.setAttribute('state', 'off');
            this.getElementsByClassName('notifications-settins-input-element')[0].checked = 0;
        }
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