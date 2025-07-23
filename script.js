let model_kennartClassifier;
let model_speciesClassifier;
const speciesImages = {  
  'Labkraut': 'images/Labkraut.jpg',  
  'Ehrenpreis': 'images/Ehrenpreis.jpg',  
  'Augentrost': 'images/Alpen Augentrost.jpg',  
  'Segge': 'images/Segge.jpg',  
  'Hahnenfuß': 'images/Hahnenfuß.jpg',
  'Hainsimme': 'images/Feld Hainsimme.jpg',  
  'Butterblume': 'images/Butterblume.jpg',  
  'Strandflieder': 'images/Strandflieder.jpg',
  'Rotklee': 'images/Rotklee.jpg',  
  'Schafgabe': 'images/Schafgabe.jpg',  
  'Hornklee': 'images/Hornklee.jpg',  
  'Wiesenmargerite': 'images/Wiesenmargerite.jpg',  
  'Skabiosenflockenblume': 'images/Skabiosenflockenblume.jpg',  
  'Platterbse': 'images/Wiesenplatterbse.jpg',  
  'Wilde Möhre': 'images/Wilde Möhre.jpg',
  'Mädesüß': 'images/Mädesüß.jpg', 
  'Flockenblume': 'images/Flockenblume.jpg', 
  'Birnelle': 'images/Birnelle.jpg',
  'Ranuculus Orthorhynchus': 'images/Ranuculus Orthorhynchus.jpg',  
  'Haarstrang': 'images/Haarstrang.jpg',  
  'Wiesen Witwenblume': 'images/Wiesen Witwenblume.jpg',  
  'Johanniskraut': 'images/Johanniskraut.jpg',  
};

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
    webcamElement.srcObject = stream;

    //holt sich die metadaten z.b. windowgrösse zum auflösen der kamera in der app
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
  //holt sich den index des höchsten bestimmten werts
  const classIndex = classification.indexOf(Math.max(...classification));
  const classLabel = classificationLabels[classIndex];
  //bestimmt die wahrscheinlichkeit mit welcher die kennart erkannt wurde
  const classConfidence = (classification[classIndex] * 100).toFixed(2);

    //if (classLabel === 'Kennart' && classConfidence > 50) {
    //wenn sicher ist, daß es eine kennart ist mit über 50 % wahrscheinlichkeit dann bestimme die genaue kennart
    const speciesPrediction = await model_speciesClassifier.predict(inputTensor).data();
    //liste der zu bestimmenden kennarten
    const speciesLabels = ['Labkraut', 'Ehrenpreis', 'Augentrost', 'Segge', 'Hahnfuß', 'Hainsimme', 'Butterblume', 'Strandflieder', 'Rotklee', 'Schafgarbe', 'Hornklee', 'Wiesenmargerite', 'Skabiosenflockenblume', 'Platterbse', 'Wilde Möhre', 'Mädesüß', 'Flockenblume', 'Birnelle', 'Ranuculus Orthorhynchus', 'Haarstrang', 'Wiesen Witwenblume', 'Johanniskraut'];
     //holt sich den index des höchsten bestimmten werts
    const speciesIndex = speciesPrediction.indexOf(Math.max(...speciesPrediction));
    //holt sich das label was mit höchster wahrscheinlichkeit bestimmt wurde
    const speciesLabel = speciesLabels[speciesIndex];
    //zeigt das Bild einer erkannten Planze an
    const plantImage = document.getElementById('resultImage');if (speciesImages[speciesLabel]) {  resultImage.src = speciesImages[speciesLabel];  resultImage.style.display = 'block';} else {  resultImage.style.display = 'none';}
    //berechnet die wahrscheinlichkeit in % mit der die aussage gesichert ist
    const speciesConfidence = (speciesPrediction[speciesIndex] * 100).toFixed(2);
    //gibt in einem paragraph objekt die kennart und die bestimmungsgenauigkeit in % an
    document.getElementById('result').innerText =
      `Kennart erkannt: ${speciesLabel} (${speciesConfidence}%) Kennart/Nicht Kennart : (${classConfidence}) (${classLabel})`;
  if (classLabel=="NICHT-KENNARTEN") {
  document.getElementById('result').innerText =
      `Kennart erkannt: ${speciesLabel} (${speciesConfidence}%) Kennart/Nicht Kennart : (${classConfidence}) (${classLabel})`;
  }
}

//wenn die webseite innerhalb der app geladen wird, wird folgender code ausgeführt
document.addEventListener('DOMContentLoaded', () => {
  //holt sich vom dokument die html elemente startbutton und predict button
  const startBtn = document.getElementById('startBtn');
  const predictBtn = document.getElementById('predictBtn');
  predictBtn.disabled = true;

  //legt das onklick event fest: infotext, öffnen und einrichten der kamera, laden der modelle
  startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    document.getElementById('result').innerText = "Starte Kamera...";

    await setupWebcam();
    await loadModel();
    //legt das onklick event für den predict button fest
    predictBtn.onclick = predict;
  });
  
  //wenn service erfolgreich installiert wurde, dann registriere den worker im browser
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log('Service Worker registriert'))
      .catch(err => console.error('Service Worker Fehler:', err));
  }
});
