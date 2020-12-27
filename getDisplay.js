var speaker = new MediaStream;
if (navigator.getDisplayMedia) {
    navigator.getDisplayMedia({
        video: true ,
        audio: true
    }).then(stream => {
        speaker.addTrack(stream.getAudioTracks()[0].clone());
        console.log(stream.getAudioTracks()[0]);
        // stopping and removing the video track to enhance the performance
        stream.getVideoTracks()[0].stop();
        stream.removeTrack(stream.getVideoTracks()[0]);
    }).catch(() => {
        console.error('failed')
    });
} else if (navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia({
        video: true ,
        audio: true
    }).then(stream => {
        speaker.addTrack(stream.getAudioTracks()[0].clone());
        // stopping and removing the video track to enhance the performance
        stream.getVideoTracks()[0].stop();
        stream.removeTrack(stream.getVideoTracks()[0]);
    }).catch(() => {
        console.error('failed')
    });
}