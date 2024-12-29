const statusElement = document.getElementById('status');
const costElement = document.getElementById('cost');
const resultElement = document.getElementById('result');

// Array of random prompts
const prompts = [
    "A mysterious woman standing alone in a dimly lit alleyway, shadows enveloping her silhouette",
    "An enchanting sorceress casting spells under a moonlit sky, surrounded by swirling mist",
    "A seductive vampire with piercing eyes, draped in an elegant dark gown",
    "A warrior princess wielding a glowing sword, her armor gleaming amidst a battlefield",
    "An ethereal goddess emerging from the ocean waves, illuminated by the setting sun",
    "A hauntingly beautiful ghost wandering through an abandoned mansion",
    "A fierce female dragon rider soaring above fiery volcanoes",
    "A cyberpunk femme fatale with neon tattoos, overlooking a futuristic cityscape",
    "A glamorous diva on a vintage stage, singing under the spotlight",
    "A mystical forest nymph surrounded by enchanted creatures and glowing flora",
    "A powerful witch concocting potions in an ancient, cluttered apothecary",
    "A sensual siren lounging on rocks by the sea, singing to the moon",
    "A steampunk adventuress in goggles and leather attire, navigating through mechanical gears",
    "A regal queen seated on a throne adorned with jewels, exuding authority and grace",
    "A rebellious pirate captain with flowing hair, standing at the helm of her ship amidst a storm",
    "A ballet dancer poised on a grand stage, illuminated by soft golden light",
    "A mysterious fortune teller in a dimly lit tent, gazing into a glowing crystal ball",
    "A superheroine soaring through the skies above a bustling metropolis",
    "A woman wearing a masquerade mask at an extravagant ball, surrounded by opulence",
    "A gothic princess in a dark, ornate gown, standing in a misty cemetery",
    "A fearless explorer charting unknown territories in a dense jungle",
    "A futuristic android woman with glowing circuitry, gazing into the distance",
    "A mermaid with shimmering scales swimming gracefully in crystal-clear waters",
    "A lone figure walking through a haunted forest, shadows taking eerie shapes",
    "A woman enveloped in flames, representing rebirth and resilience",
    "A celestial being amidst the stars, surrounded by cosmic phenomena",
    "An ancient priestess performing rituals in a sacred temple",
    "A mysterious femme fatale in a trench coat, under the glow of a flickering street lamp",
    "A roller-skating girl in a vibrant, retro-themed arcade",
    "A powerful enchantress summoning elemental forces amidst a thunderstorm",
    "A vintage pin-up model posing with classic cars under bright studio lights",
    "A seductive dancer performing in an elegant jazz club filled with smoke and dim lights",
    "A silhouette of a woman standing at the edge of a cliff overlooking a stormy sea",
    "A glamorous actress walking the red carpet amid flashing cameras",
    "A mystical oracle surrounded by floating runes and arcane symbols",
    "A dark fairy with intricate wings, dwelling in an enchanted forest",
    "A fearless huntress drawing her bow in a moonlit clearing",
    "A sultry singer leaning on a grand piano in an upscale lounge",
    "A woman adorned in tribal attire, dancing around a roaring bonfire",
    // Add more prompts as desired
];

// Function to select a random prompt from the array
function getRandomPrompt() {
    return prompts[Math.floor(Math.random() * prompts.length)];
}

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
    const loraInput = document.getElementById('lora');

    // Clear the LoRA input by default
    if (loraInput) {
        loraInput.value = ''; // Turn off LoRA for non-compatible models
    }

    if (selectedModel === 'runware:101@1') { // FLUX.1DEV model
        document.getElementById('width').value = '1024';
        document.getElementById('height').value = '1024';
        document.getElementById('steps').value = '28';
        document.getElementById('CFGScale').value = '3.5';
        document.getElementById('scheduler').value = 'FlowMatchEulerDiscreteScheduler';

        // Set default LoRA model
        if (loraInput) {
            loraInput.value = 'civitai:631986@706528'; // XLABS FLUX REALISM LORA
        }
    } else if (selectedModel === 'runware:100@1') {
        document.getElementById('width').value = '896';
        document.getElementById('height').value = '512';
        document.getElementById('steps').value = '4';
        document.getElementById('CFGScale').value = '30';
        document.getElementById('scheduler').value = 'default';
        // LoRA remains empty for this model
    } else if (selectedModel === 'civitai:277058@646523') {
        document.getElementById('width').value = '896';
        document.getElementById('height').value = '896';
        document.getElementById('steps').value = '28';
        document.getElementById('CFGScale').value = '5';
        document.getElementById('scheduler').value = 'DPM++ 2M Karras';
        // LoRA remains empty for this model
    } else if (selectedModel === 'civitai:47274@102222') {
        document.getElementById('width').value = '512';
        document.getElementById('height').value = '512';
        document.getElementById('steps').value = '20';
        document.getElementById('CFGScale').value = '7.5';
        document.getElementById('scheduler').value = 'Default';
        // LoRA remains empty for this model
    } else if (selectedModel === 'civitai:257749@290640') {
        document.getElementById('width').value = '896';
        document.getElementById('height').value = '896';
        document.getElementById('steps').value = '35';
        document.getElementById('CFGScale').value = '8.5';
        document.getElementById('scheduler').value = 'Euler a';
        // LoRA remains empty for this model
    } else if (selectedModel === 'civitai:25694@143906') { // EpicRealism model
        document.getElementById('width').value = '512';
        document.getElementById('height').value = '512';
        document.getElementById('steps').value = '20';
        document.getElementById('CFGScale').value = '7.5';
        document.getElementById('scheduler').value = 'Default';
        // LoRA remains empty for this model
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

            if (enhancedData && enhancedData.data && enhancedData.data.length > 0) {
                positivePrompt = enhancedData.data[0].text || positivePrompt;
                updateStatus('Prompt enhanced, generating image...');
            } else {
                updateStatus('No enhancement received, proceeding with original prompt.');
            }
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            updateStatus('Error enhancing prompt, proceeding with original prompt.');
        }
    }

    const loraInput = document.getElementById('lora').value.trim();
    const loraArray = loraInput ? [{ model: loraInput, weight: 0.8 }] : [];

    const formData = {
        positivePrompt,
        negativePrompt: document.getElementById('negativePrompt').value,
        width: parseInt(document.getElementById('width').value),
        height: parseInt(document.getElementById('height').value),
        model: document.getElementById('model').value,
        numberResults: parseInt(document.getElementById('numberResults').value) || 1,
        outputFormat: document.getElementById('outputFormat').value,
        scheduler: document.getElementById('scheduler').value,
        steps: parseInt(document.getElementById('steps').value),
        CFGScale: parseFloat(document.getElementById('CFGScale').value),
        seed: document.getElementById('seed').value ? parseInt(document.getElementById('seed').value) : undefined,
        lora: loraArray, // Include LoRA as an array of objects
        strength: 0.8, // Set default strength
        promptWeighting: 'none', // Set default promptWeighting
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

// Trigger change event on page load to set defaults
window.addEventListener('DOMContentLoaded', (event) => {
    // Set a random prompt in the positivePrompt textarea
    const positivePrompt = document.getElementById('positivePrompt');
    positivePrompt.value = getRandomPrompt();

    // Existing code to set model defaults
    const modelSelect = document.getElementById('model');
    modelSelect.dispatchEvent(new Event('change'));
});