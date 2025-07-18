let model_kennartClassifier;
let model_speciesClassifier;

async function setupWebcam() {
  const webcamElement = document.getElementById('webcam');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("getUserMedia wird nicht unterstützt. Bitte Safari (ab iOS 11+) verwenden.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    webcamElement.srcObject = stream;

    return new Promise((resolve) => {
      webcamElement.onloadedmetadata = () => resolve();
    });
  } catch (err) {
    console.error("Fehler beim Zugriff auf die Kamera:", err);
    alert("Zugriff auf die Kamera fehlgeschlagen. Bitte Berechtigungen prüfen.");
  }
}

async function loadModel() {
  document.getElementById('result').innerText = "Modelle werden geladen...";

  try {
    model_kennartClassifier = await tf.loadLayersModel('./modelClassifier/model.json');
    model_speciesClassifier = await tf.loadLayersModel('./modelSpecies/model.json');
    console.log('Modelle geladen');
    document.getElementById('result').innerText = "Modelle bereit. Kamera aktiv.";
    document.getElementById('predictBtn').disabled = false;
  } catch (err) {
    console.error("Fehler beim Laden der Modelle:", err);
    document.getElementById('result').innerText = "Fehler beim Laden der Modelle.";
  }
}

async function predict() {
  const video = document.getElementById('webcam');
  const inputTensor = tf.browser.fromPixels(video)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();

  const classification = await model_kennartClassifier.predict(inputTensor).data();
  const classificationLabels = ['Kennart', 'Keine Kennart'];
  const classIndex = classification.indexOf(Math.max(...classification));
  const classLabel = classificationLabels[classIndex];
  const classConfidence = (classification[classIndex] * 100).toFixed(2);

  if (classLabel === 'Kennart' && classConfidence > 50) {
    const speciesPrediction = await model_speciesClassifier.predict(inputTensor).data();
    const speciesLabels = ['Ehrenpreis', 'Hahnenfuß', 'Labkraut', 'Margerite', 'Beifuß', 'Storchschnabel', 'Mädesüß'];
    const speciesIndex = speciesPrediction.indexOf(Math.max(...speciesPrediction));
    const speciesLabel = speciesLabels[speciesIndex];
    const speciesConfidence = (speciesPrediction[speciesIndex] * 100).toFixed(2);

    document.getElementById('result').innerText =
      `Kennart erkannt: ${speciesLabel} (${speciesConfidence}%)`;
  } else {
    document.getElementById('result').innerText =
      `Keine Kennart erkannt (${classConfidence}%)`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const predictBtn = document.getElementById('predictBtn');
  predictBtn.disabled = true;

  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    document.getElementById('result').innerText = "Starte Kamera...";

    await setupWebcam();
    await loadModel();

    predictBtn.onclick = predict;
  });
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log('Service Worker registriert'))
      .catch(err => console.error('Service Worker Fehler:', err));
  }
});
