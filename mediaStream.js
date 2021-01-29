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
            let audioRecorder = null;
            let micOnFlag = false;
            let mediaRecorder;
            
            if(mic) {
                const audioContext = new AudioContext();

                const micAudio = audioContext.createMediaStreamSource(mic);
                const systemAudio = audioContext.createMediaStreamSource(mediaStreamObj);

                const dest = audioContext.createMediaStreamDestination();
                systemAudio.connect(dest);

                let combined = new MediaStream([...dest.stream.getTracks(), ...mediaStreamObj.getTracks()]);
                mediaRecorder = new MediaRecorder(combined);

                // Mic Controller
                toggleMic.classList.remove('hide');
                toggleMic.addEventListener('click', function () {
                    if(micOnFlag) {
                        micOnFlag = false;
                        toggleMic.classList.remove('mic-on');
                        micAudio.disconnect(dest);
                    } else {
                        micOnFlag = true;
                        toggleMic.classList.add('mic-on');
                        micAudio.connect(dest);
                    }
                });
            }
            else mediaRecorder = new MediaRecorder(mediaStreamObj);
            
            var timer = document.querySelector('#timer');
            let chunks = [];
            
            start.classList.add('hide');
            mediaRecorder.start();
            main.classList.add('recording');
            loading.classList.remove('hide');
            timer.checked = true;
            Timer(timer, 0, 0, 0);
    
            mediaRecorder.ondataavailable = function(ev) {
                chunks.push(ev.data);
            }
    
            mediaRecorder.onstop = () => {
                let blob = new Blob(chunks, { 'type' : 'video/webm;' });
                chunks = [];
                let videoURL = window.URL.createObjectURL(blob);
                screen.src = videoURL;

                window.URL.revokeObjectURL(blob);
                
                preview.classList.remove('hide');
                loading.classList.add('hide');
                main.classList.remove('recording');
    
                screen.currentTime = 9999999;
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
    let mic = document.querySelector('#enableMic');
    let cam = document.querySelector('#enableCam');
    
    start.addEventListener('click', () => {
        RecScreen(start, echo, noise);
        echo.disabled = true;
        noise.disabled = true;
        mic.disabled = true;
        cam.disabled = true;
    });
});