window.onload = function() {
    audio = document.getElementById("audio");
    fftCanvas = document.getElementById("fftCanvas");
    fftDiffCanvas = document.getElementById("fftDiffCanvas");
    var fftCtx = fftCanvas.getContext("2d");
    var fftDiffCtx = fftDiffCanvas.getContext("2d");

    var audioCtx = new AudioContext();
    var audioSrc = audioCtx.createMediaElementSource(audio);
    var analyser = audioCtx.createAnalyser();
    audioSrc.connect(analyser);
    audioSrc.connect(audioCtx.destination);

    // fftSize is 2* number of bins.
    // we actually want 4 bins per vertical pixel because the Uint8ClampedArray passed to putImageData is
    // interpreted as successive RGBA sets.
    try {
      analyser.fftSize = fftCanvas.height * 8;
      if (analyser.frequencyBinCount != fftCanvas.height * 4) {
          console.log("wat");
      }
    } catch (e) {
      console.log("CANVAS HEIGHT MUST BE A POWER OF 2");
    }

    var freqData = new Uint8Array(analyser.frequencyBinCount);
    // Initialise this so we don't have to bother with checking if it's the first iteration.
    var prevColumn = new Uint8ClampedArray(freqData.length);
    var diffColumn = new Uint8ClampedArray(freqData.length);

    var columnPos = 0;
    var playing = false;
    function renderFrame() {
        if (playing) requestAnimationFrame(renderFrame);

        // Fourier transform
        analyser.getByteFrequencyData(freqData);
        var column = new Uint8ClampedArray(freqData, 0, freqData.length);
        var imageData = new ImageData(column, 1);
        fftCtx.putImageData(imageData, columnPos, 0);

        // Work out differences between this frame and last one
        // So basically this sort of sucks - instead we should do a
        // little convolution: look at 2 or 3 previous columns. TODO
        var sum = 0;
        for (var i = 0; i < column.length; i++) {
            diffColumn[i] = Math.abs(column[i] - prevColumn[i]) * 4;
            sum += diffColumn[i];
        }
        var diffImageData = new ImageData(diffColumn, 1);
        fftDiffCtx.putImageData(diffImageData, columnPos, 1);

        // Try flickering the background when shit changes...
        // TODO: obviously should do this with different colours for different bins!
        // Also there's probably a way to make it not look shit by smoothing it a bit.
        var s = "rgb(" + Math.floor(sum / fftDiffCanvas.height) + ", 0, 0)";
        console.log(s);
        document.body.style.background = s;

        columnPos = (columnPos + 1) % fftCanvas.width;
        prevColumn = column;
    }

    audio.addEventListener("play", function() {
        playing = true;
        renderFrame();
    });
    audio.addEventListener("pause", function() {
        playing = false;
    });
}
