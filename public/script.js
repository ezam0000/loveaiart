const statusElement = document.getElementById('status');
const costElement = document.getElementById('cost');
const resultElement = document.getElementById('result');

// Array of random prompts
const prompts = [
    "In a close-up shot inside a messy artist's studio, a slightly unhinged-looking guy in his late 30s, with wild hair and paint splattered all over his face and shirt, holds up a piece of paper proudly. He's grinning like he's just solved a life mystery, showing off his 'masterpiece' with pure, chaotic joy. The paper reads: 'Since SD 3.5 Large cannot draw me, I drew myself using Flux!' The self-portrait is a stick figure that looks like a child's scribble, but the man's expression says he genuinely believes it's a masterpiece. Behind him, paint tubes and half-finished canvases are scattered everywhere, adding to the creative madness of the scene",
    
    "In a wide shot of a night club, a man dressed as the grumpy character resembling SpongeBob is holding a balloon. Above him, a banner reads: \"THIS IS FINE. EVERYTHING IS FINE.\" People are drinking happily while he stands there, clearly not having it",
    
    "In a full-body shot at a comic book convention, a lanky guy dressed as a very homemade version of Spider-Man (think duct tape and sweatpants) stands proudly in front of a booth. He's holding a sign that reads: 'I May Not Be the Real Spiderman, but I Have Pizza Rolls!' His expression is one of pure determination, as if he's convinced this will somehow save the city. Other cosplayers in the background, dressed much more professionally, give him a mix of pity and admiration. The scene is filled with comic book posters, action figures, and a crowd of excited fans, but DIY Spider-Man is the real star of this hilarious moment",
    
    "A medium shot of an unusual garden sculpture of a 'Grass Man,' a human-like figure entirely made from thick green grass, moss, and vines, positioned in a quirky, lush setting. The Grass Man has an expression of intense concentration, his arms raised as he holds a stone toilet. From his grass-covered backside, water flows down like a waterfall, filling a small pool below. The scene is unexpectedly serene, despite the comical premise, as the water cascades down from his body into the pool, creating the image of a natural water source feeding the landscape. Palm leaves and bushes surround the sculpture, and the vibrant green plants covering his body give the impression that this figure has sprouted directly from the earth itself. Graffiti on a nearby tree reads \"Nature Calls\" in bright, playful letters, adding an extra layer of humor to the already absurd scene. The waterfall's gentle flow adds to the overall peaceful vibe, but the Grass Man's bathroom situation is the real highlight, mixing tranquility with pure absurdity in a landscape that seems to embrace the ridiculous",
    
    "A medium shot of two young women standing outdoors at a protest, holding signs advocating for climate action. Both women, likely of Caucasian descent, are dressed warmly for cold weather, wearing winter hats and gloves. The woman on the left is holding a cardboard sign that reads 'FTNA' in bold black and red letters, with smaller text beneath mentioning 'BIG BOOBS'. She is smiling slightly as she looks at the camera. The woman on the right holds a white sign with blue and green letters that reads 'FREE THE NIPPLE AGAIN' and includes a red circle with a slash through 'BRA,' referring to opposition to the Keystone XL pipeline. She is also smiling, standing close to her friend, and wearing red gloves, a blue headband, and a jacket. Behind them, other protestors are visible, some carrying signs, banners, or flags. A large flag with an image of the Earth is prominently seen to the right. The background includes a fence and some buildings, suggesting that the protest is taking place near a governmental or important public building. The atmosphere appears peaceful but determined, with people gathered in support of climate justice and renewable energy solutions",
    
    // Additional 15 prompts based on realistic output examples:
    "In a bustling street market at dusk, a vendor stands behind a stall piled with colorful fruits and vegetables. His weathered face shows years of experience as he carefully arranges his produce, while passersby in casual attire stroll by, engaging in friendly chatter. The warm glow of street lamps and the vibrant display of goods create a lively and authentic urban scene",
    
    "Inside a quaint, cluttered home workshop, a middle-aged craftsman meticulously repairs an old clock. Tools are scattered across a wooden table, and shafts of soft afternoon light illuminate the intricate gears and delicate hands of the timepiece. His calm, focused expression tells a story of dedication and passion for his craft",
    
    "At a busy downtown café, a young woman with a confident smile sits by the window, typing rapidly on her laptop. The aroma of fresh coffee fills the air as other patrons engage in quiet conversation. The urban backdrop, with its mix of modern glass buildings and vintage storefronts, lends an energetic yet relaxed vibe to the scene",
    
    "In a serene public park during early autumn, an elderly man in a cozy sweater sits on a worn bench feeding pigeons. Fallen leaves in hues of amber and red create a natural carpet on the ground, while a gentle breeze causes them to swirl around. His face, lined with age and wisdom, reflects quiet contentment amid nature's subtle beauty",
    
    "At a vibrant outdoor music festival, a group of friends is captured mid-celebration. The scene is filled with dynamic lighting, a diverse crowd, and a stage where an energetic band plays. Laughter, movement, and the pulse of music create an immersive atmosphere that invites the viewer to join the festivity",
    
    "Inside a modern art gallery, a visitor with a contemplative gaze stands before a large abstract painting. The minimalist design of the space and the bold, contrasting colors of the artwork evoke a sense of introspection and appreciation for creative expression. The soft echo of footsteps and whispered musings add to the ambiance of refined culture",
    
    "In a suburban backyard at sunset, a family gathers for an impromptu barbecue. The warm hues of the fading light enhance the smile on each face as they enjoy simple pleasures. The scene is casual and heartfelt, with children playing on the grass and adults engaged in lively conversation",
    
    "On a rainy city day, a young man in a stylish trench coat waits at a bus stop. His eyes reflect the glistening reflections of neon signs and wet pavement, as droplets fall softly around him. The urban scene exudes a sense of quiet introspection amid the damp chill of a storm",
    
    "In a cozy library filled with tall bookshelves, a student is deeply absorbed in reading an ancient manuscript. Soft lamplight illuminates the pages, casting gentle shadows against the rows of worn books. The quiet rustling of pages and the smell of old paper create an inviting atmosphere of academic pursuit",
    
    "Amid the rustic charm of a countryside farmhouse, a chef is busy preparing a meal in a sunlit kitchen. Fresh produce from a nearby garden sits on the counter while the aroma of baked bread and simmering stew fills the air. The scene exudes warmth, tradition, and the joy of home cooking",
    
    "At a lively sports event, an enthusiastic fan clad in team colors cheers from the stands. The excitement is palpable as the crowd roars and banners wave. The moment captures pure passion and communal energy, emblematic of the deep connection between sports and its supporters",
    
    "Within a sleek, modern office environment, a duo of startup founders is engaged in a spirited discussion over innovative ideas. Their animated expressions and dynamic gestures highlight the creative energy and ambition that drive entrepreneurial success in today's competitive business world",
    
    "During a peaceful morning in a local farmer's market, an elderly woman exchanges a warm smile with a young vendor. The gentle banter and the abundant display of fresh, seasonal produce create a scene that is both timeless and full of community spirit",
    
    "At an intimate live jazz club, a saxophonist passionately performs on stage under soft spotlighting. The intimate ambiance, filled with the soulful notes of the instrument and the attentive faces of the audience, evokes the rich history of jazz and the deep emotional connection it fosters",
    
    "On a busy urban sidewalk, a street performer captivates an audience with his skillful magic tricks. Crowds gather around, their faces lighting up in astonishment as he performs sleight-of-hand illusions against the backdrop of the city's architectural beauty"
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

        // Removed default LoRA assignment for FLUX.1DEV so that default remains "No LoRa"
        // if (loraInput) {
        //     loraInput.value = 'civitai:631986@706528'; // XLABS FLUX REALISM LORA
        // }
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
                // Persist the enhanced prompt in the textarea
                document.getElementById('positivePrompt').value = positivePrompt;
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

// Add this code to set a random prompt when the DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set a random prompt in the positivePrompt textarea
    const positivePrompt = document.getElementById('positivePrompt');
    if (positivePrompt) {
        const randomPrompt = getRandomPrompt();
        positivePrompt.value = randomPrompt;
        console.log('Random prompt set:', randomPrompt);
    } else {
        console.error('Element with id "positivePrompt" not found.');
    }

    // Set model defaults if available
    const modelSelect = document.getElementById('model');
    if (modelSelect) {
        modelSelect.dispatchEvent(new Event('change'));
    }

    // Remove interfering class from the "Get New Random Prompt" button and add click event listener
    const newPromptButton = document.getElementById('newPromptButton');
    if (newPromptButton) {
        newPromptButton.classList.remove('random-prompt-btn');
        newPromptButton.addEventListener('click', () => {
            const randomPrompt = getRandomPrompt();
            positivePrompt.value = randomPrompt;
            console.log('New prompt generated:', randomPrompt);
        });
    } else {
        console.error('Element with id "newPromptButton" not found.');
    }
});