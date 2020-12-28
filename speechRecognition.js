// new speech recognition object
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();
const speechUtility = document.querySelector('#speechNote');
const field = document.querySelector('#speechNoteField');
const speakNow = document.querySelector('#speakNow');
const speakStop = document.querySelector('#speakStop');
const transcribe = document.querySelector('#transcribe');
const msg = document.querySelector('#speechNoteField p');

recognition.continuous = true;
            
// This runs when the speech recognition service starts
recognition.onstart = function() {
    msg.classList.remove('hide');
};

recognition.onspeechend = function() {
    speakStop.click();
}
              
// This runs when the speech recognition service returns result
recognition.onresult = function(event) {
    var current = event.resultIndex;
    var transcript = event.results[current][0].transcript;
    var confidence = event.results[current][0].confidence;
    
    transcribe.textContent += transcript;
};

recognition.onerror = function () {
    console.log('error');
}
              
// start recognition
//recognition.start();

window.addEventListener('DOMContentLoaded', function () {
    
    speechUtility.addEventListener('click', function () {
        if(speechUtility.checked) field.classList.remove('hide');
        else field.classList.add('hide');
    });

    speakNow.addEventListener('click', function () {
        recognition.start();
        speakNow.hidden = true;
        speakStop.hidden = false;
        transcribe.disabled = true;
    });

    speakStop.addEventListener('click', function () {
        recognition.stop();
        msg.classList.add('hide');
        speakNow.hidden = false;
        speakStop.hidden = true;
        transcribe.disabled = false;
    });
});