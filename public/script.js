const statusElement = document.getElementById('status');
const costElement = document.getElementById('cost');
const resultElement = document.getElementById('result');

// Array of random prompts
const prompts = [
    "A hyper-realistic depiction of a mysterious woman standing alone in a dimly lit alleyway. Shadows envelop her silhouette, with the faint glow of distant neon signs reflecting off wet cobblestones. She wears a vintage trench coat and a wide-brimmed hat that partially obscures her face, adding to her enigmatic presence. Wisps of fog curl around her feet, and the alley is framed by old brick buildings with fire escapes. The atmosphere is moody and cinematic, evoking a sense of intrigue and suspense.",

    "An enchanting sorceress casting spells under a moonlit sky atop an ancient stone circle. She is surrounded by swirling mist that glows with magical energy. Her flowing robes are adorned with intricate silver embroidery, and a jeweled amulet hangs around her neck. She holds an ornate staff topped with a glowing crystal, from which tendrils of light emanate. Her eyes shine with ethereal light, and her long hair cascades over her shoulders. The night sky is filled with stars, and the full moon bathes the scene in a soft, luminescent glow.",

    "A detailed portrayal of a seductive vampire with piercing eyes, draped in an elegant dark gown made of velvet and lace. She stands on the balcony of a gothic mansion, overlooking a mist-covered forest bathed in moonlight. Her skin is porcelain pale, contrasting with her crimson lips and dark attire. A delicate necklace with a ruby pendant rests at her throat. The architecture features ornate stone carvings and gargoyles, and ivy climbs up the walls. The mood is mysterious and alluring.",

    "A warrior princess wielding a glowing sword, her armor gleaming amidst a battlefield at dawn. She stands atop a hill with a determined expression, her cape flowing in the wind. The armor is intricately crafted, featuring engravings of mythical creatures and symbols. The blade of her sword emits a radiant light, illuminating the surrounding area. Behind her, warriors engage in battle, and banners bearing her kingdom's emblem wave amidst the chaos. The sky is painted with the first light of day, casting a dramatic backdrop.",

    "An ethereal goddess emerging gracefully from the ocean waves, illuminated by the setting sun. She is draped in a dress made of flowing, translucent materials that blend seamlessly with the water. Pearls and seashells adorn her hair, which floats around her like a halo. The warm hues of the sunset reflect off the water, creating a serene and radiant atmosphere. Dolphins leap in the background, and seagulls soar across the sky. The scene captures the harmony between the divine and nature.",

    "A hauntingly beautiful ghost wandering through an abandoned, grand mansion. She wears a vintage Victorian-era dress that seems to fade into mist at the edges. Her expression is melancholic, and her eyes gaze longingly into the distance. The mansion's opulent details—marble columns, crystal chandeliers, and ornate staircases—are in a state of decay, with cobwebs and dust covering surfaces. Moonlight streams through cracked windows, casting eerie shadows. The atmosphere is filled with a sense of nostalgia and mystery.",

    "A fierce female dragon rider soaring above erupting volcanoes. She sits confidently atop a magnificent dragon whose scales are iridescent shades of red and gold. The rider wears armor crafted from dragon scales, with intricate designs and a helmet adorned with horns. Lava and ash spew from the volcanoes below, while plumes of smoke rise into the fiery sky. The heat distorts the air, and embers float around them. The scene is dynamic and intense, highlighting the bond between rider and dragon.",

    "A cyberpunk femme fatale with neon tattoos, standing atop a skyscraper overlooking a futuristic cityscape at night. She wears a sleek, high-tech outfit with luminescent accents, and her short hair is styled sharply. The neon tattoos covering her arms glow in patterns that synchronize with the city's lights. Below, holographic advertisements and flying vehicles fill the bustling streets. She gazes out over the city with a confident smirk, embodying the essence of a high-tech, cybernetic world.",

    "A glamorous diva performing on a grand, vintage stage under a brilliant spotlight. She wears an exquisite evening gown adorned with sequins and feathers, and a classic microphone stands before her. The stage is framed by luxurious red velvet curtains and Art Deco designs. The orchestra is visible in the background, and the audience watches in awe from the dimly lit auditorium. Her expression is passionate, and her pose elegant, capturing the golden age of performance arts.",

    "A mystical forest nymph surrounded by enchanted creatures and glowing flora in a dense, ancient woodland. She is seated on a throne made from intertwined tree roots and vines. Her attire is crafted from leaves, petals, and delicate spider silk. Fireflies and ethereal beings like fairies and sprites gather around her. Bioluminescent plants cast a soft illumination, and the air is filled with floating pollen that sparkles. Sunlight filters through the canopy, creating dappled patterns on the forest floor. The scene exudes magic and serenity.",

    "A powerful witch carefully concocting potions in an ancient, cluttered apothecary filled with shelves of mysterious ingredients and dusty tomes. She wears a flowing dark cloak with silver accents and a wide-brimmed hat adorned with feathers and trinkets. Her eyes focus intently on a bubbling cauldron emitting colorful vapors. The room is dimly lit by candles and lanterns, casting flickering shadows. Herbs hang from the ceiling, and enchanted artifacts are scattered around. The atmosphere is mystical and rich with detail.",

    "A sensual siren lounging gracefully on rugged rocks by the sea, her tail shimmering with iridescent scales. She gazes up at the full moon, singing a haunting melody that ripples across the calm waters. Her long hair cascades over her shoulders like waves, adorned with seashells and pearls. The ocean reflects the moonlight, and gentle waves lap at the rocks. The sky is studded with stars, and the atmosphere is both enchanting and tranquil.",

    "A steampunk adventuress dressed in intricately designed leather attire, complete with brass buckles and gears. She wears goggles with tinted lenses atop her head and a utility belt with various gadgets. She is navigating through a colossal clockwork mechanism, with massive gears and cogs surrounding her. Steam and sparks emanate from the machinery, and shafts of light filter through the metal framework. Her expression is determined as she consults a complex map. The scene blends industrial elements with Victorian aesthetics.",

    "A regal queen seated upon an ornate throne embellished with precious gems and intricate carvings. She wears a magnificent crown and elegant royal robes made of luxurious fabrics embroidered with gold thread. Her posture is upright and poised, exuding authority and grace. The throne room features grand pillars, stained glass windows, and rich tapestries depicting historical events. Courtiers stand respectfully at a distance. The lighting highlights her as the focal point, emphasizing her prominence.",

    "A rebellious pirate captain with windswept hair stands firmly at the helm of her ship amidst a raging storm. She wears a tricorne hat and a long coat with ornate epaulettes. Rain pours down, and lightning illuminates the turbulent sea. The ship's sails billow violently, and crew members scramble on deck. She grips the ship's wheel with determination, her eyes fixed ahead. The atmosphere is intense, conveying adventure and defiance against the elements.",

    "A graceful ballet dancer poised in an elegant arabesque on a grand stage. She wears a delicate tutu embellished with glittering sequins and feathers. Soft golden light bathes the stage, casting a warm glow. The backdrop features a painted scene of a moonlit garden. Her expression is serene, and her movements convey fluidity and control. The audience is captivated in the shadows, and the atmosphere is one of beauty and artistry.",

    "A mysterious fortune teller seated at a small, ornate table within a dimly lit tent draped with rich fabrics and tapestries. She wears exotic clothing adorned with jewelry, including bangles and necklaces that jingle softly. Her eyes are intense as she gazes into a glowing crystal ball that emits a soft, ethereal light. Candles flicker around her, and tarot cards are spread out on the table. The air is filled with wisps of incense smoke, creating an atmosphere of mystique and intrigue.",

    "A dynamic illustration of a superheroine soaring through the skies above a bustling metropolis at sunset. She wears a sleek costume featuring her emblem and a flowing cape. Skyscrapers below reflect the warm hues of the setting sun, and city lights begin to twinkle. Her pose is confident, with one arm extended forward. Clouds trail behind her, and the wind causes her hair and cape to billow dramatically. The scene captures a sense of hope and guardianship.",

    "A woman elegantly attired in a lavish gown stands amidst an extravagant ballroom adorned with chandeliers and gilded decor. She wears an ornate masquerade mask embellished with feathers and jewels. Guests in similarly elaborate attire mingle and dance around her. The marble floors reflect the shimmering lights, and live musicians play classical music. Her posture is poised, and she holds a decorative fan. The atmosphere exudes luxury and mystery.",

    "A gothic princess dressed in a dark, intricately designed gown with lace and corset details stands in a misty cemetery at twilight. She holds a black parasol adorned with lace. Gravestones and ancient statues surround her, partially obscured by swirling mist. Her expression is contemplative, and a faint smile plays on her lips. The setting sun casts a purple and blue hue across the scene. The atmosphere is both haunting and romantic.",

    "A fearless explorer navigating through a dense jungle filled with towering trees and exotic flora. She wears rugged attire suitable for adventure, with a wide-brimmed hat and a compass in hand. Beams of sunlight penetrate the canopy, illuminating her path. In the background, ancient ruins partially covered in vines hint at lost civilizations. Her expression is determined as she studies a map. The scene evokes a sense of discovery and exploration.",

    "A futuristic android woman standing atop a high-tech platform, gazing into a sprawling cityscape of a future world. Her synthetic skin has transparent sections revealing glowing circuitry and mechanical components. Her eyes emit a soft light, and her expression is one of contemplation. She wears sleek attire integrated with advanced technology. The background features towering buildings with holographic advertisements and flying vehicles. The scene blends human elements with advanced robotics.",

    "A mermaid with iridescent scales swimming gracefully through crystal-clear tropical waters. Sunlight filters down, creating dappled patterns on the ocean floor. Colorful coral reefs and schools of exotic fish surround her. Her tail moves fluidly, and her long hair floats weightlessly. She reaches out to interact with sea creatures, embodying harmony with the marine environment. The atmosphere is serene and vibrant with color.",

    "A lone figure cloaked in a dark hooded garment walks cautiously through a haunted forest at night. The trees are gnarled and twisted, with branches forming eerie shapes. Mist clings to the ground, and shadows seem to move with a life of their own. Eyes appear to peer from the darkness, and whispers carry on the wind. The moon provides minimal illumination, adding to the ominous atmosphere. The scene is filled with tension and suspense.",

    "A powerful image of a woman standing amidst swirling flames that do not harm her. She emerges from the fire with an expression of strength and serenity. Her attire is transformed into ethereal garments made of embers and sparks. The flames take on shapes resembling phoenix wings. The background is dark, making the fire's glow more intense. The scene symbolizes rebirth, resilience, and transformation.",

    "A celestial being floating gracefully amidst a backdrop of stars, nebulas, and galaxies. Her form is ethereal, composed of stardust and light. She reaches out to touch swirling cosmic clouds of color. Comets and stellar objects orbit around her. Her expression is serene, and her eyes reflect the depths of the universe. The scene is vast and awe-inspiring, capturing the majesty of the cosmos.",

    "An ancient priestess standing within a sacred temple adorned with hieroglyphics and grand pillars. She wears ceremonial robes and intricate jewelry. Golden light from torches illuminates the space. She performs a ritual, holding a ceremonial staff and reciting incantations. Sacred artifacts and offerings are arranged around her. The atmosphere is reverent and mystical, with an air of ancient wisdom.",

    "A mysterious femme fatale stands under the flickering light of a street lamp on a deserted street. She wears a stylish trench coat and a fedora hat that casts a shadow over her eyes. The pavement glistens from recent rain, reflecting the dim lights. Smoke from a nearby grate drifts past. Her gaze is enigmatic, and she holds a subtle smile. The scene exudes film noir aesthetics and intrigue.",

    "A lively scene of a girl roller-skating through a vibrant, retro-themed arcade filled with neon lights and classic game machines. She wears colorful 80s attire with leg warmers and headphones. The arcade is bustling with activity, and the sounds of games and laughter fill the air. Reflections of light glimmer off the polished floor. The mood is energetic and nostalgic, celebrating youthful fun.",

    "A powerful enchantress stands atop a cliff during a raging thunderstorm, summoning elemental forces. Lightning bolts streak across the sky, and she manipulates them with her raised hands. Her robes billow dramatically, and her eyes glow with energy. The ocean below churns with massive waves. The scene is dynamic and intense, showcasing the raw power of nature and magic intertwined.",

    "A vintage pin-up model poses confidently next to a polished classic car from the 1950s. She wears period-appropriate attire with polka dots and high heels. The studio is lit brightly, and the backdrop features stylized graphics. Her pose is playful and glamorous, evoking the charm of mid-20th-century advertisements. The scene is colorful and crisp, capturing a moment of timeless style.",

    "A seductive dancer performs on a small stage in an elegant jazz club. She wears a shimmering dress with fringe that moves as she dances. The club is filled with a haze of smoke, and patrons sit at small round tables with candlelight. Musicians in the background play smooth jazz. The lighting is low and atmospheric, with spotlights highlighting the dancer's movements. The mood is intimate and sophisticated.",

    "A dramatic image of a woman silhouetted against the backdrop of a stormy sea. She stands at the edge of a rugged cliff, her dress and hair blowing in the fierce wind. Dark clouds gather overhead, and waves crash against the rocks below. The scene is visually striking, conveying emotions of strength and contemplation amidst nature's fury.",

    "A glamorous actress makes a grand entrance on the red carpet, surrounded by a flurry of flashing cameras and admiring fans. She wears an exquisite designer gown that sparkles under the bright lights. Photographers call out her name, and she smiles gracefully. The backdrop features event logos and banners. The atmosphere is electric, capturing the excitement of a star-studded event.",

    "A mystical oracle sits in meditation within a circular chamber. She is surrounded by floating runes and arcane symbols that glow softly. She wears robes adorned with symbolic patterns, and her eyes are closed in deep concentration. The chamber's walls are inscribed with ancient texts. The air shimmers with energy. The scene evokes mystery and the pursuit of hidden knowledge.",

    "A dark fairy with elaborate, translucent wings stands amidst an enchanted forest at twilight. Her attire blends with the natural elements, featuring leaves and dark feathers. She holds a small, glowing orb. The forest is dense with unusual plants and glowing fungi. Fireflies drift around her. The atmosphere is both magical and slightly eerie, highlighting the duality of beauty and darkness.",

    "A fearless huntress stands poised in a moonlit forest clearing, drawing her bow with precision. She wears practical garb with elements of leather and fur. Her gaze is focused, and her muscles are tense, ready to release the arrow. The surrounding trees cast shadows, and the moonlight creates a silver sheen on the landscape. The scene exudes tension and skill.",

    "A sultry singer leans elegantly on a grand piano in an upscale lounge. She wears a glamorous evening gown and holds a vintage microphone. The lounge features sophisticated decor with plush seating and subtle lighting. Patrons sip cocktails while watching her perform. The pianist plays softly. The atmosphere is smooth and refined, capturing the essence of classic entertainment.",

    "A woman clad in traditional tribal attire dances energetically around a roaring bonfire under a starlit sky. Her clothing features vibrant patterns, beads, and feathers. Other members of the tribe play drums and instruments, accompanying her movements. Sparks from the fire rise into the night air. The scene is alive with rhythm and cultural richness, celebrating community and tradition",

    "A hilarious scene of a squirrel wearing a tiny superhero cape, fighting off squirrels stealing his nuts.",
    "A cute kitten attempting to catch a laser pointer on a spaceship's dashboard, with Earth visible through the window.",
    "An endearing puppy with oversized ears and paws, trying to climb a stack of books in a cozy library.",
    "A majestic lion with a playful expression, wearing a crown made of jungle vines and flowers.",
    "A beautiful woman in a flowing dress made entirely of autumn leaves, dancing in a forest clearing.",
    "An elegant ballerina performing en pointe atop a giant water lily floating on a serene lake.",
    "A whimsical illustration of a panda eating bamboo while floating in space among the stars.",
    "A charming fox wearing glasses and reading a newspaper in a quaint coffee shop.",
    "A stunning portrait of a warrior princess with intricate armor, standing atop a mountain at sunrise.",
    "A humorous image of a penguin in a tuxedo, sliding down a snow hill into a fancy gala event."
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

// Add this code to set a random prompt when the DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded'); // Debugging statement
    const positivePrompt = document.getElementById('positivePrompt');
    if (positivePrompt) {
        const randomPrompt = getRandomPrompt();
        positivePrompt.value = randomPrompt;
        console.log('Random prompt set:', randomPrompt); // Debugging statement
    } else {
        console.error('Element with id "positivePrompt" not found.');
    }
});

// Get the new prompt button
const newPromptButton = document.getElementById('newPromptButton');

// Add click event listener to the button
newPromptButton.addEventListener('click', () => {
    const randomPrompt = getRandomPrompt();
    positivePrompt.value = randomPrompt;
});