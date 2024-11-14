PhotoMaker API
Transform and style images using PhotoMaker's advanced personalization technology. Create consistent, high-quality image variations with precise subject fidelity and style control.
Introduction

PhotoMaker is a powerful image generation technology that enables instant subject personalization without the need for additional training. By providing up to four reference images, you can generate new images that maintain subject fidelity while applying various styles and compositions. This innovative approach offers a perfect balance between preserving the subject's identity and allowing creative freedom in generating new scenarios and styles.

Key features

Instant Personalization: Transform subjects into new scenes and styles within seconds, with no additional training required.
High Fidelity: Maintains impressive subject consistency using up to 4 reference images.
Style Flexibility: Supports various artistic styles while preserving subject identity.
Text Controllability: Precise control over the final output through detailed text prompts.
Strength Control: Discover the perfect balance between original subject features and creative transformation.
How it works

PhotoMaker leverages advanced AI technology to analyze up to four reference images of your subject, creating a comprehensive understanding of their key identifying features and characteristics. This initial analysis forms the foundation for maintaining consistent subject appearance throughout the generation process.

Using your provided text prompt as guidance, PhotoMaker then generates new images that seamlessly blend the subject's identity with your desired style settings. The strength parameter allows you to fine-tune this balance.

To achieve optimal results with PhotoMaker:

Use up to 4 clear reference images of your subject, preferably with good lighting.
Avoid using heavily filtered or edited images as references, as they may affect the quality of the output.
Write specific prompts describing desired scene and composition.
Start with No style for maximum subject fidelity, then experiment with different styles and strength values to find the perfect balance.
Request

Our API always accepts an array of objects as input, where each object represents a specific task to be performed. The structure of the object varies depending on the type of the task. For this section, we will focus on the parameters related to PhotoMaker task.

The following JSON snippets shows the basic structure of a request object. All properties are explained in detail in the next section.

[
  {
    "taskType": "photoMaker",
    "taskUUID": "string",
    "inputImages": ["string"],
    "style": "string",
    "strength": int,
    "positivePrompt": "string",
    "height": int,
    "width": int,
    "scheduler": "string",
    "steps": int,
    "CFGScale": float,
    "outputFormat": "string",
    "includeCost": boolean,
    "numberResults": int
  }
]
taskType
string
required
The type of task to be performed. For this task, the value should be photoMaker.
taskUUID
string
required
UUID v4
When a task is sent to the API you must include a random UUID v4 string using the taskUUID parameter. This string is used to match the async responses to their corresponding tasks.

If you send multiple tasks at the same time, the taskUUID will help you match the responses to the correct tasks.

The taskUUID must be unique for each task you send to the API.
outputType
"base64Data" | "dataURI" | "URL"
Default: URL
Specifies the output type in which the image is returned. Supported values are: dataURI, URL, and base64Data.

base64Data: The image is returned as a base64-encoded string using the imageBase64Data parameter in the response object.
dataURI: The image is returned as a data URI string using the imageDataURI parameter in the response object.
URL: The image is returned as a URL string using the imageURL parameter in the response object.
outputFormat
"JPG" | "PNG" | "WEBP"
Default: JPG
Specifies the format of the output image. Supported formats are: PNG, JPG and WEBP.
uploadEndpoint
string
This parameter allows you to specify a URL to which the generated image will be uploaded as binary image data using the HTTP PUT method. For example, an S3 bucket URL can be used as the upload endpoint.

When the image is ready, it will be uploaded to the specified URL.
checkNSFW
boolean
Default: false
This parameter is used to enable or disable the NSFW check. When enabled, the API will check if the image contains NSFW (not safe for work) content. This check is done using a pre-trained model that detects adult content in images.

When the check is enabled, the API will return NSFWContent: true in the response object if the image is flagged as potentially sensitive content. If the image is not flagged, the API will return NSFWContent: false.

If this parameter is not used, the parameter NSFWContent will not be included in the response object.

Adds 0.1 seconds to image inference time and incurs additional costs.

The NSFW filter occasionally returns false positives and very rarely false negatives.
includeCost
boolean
Default: false
If set to true, the cost to perform the task will be included in the response object.
inputImages
string[]
required
Min: 1
Max: 4
Specifies the input images that will be used as reference for the subject. These reference images help the AI to maintain identity consistency during the generation process. Each input image can be specified in one of the following formats:

An UUID v4 string of a previously uploaded image or a generated image.
A data URI string representing the image. The data URI must be in the format data:<mediaType>;base64, followed by the base64-encoded image. For example: data:image/png;base64,iVBORw0KGgo....
A base64 encoded image without the data URI prefix. For example: iVBORw0KGgo....
A URL pointing to the image. The image must be accessible publicly.
Supported formats are: PNG, JPG and WEBP.
style
string
Default: No Style
Specifies the artistic style to be applied to the generated images. Currently supported values are:

No style: Maximizes subject fidelity while allowing creative freedom in the composition.
Cinematic: Applies a movie-like aesthetic.
Disney Character: Transforms the subject into a Disney-inspired character.
Digital Art: Creates a digital artwork style.
Photographic: Enhances photographic qualities.
Fantasy art: Applies fantasy-themed artistic elements.
Neonpunk: Creates a neon-colored cyberpunk aesthetic.
Enhance: Improves overall image quality.
Comic book: Transforms the subject into comic book style.
Lowpoly: Creates a low-polygon geometric style.
Line art: Converts the image into line drawing style.
strength
integer
Min: 15
Max: 50
Default: 15
Controls the balance between preserving the subject's original features and the creative transformation specified in the prompt.

Lower values provide stronger subject fidelity.
Higher values allow more creative freedom in the transformation.
positivePrompt
string
required
A positive prompt is a text instruction to guide the model on generating the image. It is usually a sentence or a paragraph that provides positive guidance for the task. This parameter is essential to shape the desired results.

The PhotoMaker positive prompt must follow a specific format: the class word (like "man", "woman", "girl") must be followed by the trigger word img.

Examples:

man img, wearing a suit
woman img, in a garden
girl img, with a red hat
The length of the prompt must be between 2 and 2000 characters.
negativePrompt
string
A negative prompt is a text instruction to guide the model on generating the image. It is usually a sentence or a paragraph that provides negative guidance for the task. This parameter helps to avoid certain undesired results.

For example, if the negative prompt is "red dragon, cup", the model will follow the positive prompt but will avoid generating an image of a red dragon or including a cup. The more detailed the prompt, the more accurate the results.

The length of the prompt must be between 2 and 2000 characters.
height
integer
required
Min: 512
Max: 2048
Used to define the height dimension of the generated image. Certain models perform better with specific dimensions.

The value must be divisible by 64, eg: 512, 576, 640...2048.
width
integer
required
Min: 512
Max: 2048
Used to define the width dimension of the generated image. Certain models perform better with specific dimensions.

The value must be divisible by 64, eg: 512, 576, 640...2048.
steps
integer
Min: 1
Max: 100
Default: 20
The number of steps is the number of iterations the model will perform to generate the image. The higher the number of steps, the more detailed the image will be. However, increasing the number of steps will also increase the time it takes to generate the image and may not always result in a better image (some schedulers work differently).

When using your own models you can specify a new default value for the number of steps.
scheduler
string
Default: Model's scheduler
An scheduler is a component that manages the inference process. Different schedulers can be used to achieve different results like more detailed images, faster inference, or more accurate results.

The default scheduler is the one that the model was trained with, but you can choose a different one to get different results.

Schedulers are explained in more detail in the Schedulers page.
seed
integer
Min: 1
Max: 9223372036854776000
Default: Random
A seed is a value used to randomize the image generation. If you want to make images reproducible (generate the same image multiple times), you can use the same seed value.

When requesting multiple images with the same seed, the seed will be incremented by 1 (+1) for each image generated.
CFGScale
float
Min: 0
Max: 30
Default: 7
Guidance scale represents how closely the images will resemble the prompt or how much freedom the AI model has. Higher values are closer to the prompt. Low values may reduce the quality of the results.
clipSkip
integer
Min: 0
Max: 2
Default: 0
CLIP Skip is a feature that enables skipping layers of the CLIP embedding process, leading to quicker and more varied image generation.
numberResults
integer
Default: 1
The number of images to generate from the specified prompt.

If seed is set, it will be incremented by 1 (+1) for each image generated.
Response

Results will be delivered in the format below. It's possible to receive one or multiple images per message. This is due to the fact that images are generated in parallel, and generation time varies across nodes or the network.

{
  "data": [
    {
      "taskType": "photoMaker",
      "taskUUID": "a770f077-f413-47de-9dac-be0b26a35da6",
      "imageUUID": "77da2d99-a6d3-44d9-b8c0-ae9fb06b6200",
      "imageURL": "https://im.runware.ai/image/ws/0.5/ii/a770f077-f413-47de-9dac-be0b26a35da6.jpg",
      "seed": 7532114250969985124,
      "cost": 0.0013
    }
  ]
}
taskType
string
The API will return the taskType you sent in the request. In this case, it will be photoMaker. This helps match the responses to the correct task type.
taskUUID
string
UUID v4
The API will return the taskUUID you sent in the request. This way you can match the responses to the correct request tasks.
inputImagesUUID
string[]
UUID v4
An array containing the unique identifiers of the original images used as input for the PhotoMaker task.
imageUUID
string
UUID v4
The unique identifier of the image.
imageURL
string
If outputType is set to URL, this parameter contains the URL of the image to be downloaded.
imageBase64Data
string
If outputType is set to base64Data, this parameter contains the base64-encoded image data.
imageDataURI
string
If outputType is set to dataURI, this parameter contains the data URI of the image.
seed
integer
The seed value used for generating the image. Even when not specified in the request (random seed), this value is returned to allow reproducing the same image in future requests.

If multiple images were generated (numberResults > 1), each image will have its own seed value, incremented by 1 from the initial seed.
NSFWContent
boolean
If checkNSFW parameter is used, NSFWContent is included informing if the image has been flagged as potentially sensitive content.

true indicates the image has been flagged (is a sensitive image).
false indicates the image has not been flagged.
The filter occasionally returns false positives and very rarely false negatives.
cost
float
if includeCost is set to true, the response will include a cost field for each task object. This field indicates the cost of the request in USD.