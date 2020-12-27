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

function RecScreen(start) {
    navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
    .then(function(mediaStreamObj) {
        
        //add listeners for saving video/audio
        let screen = document.getElementById('screen');
        let main = document.querySelector('main');
        let loading = document.querySelector('.lds-hourglass');
        let mediaRecorder = new MediaRecorder(mediaStreamObj);
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
            window.URL.revokeObjectURL(blob);
            chunks = [];
            let videoURL = window.URL.createObjectURL(blob);
            screen.src = videoURL;
            screen.parentElement.classList.remove('hide');

            screen.currentTime = 36000; 

            // var audio = document.createElement('audio');
            // audio.controls = true;
            // var blob = new Blob(chunks, { 'type' : 'audio/mp3; codecs=opus' });
            // var audioURL = window.URL.createObjectURL(blob);
            // audio.src = audioURL;
            // document.querySelector('main').appendChild(audio);
        }

        mediaStreamObj.getVideoTracks()[0].onended = function () {
            mediaRecorder.stop();
            timer.checked = false;
        };
    })
    .catch(function(err) { 
        console.log(err.name, err.message); 
    });

    navigator.onstop = function () { console.log("Ended")}
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
    
    start.addEventListener('click', () => {
        RecScreen(start);
    });
});