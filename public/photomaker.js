const photoMakerForm = document.getElementById('photoMakerForm');
const resultElement = document.getElementById('result');

photoMakerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputImages = document.getElementById('inputImages').files;
    const positivePrompt = document.getElementById('positivePrompt').value;
    const style = document.getElementById('style').value;
    const strength = 15; // Default strength
    const outputFormat = 'JPG'; // Default format
    const width = parseInt(document.getElementById('width').value); // Default width
    const height = parseInt(document.getElementById('height').value); // Default height
    const taskUUID = generateUUID(); // Function to generate a UUID
    const scheduler = "default"; // Default scheduler
    const steps = 20; // Default steps
    const CFGScale = 7.0; // Default CFGScale
    const includeCost = false; // Default includeCost
    const numberResults = 1; // Default to 1 result

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
                inputImagesArray.push(reader.result); // Push base64 string to array
                resolve();
            };
            reader.readAsDataURL(image); // Read image as base64
        });
    });

    Promise.all(promises).then(() => {
        const requestBody = [
            {
                taskType: "photoMaker",
                taskUUID: taskUUID,
                inputImages: inputImagesArray,
                style: style,
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
        .then(images => displayResults(images))
        .catch(error => {
            console.error('Error generating image:', error);
            resultElement.textContent = 'Error generating image.';
        });
    });
});

function displayResults(images) {
    resultElement.innerHTML = ''; // Clear previous results
    if (images && images[0].data) {
        images[0].data.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image.imageURL;
            imgElement.alt = 'Generated Image';
            imgElement.classList.add('generated-image');
            resultElement.appendChild(imgElement);
        });
    } else {
        resultElement.textContent = 'No images generated.';
    }
}
