Quick start
​
 Summarize
​
Securely integrate a new or existing application to the Kinde platform

Technology

Change technology

Node.js


We don't have an SDK for Node.js yet. In the meantime the steps below can get you up and going.

Starter kit
Existing codebase
Where is your project running?


The URLs used in this guide are based on this value

http://localhost:3000 Edit

Requirement


Node version 18.x.x or newer
Install


Install the SDK via npm or Yarn

npm i @kinde-oss/kinde-nodejs-sdk --save
Configure your app


Copy these variables in your .env. You can change the redirect URIs if you need to.

KINDE_DOMAIN=https://loveaiart.kinde.com
KINDE_CLIENT_ID=97e19445ae69497289ecdc8bca593232
KINDE_CLIENT_SECRET=** Hidden until copied **
KINDE_REDIRECT_URI=http://localhost:3000/callback
KINDE_LOGOUT_REDIRECT_URI=http://localhost:3000
Integrate with your app


Create a new KindeClient instance before you initialize your app.

Create a new KindeClient instance before you initialize your app.

require("dotenv").config();

const {KindeClient, GrantType} = require("@kinde-oss/kinde-nodejs-sdk");

const options = {
	domain: process.env.KINDE_DOMAIN,
	clientId: process.env.KINDE_CLIENT_ID,
	clientSecret: process.env.KINDE_CLIENT_SECRET,
	redirectUri: process.env.KINDE_REDIRECT_URI,
	logoutRedirectUri: process.env.KINDE_LOGOUT_REDIRECT_URI,
	grantType: GrantType.PKCE
};
Sign in and sign up


To incorporate the login and register features, you’ll have to create routes for /login and /register. Additionally, you should implement the /login//register methods in the middleware.

app.get("/login", kindeClient.login(), (req, res) => {
	return res.redirect("/");
});

app.get("/register", kindeClient.register(), (req, res) => {
	return res.redirect("/");
});
With that done you can simply add links in your HTML as follows:

<a href="/login">Sign in</a>
<a href="/register">Sign up</a>
Manage redirects


You will also need to route/callback. When the user is redirected back to your site from Kinde, it will trigger a call to the callback URL defined in the variable /KINDE_REDIRECT_URL.

app.get("/callback", kindeClient.callback(), (req, res) => {
	return res.redirect("/");
});
Logout


The Kinde SDK comes with a logout method.

app.get("/logout", client.logout());
With that in place you can simply add links in your HTML as follows:

<a href="/logout">Log out</a>
Open your project in a browser


You should see sign in and registration buttons

Sign up your first user


Register your first user and view their profile on the Users page

What’s next?


Explore all of Kinde’s functions in the SDK docs

View Node.js docs