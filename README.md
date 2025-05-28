# LoveAIArt

**LoveAIArt** is a platform that allows users to create stunning AI-generated artworks. Users can sign in with Google to access the full range of features, including the ability to generate images based on prompts, modify styles, and more. This project is built using Node.js, Express, MongoDB, and integrates with Google OAuth for user authentication.

## Features

### 🎉 NEW: Advanced AI Features (December 2024)

- **🧼 LayerDiffuse - Transparent Backgrounds**: Generate images with built-in transparency using FLUX models. Perfect for product photography, logos, and isolated subjects. No post-processing required!
- **🧬 PuLID - Identity Consistency**: Maintain facial identity across different prompts using reference images. Ideal for character consistency, portraits, and brand mascots.

### Core Features

- **AI-Generated Art**: Users can create unique artworks using AI by inputting custom prompts.
- **Google Authentication**: Secure sign-in with Google using OAuth 2.0.
- **Responsive Design**: The platform is optimized for both desktop and mobile devices.
- **Session Management**: User sessions are managed with MongoDB and `connect-mongo` for scalable storage.
- **Terms of Service and Privacy Policy**: Clear guidelines and privacy practices are outlined for all users.

## Installation

To run this project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/loveaiart.git
   cd loveaiart
   Install the necessary dependencies:
   bash
   Copy code
   npm install
   Set up environment variables:
   Create a .env file in the root directory and add the following:
   ```

plaintext
Copy code
RUNWARE_API_KEY=your_runware_api_key

Run the server locally:
bash
Copy code
npm start
The application should be accessible at http://localhost:3000.
Deploy to Heroku (optional):
Ensure that all environment variables are set in the Heroku dashboard, then push your code to Heroku to deploy.
Usage

    •	Sign In: Users can sign in using their Google account.
    •	Create Art: After signing in, users can input prompts to generate AI-based artworks.
    •	Manage Sessions: Sessions are securely managed and stored using MongoDB.

Project Structure

    •	server.js: Main server-side application logic, including routes and session management.
    •	public/: Contains all the static files such as HTML, CSS, and JavaScript.
    •	.env: Contains environment variables for secure information.
    •	Procfile: Used for Heroku deployment.

Contributing

Feel free to submit issues or pull requests for improvements or bug fixes. Please follow the standard code of conduct and ensure that all contributions are well-documented.

License

This project is licensed under the MIT License. See the LICENSE file for details.

Changelog

August 21, 2024

    •	modified mongo to see if it works in prod, prior commit not working:
    •	Attempted to fix MongoDB configuration for production deployment after previous issues.
    •	added MongoDB, not sure why but it's stable and running locally, not tested in prod:
    •	Integrated MongoDB into the project; tested locally and confirmed stability, but not yet tested in production.
    •	OAuth working if I go directly through http://localhost:3000/auth/google, otherwise not:
    •	Fixed an issue where Google OAuth would only work when directly accessing the /auth/google route.
    •	added Google OAuth, untested, modified server.js and added login page, untested, won't show login local:
    •	Integrated Google OAuth into the project, modified server.js, and added a login page. Initial local tests showed the login page wasn't displaying.
    •	added logo.jpg:
    •	Uploaded logo.jpg to enhance the visual branding of the site.
    •	fixed title on index.html broke the output, working now:
    •	Corrected an issue in index.html where modifying the title broke the page rendering.
    •	changed styles.css, it's responsive on virtual iPhone:
    •	Updated styles.css to improve responsiveness on mobile devices, particularly tested on a virtual iPhone.
    •	changed styles.css to one column:
    •	Adjusted the CSS layout to a single-column format to improve mobile usability.
    •	long commit, added TOS and PP, also updated styles and package.json for Google OAuth, index.html was modified to give links to PP and TOS:
    •	Added Terms of Service and Privacy Policy pages, updated index.html to include links to these pages, and made corresponding updates to styles.css and package.json.
    •	testing better CSS to make it better on mobile:
    •	Experimented with various CSS improvements to enhance the mobile experience.

August 20, 2024

    •	modified defaults:
    •	Updated default settings in the application for better usability.
    •	fixed server.js port management and ping:
    •	Improved port management and added a keep-alive ping to ensure consistent uptime in the server.js file.
    •	added Procfile:
    •	Created a Procfile to manage Heroku deployment processes.
    •	first commit, clean no deploy element:
    •	Initial setup of the project structure without deployment configurations.
