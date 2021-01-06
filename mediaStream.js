function getCam() {
    navigator.mediaDevices.getUserMedia({
        video: true ,
        audio: false
    })
    .then(function(mediaStreamObj) {
        //connect the media stream to the first video element
    
        let video = document.querySelector('#cam');
        if ("srcObject" in video) {
            video.srcObject = mediaStreamObj;
        } else {
            //old version
            video.src = window.URL.createObjectURL(mediaStreamObj);
        }
        
        video.onloadedmetadata = function(ev) {
            //show in the video element what is being captured by the webcam
            video.play();
        };
    });
}

function RecScreen(start, echoCancellation, noiseSuppression) {
    const enableMic = document.querySelector('#enableMic');
    const audioSetting = {
        echoCancellation: echoCancellation.checked,
        noiseSuppression: noiseSuppression.checked,
        sampleRate: 44100
    }

    if(enableMic.checked) {
        navigator.mediaDevices.getUserMedia({
            video: false ,
            audio: audioSetting
        })
        .then(function(audioStreamObj) {
            StartScreenRecording(audioStreamObj);
        });
    } else {
        StartScreenRecording();
    }

    function StartScreenRecording(mic = null) {
        navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: "always"
            },
            audio: audioSetting
          })
        .then(function(mediaStreamObj) {
            
            //add listeners for saving video/audio
            const screen = document.getElementById('screen');
            const micStream = document.getElementById('mic');
            const toggleMic = document.querySelector('#toggleMic');
            const main = document.querySelector('main');
            const loading = document.querySelector('.lds-hourglass');
            const preview = document.querySelector('#btnPreview');
            const close = document.querySelector('#closeScreen');
            const mediaRecorder = new MediaRecorder(mediaStreamObj);
            let audioRecorder = null;
            let micOnFlag = false;
            
            var timer = document.querySelector('#timer');
            let chunks = [];
            
            start.classList.add('hide');
            mediaRecorder.start();
            main.classList.add('recording');
            loading.classList.remove('hide');
            timer.checked = true;
            Timer(timer, 0, 0, 0);

            if(mic) {
                // audioRecorder = new MediaRecorder(mic);
                // audioRecorder.start();

                // audioRecorder.ondataavailable = function(ev) {
                //     chunks.push(ev.data);
                // }
                micStream.srcObject = mic;
                toggleMic.classList.remove('hide');
                toggleMic.addEventListener('click', function () {
                    if(micOnFlag) {
                        micOnFlag = false;
                        micStream.pause();
                        toggleMic.classList.remove('mic-on');
                    } else {
                        micOnFlag = true;
                        micStream.play();
                        toggleMic.classList.add('mic-on');
                    }
                });
            }
    
            mediaRecorder.ondataavailable = function(ev) {
                chunks.push(ev.data);
            }
    
            mediaRecorder.onstop = () => {
                let blob = new Blob(chunks, { 'type' : 'video/webm;' });
                window.URL.revokeObjectURL(blob);
                chunks = [];
                let videoURL = window.URL.createObjectURL(blob);
                screen.src = videoURL;

                // var outputStream = new MediaStream;
                // outputStream.addTrack(chunks[0]);
                // //outputAudioStream.addTrack(mic.getAudioTracks()[0].clone());
                // screen.src = outputStream;
                
                preview.classList.remove('hide');
                loading.classList.add('hide');
                main.classList.remove('recording');
    
                screen.currentTime = 36000;
    
                // var audio = document.createElement('audio');
                // audio.controls = true;
                // var blob = new Blob(chunks, { 'type' : 'audio/mp3; codecs=opus' });
                // var audioURL = window.URL.createObjectURL(blob);
                // audio.src = audioURL;
                // document.querySelector('main').appendChild(audio);
            }
    
            mediaStreamObj.getVideoTracks()[0].onended = function () {
                if(audioRecorder) audioRecorder.stop();
                mediaRecorder.stop();
                micStream.pause();
                timer.checked = false;
                toggleMic.classList.add('hide');
            };
    
            preview.addEventListener('click', function () {
                screen.parentElement.classList.remove('hide');
            });
    
            close.addEventListener('click', function () {
                screen.parentElement.classList.add('hide');
            });
        })
        .catch(function(err) { 
            console.log(err.name, err.message); 
        });
    
        navigator.onstop = function () { console.log("Ended")}
    }   
}

function Timer(timer, h, m, s) {
    var time = document.querySelector('#time');

    function setTwoDigit(num) {
        if(num.toString().length === 1) return `0${num}`;
        else return `${num}`;
    }

    setTimeout(function () {
        if(timer.checked) {
            if(s < 59) s = s + 1;
            else {
                s = 0;
                
                if(m < 59) m = m + 1;
                else {
                    m = 0;
                    h = h + 1;
                }
            }

            time.textContent = `${setTwoDigit(h)}:${setTwoDigit(m)}:${setTwoDigit(s)}`;
            Timer(timer, h, m, s);
        }
    }, 1000);

}

window.addEventListener('DOMContentLoaded', function () {

    let start = document.getElementById('btnStart');
    let echo = document.querySelector('#echoCancellation');
    let noise = document.querySelector('#noiseSuppression');
    
    start.addEventListener('click', () => {
        RecScreen(start, echo, noise);
        echo.disabled = true;
        noise.disabled = true;
    });
});