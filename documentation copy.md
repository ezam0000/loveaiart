How to connect and authenticate

Step-by-step guide on using our API via WebSockets for efficient and fast connection.

To interact with the Runware API, you need to authenticate your requests using an API key. This key is unique to your account and is used to identify you when making requests. You can create multiple keys for different projects or environments (development, production, staging) , add descriptions to them, and revoke them at any time. With the new teams feature, you can also share keys with your team members.

To create an API key, simply sign up on Runware and visit the "API Keys" page. Then, click "Create Key" and fill the details for your new key.

We currently support WebSocket connections as they are more efficient, faster, and less resource intensive. We have made our WebSocket connections easy to work with, as each response contains the request ID. So it's possible to easily match request → response.

REST API will be available soon, we are working on it.

The API uses a bidirectional protocol that encodes all messages as JSON objects.

To connect you can use one of the sdks we provide JavaScript, (Python or manually.

If you prefer to connect manually (to use another language/technology), the endpoint URL is wss://ws-api.runware.ai/v1.

WebSocket connections are point-to-point, so there's no need for each request to contain an authentication header.

Instead, the first request must always be an authentication request that includes the API key. This way we can identify which subsequent requests are arriving from the same user.

[
  {
    "taskType": "authentication",
    "apiKey": "<APIKEY>"
  }
]
After you've made the authentication request the API will return an object with the connectionSessionUUID parameter. This string is unique to your connection and is used to resume connections in case of disconnection (more on this later).

{
  "data": [
    {
      "taskType": "authentication",
      "connectionSessionUUID": "f40c2aeb-f8a7-4af7-a1ab-7594c9bf778f"
    }
  ]
}
In case of error you will receive an object with the error message.

{
  "error": true,
  "errorMessageContentId": 1212,
  "errorId": 19,
  "errorMessage": "Invalid api key"
}
The WebSocket connection is kept open for 120 seconds from the last message exchanged. If you don't send any messages for 120 seconds, the connection will be closed automatically.

To keep the connection going, you can send a ping message when needed, to which we will reply with a pong.

[
  {
    "taskType": "ping",
    "ping": true
  }
]
{
  "data": [
    {
      "taskType": "ping",
      "pong": true
    }
  ]
}
If any service, server or network is unresponsive (for instance due to a restart), all the images or tasks that could not be delivered are kept in a buffer memory for 120 seconds. You can reconnect and have these messages delivered by including the connectionSessionUUID parameter in the initial authentication connection request.

[
  {
    "taskType": "authentication",
    "apiKey": "<APIKEY>",
    "connectionSessionUUID": "f40c2aeb-f8a7-4af7-a1ab-7594c9bf778f"
  }
]
This means that is not needed to make the same request again, the initial one will be delivered when reconnecting.

SDK libraries reconnects automatically.

Using SDK libraries

Python Library


Integrate Runware's API with our Python library. Get started with code examples and comprehensive usage instructions.
JavaScript Library


Integrate Runware's API with our JavaScript library. Get started with code examples and comprehensive usage instructions.



_docs
Dashboard
Image Inference API
Generate images from text prompts or transform existing ones using Runware's API. Learn how to do image inference for creative and high-quality results.
Introduction

Image inference is a powerful feature that allows you to generate images from text prompts or transform existing images according to your needs. This process is essential for creating high-quality visuals, whether you're looking to bring creative ideas to life or enhance existing images with new styles or subjects.

There are several types of image inference requests you can make using our API:

Text-to-Image: Generate images from descriptive text prompts. This process translates your text into high-quality visuals, allowing you to create detailed and vivid images based on your ideas.
Image-to-Image: Perform transformations on existing images, whether they are previously generated images or uploaded images. This process enables you to enhance, modify, or stylize images to create new and visually appealing content. With a single parameter you can control the strength of the transformation.
Inpainting: Replace parts of an image with new content, allowing you to remove unwanted elements or improve the overall composition of an image. It's like Image-to-Image but with a mask that defines the area to be transformed.
Outpainting: Extend the boundaries of an image by generating new content outside the original frame that seamlessly blends with the existing image. As Inpainting, it uses a mask to define the new area to be generated.
Our API also supports advanced features that allow developers to fine-tune the image generation process with precision:

ControlNet: A feature that enables precise control over image generation by using additional input conditions, such as edge maps, poses, or segmentation masks. This allows for more accurate alignment with specific user requirements or styles.
LoRA: A technique that helps in adapting models to specific styles or tasks by focusing on particular aspects of the data, enhancing the quality and relevance of the generated images.
Additionally, you can tweak numerous parameters to customize the output, such as adjusting the image dimension, steps, scheduler to use, and other generation settings, providing a high level of flexibility to suit your application's needs.

Our API is really fast because we have unique optimizations, custom-designed hardware, and many other elements that are part of our Sonic Inference Engine.

Request

Our API always accepts an array of objects as input, where each object represents a specific task to be performed. The structure of the object varies depending on the type of the task. For this section, we will focus on the parameters related to image inference tasks.

The following JSON snippets shows the basic structure of a request object. All properties are explained in detail in the next section.

[
  {
    "taskType": "imageInference",
    "taskUUID": "string",
    "outputType": "string",
    "outputFormat": "string",
    "positivePrompt": "string",
    "negativePrompt": "string",
    "height": int,
    "width": int,
    "model": "string",
    "steps": int,
    "CFGScale": float,
    "numberResults": int
  }
]
You can mix multiple ControlNet and LoRA objects in the same request to achieve more complex control over the generation process.

taskType
string
required
The type of task to be performed. For this task, the value should be imageInference.
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
positivePrompt
string
required
A positive prompt is a text instruction to guide the model on generating the image. It is usually a sentence or a paragraph that provides positive guidance for the task. This parameter is essential to shape the desired results.

For example, if the positive prompt is "dragon drinking coffee", the model will generate an image of a dragon drinking coffee. The more detailed the prompt, the more accurate the results.

The length of the prompt must be between 4 and 2000 characters.
negativePrompt
string
A negative prompt is a text instruction to guide the model on generating the image. It is usually a sentence or a paragraph that provides negative guidance for the task. This parameter helps to avoid certain undesired results.

For example, if the negative prompt is "red dragon, cup", the model will follow the positive prompt but will avoid generating an image of a red dragon or including a cup. The more detailed the prompt, the more accurate the results.

The length of the prompt must be between 4 and 2000 characters.
seedImage
string
required
When doing Image-to-Image, Inpainting or Outpainting, this parameter is required.

Specifies the seed image to be used for the diffusion process. The image can be specified in one of the following formats:

An UUID v4 string of a previously uploaded image or a generated image.
A data URI string representing the image. The data URI must be in the format data:<mediaType>;base64, followed by the base64-encoded image. For example: data:image/png;base64,iVBORw0KGgo....
A base64 encoded image without the data URI prefix. For example: iVBORw0KGgo....
A URL pointing to the image. The image must be accessible publicly.
Supported formats are: PNG, JPG and WEBP.
maskImage
string
required
When doing Inpainting or Outpainting, this parameter is required.

Specifies the mask image to be used for the inpainting process. The image can be specified in one of the following formats:

An UUID v4 string of a previously uploaded image or a generated image.
A data URI string representing the image. The data URI must be in the format data:<mediaType>;base64, followed by the base64-encoded image. For example: data:image/png;base64,iVBORw0KGgo....
A base64 encoded image without the data URI prefix. For example: iVBORw0KGgo....
A URL pointing to the image. The image must be accessible publicly.
Supported formats are: PNG, JPG and WEBP.
strength
float
Min: 0
Max: 1
Default: 0.8
When doing Image-to-Image, Inpainting or Outpainting, this parameter is used to determine the influence of the seedImage image in the generated output. A higher value results in more influence from the original image, while a lower value allows more creative deviation.
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
model
string
required
At Runware we make use of the AIR system to identify models. This identifier is a unique string that represents a specific model.

You can find the AIR identifier of the model you want to use in our Model Explorer, which is a tool that allows you to search for models based on their characteristics.

More information about the AIR system can be found in the Models page.
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
usePromptWeighting
boolean
Default: false
Allow setting different weights per words or expressions in prompts.

Adds 0.2 seconds to image inference time and incurs additional costs.

When weighting is enabled, you can use the following syntax in prompts:

Weighting

Syntax: + - (word)0.9

Increase or decrease the attention given to specific words or phrases.

Examples:

Single words: small+ dog, pixar style
Multiple words: small dog, (pixar style)-
Multiple symbols for more effect: small+++ dog, pixar style
Nested weighting: (small+ dog)++, pixar style
Explicit weight percentage: small dog, (pixar)1.2 style
Blend

Syntax: .blend()

Merge multiple conditioning prompts.

Example: ("small dog", "robot").blend(1, 0.8)

Conjunction

Syntax: .and()

Break a prompt into multiple clauses and pass them separately.

Example: ("small dog", "pixar style").and()
numberResults
integer
Default: 1
The number of images to generate from the specified prompt.

If seed is set, it will be incremented by 1 (+1) for each image generated.
controlNet
object
With ControlNet, you can provide a guide image to help the model generate images that align with the desired structure. This guide image can be generated with our ControlNet preprocessing tool, extracting guidance information from an input image. The guide image can be in the form of an edge map, a pose, a depth estimation or any other type of control image that guides the generation process via the ControlNet model.

Multiple ControlNet models can be used at the same time to provide different types of guidance information to the model.

The controlNet parameter is an array of objects. Each object contains properties that define the configuration for a specific ControlNet model. You can find the properties of the ControlNet object below.

model
string
required
For basic/common ControlNet models, you can check the list of available models here.

For custom or specific ControlNet models, we make use of the AIR system to identify models. This identifier is a unique string that represents a specific model.

You can find the AIR identifier of the ControlNet model you want to use in our Model Explorer, which is a tool that allows you to search for models based on their characteristics.

More information about the AIR system can be found in the Models page.
guideImage
string
required
Specifies the preprocessed image to be used as guide to control the image generation process. The image can be specified in one of the following formats:

An UUID v4 string of a previously uploaded image or a generated image.
A data URI string representing the image. The data URI must be in the format data:<mediaType>;base64, followed by the base64-encoded image. For example: data:image/png;base64,iVBORw0KGgo....
A base64 encoded image without the data URI prefix. For example: iVBORw0KGgo....
A URL pointing to the image. The image must be accessible publicly.
Supported formats are: PNG, JPG and WEBP.
weight
float
Min: 0
Max: 1
Represents the weight (strength) of the ControlNet model in the image.
startStep
integer
Min: 0
Max: {steps}
Represents the step number in which the ControlNet model starts to control the inference process.

It can take values from 0 (first step) to the number of steps specified.

Alternative parameters:startStepPercentage.
startStepPercentage
integer
Min: 0
Max: 99
Represents the percentage of steps in which the ControlNet model starts to control the inference process.

It can take values from 0 to 100.

Alternative parameters:startStep.
endStep
integer
Min: {startStep + 1}
Max: {steps}
Represents the step number in which the ControlNet preprocessor ends to control the inference process.

It can take values higher than startStep and less than or equal to the number of steps specified.

Alternative parameters:endStepPercentage.
endStepPercentage
integer
Min: {startStepPercentage + 1}
Max: 100
Represents the percentage of steps in which the ControlNet model ends to control the inference process.

It can take values higher than startStepPercentage and lower than or equal to 100.

Alternative parameters:endStep.
controlMode
string
This parameter has 3 options: prompt, controlnet and balanced.

prompt: Prompt is more important in guiding image generation.
controlnet: ControlNet is more important in guiding image generation.
balanced: Balanced operation of prompt and ControlNet.
lora
object
With LoRA (Low-Rank Adaptation), you can adapt a model to specific styles or features by emphasizing particular aspects of the data. This technique enhances the quality and relevance of the generated images and can be especially useful in scenarios where the generated images need to adhere to a specific artistic style or follow particular guidelines.

Multiple LoRA models can be used at the same time to achieve different adaptation goals.

The lora parameter is an array of objects. Each object contains properties that define the configuration for a specific LoRA model. You can find the properties of the LoRA object below.

model
string
required
We make use of the AIR system to identify models. This identifier is a unique string that represents a specific model.

You can find the AIR identifier of the LoRA model you want to use in our Model Explorer, which is a tool that allows you to search for models based on their characteristics.

More information about the AIR system can be found in the Models page.

Example: civitai:132942@146296.
weight
float
Default: 1
It is possible to use multiple LoRAs at the same time.

With the weight parameter you can assign the importance of the LoRA with respect to the others.

The sum of all weight parameters must always be 1. If needed, we will increase the values proportionally to achieve it.

Example:

"lora": [
{
  "model": "civitai:13090@38884",
  "weight": 0.4
},
{
  "model": "civitai:6638@7804",
  "weight": 0.3
},
{
  "model": "civitai:6526@7657",
  "weight": 0.3
}
],
Response

Results will be delivered in the format below. It's possible to receive one or multiple images per message. This is due to the fact that images are generated in parallel, and generation time varies across nodes or the network.

{
  "data": [
    {
      "taskType": "imageInference",
      "taskUUID": "a770f077-f413-47de-9dac-be0b26a35da6",
      "imageUUID": "77da2d99-a6d3-44d9-b8c0-ae9fb06b6200",
      "imageURL": "https://im.runware.ai/image/ws/0.5/ii/a770f077-f413-47de-9dac-be0b26a35da6.jpg",
      "cost": 0.0013
    }
  ]
}
taskUUID
string
UUID v4
The API will return the taskUUID you sent in the request. This way you can match the responses to the correct tasks.
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
NSFWContent
boolean
If checkNSFW parameter is used, NSFWContent is included informing if the image has been flagged as potentially sensitive content.

true indicates the image has been flagged (is a sensitive image).
false indicates the image has not been flagged.
The filter occasionally returns false positives and very rarely false negatives.
cost
float
if includeCost is set to true, the response will include a cost field for each task object. This field indicates the cost of the request in USD.
Introduction
Request
taskType
taskUUID
outputType
outputFormat
uploadEndpoint
checkNSFW
includeCost
positivePrompt
negativePrompt
seedImage
maskImage
strength
height
width
model
steps
scheduler
seed
CFGScale
clipSkip
usePromptWeighting
numberResults
controlNet
controlNet model
controlNet guideImage
controlNet weight
controlNet startStep
controlNet startStepPercentage
controlNet endStep
controlNet endStepPercentage
controlNet controlMode
lora
lora model
lora weight
Response
taskUUID
imageUUID
imageURL
imageBase64Data
imageDataURI
NSFWContent
cost
Related docs
Schedulers
Discover the various schedulers available for image generation.
Models Overview
Explore the different models available. Choose the best model for your specific image generation needs.
Prompt Enhancer
Enhance your prompts with our Prompt Enhancer, optimizing your instructions for greater efficiency and effectiveness in your image generation tasks.
Generative media in the blink of an API
Login
Contact us
Terms
Privacy


Prompt Enhancer
​
 Summarize
​
Enhance your prompts with our Prompt Enhancer, optimizing your instructions for greater efficiency and effectiveness in your image generation tasks.

Prompt enhancement is a powerful tool designed to refine and diversify the results generated for a specific topic. By incorporating additional keywords into a given prompt, this feature aims to expand the scope and creativity of the generated images.

It's important to note that while prompt enhancement can produce varied results, it may not always maintain the exact subject focus of the original prompt and does not guarantee superior outcomes compared to the original input.

Our API always accepts an array of objects as input, where each object represents a specific task to be performed. The structure of the object varies depending on the type of the task. For this section, we will focus on the parameters related to the prompt enhancement task.

The following JSON snippets shows the basic structure of a request object. All properties are explained in detail in the next section.

[
  {
    "taskType": "promptEnhance",
    "taskUUID": "9da1a4ad-c3de-4470-905d-5be5c042f98a",
    "prompt": "dog",
    "promptMaxLength": 64,
    "promptVersions": 4
  }
]
The type of task to be performed. For this task, the value should be promptEnhance.

When a task is sent to the API you must include a random UUID v4 string using the taskUUID parameter. This string is used to match the async responses to their corresponding tasks.

If you send multiple tasks at the same time, the taskUUID will help you match the responses to the correct tasks.

The taskUUID must be unique for each task you send to the API.

If set to true, the cost to perform the task will be included in the response object.

stringrequiredMin: 1Max: 300

The prompt that you intend to enhance.

integerrequiredMin: 12Max: 400

Represents the maximum length of the enhanced prompt that you intend to receive.

integerrequiredMin: 1Max: 5

The number of prompt versions that will be received.


Image Upload
​
 Summarize
​
Learn how to upload images to use in various tasks, including image-to-image generation, background removal, upscaling, and more.

Images can be uploaded to be used in other tasks like Image-to-Image, Upscaling or ControlNet preprocessing.

There are 3 things to keep in mind:

Valid extensions are: jpeg, jpg, png, webp, bmp and gif.
There is no limit on image size but we save them with a maximum of 2048 pixels in width or height, maintaining the original aspect ratio.
Images are deleted 30 days after last use. As long as you continue using them, we will continue saving them indefinitely.
Our API always accepts an array of objects as input, where each object represents a specific task to be performed. The structure of the object varies depending on the type of the task. For this section, we will focus on the parameters related to the image upload task.

The following JSON snippet shows the basic structure of a request object. All properties are explained in detail in the next section.

[
  {
    "taskType": "imageUpload",
    "taskUUID": "50836053-a0ee-4cf5-b9d6-ae7c5d140ada",
    "image": "data:image/png;base64,iVBORw0KGgo..."
  }
]
The type of task to be performed. For this task, the value should be imageUpload.

When a task is sent to the API you must include a random UUID v4 string using the taskUUID parameter. This string is used to match the async responses to their corresponding tasks.

If you send multiple tasks at the same time, the taskUUID will help you match the responses to the correct tasks.

The taskUUID must be unique for each task you send to the API.

Specifies the image to be uploaded. The image can be specified in one of the following formats:

A data URI string representing the image. The data URI must be in the format data:<mediaType>;base64, followed by the base64-encoded image. For example: data:image/png;base64,iVBORw0KGgo....
A base64 encoded image without the data URI prefix. For example: iVBORw0KGgo....
A URL pointing to the image. The image must be accessible publicly.
Supported formats are: PNG, JPG and WEBP.


ControlNet tools
Enhance your image generation with ControlNet. Get detailed instructions on integrating and using ControlNet with Runware's different APIs.

ControlNet offers advanced capabilities for precise image processing through the use of guide images in specific formats, known as preprocessed images. This powerful tool enhances the control and customization of image generation, enabling users to achieve desired artistic styles and detailed adjustments effectively.

Using ControlNet via our API simplifies the integration of guide images into your workflow. By leveraging the API, you can seamlessly incorporate preprocessed images and specify various parameters to tailor the image generation process to your exact requirements.

Our API always accepts an array of objects as input, where each object represents a specific task to be performed. The structure of the object varies depending on the type of the task. For this section, we will focus on the parameters related to the ControlNet preprocessing task.

The following JSON snippet shows the basic structure of a request object. All properties are explained in detail in the next section.

[
  {
    "taskType": "imageControlNetPreProcess",
    "taskUUID": "3303f1be-b3dc-41a2-94df-ead00498db57",
    "inputImage": "ff1d9a0b-b80f-4665-ae07-8055b99f4aea",
    "preProcessorType": "canny",
    "height": 512,
    "width": 512
  }
]
The type of task to be performed. For this task, the value should be imageControlNetPreProcess.

When a task is sent to the API you must include a random UUID v4 string using the taskUUID parameter. This string is used to match the async responses to their corresponding tasks.

If you send multiple tasks at the same time, the taskUUID will help you match the responses to the correct tasks.

The taskUUID must be unique for each task you send to the API.

"base64Data" | "dataURI" | "URL"Default: URL

Specifies the output type in which the image is returned. Supported values are: dataURI, URL, and base64Data.

base64Data: The image is returned as a base64-encoded string using the imageBase64Data parameter in the response object.
dataURI: The image is returned as a data URI string using the imageDataURI parameter in the response object.
URL: The image is returned as a URL string using the imageURL parameter in the response object.
"JPG" | "PNG" | "WEBP"Default: JPG

Specifies the format of the output image. Supported formats are: PNG, JPG and WEBP.

If set to true, the cost to perform the task will be included in the response object.

Specifies the input image to be preprocessed to generate a guide image. This guide image will be used as a reference for image generation processes, guiding the AI to generate images that are more aligned with the input image. The input image can be specified in one of the following formats:

An UUID v4 string of a previously uploaded image.
A data URI string representing the image. The data URI must be in the format data:<mediaType>;base64, followed by the base64-encoded image. For example: data:image/png;base64,iVBORw0KGgo....
A base64 encoded image without the data URI prefix. For example: iVBORw0KGgo....
A URL pointing to the image. The image must be accessible publicly.
Supported formats are: PNG, JPG and WEBP.

The preprocessor to be used. Possible values:

canny
depth
mlsd
normalbae
openpose
tile
seg
lineart
lineart_anime
shuffle
scribble
softedge
Will resize the image to this height.

Will resize the image to this width.

Defines the lower threshold when using the Canny edge detection preprocessor.

The recommended value is 100.

Defines the high threshold when using the Canny edge detection preprocessor.

The recommended value is 200.

Include the hands and face in the pose outline when using the OpenPose preprocessor.

Results will be delivered in the format below.

{
  "data": [
    {
      "taskType": "imageControlNetPreProcess",
      "taskUUID": "3303f1be-b3dc-41a2-94df-ead00498db57",
      "guideImageUUID": "b6a06b3b-ce32-4884-ad93-c5eca7937ba0",
      "inputImageUUID": "ff1d9a0b-b80f-4665-ae07-8055b99f4aea",
      "guideImageURL": "https://im.runware.ai/image/ws/0.5/ii/b6a06b3b-ce32-4884-ad93-c5eca7937ba0.jpg",
      "cost": 0.0006
    }
  ]
}
The API will return the taskUUID you sent in the request. This way you can match the responses to the correct tasks.

The unique identifier of the original image used as input for the preprocessing task.

The unique identifier of the preprocessed image.

If outputType is set to URL, this parameter contains the URL of the preprocessed image to be downloaded.

If outputType is set to base64Data, this parameter contains the base64-encoded data of the preprocessed image.

If outputType is set to dataURI, this parameter contains the data URI of the preprocessed image.

if includeCost is set to true, the response will include a cost field for each task object. This field indicates the cost of the request in USD.

 Summary
ControlNet enhances image generation by using guide images in preprocessed formats. The API allows integration of guide images and customization of the image generation process. The response includes the task UUID, input image UUID, guide image UUID, and guide image URL or base64 data.


Image Upscaling
​
 Summarize
​
Enhance the resolution and quality of your images using Runware's advanced upscaling API. Transform low-resolution images into sharp, high-definition visuals.

Upscaling refers to the process of enhancing the resolution and overall quality of images. This technique is particularly useful for improving the visual clarity and detail of lower-resolution images, making them suitable for various high-definition applications.

Our API always accepts an array of objects as input, where each object represents a specific task to be performed. The structure of the object varies depending on the type of the task. For this section, we will focus on the parameters related to the image upscaling task.

The following JSON snippets shows the basic structure of a request object. All properties are explained in detail in the next section.

[
  {
    "taskType": "imageUpscale",
    "taskUUID": "19abad0d-6ec5-40a6-b7af-203775fa5b7f",
    "inputImage": "fd613011-3872-4f37-b4aa-0d343c051a27",
    "outputType": "URL",
    "outputFormat": "JPG",
    "upscaleFactor": 2
  }
]
The type of task to be performed. For this task, the value should be imageUpscale.

When a task is sent to the API you must include a random UUID v4 string using the taskUUID parameter. This string is used to match the async responses to their corresponding tasks.

If you send multiple tasks at the same time, the taskUUID will help you match the responses to the correct tasks.

The taskUUID must be unique for each task you send to the API.

Specifies the input image to be processed. The image can be specified in one of the following formats:

An UUID v4 string of a previously uploaded image or a generated image.
A data URI string representing the image. The data URI must be in the format data:<mediaType>;base64, followed by the base64-encoded image. For example: data:image/png;base64,iVBORw0KGgo....
A base64 encoded image without the data URI prefix. For example: iVBORw0KGgo....
A URL pointing to the image. The image must be accessible publicly.
Supported formats are: PNG, JPG and WEBP.

"base64Data" | "dataURI" | "URL"Default: URL

Specifies the output type in which the image is returned. Supported values are: dataURI, URL, and base64Data.

base64Data: The image is returned as a base64-encoded string using the imageBase64Data parameter in the response object.
dataURI: The image is returned as a data URI string using the imageDataURI parameter in the response object.
URL: The image is returned as a URL string using the imageURL parameter in the response object.
"JPG" | "PNG" | "WEBP"Default: JPG

Specifies the format of the output image. Supported formats are: PNG, JPG and WEBP.

If set to true, the cost to perform the task will be included in the response object.

integerrequiredMin: 2Max: 4

This value is the level of upscaling performed.

Each will increase the size of the image by the corresponding factor.

For instance, an upscaleFactor of 2 will 2x image size.

Results will be delivered in the format below.

{
  "data": [
    {
      "taskType": "imageUpscale",
      "taskUUID": "19abad0d-6ec5-40a6-b7af-203775fa5b7f",
      "imageUUID": "e0b6ed2b-311d-4abc-aa01-8f3fdbdb8860",
      "inputImageUUID": "fd613011-3872-4f37-b4aa-0d343c051a27",
      "imageURL": "https://im.runware.ai/image/ws/0.5/ii/e0b6ed2b-311d-4abc-aa01-8f3fdbdb8860.jpg",
      "cost": 0
    }
  ]
}
The API will return the taskUUID you sent in the request. This way you can match the responses to the correct tasks.

The unique identifier of the image.

If outputType is set to URL, this parameter contains the URL of the image to be downloaded.

If outputType is set to base64Data, this parameter contains the base64-encoded image data.

If outputType is set to dataURI, this parameter contains the data URI of the image.

if includeCost is set to true, the response will include a cost field for each task object. This field indicates the cost of the request in USD.


