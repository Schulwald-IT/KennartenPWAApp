let model_kennartClassifier;
let model_speciesClassifier;
let currentStream = null;

const speciesImages = {  
  'Labkraut': 'ResultImages/Labkraut.jpg',  
  'Ehrenpreis': 'ResultImages/Ehrenpreis.jpg',  
  'Augentrost': 'ResultImages/Alpen Augentrost.jpg',  
  'Segge': 'ResultImages/Segge.jpg',  
  'Hahnenfuß': 'ResultImages/Hahnenfuß.jpg',
  'Hainsimme': 'ResultImages/Feld Hainsimme.jpg',  
  'Butterblume': 'ResultImages/Butterblume.jpg',  
  'Strandflieder': 'ResultImages/Strandflieder.jpg',
  'Rotklee': 'ResultImages/Rotklee.jpg',  
  'Schafgabe': 'ResultImages/Schafgabe.jpg',  
  'Hornklee': 'ResultImages/Hornklee.jpg',  
  'Wiesenmargerite': 'ResultImages/Wiesenmargerite.jpg',  
  'Skabiosenflockenblume': 'ResultImages/Skabiosenflockenblume.jpg',  
  'Platterbse': 'ResultImages/Wiesenplatterbse.jpg',  
  'Wilde Möhre': 'ResultImages/Wilde Möhre.jpg',
  'Mädesüß': 'ResultImages/Mädesüß.jpg', 
  'Flockenblume': 'ResultImages/Flockenblume.jpg', 
  'Birnelle': 'ResultImages/Birnelle.jpg',
  'Ranuculus Orthorhynchus': 'ResultImages/Ranuculus Orthorhynchus.jpg',  
  'Haarstrang': 'ResultImages/Haarstrang.jpg',  
  'Wiesen Witwenblume': 'ResultImages/Wiesen Witwenblume.jpg',  
  'Johanniskraut': 'ResultImages/Johanniskraut.jpg',  
};

let threshold = 50;

//öffnet die kamera in einem video html objekt
async function setupWebcam() {
  //holt sich das video objekt
  const webcamElement = document.getElementById('webcam');

  //prüft ob die funktion unterstützt wird vom browser
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("getUserMedia wird nicht unterstützt. Bitte Safari (ab iOS 11+) verwenden.");
    return;
  }

  try {
    //holt sich den kamera stream im video objekt, ohne audio aufnahme
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    //setzt die quelle des videoobjektes auf den stream der kamera
    currentStream = stream;
    webcamElement.srcObject = currentStream;

    //holt sich die metadaten z.b. windowgrösse zum auflösen der kamera in der app
    return new Promise((resolve) => {
      webcamElement.onloadedmetadata = () => resolve();
    });
  } catch (err) {
    console.error("Fehler beim Zugriff auf die Kamera:", err);
    alert("Zugriff auf die Kamera fehlgeschlagen. Bitte Berechtigungen prüfen.");
  }
}

function stopWebcam() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
    console.log("Kamera gestoppt");
    document.getElementById('webcam').srcObject = null;
  }
}

async function loadModel() {
  document.getElementById('result').innerText = "Modelle werden geladen...";

  try {
    //läd die Modelle in den TensorFlow aus dem Cache des Service Workers
    model_kennartClassifier = await tf.loadLayersModel('./modelClassifier/model.json');
    model_speciesClassifier = await tf.loadLayersModel('./modelSpecies/model.json');
    console.log('Modelle geladen');
    //nach beenden des ladens wird Aktivität zurückgemeldet
    document.getElementById('result').innerText = "Modelle bereit. Kamera aktiv.";
    document.getElementById('predictBtn').disabled = false;
  } catch (err) {
    console.error("Fehler beim Laden der Modelle:", err);
    document.getElementById('result').innerText = "Fehler beim Laden der Modelle.";
  }
}
//zentrale Funktion zum bestimmen der Kennart
async function predict() {
  console.log("In Predict");
  //holt sich das video objekt mit dem webcam stream
  const video = document.getElementById('webcam');
  //setzt den tensorflow auf das video und setzt die pixelgrösse zur besseren verarbeitung im TF
  const inputTensor = tf.browser.fromPixels(video)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();

  //gibt einen array von wahrscheinlichkeiten (kennart oder nicht) zurück
  const classification = await model_kennartClassifier.predict(inputTensor).data();
  
  //ergebnisarray
  const classificationLabels = ['KENNARTEN', 'NICHT-KENNARTEN'];
  console.log("classification", classification);
  const speciesPredictionelement = document.getElementById('speciesPrediction');
  //holt sich den index des höchsten bestimmten werts
  const classIndex = classification.indexOf(Math.max(...classification));
  const classLabel = classificationLabels[classIndex];
  //bestimmt die wahrscheinlichkeit mit welcher die kennart erkannt wurde
  const classConfidence = (classification[0] * 100).toFixed(2);
  let ergebnisse = 0;
  if(localStorage.getItem("anzahl")) {
  ergebnisse = (localStorage.getItem("anzahl")); 
  }
  console.log(classConfidence, "Confidence");
  console.log(threshold, "Value");

    if (classConfidence > threshold) {

    //wenn sicher ist, daß es eine kennart ist mit über 50 % wahrscheinlichkeit dann bestimme die genaue kennart
    const speciesPrediction = await model_speciesClassifier.predict(inputTensor).data();
    //liste der zu bestimmenden kennarten
    const speciesLabels = ['Labkraut', 'Ehrenpreis', 'Augentrost', 'Segge', 'Hahnfuß', 'Hainsimme', 'Butterblume', 'Strandflieder', 'Rotklee', 'Schafgarbe', 'Hornklee', 'Wiesenmargerite', 'Skabiosenflockenblume', 'Platterbse', 'Wilde Möhre', 'Mädesüß', 'Flockenblume', 'Birnelle', 'Ranuculus Orthorhynchus', 'Haarstrang', 'Wiesen Witwenblume', 'Johanniskraut'];
     //holt sich den index des höchsten bestimmten werts
    const speciesIndex = speciesPrediction.indexOf(Math.max(...speciesPrediction));
    //holt sich das label was mit höchster wahrscheinlichkeit bestimmt wurde
    const speciesLabel = speciesLabels[speciesIndex];
    //zeigt das Bild einer erkannten Planze an
    const resultImage = document.getElementById('resultImage');
    if (speciesImages[speciesLabel]) {  
      resultImage.src = speciesImages[speciesLabel];  resultImage.style.display = 'block';
    } else {
        resultImage.style.display = 'none';
      }
    //berechnet die wahrscheinlichkeit in % mit der die aussage gesichert ist
    const speciesConfidence = (speciesPrediction[speciesIndex] * 100).toFixed(2);
    //gibt in einem paragraph objekt die kennart und die bestimmungsgenauigkeit in % an
    document.getElementById('result').innerText =
      `Kennart erkannt: ${speciesLabel} (${speciesConfidence}%)`;
      document.getElementById('result').style = "color : green";
      ergebnisse = parseInt(ergebnisse) + 1; 
      localStorage.setItem('anzahl', ergebnisse);
      document.getElementById("anzahlView").innerText = "Gespeicherte Ergebnisse:" + ergebnisse;
}else {
  document.getElementById('result').innerText =
      `Keine Kennart erkannt`;
      document.getElementById('result').style = "color : red";
      document.getElementById("resultImage").style.display = 'none';   
}
}
//wenn die webseite innerhalb der app geladen wird, wird folgender code ausgeführt
document.addEventListener('DOMContentLoaded', () => {
  //holt sich vom dokument die html elemente startbutton und predict button

  const startBtn = document.getElementById('startBtn');
  const predictBtn = document.getElementById('predictBtn');
  console.log("Button connected");

  const thresholdSlider = document.getElementById('thresholdSlider');
  const thresholdValue = document.getElementById('thresholdValue');
  
  thresholdSlider.addEventListener('change', () => {  
    threshold = parseInt(thresholdSlider.value);  
    thresholdValue.innerText = threshold;
  });

  //legt das onklick event fest: infotext, öffnen und einrichten der kamera, laden der modelle
  startBtn.addEventListener('click', async () => {
    // Wenn Kamera läuft → stoppen
    if (currentStream) {
      stopWebcam();
      document.getElementById('result').innerText = "Kamera gestoppt.";
      startBtn.innerText = "Start"; // optional Button-Text ändern
      return;
    }
  
    // Kamera läuft NICHT → starten
    document.getElementById('result').innerText = "Starte Kamera...";
    startBtn.innerText = "Stop"; // optional Button-Text ändern
    await setupWebcam();
    await loadModel();
    predictBtn.addEventListener('click', predict);
    console.log("Alles prepared");
  });
  
  //wenn service erfolgreich installiert wurde, dann registriere den worker im browser
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log('Service Worker registriert'))
      .catch(err => console.error('Service Worker Fehler:', err));
  }
});