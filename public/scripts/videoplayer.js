class video{
    constructor(el){
        this.video = el;
        this.video_container = el.parentNode;
        this.video_controls = this.video_container.getElementsByClassName('video-controls')[0];
        this.videoPlay_button = this.video_controls.getElementsByClassName('video-play-button')[0];
        this.controlsContainer = this.video_controls.getElementsByClassName('controls-container')[0];
        this.progressBar = this.controlsContainer.getElementsByClassName('video-progress-bar')[0];
        this.controlsButtons = this.controlsContainer.getElementsByClassName('controls-container-buttons')[0];
        this.currentHours = this.controlsButtons.getElementsByClassName('video-timer-current-hours')[0];
        this.currentMinutes = this.controlsButtons.getElementsByClassName('video-timer-current-minutes')[0];
        this.currentSeconds = this.controlsButtons.getElementsByClassName('video-timer-current-seconds')[0];
        this.totalHours = this.controlsButtons.getElementsByClassName('video-timer-total-hours')[0];
        this.totalMinutes = this.controlsButtons.getElementsByClassName('video-timer-total-minutes')[0];
        this.totalSeconds = this.controlsButtons.getElementsByClassName('video-timer-total-seconds')[0];
        this.videoControls_volume = this.controlsButtons.getElementsByClassName('video-controls-volume');
        this.unmuted_icon = this.controlsButtons.getElementsByClassName('video-controls-volume')[0];
        this.muted_icon = this.controlsButtons.getElementsByClassName('video-controls-volume')[1];
        this.volumeInput = this.controlsButtons.getElementsByClassName('video-volume-input')[0];
        this.fullScreenButton_enter = this.controlsButtons.getElementsByClassName('video-controls-fullscreen-enter');
        this.volumeInputDisabled = false;
        this.timer;
        this.volumeTimer;
        this.playState = 0;
        this.fullScreenState = 0;
        this.hasHours = false;
        this.isMuted = true;
    }
    initialize(){
        this.video_container.addEventListener('mousemove', e => {
            this.showControls();
        });
        this.video_controls.addEventListener('click', e => {
            this.playState_handle(e);
        })
        this.video.addEventListener('ended', e => {
            this.rewindAgain();
        });
        this.videoPlay_button.addEventListener('click', e => {
            e.stopPropagation();
            this.playState_handle(e);
        });
        this.video.addEventListener('timeupdate', e => {
            this.progressBar_handle();
        })
        this.progressBar.addEventListener('click', e => {
            e.stopPropagation();
            this.progressBarRewind(e);
        })
        this.volumeInput.addEventListener('mouseenter', e => {
            this.showVolumeInput();
        })
        this.volumeInput.addEventListener('mouseleave', e => {
            this.hideVolumeInput();
        })
        this.volumeInput.addEventListener('click', e => {
            e.stopPropagation();
        })
        this.volumeInput.addEventListener('input', e => {
            this.volume_handle();
        })
        this.fullScreenButton_enter[0].addEventListener('click', e => {
            e.stopPropagation();
            this.fullScreen_open();
        })
        this.fullScreenButton_enter[1].addEventListener('click', e => {
            e.stopPropagation();
            this.fullScreen_close();
        })
        this.video_container.addEventListener('fullscreenchange', e => {
            this.fullScreenStateChange_handle();
        })
        this.showtime();
        this.mute_handle();
        if(this.volumeInputDisabled){
            this.volumeInput.style.display = 'none';
        }
        for(let i = 0; i < this.videoControls_volume.length; i++){
            this.videoControls_volume[i].addEventListener('click', e => {
                e.stopPropagation();
                this.muteButton_handle(e);
            })
            this.videoControls_volume[i].addEventListener('mouseenter', e => {
                this.showVolumeInput();
            })
            this.videoControls_volume[i].addEventListener('mouseleave', e => {
                this.hideVolumeInput();
            })
        }
    }
    fullScreenStateChange_handle(){
        if(this.fullScreenState == 0){
            this.fullScreenState = 1;
            this.video_container.classList.add('video-container_fullscreen');
            this.fullScreenButton_enter[0].classList.add('icon_hidden');
            this.fullScreenButton_enter[1].classList.remove('icon_hidden');
        }
        else if(this.fullScreenState == 1){
            this.fullScreenState = 0;
            this.video_container.classList.remove('video-container_fullscreen');
            this.fullScreenButton_enter[0].classList.remove('icon_hidden');
            this.fullScreenButton_enter[1].classList.add('icon_hidden');
        }
    }
    fullScreen_open(){
        this.video_container.requestFullscreen();
        if(this.volumeInputDisabled){
            this.volumeInput.style.display = 'block';
        }
    }
    fullScreen_close(){
        document.exitFullscreen();
        this.volumeInput.style.display = 'none';
    }
    showVolumeInput(){
        clearTimeout(this.volumeTimer);
        this.volumeInput.style.animationName = 'width-in';
    }
    hideVolumeInput(){
        this.volumeTimer = setTimeout(() => {
            this.volumeInput.style.animationName = 'width-out';
        }, 2000);
    }
    playState_handle(e){
        if(this.playState == 0){
            this.playState = 1;
            this.play();
        }
        else{
            this.playState = 0;
            this.pause();
        }
    }
    showtime(){
        let thisVideo_totalTime = Math.round(this.video.duration);
        let totalHours = Math.floor(thisVideo_totalTime/3600);
        thisVideo_totalTime = (thisVideo_totalTime - (totalHours * 3600));
        if(totalHours != 0){
            this.hasHours = true;
            this.totalHours.classList.remove('video-timer-total-hours_hidden');
            this.currentHours.classList.remove('video-timer-current-hours_hidden');
            let totalHours_text = totalHours;
            if(totalHours_text < 10){
                totalHours_text = '0' + totalHours_text;
            }
            this.totalHours.innerText = totalHours_text;
            this.currentHours.innerText = '0';
        }
        let totalMinutes = Math.floor(thisVideo_totalTime/60);
        let totalMinutes_text = totalMinutes;
        if(totalMinutes_text < 10){
            totalMinutes_text = `0${totalMinutes_text}`;
        }
        let totalSeconds = (thisVideo_totalTime - (totalMinutes * 60));
        let totalSeconds_text = totalSeconds;
        if(totalSeconds_text < 10){
            totalSeconds_text = `0${totalSeconds_text}`;
        }
        this.totalMinutes.innerText = totalMinutes_text;
        this.totalSeconds.innerText = totalSeconds_text;
        this.currentHours.innerText = '00';
        this.currentHours.innerText = '00';
        this.currentHours.innerText = '00';
    }
    progressBarRewind(e){
        let progressBar_width = this.progressBar.offsetWidth;
        let progressBar_clickOffset = e.offsetX;
        this.progressBar.value = progressBar_clickOffset/progressBar_width*100;
        this.video.currentTime = (this.video.duration * (progressBar_clickOffset / progressBar_width));
    }
    muteButton_handle(){
        if(this.isMuted){
            this.video.volume = 0.5;
            this.volumeInput.value = 50;
        }
        else{
            this.video.volume = 0;
            this.volumeInput.value = 0;
        }
        this.mute_handle();
    }
    mute_handle(){
        if(this.isMuted){
            this.isMuted = false;
            this.unmuted_icon.classList.remove('video-controls-volume_hidden');
            this.muted_icon.classList.add('video-controls-volume_hidden');
        }
        else{
            this.isMuted = true;
            this.unmuted_icon.classList.add('video-controls-volume_hidden');
            this.muted_icon.classList.remove('video-controls-volume_hidden');
        }
    }
    volume_handle(){
        let currentVolume = this.volumeInput.value;
        this.video.volume = currentVolume/100;
        if(!this.isMuted && currentVolume == 0){
            this.mute_handle();
        }
        if(this.isMuted && currentVolume != 0){
            this.mute_handle();
        }
    }
    play(){
        this.hidePlayButton();
        this.video.play();
    }
    pause(){
        this.showPlayButton();
        this.video.pause();
    }
    progressBar_handle(){
        let currentDuration = this.video.currentTime;
        let totalDuration = this.video.duration;
        this.progressBar.value = currentDuration/totalDuration*100;
        currentDuration = Math.round(currentDuration);
        if(this.hasHours){
            let currentHours = Math.floor(currentDuration/3600);
            currentDuration = (currentDuration - (currentHours * 3600));
            if(currentHours < 10){currentHours = `0${currentHours}`};
            let currentMinutes = Math.floor(currentDuration/60);
            currentDuration = (currentDuration - (currentMinutes * 60));
            if(currentMinutes < 10){currentMinutes = `0${currentMinutes}`};
            let currentSeconds = currentDuration;
            if(currentDuration < 10){ currentSeconds = `0${currentSeconds}`};
            this.currentHours = currentHours;
            this.currentMinutes = currentMinutes;
            this.currentSeconds = currentSeconds;
        }
        else{
            let currentMinutes = Math.floor(currentDuration/60);
            currentDuration = (currentDuration - (currentMinutes * 60));
            if(currentMinutes < 10){currentMinutes = `0${currentMinutes}`};
            let currentSeconds = currentDuration;
            if(currentDuration < 10){ currentSeconds = `0${currentSeconds}`};
            this.currentMinutes.innerText = currentMinutes;
            this.currentSeconds.innerText = currentSeconds;
        }
    }
    hideControls(){
        this.controlsContainer.style.animationName = 'fade-out';
    }
    showControls(){
        clearTimeout(this.timer);
        this.controlsContainer.style.animationName = 'fade-in';      
        this.timer = setTimeout(() => {
            this.hideControls();
        }, 2000);  
    }
    hidePlayButton(){
        this.videoPlay_button.style.animationName = 'fade-out';
    }
    showPlayButton(){
        this.videoPlay_button.style.animationName = 'fade-in';
    }
    rewindAgain(){
        this.progressBar.value = 0;
        this.playState = 0;
        this.video.currentTime = 0;
        this.showPlayButton();
    }
    disableVolumeInput(){
        this.volumeInputDisabled = true;
    }
}