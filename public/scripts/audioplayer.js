class audio{
    constructor(el){
        this.audio = el;
    }
    initialize(){
        this.controlsContainer = this.audio.parentNode.getElementsByClassName('audio-controls-container')[0];
        this.playButton = this.controlsContainer.getElementsByClassName('audio-play-button');
        this.volumeIcons = this.controlsContainer.getElementsByClassName('volume-icon');
        this.volumeInput = this.controlsContainer.getElementsByClassName('input-volume')[0];
        this.audioProgress = this.controlsContainer.getElementsByClassName('audio-progress')[0];

        this.currentPlayState = 0;
        this.lastVolume = 0.5;
        this.muted = false;
        this.volumeHide_timer;
        this.totalTime = this.audio.duration;
        this.audio.volume = 0.5;

        this.volumeInput.addEventListener('input', e => {
            this.volume_handle();
        })
        this.volumeInput.addEventListener('mouseenter', e => {
            this.showVolumeInput();
        })
        this.volumeInput.addEventListener('mouseleave', e => {
            this.hideVolumeInput();
        })
        this.audio.addEventListener('timeupdate', e => {
            this.updateCurrentTime();
        })
        this.audio.addEventListener('ended', e => {
            this.rewindAgain();
        })
        this.audioProgress.addEventListener('click', e => {
            e.stopPropagation();
            this.changeCurrentTime(e);
        })

        for(let i = 0; i < this.playButton.length; i++){
            this.playButton[i].addEventListener('click', e => {
                this.playButton_handle();
            })
        }

        for(let i = 0; i < this.volumeIcons.length; i++){
            this.volumeIcons[i].addEventListener('click', e => {
                this.volumeButton_handle();
            })
            this.volumeIcons[i].addEventListener('mouseenter', e => {
                this.showVolumeInput();
            })
            this.volumeIcons[i].addEventListener('mouseleave', e => {
                this.hideVolumeInput();
            })
        }
    }
    changeCurrentTime(e){
        let progressWidth = this.audioProgress.offsetWidth;
        let progress_clickOffset = e.offsetX;
        console.log('progressWidth: ' + progressWidth);
        console.log('clickOffset: ' + progress_clickOffset);
        console.log('pers: '+(progress_clickOffset/progressWidth)*100);
        this.audioProgress.value = (progress_clickOffset/progressWidth)*100;
        this.audio.currentTime = (progress_clickOffset/progressWidth)*this.totalTime;
    }
    rewindAgain(){
        this.pause();
        this.currentPlayState = 0;
        this.audioProgress.value = 0;
        this.currentTime = 0;
        this.playButton[0].classList.remove('audio-play-button_hidden');
        this.playButton[1].classList.add('audio-play-button_hidden');
    }
    updateCurrentTime(){
        let currentTime = this.audio.currentTime;
        let rangeVal = (currentTime/this.totalTime)*100;
        this.audioProgress.value = rangeVal;
    }
    showVolumeInput(){
        this.volumeInput.style.animationName = 'width-in';
        clearTimeout(this.volumeHide_timer);
    }
    hideVolumeInput(){
        this.volumeHide_timer = setTimeout(() => {
            this.volumeInput.style.animationName = 'width-out';
        }, 2000);
    }
    volume_handle(){
        let volume_value = this.volumeInput.value;
        this.lastVolume = volume_value/100;
        this.audio.volume = this.lastVolume;
        if(!this.muted && this.lastVolume == 0){
            this.mute();
        }
        else if(this.muted && this.lastVolume != 0){
            this.unmute();
        }
    }
    mute(){
        this.muted = true;
        this.volumeIcons[0].classList.add('volume-icon_hidden');
        this.volumeIcons[1].classList.remove('volume-icon_hidden');
        this.audio.volume = 0;
        this.volumeInput.value = 0;
    }
    unmute(){
        this.muted = false;
        this.volumeIcons[0].classList.remove('volume-icon_hidden');
        this.volumeIcons[1].classList.add('volume-icon_hidden');
        this.audio.volume = this.lastVolume;
        this.volumeInput.value = this.lastVolume*100;
    }
    volumeButton_handle(){
        if(!this.muted){
            this.mute();
        }
        else if(this.muted){
            this.unmute();
        }
    }
    playButton_handle(){
        if(this.currentPlayState == 0){
            this.currentPlayState = 1;
            this.playButton[0].classList.add('audio-play-button_hidden');
            this.playButton[1].classList.remove('audio-play-button_hidden');
            this.play();
        }
        else if(this.currentPlayState == 1){
            this.currentPlayState = 0;
            this.playButton[0].classList.remove('audio-play-button_hidden');
            this.playButton[1].classList.add('audio-play-button_hidden');
            this.pause();
        }
    }
    play(){
        this.audio.play();
    }
    pause(){
        this.audio.pause();
    }
}