let select = document.getElementsByClassName('select');
let selected;

for(let i = 0; i<select.length; i++){
    select[i].addEventListener('click', function(){
        this.classList.remove('select');
        this.classList.add('select-click');
        let select = this;
        let select_items = select.getElementsByClassName('select-body-group-content-item');
        let select_text = select.getElementsByClassName('select-text')[0]
        for(let i = 0; i<select_items.length; i++){
            select_items[i].addEventListener('click', function(){
                select.classList.remove('select-click');
                select.classList.add('select');
                selected = this.innerHTML;
                select_text.innerHTML = selected;
            }, true) 
        }
    }, true)
}