const photoMakerForm = document.getElementById('photoMakerForm');
const resultElement = document.getElementById('result');
const loadingElement = document.getElementById('loading');

photoMakerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loading indicator
    loadingElement.style.display = 'block';

    // Disable the submit button to prevent multiple submissions
    const submitButton = document.querySelector('#photoMakerForm button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Generating...';

    const inputImages = document.getElementById('inputImages').files;
    const positivePrompt = document.getElementById('positivePrompt').value;
    const style = document.getElementById('style').value;
    const strength = 0.8; // Set strength to a valid default value
    const outputFormat = 'JPG'; // Default format
    const model = document.getElementById('model').value;
    let width = parseInt(document.getElementById('width').value);
    let height = parseInt(document.getElementById('height').value);
    const scheduler = "default"; // Default scheduler
    const steps = 20; // Default steps
    const CFGScale = 7.0; // Default CFGScale
    const includeCost = false; // Default includeCost
    const numberResults = 1; // Default to 1 result

    // Adjust width and height based on selected model
    if (model === 'civitai:139562@344487') {
        width = 1024;
        height = 1024;
    }

    if (inputImages.length > 4) {
        alert("You can upload a maximum of 4 images.");
        return;
    }

    // Prepare input images as an array of base64 strings
    const inputImagesArray = [];
    const promises = Array.from(inputImages).map((image) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = function () {
                inputImagesArray.push(reader.result);
                resolve();
            };
            reader.readAsDataURL(image);
        });
    });

    Promise.all(promises).then(() => {
        const requestBody = [
            {
                taskType: "photoMaker",
                taskUUID: generateUUID(),
                inputImages: inputImagesArray,
                style: style,
                model: model,
                strength: strength,
                positivePrompt: positivePrompt,
                height: height,
                width: width,
                scheduler: scheduler,
                steps: steps,
                CFGScale: CFGScale,
                outputFormat: outputFormat,
                includeCost: includeCost,
                numberResults: numberResults
            }
        ];

        fetch('/photomaker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(images => {
            console.log('Response from server:', images);
            displayResults(images);
        })
        .catch(error => {
            console.error('Error generating image:', error);
            resultElement.textContent = `Error generating image: ${error.message}`;
        })
        .finally(() => {
            // Hide loading indicator
            loadingElement.style.display = 'none';
            // Re-enable the submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Generate Image';
        });
    });
});

function displayResults(images) {
    resultElement.innerHTML = '';
    if (images && images.length > 0) {
        images.forEach(image => {
            if (image.imageURL) {
                const imgElement = document.createElement('img');
                imgElement.src = image.imageURL;
                imgElement.alt = 'Generated Image';
                imgElement.classList.add('generated-image');
                resultElement.appendChild(imgElement);
            } else {
                console.error('No imageURL found in the response:', image);
                resultElement.textContent = 'No images generated.';
            }
        });
    } else {
        console.error('No images found in the response:', images);
        resultElement.textContent = 'No images generated.';
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
