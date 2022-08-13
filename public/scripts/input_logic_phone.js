document.addEventListener('DOMContentLoaded', function () {
    const select = document.getElementsByClassName('select')[0]; //Получаем элемент селект
    const select_items = document.getElementsByClassName('select-body-group-content-item'); //Получаем варианты выбора селект
    const select_text = document.getElementsByClassName('select-text')[0]; //Получаем селект выбора страны
    const input_code = document.getElementsByClassName('input-code')[0]; //Получаем инпут кода
    const button_continue = document.getElementsByClassName('continue-button')[0]; //Получаем кнопку продолжить
    let selected;
    let selected_code;
    let code;
    select.addEventListener('click', function () { //ивент клика по селекту для отображения вариантов 
        select.classList.remove('select');
        select.classList.add('select-click');
    }, true);
    button_continue.addEventListener('click', login_continue()); //Ивент клика по кнопке продолжить
    input_code.addEventListener('keyup', read_input_code, true); //Ивент ввода кода в инпут кода
    for (let i = 0; i < select_items.length; i++) { //добавление ивентов клика на все варианты селекта для показа выбранного варианта
        select_items[i].addEventListener('click', function () {
            select.classList.remove('select-click');
            select.classList.add('select');
            selected = this.innerHTML;
            selected_code = this.getElementsByClassName('code')[0].innerHTML;
            changeSelected();
        }, true)
    } 
    function changeSelected() { //функция смены выбранного варианта
        select_text.innerHTML = selected;
        input_code.value = selected_code;
    }
    function read_input_code() { //функция получения введенного кода
        code = input_code.value;
        
    }
    function login_continue() {

    }
})