var currentImageIndex = -1;
var imageUrls = [];
var imageNames = [];
var scores = [];

function loadImages() {
  var files = document.getElementById('imageFiles').files;
  if (files.length === 0) {
    alert('Please select images to evaluate.');
    return;
  }
  imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
  imageNames = Array.from(files).map(file => file.name);
  scores = new Array(imageUrls.length).fill(null);
  updatePreviews(imageUrls);
  document.getElementById('criteriaSection').style.display = 'none'; // Hide criteria initially
}

function updatePreviews(imageUrls) {
  var previewContainer = document.getElementById('previewContainer');
  previewContainer.innerHTML = '';
  imageUrls.forEach((url, index) => {
    var imgContainer = document.createElement('div');
    imgContainer.style.position = 'relative';

    var img = document.createElement('img');
    img.src = url;
    img.onclick = function() { selectImage(url, index); };
    imgContainer.appendChild(img);

    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = '!';
    imgContainer.appendChild(overlay);

    previewContainer.appendChild(imgContainer);
  });
}

function selectImage(url, index) {
  if (currentImageIndex !== -1 && !allCriteriaRated()) {
    resetCriteria();
  }
  currentImageIndex = index;
  document.getElementById('image').src = url;
  showRatingSection(); // Show the rating section
}

function allCriteriaRated() {
  var criteriaNames = ['inpainting', 'consistency', 'congruence', 'fontMatching'];
  return criteriaNames.every(name => {
    var radios = document.getElementsByName(name);
    return Array.from(radios).some(radio => radio.checked);
  });
}

function saveScores() {
    if (!allCriteriaRated()) {
        alert('Please rate all criteria before moving to the next image.');
        return;
    }

    var currentDate = new Date();
    var formattedDate = formatDate(currentDate);

    var averageRating = calculateAverage([
        getRadioValue('inpainting'),
        getRadioValue('consistency'),
        getRadioValue('congruence'),
        getRadioValue('fontMatching')
    ]);

    scores[currentImageIndex] = {
        image: imageNames[currentImageIndex],
        inpainting: getRadioValue('inpainting'),
        consistency: getRadioValue('consistency'),
        congruence: getRadioValue('congruence'),
        fontMatching: getRadioValue('fontMatching'),
        average: averageRating,
        ratedDate: formattedDate
    };

  updateOverlay(currentImageIndex, true); // true for rated

  if (scores.every(score => score !== null)) {
    exportScores();
  } else {
    moveToNextUnratedImage();
  }
}

function formatDate(date) {
var day = String(date.getDate()).padStart(2, '0');
var month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
var year = date.getFullYear().toString().substr(-2); // Last two digits of the year
return day + '-' + month + '-' + year; // Format: DD-MM-YY
}

function moveToNextUnratedImage() {
var nextUnratedIndex = findNextUnratedImage();
if (nextUnratedIndex !== -1) {
    selectImage(imageUrls[nextUnratedIndex], nextUnratedIndex);
    resetCriteria(); // Reset the criteria (radio buttons) when moving to the next image
}
}

function calculateAverage(ratings) {
    var sum = ratings.reduce(function(a, b) {
        return a + parseFloat(b);
    }, 0);
    return (sum / ratings.length).toFixed(2); // Average with two decimal places
}

function findNextUnratedImage() {
  return scores.findIndex(score => score === null);
}

function getRadioValue(name) {
  var radios = document.getElementsByName(name);
  var selectedRadio = Array.from(radios).find(radio => radio.checked);
  return selectedRadio ? selectedRadio.value : null;
}

function resetCriteria() {
  var criteriaNames = ['inpainting', 'consistency', 'congruence', 'fontMatching'];
  criteriaNames.forEach(name => {
    document.getElementsByName(name).forEach(radio => radio.checked = false);
  });
}

function nextImage() {
  saveScores();
}

function updateOverlay(index, isRated) {
  var overlay = document.querySelectorAll('.preview-container .overlay')[index];
  overlay.innerHTML = isRated ? '✓' : '!';
  overlay.style.backgroundColor = isRated ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
}

function exportScores() {
let tableData = '';
let finalScore = 0;
let currentDate = new Date();
let formattedDate = formatDate(currentDate);

scores.forEach(function(row) {
    tableData += `<tr>
                    <td>${row.image}</td>
                    <td>${row.inpainting}</td>
                    <td>${row.consistency}</td>
                    <td>${row.congruence}</td>
                    <td>${row.fontMatching}</td>
                    <td>${row.average}</td>
                  </tr>`;
    finalScore += parseFloat(row.average);
});

var successMessage = '<div style="text-align: center; margin-top: 50px; font-size: 24px;">Great Success</div>';
successMessage += '<div style="text-align: center; margin-top: 20px;">Final Score: ' + finalScore.toFixed(2) + ' (Date: ' + formattedDate + ')</div>';
successMessage += '<table border="1" style="margin: 0 auto; margin-top: 20px;"><tr><th>Image</th><th>Inpainting</th><th>Consistency</th><th>congruence</th><th>Font Matching</th><th>Average</th></tr>' + tableData + '</table>';
document.body.innerHTML = successMessage;

// Prepare CSV Data without Date Rated
var csv = 'Image,Inpainting,Consistency,Congruence,Font Matching,Average\n';
scores.forEach(function(row) {
    csv += row.image + ',' + row.inpainting + ',' + row.consistency + ',' + row.congruence + ',' + row.fontMatching + ',' + row.average + '\n';
});
var blob = new Blob([csv], { type: 'text/csv' });
var csvFileName = 'scores_' + formattedDate.replace(/\//g, '-') + '.csv'; // Replace slashes with dashes
var url = window.URL.createObjectURL(blob);
successMessage += '<div style="text-align: center; margin-top: 20px;"><a href="' + url + '" download="' + csvFileName + '">Download CSV</a></div>';
document.body.innerHTML = successMessage;
}

function showRatingSection() {
  document.getElementById('criteriaSection').style.display = 'block';
}

function updateGradient() {
  var color1 = document.getElementById('color1').value;
  var color2 = document.getElementById('color2').value;
  var gradient = document.getElementById('gradient');
  gradient.style.background = 'linear-gradient(to right, ' + color1 + ', ' + color2 + ')';
  document.documentElement.style.setProperty('--color1', color1);
  document.documentElement.style.setProperty('--color2', color2);
}

window.onload = updateGradient;
