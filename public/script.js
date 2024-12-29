const statusElement = document.getElementById('status');
const costElement = document.getElementById('cost');
const resultElement = document.getElementById('result');

// Function to update the status message
function updateStatus(message) {
    console.log("Updating status: ", message);  // Log status update
    statusElement.textContent = message;
}

// Function to update the result with generated images
function updateResult(images) {
    console.log("Updating result with images: ", images);  // Log images received
    resultElement.innerHTML = '';  // Clear previous results

    images.forEach((image) => {
        const img = new Image();
        img.onload = () => {
            console.log("Image loaded successfully: ", image.imageURL);  // Log successful load
            resultElement.appendChild(img);
        };
        img.onerror = () => {
            console.error('Failed to load image:', image.imageURL);
        };
        img.src = image.imageURL;
    });
}

// Prevent form submission when 'Enter' is pressed inside the textareas
const positivePrompt = document.getElementById('positivePrompt');
const negativePrompt = document.getElementById('negativePrompt');

function preventSubmitOnEnter(event) {
    if (event.key === 'Enter') {
        event.stopPropagation();  // Prevent form submission
    }
}

// Attach the event listeners to the textareas
positivePrompt.addEventListener('keypress', preventSubmitOnEnter);
negativePrompt.addEventListener('keypress', preventSubmitOnEnter);

// Restore model-specific default settings when a model is selected
document.getElementById('model').addEventListener('change', function () {
    const selectedModel = this.value;

    if (selectedModel === 'runware:100@1') {
        document.getElementById('width').value = '896';
        document.getElementById('height').value = '512';
        document.getElementById('steps').value = '4';
        document.getElementById('CFGScale').value = '30';
        document.getElementById('scheduler').value = 'default';
    } else if (selectedModel === 'civitai:277058@646523') {
        document.getElementById('width').value = '896';
        document.getElementById('height').value = '896';
        document.getElementById('steps').value = '28';
        document.getElementById('CFGScale').value = '5';
        document.getElementById('scheduler').value = 'DPM++ 2M Karras';
    } else if (selectedModel === 'civitai:47274@102222') {
        document.getElementById('width').value = '512';
        document.getElementById('height').value = '512';
        document.getElementById('steps').value = '20';
        document.getElementById('CFGScale').value = '7.5';
        document.getElementById('scheduler').value = 'Default';
    } else if (selectedModel === 'civitai:257749@290640') {
        document.getElementById('width').value = '512';
        document.getElementById('height').value = '512';
        document.getElementById('steps').value = '20';
        document.getElementById('CFGScale').value = '7.5';
        document.getElementById('scheduler').value = 'Default';
    }
});

// Toggle Advanced Settings visibility
const advancedSettings = document.getElementById('advancedSettings');
const toggleAdvancedSettings = document.getElementById('toggleAdvancedSettings');

toggleAdvancedSettings.addEventListener('click', function () {
    if (advancedSettings.classList.contains('hidden')) {
        advancedSettings.classList.remove('hidden');
        toggleAdvancedSettings.textContent = 'Hide Advanced Settings';
    } else {
        advancedSettings.classList.add('hidden');
        toggleAdvancedSettings.textContent = 'Show Advanced Settings';
    }
});

// Handle form submission
document.getElementById('imageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    updateStatus('Processing...');

    let positivePrompt = document.getElementById('positivePrompt').value;
    const useEnhancer = document.getElementById('enhanceToggle').checked;

    if (useEnhancer) {
        try {
            updateStatus('Enhancing prompt...');
            const enhanceResponse = await fetch('/enhance-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: positivePrompt })
            });

            if (!enhanceResponse.ok) {
                throw new Error(`HTTP error! status: ${enhanceResponse.status}`);
            }

            const enhancedData = await enhanceResponse.json();
            positivePrompt = enhancedData.text || positivePrompt;
            updateStatus('Prompt enhanced, generating image...');
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            updateStatus('Error enhancing prompt, proceeding with original prompt.');
        }
    }

    const loraInput = document.getElementById('lora').value.trim();
    const loraArray = loraInput ? [{ model: loraInput, weight: 1.0 }] : [];

    const formData = {
        positivePrompt,
        negativePrompt: document.getElementById('negativePrompt').value,
        width: parseInt(document.getElementById('width').value),
        height: parseInt(document.getElementById('height').value),
        model: document.getElementById('model').value,
        numberResults: parseInt(document.getElementById('numberResults').value),
        outputFormat: document.getElementById('outputFormat').value,
        scheduler: document.getElementById('scheduler').value,
        steps: parseInt(document.getElementById('steps').value),
        CFGScale: parseFloat(document.getElementById('CFGScale').value),
        seed: parseInt(document.getElementById('seed').value),
        lora: loraArray // Include LoRA as an array of objects
    };

    try {
        const response = await fetch('/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const images = await response.json();

        if (!images || images.length === 0) {
            throw new Error('No images received from the server');
        }

        updateStatus(`Successfully generated ${images.length} image(s)!`);
        updateResult(images);
    } catch (error) {
        console.error('Error:', error);
        updateStatus(`An error occurred: ${error.message}`);
    }
});