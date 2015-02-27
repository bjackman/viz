window.onload = function() {
    audio = document.getElementById("audio");
    canvas = document.getElementById("canvas");

    var drawCtx = canvas.getContext("2d");

    var audioCtx = new AudioContext();
    var audioSrc = audioCtx.createMediaElementSource(audio);
    var analyser = audioCtx.createAnalyser();
    audioSrc.connect(analyser);
    audioSrc.connect(audioCtx.destination);

    try {
      analyser.fftSize = canvas.height * 8;
      if (analyser.frequencyBinCount != canvas.height * 4) {
          console.log("wat");
      }
    } catch (e) {
      console.log("CANVAS HEIGHT MUST BE A POWER OF 2");
    }

    var freqData = new Uint8Array(analyser.frequencyBinCount);

    var columnPos = 0;
    var playing = false;
    function renderFrame() {
        if (playing) requestAnimationFrame(renderFrame);
        // update data in frequencyData
        analyser.getByteFrequencyData(freqData);
        var column = new Uint8ClampedArray(freqData, 0, freqData.length);
        var imageData = new ImageData(column, 1);
        drawCtx.putImageData(imageData, columnPos, 0);
        columnPos = (columnPos + 1) % canvas.width;
    }

    audio.addEventListener("play", function() {
        playing = true;
        renderFrame()
    });
    audio.addEventListener("pause", function() {
        playing = false
    });
}
