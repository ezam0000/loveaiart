Kinde Management API v1
​
 Summarize
​
Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

Welcome to the Kinde management API docs. Most things that can be done in the Kinde admin UI can be done programmatically with this API.

Note: This API can only be used by back-end servers or trusted parties. It is not accessible from the browser.

Requests should be sent with a Content-Type of application/json.

Authentication

Access tokens

You will need a Management API access token to access the Kinde Management API.

If you haven’t already set this up, you’ll need to do these tasks first:

Add a machine to machine application in Kinde with Management API access
Use the application to get a Management API access token
Test the connection — we show you how in Postman
Scopes

All requests are authenticated with JWTs. The Management API access token’s scope claim indicates which request methods can be performed when calling this API.

For example, this deserialized token grants read-only access to users, and read/write access to applications:

Trying to call any request method not permitted within the set scopes will result in a 403 Forbidden response along with details of the scope required to access.

Limits

The following limits apply to API calls

maximum page size of 500 per request to API GET endpoints that use the page_size parameter, additional results can be requested using the page_size and next_token parameters (e.g. GET /api/v1/subscribers)

maximum 100 objects can be updated in a single request when sending POST/PATCH requests to bulk endpoints (e.g. PATCH /api/v1/organizations/{org_code}/users)

If this affects your integrations and you require an extended period with a higher limit please get in touch. This API can only be used by back-end servers or trusted parties. It is not accessible from the browser.

Base URLs

Make sure you use your own Kinde domain as the base URL wherever you see http://{your_subdomain}.kinde.com.

To find this in Kinde, go to Settings > Applications > View details (on the relevant app) and copy it from the App keys > Domain field.

Note: custom domains cannot currently be used with this API.

Need more help?

View all our docs

Reach out in the Kinde community on Slack

Email support@kinde.com

Authentication

To access endpoints in the API, you need to go through the three set up steps above.

To access the OAuth endpoint, use the token obtained when your users sign in via the methods you've setup in Kinde (e.g. google, passwordless, etc). Find this using the getToken command in the relevant SDK.

OAuth

Get User Profile

Code samples

GET /oauth2/user_profile

Contains the id, names and email of the currently logged in user.

Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Details of logged in user V1.	user_profile
403	Forbidden	Invalid credentials.	None
To perform this operation, you must be authenticated by means of one of the following methods: kindeBearerAuth
Get token details

Code samples

POST /oauth2/introspect

Retrieve information about the provided token.

Body parameter

token: string
token_type: string

Parameters

Name	In	Type	Required	Description
body	body	object	true	Token details.
» token	body	string	false	The token to be introspected.
» token_type	body	string	false	The provided token's type.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Details of the token.	token_introspect
401	Unauthorized	Bad request.	token_error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: kindeBearerAuth
Revoke token

Code samples

POST /oauth2/revoke

Revoke a previously issued token.

Body parameter

token: string
client_id: string
client_secret: string

Parameters

Name	In	Type	Required	Description
body	body	object	true	Details of the token to be revoked.
» token	body	string	false	The token to be revoked.
» client_id	body	string	false	The identifier for your client.
» client_secret	body	string	false	The secret associated with your client.
Example responses

401 Response

{
  "error": "string",
  "error_description": "string"
}
Responses

Status	Meaning	Description	Schema
200	OK	Token successfully revoked.	None
401	Unauthorized	Bad request.	token_error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: kindeBearerAuth
Returns the details of the currently logged in user

Code samples

GET /oauth2/v2/user_profile

Contains the id, names, profile picture URL and email of the currently logged in user.

Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Details of logged in user V2.	user_profile_v2
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: kindeBearerAuth
APIs

Get APIs

Code samples

GET /api/v1/apis

Returns a list of your APIs. The APIs are returned sorted by name.

Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	A list of APIs.	get_apis_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:apis )
Create API

Code samples

POST /api/v1/apis

Register a new API. For more information read Register and manage APIs.

Body parameter

{
  "name": "Example API",
  "audience": "https://api.example.com"
}
Parameters

Name	In	Type	Required	Description
body	body	object	true	none
» name	body	string	true	The name of the API. (1-64 characters).
» audience	body	string	true	A unique identifier for the API - commonly the URL. This value will be used as the audience parameter in authorization claims. (1-64 characters)
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	APIs successfully updated	create_apis_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:apis )
Get API

Code samples

GET /api/v1/apis/{api_id}

Retrieve API details by ID.

Parameters

Name	In	Type	Required	Description
api_id	path	string	true	The API's ID.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	API successfully retrieved.	get_api_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:apis )
Delete API

Code samples

DELETE /api/v1/apis/{api_id}

Delete an API you previously created.

Parameters

Name	In	Type	Required	Description
api_id	path	string	true	The API's ID.
Example responses

200 Response

{
  "message": "API successfully deleted",
  "code": "API_DELETED"
}
Responses

Status	Meaning	Description	Schema
200	OK	API successfully deleted.	delete_api_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:apis )
Authorize API applications

Code samples

PATCH /api/v1/apis/{api_id}/applications

Authorize applications to be allowed to request access tokens for an API

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	true	The applications you want to authorize.
» applications	body	[object]	true	none
»» id	body	string	true	The application's Client ID.
»» operation	body	string	false	Optional operation, set to 'delete' to revoke authorization for the application. If not set, the application will be authorized.
api_id	path	string	true	The API's ID.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Authorized applications updated.	authorize_app_api_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:apis )
Applications

Get applications

Code samples

GET /api/v1/applications

Get a list of applications / clients.

Parameters

Name	In	Type	Required	Description
sort	query	string	false	Field and order to sort the result by.
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
next_token	query	string	false	A string to get the next page of results if there are more results.
Enumerated Values

Parameter	Value
sort	name_asc
sort	name_desc
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	A successful response with a list of applications or an empty list.	get_applications_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:applications )
Create application

Code samples

POST /api/v1/applications

Create a new client.

Body parameter

{
  "name": "React Native app",
  "type": "reg"
}
Parameters

Name	In	Type	Required	Description
body	body	object	true	none
» name	body	string	true	The application's name.
» type	body	string	true	The application's type. Use reg for regular server rendered applications, spa for single-page applications, and m2m for machine-to-machine applications.
Enumerated Values

Parameter	Value
» type	reg
» type	spa
» type	m2m
Example responses

201 Response

Responses

Status	Meaning	Description	Schema
201	Created	Application successfully created.	create_application_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:applications )
Get application

Code samples

GET /api/v1/applications/{application_id}

Gets an application given the application's ID.

Parameters

Name	In	Type	Required	Description
application_id	path	string	true	The identifier for the application.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Application successfully retrieved.	get_application_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:applications )
Update Application

Code samples

PATCH /api/v1/applications/{application_id}

Updates a client's settings. For more information, read Applications in Kinde

Body parameter

Parameters

Name	In	Type	Required	Description
application_id	path	string	true	The identifier for the application.
body	body	object	false	Application details.
» name	body	string	false	The application's name.
» language_key	body	string	false	The application's language key.
» logout_uris	body	[string]	false	The application's logout uris.
» redirect_uris	body	[string]	false	The application's redirect uris.
» login_uri	body	string	false	The default login route for resolving session issues.
» homepage_uri	body	string	false	The homepage link to your application.
Example responses

400 Response

Responses

Status	Meaning	Description	Schema
200	OK	Application successfully updated.	None
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:applications )
Delete application

Code samples

DELETE /api/v1/applications/{application_id}

Delete a client / application.

Parameters

Name	In	Type	Required	Description
application_id	path	string	true	The identifier for the application.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Application successfully deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:applications )
Get connections

Code samples

GET /api/v1/applications/{application_id}/connections

Gets all connections for an application.

Parameters

Name	In	Type	Required	Description
application_id	path	string	true	The identifier/client ID for the application.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Application connections successfully retrieved.	get_connections_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:application_connections )
Enable connection

Code samples

POST /api/v1/applications/{application_id}/connections/{connection_id}

Enable an auth connection for an application.

Parameters

Name	In	Type	Required	Description
application_id	path	string	true	The identifier/client ID for the application.
connection_id	path	string	true	The identifier for the connection.
Example responses

400 Response

Responses

Status	Meaning	Description	Schema
200	OK	Connection successfully enabled.	None
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:application_connections )
Remove connection

Code samples

DELETE /api/v1/applications/{application_id}/connections/{connection_id}

Turn off an auth connection for an application

Parameters

Name	In	Type	Required	Description
application_id	path	string	true	The identifier/client ID for the application.
connection_id	path	string	true	The identifier for the connection.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Connection successfully removed.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:application_connections )
Business

Get business

Code samples

GET /api/v1/business

Get your business details.

Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Your business details.	get_business_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:business )
Update business

Code samples

PATCH /api/v1/business

Update your business details.

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	true	The business details to update.
» business_name	body	string¦null	false	The name of the business.
» email	body	string¦null	false	The email address of the business.
» industry_key	body	string¦null	false	The key of the industry of your business. Can be retrieved from the /industries endpoint.
» is_click_wrap	body	boolean¦null	false	Whether the business is using clickwrap agreements.
» is_show_kinde_branding	body	boolean¦null	false	Whether the business is showing Kinde branding. Requires a paid plan.
» kinde_perk_code	body	string¦null	false	The Kinde perk code for the business.
» phone	body	string¦null	false	The phone number of the business.
» privacy_url	body	string¦null	false	The URL to the business's privacy policy.
» terms_url	body	string¦null	false	The URL to the business's terms of service.
» timezone_key	body	string¦null	false	The key of the timezone of your business. Can be retrieved from the /timezones endpoint.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Business successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:businesses )
Industries

Get industries

Code samples

GET /api/v1/industries

Get a list of industries and associated industry keys.

Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	A list of industries.	get_industries_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:industries )
Timezones

Get timezones

Code samples

GET /api/v1/timezones

Get a list of timezones and associated timezone keys.

Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	A list of timezones.	get_timezones_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:timezones )
Callbacks

List Callback URLs

Code samples

GET /api/v1/applications/{app_id}/auth_redirect_urls

Returns an application's redirect callback URLs.

Parameters

Name	In	Type	Required	Description
app_id	path	string	true	The identifier for the application.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Callback URLs successfully retrieved.	redirect_callback_urls
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:applications_redirect_uris )
Add Redirect Callback URLs

Code samples

POST /api/v1/applications/{app_id}/auth_redirect_urls

Add additional redirect callback URLs.

Body parameter

Parameters

Name	In	Type	Required	Description
app_id	path	string	true	The identifier for the application.
body	body	object	true	Callback details.
» urls	body	[string]	false	Array of callback urls.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Callbacks successfully updated	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:application_redirect_uris )
Replace Redirect Callback URLs

Code samples

PUT /api/v1/applications/{app_id}/auth_redirect_urls

Replace all redirect callback URLs.

Body parameter

Parameters

Name	In	Type	Required	Description
app_id	path	string	true	The identifier for the application.
body	body	object	true	Callback details.
» urls	body	[string]	false	Array of callback urls.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Callbacks successfully updated	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:application_redirect_uris )
Delete Callback URLs

Code samples

DELETE /api/v1/applications/{app_id}/auth_redirect_urls

Delete callback URLs.

Parameters

Name	In	Type	Required	Description
app_id	path	string	true	The identifier for the application.
urls	query	string	true	Urls to delete, comma separated and url encoded.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Callback URLs successfully deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:application_redirect_uris )
List Logout URLs

Code samples

GET /api/v1/applications/{app_id}/auth_logout_urls

Returns an application's logout redirect URLs.

Parameters

Name	In	Type	Required	Description
app_id	path	string	true	The identifier for the application.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Logout URLs successfully retrieved.	logout_redirect_urls
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:application_logout_uris )
Add Logout Redirect URLs

Code samples

POST /api/v1/applications/{app_id}/auth_logout_urls

Add additional logout redirect URLs.

Body parameter

Parameters

Name	In	Type	Required	Description
app_id	path	string	true	The identifier for the application.
body	body	object	true	Callback details.
» urls	body	[string]	false	Array of logout urls.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Logouts successfully updated	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:application_logout_uris )
Replace Logout Redirect URLs

Code samples

PUT /api/v1/applications/{app_id}/auth_logout_urls

Replace all logout redirect URLs.

Body parameter

Parameters

Name	In	Type	Required	Description
app_id	path	string	true	The identifier for the application.
body	body	object	true	Callback details.
» urls	body	[string]	false	Array of logout urls.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Logout URLs successfully updated	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:application_logout_uris )
Delete Logout URLs

Code samples

DELETE /api/v1/applications/{app_id}/auth_logout_urls

Delete logout URLs.

Parameters

Name	In	Type	Required	Description
app_id	path	string	true	The identifier for the application.
urls	query	string	true	Urls to delete, comma separated and url encoded.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Logout URLs successfully deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:application_logout_uris )
Connected Apps

Get Connected App URL

Code samples

GET /api/v1/connected_apps/auth_url

Get a URL that authenticates and authorizes a user to a third-party connected app.

Parameters

Name	In	Type	Required	Description
key_code_ref	query	string	true	The unique key code reference of the connected app to authenticate against.
user_id	query	string	false	The id of the user that needs to authenticate to the third-party connected app.
org_code	query	string	false	The code of the Kinde organization that needs to authenticate to the third-party connected app.
override_callback_url	query	string	false	A URL that overrides the default callback URL setup in your connected app configuration
Example responses

200 Response

{
  "url": "string",
  "session_id": "string"
}
Responses

Status	Meaning	Description	Schema
200	OK	A URL that can be used to authenticate and a session id to identify this authentication session.	connected_apps_auth_url
400	Bad Request	Error retrieving connected app auth url.	error_response
403	Forbidden	Invalid credentials.	None
404	Not Found	Error retrieving connected app auth url.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:connected_apps )
Get Connected App Token

Code samples

GET /api/v1/connected_apps/token

Get an access token that can be used to call the third-party provider linked to the connected app.

Parameters

Name	In	Type	Required	Description
session_id	query	string	true	The unique sesssion id representing the login session of a user.
Example responses

200 Response

{
  "access_token": "string",
  "access_token_expiry": "string"
}
Responses

Status	Meaning	Description	Schema
200	OK	An access token that can be used to query a third-party provider, as well as the token's expiry time.	connected_apps_access_token
400	Bad Request	The session id provided points to an invalid session.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:connected_apps )
Revoke Connected App Token

Code samples

POST /api/v1/connected_apps/revoke

Revoke the tokens linked to the connected app session.

Parameters

Name	In	Type	Required	Description
session_id	query	string	true	The unique sesssion id representing the login session of a user.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	An access token that can be used to query a third-party provider, as well as the token's expiry time.	success_response
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	error_response
405	Method Not Allowed	Invalid HTTP method used.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:connected_apps )
Connections

List Connections

Code samples

GET /api/v1/connections

Returns a list of Connections

Parameters

Name	In	Type	Required	Description
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
starting_after	query	string	false	The ID of the connection to start after.
ending_before	query	string	false	The ID of the connection to end before.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Connections successfully retrieved.	get_connections_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:connections )
Create Connection

Code samples

POST /api/v1/connections

Create Connection.

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	true	Connection details.
» name	body	string	true	The internal name of the connection.
» display_name	body	string	true	The public facing name of the connection.
» strategy	body	string	true	The identity provider identifier for the connection.
» enabled_applications	body	[string]	false	Client IDs of applications in which this connection is to be enabled.
» options	body	object	false	The connection's options (varies by strategy).
Enumerated Values

Parameter	Value
» strategy	oauth2:apple
» strategy	oauth2:azure_ad
» strategy	oauth2:bitbucket
» strategy	oauth2:discord
» strategy	oauth2:facebook
» strategy	oauth2:github
» strategy	oauth2:gitlab
» strategy	oauth2:google
» strategy	oauth2:linkedin
» strategy	oauth2:microsoft
» strategy	oauth2:patreon
» strategy	oauth2:slack
» strategy	oauth2:stripe
» strategy	oauth2:twitch
» strategy	oauth2:twitter
» strategy	oauth2:xero
» strategy	saml:custom
» strategy	wsfed:azure_ad
Example responses

201 Response

Responses

Status	Meaning	Description	Schema
201	Created	Connection successfully created	create_connection_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:connections )
Get Connection

Code samples

GET /api/v1/connections/{connection_id}

Get Connection.

Parameters

Name	In	Type	Required	Description
connection_id	path	string	true	The unique identifier for the connection.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Connection successfully retrieved.	connection
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:connections )
Update Connection

Code samples

PATCH /api/v1/connections/{connection_id}

Update Connection.

Body parameter

Parameters

Name	In	Type	Required	Description
connection_id	path	string	true	The unique identifier for the connection.
body	body	object	true	The fields of the connection to update.
» name	body	string	false	The internal name of the connection.
» display_name	body	string	false	The public facing name of the connection.
» enabled_applications	body	[string]	false	Client IDs of applications in which this connection is to be enabled.
» options	body	object	false	The connection's options (varies by strategy).
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Connection successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:connections )
Delete Connection

Code samples

DELETE /api/v1/connections/{connection_id}

Delete connection.

Parameters

Name	In	Type	Required	Description
connection_id	path	string	true	The identifier for the connection.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Connection deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:connections )
Environments

Delete Environment Feature Flag Overrides

Code samples

DELETE /api/v1/environment/feature_flags

Delete all environment feature flag overrides.

Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Feature flag overrides deleted successfully.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:environment_feature_flags )
List Environment Feature Flags

Code samples

GET /api/v1/environment/feature_flags

Get environment feature flags.

Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Feature flags retrieved successfully.	get_environment_feature_flags_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:environment_feature_flags )
Delete Environment Feature Flag Override

Code samples

DELETE /api/v1/environment/feature_flags/{feature_flag_key}

Delete environment feature flag override.

Parameters

Name	In	Type	Required	Description
feature_flag_key	path	string	true	The identifier for the feature flag.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Feature flag deleted successfully.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:environment_feature_flags )
Update Environment Feature Flag Override

Code samples

PATCH /api/v1/environment/feature_flags/{feature_flag_key}

Update environment feature flag override.

Body parameter

Parameters

Name	In	Type	Required	Description
feature_flag_key	path	string	true	The identifier for the feature flag.
body	body	object	true	Flag details.
» value	body	string	true	The flag override value.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Feature flag override successful	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:environment_feature_flags )
Feature Flags

Create Feature Flag

Code samples

POST /api/v1/feature_flags

Create feature flag.

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	true	Flag details.
» name	body	string	true	The name of the flag.
» description	body	string	false	Description of the flag purpose.
» key	body	string	true	The flag identifier to use in code.
» type	body	string	true	The variable type.
» allow_override_level	body	string	false	Allow the flag to be overridden at a different level.
» default_value	body	string	true	Default value for the flag used by environments and organizations.
Enumerated Values

Parameter	Value
» type	str
» type	int
» type	bool
» allow_override_level	env
» allow_override_level	org
» allow_override_level	usr
Example responses

201 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
201	Created	Feature flag successfully created	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:feature_flags )
Delete Feature Flag

Code samples

DELETE /api/v1/feature_flags/{feature_flag_key}

Delete feature flag

Parameters

Name	In	Type	Required	Description
feature_flag_key	path	string	true	The identifier for the feature flag.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Feature flag successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:feature_flags )
Replace Feature Flag

Code samples

PUT /api/v1/feature_flags/{feature_flag_key}

Update feature flag.

Parameters

Name	In	Type	Required	Description
feature_flag_key	path	string	true	The key identifier for the feature flag.
name	query	string	true	The name of the flag.
description	query	string	true	Description of the flag purpose.
type	query	string	true	The variable type
allow_override_level	query	string	true	Allow the flag to be overridden at a different level.
default_value	query	string	true	Default value for the flag used by environments and organizations.
Enumerated Values

Parameter	Value
type	str
type	int
type	bool
allow_override_level	env
allow_override_level	org
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Feature flag successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:feature_flags )
Identities

Get identity

Code samples

GET /api/v1/identities/{identity_id}

Returns an identity by ID

Parameters

Name	In	Type	Required	Description
identity_id	path	string	true	The unique identifier for the identity.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Identity successfully retrieved.	identity
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:identities )
Update identity

Code samples

PATCH /api/v1/identities/{identity_id}

Update identity by ID.

Body parameter

{
  "is_primary": true
}
Parameters

Name	In	Type	Required	Description
identity_id	path	string	true	The unique identifier for the identity.
body	body	object	true	The fields of the identity to update.
» is_primary	body	boolean	false	Whether the identity is the primary for it's type
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Identity successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:identities )
Delete identity

Code samples

DELETE /api/v1/identities/{identity_id}

Delete identity by ID.

Parameters

Name	In	Type	Required	Description
identity_id	path	string	true	The unique identifier for the identity.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Identity successfully deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:identities )
Organizations

Get organization

Code samples

GET /api/v1/organization

Retrieve organization details by code.

Parameters

Name	In	Type	Required	Description
code	query	string	false	The organization's code.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Organization successfully retrieved.	get_organization_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:organizations )
Create organization

Code samples

POST /api/v1/organization

Create a new organization. To learn more read about multi tenancy using organizations

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	true	Organization details.
» name	body	string	true	The organization's name.
» feature_flags	body	object	false	The organization's feature flag settings.
»» additionalProperties	body	string	false	Value of the feature flag.
» external_id	body	string	false	The organization's external identifier - commonly used when migrating from or mapping to other systems.
» background_color	body	string	false	The organization's brand settings - background color.
» button_color	body	string	false	The organization's brand settings - button color.
» button_text_color	body	string	false	The organization's brand settings - button text color.
» link_color	body	string	false	The organization's brand settings - link color.
» background_color_dark	body	string	false	The organization's brand settings - dark mode background color.
» button_color_dark	body	string	false	The organization's brand settings - dark mode button color.
» button_text_color_dark	body	string	false	The organization's brand settings - dark mode button text color.
» link_color_dark	body	string	false	The organization's brand settings - dark mode link color.
» theme_code	body	string	false	The organization's brand settings - theme/mode 'light'
» handle	body	string	false	A unique handle for the organization - can be used for dynamic callback urls.
» is_allow_registrations	body	boolean	false	If users become members of this organization when the org code is supplied during authentication.
» is_custom_auth_connections_enabled	body	boolean	false	Enable custom auth connections for this organization.
Enumerated Values

Parameter	Value
»» additionalProperties	str
»» additionalProperties	int
»» additionalProperties	bool
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Organization successfully created.	create_organization_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:organizations )
Get organizations

Code samples

GET /api/v1/organizations

Get a list of organizations.

Parameters

Name	In	Type	Required	Description
sort	query	string	false	Field and order to sort the result by.
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
next_token	query	string	false	A string to get the next page of results if there are more results.
Enumerated Values

Parameter	Value
sort	name_asc
sort	name_desc
sort	email_asc
sort	email_desc
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Organizations successfully retreived.	get_organizations_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:organizations )
Update Organization

Code samples

PATCH /api/v1/organization/{org_code}

Update an organization.

Body parameter

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The identifier for the organization.
body	body	object	false	Organization details.
» name	body	string	false	The organization's name.
» external_id	body	string	false	The organization's ID.
» background_color	body	string	false	The organization's brand settings - background color.
» button_color	body	string	false	The organization's brand settings - button color.
» button_text_color	body	string	false	The organization's brand settings - button text color.
» link_color	body	string	false	The organization's brand settings - link color.
» background_color_dark	body	string	false	The organization's brand settings - dark mode background color.
» button_color_dark	body	string	false	The organization's brand settings - dark mode button color.
» button_text_color_dark	body	string	false	The organization's brand settings - dark mode button text color.
» link_color_dark	body	string	false	The organization's brand settings - dark mode link color.
» theme_code	body	string	false	The organization's brand settings - theme/mode.
» handle	body	string	false	The organization's handle.
» is_allow_registrations	body	boolean	false	Deprecated - Use 'is_auto_membership_enabled' instead.
» is_custom_auth_connections_enabled	body	boolean	false	Enable custom auth connections for this organization.
» is_auto_join_domain_list	body	boolean	false	Users can sign up to this organization.
» allowed_domains	body	[string]	false	Domains allowed for self-sign up to this environment.
Enumerated Values

Parameter	Value
» theme_code	light
» theme_code	dark
» theme_code	user_preference
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Organization successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:organizations )
Delete Organization

Code samples

DELETE /api/v1/organization/{org_code}

Delete an organization.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The identifier for the organization.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Organization successfully deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Unauthorized - invalid credentials.	error_response
404	Not Found	The specified resource was not found	not_found_response
429	Too Many Requests	Too many requests. Request was throttled.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:organizations )
List Organization Users

Code samples

GET /api/v1/organizations/{org_code}/users

Get users in an organization.

Parameters

Name	In	Type	Required	Description
sort	query	string	false	Field and order to sort the result by.
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
next_token	query	string	false	A string to get the next page of results if there are more results.
org_code	path	string	true	The organization's code.
permissions	query	string	false	Filter by user permissions comma separated (where all match)
roles	query	string	false	Filter by user roles comma separated (where all match)
Enumerated Values

Parameter	Value
sort	name_asc
sort	name_desc
sort	email_asc
sort	email_desc
sort	id_asc
sort	id_desc
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	A successful response with a list of organization users or an empty list.	get_organization_users_response
400	Bad Request	Error creating user	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:organization_users )
Add Organization Users

Code samples

POST /api/v1/organizations/{org_code}/users

Add existing users to an organization.

Body parameter

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
body	body	object	false	none
» users	body	[object]	false	Users to be added to the organization.
»» id	body	string	false	The users id.
»» roles	body	[string]	false	Role keys to assign to the user.
»» permissions	body	[string]	false	Permission keys to assign to the user.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Users successfully added.	add_organization_users_response
204	No Content	No users added.	None
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:organization_users )
Update Organization Users

Code samples

PATCH /api/v1/organizations/{org_code}/users

Update users that belong to an organization.

Body parameter

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
body	body	object	false	none
» users	body	[object]	false	Users to add, update or remove from the organization.
»» id	body	string	false	The users id.
»» operation	body	string	false	Optional operation, set to 'delete' to remove the user from the organization.
»» roles	body	[string]	false	Role keys to assign to the user.
»» permissions	body	[string]	false	Permission keys to assign to the user.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Users successfully removed.	update_organization_users_response
400	Bad Request	Error updating organization user.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:organization_users )
List Organization User Roles

Code samples

GET /api/v1/organizations/{org_code}/users/{user_id}/roles

Get roles for an organization user.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
user_id	path	string	true	The user's id.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	A successful response with a list of user roles.	get_organizations_user_roles_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:organization_user_roles )
Add Organization User Role

Code samples

POST /api/v1/organizations/{org_code}/users/{user_id}/roles

Add role to an organization user.

Body parameter

{
  "role_id": "string"
}
Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
user_id	path	string	true	The user's id.
body	body	object	true	Role details.
» role_id	body	string	false	The role id.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Role successfully added.	success_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:organization_user_roles )
Delete Organization User Role

Code samples

DELETE /api/v1/organizations/{org_code}/users/{user_id}/roles/{role_id}

Delete role for an organization user.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
user_id	path	string	true	The user's id.
role_id	path	string	true	The role id.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	User successfully removed.	success_response
400	Bad Request	Error creating user.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:organization_user_roles )
List Organization User Permissions

Code samples

GET /api/v1/organizations/{org_code}/users/{user_id}/permissions

Get permissions for an organization user.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
user_id	path	string	true	The user's id.
expand	query	string	false	Specify additional data to retrieve. Use "roles".
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	A successful response with a list of user permissions.	get_organizations_user_permissions_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:organization_user_permissions )
Add Organization User Permission

Code samples

POST /api/v1/organizations/{org_code}/users/{user_id}/permissions

Add permission to an organization user.

Body parameter

{
  "permission_id": "string"
}
Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
user_id	path	string	true	The user's id.
body	body	object	true	Permission details.
» permission_id	body	string	false	The permission id.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	User permission successfully updated.	success_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:organization_user_permissions )
Delete Organization User Permission

Code samples

DELETE /api/v1/organizations/{org_code}/users/{user_id}/permissions/{permission_id}

Delete permission for an organization user.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
user_id	path	string	true	The user's id.
permission_id	path	string	true	The permission id.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	User successfully removed.	success_response
400	Bad Request	Error creating user.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:organization_user_permissions )
Remove Organization User

Code samples

DELETE /api/v1/organizations/{org_code}/users/{user_id}

Remove user from an organization.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
user_id	path	string	true	The user's id.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	User successfully removed from organization	success_response
400	Bad Request	Error removing user	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:organization_users )
List Organization Feature Flags

Code samples

GET /api/v1/organizations/{org_code}/feature_flags

Get all organization feature flags.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The identifier for the organization.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Feature flag overrides successfully returned.	get_organization_feature_flags_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:organization_feature_flags )
Delete Organization Feature Flag Overrides

Code samples

DELETE /api/v1/organizations/{org_code}/feature_flags

Delete all organization feature flag overrides.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The identifier for the organization.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Feature flag overrides successfully deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:organization_feature_flags )
Delete Organization Feature Flag Override

Code samples

DELETE /api/v1/organizations/{org_code}/feature_flags/{feature_flag_key}

Delete organization feature flag override.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The identifier for the organization.
feature_flag_key	path	string	true	The identifier for the feature flag.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Feature flag override successfully deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:organization_feature_flags )
Update Organization Feature Flag Override

Code samples

PATCH /api/v1/organizations/{org_code}/feature_flags/{feature_flag_key}

Update organization feature flag override.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The identifier for the organization
feature_flag_key	path	string	true	The identifier for the feature flag
value	query	string	true	Override value
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Feature flag override successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:organization_feature_flags )
Update Organization Property value

Code samples

PUT /api/v1/organizations/{org_code}/properties/{property_key}

Update organization property value.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The identifier for the organization
property_key	path	string	true	The identifier for the property
value	query	string	true	The new property value
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Property successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:organization_properties )
Get Organization Property Values

Code samples

GET /api/v1/organizations/{org_code}/properties

Gets properties for an organization by org code.

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Properties successfully retrieved.	get_property_values_response
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:organization_properties )
Update Organization Property values

Code samples

PATCH /api/v1/organizations/{org_code}/properties

Update organization property values.

Body parameter

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The identifier for the organization
body	body	object	true	Properties to update.
» properties	body	object	true	Property keys and values
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Properties successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:organization_properties )
Delete organization handle

Code samples

DELETE /api/v1/organization/{org_code}/handle

Delete organization handle

Parameters

Name	In	Type	Required	Description
org_code	path	string	true	The organization's code.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Handle successfully deleted.	success_response
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:organization_handles )
Permissions

List Permissions

Code samples

GET /api/v1/permissions

The returned list can be sorted by permission name or permission ID in ascending or descending order. The number of records to return at a time can also be controlled using the page_size query string parameter.

Parameters

Name	In	Type	Required	Description
sort	query	string	false	Field and order to sort the result by.
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
next_token	query	string	false	A string to get the next page of results if there are more results.
Enumerated Values

Parameter	Value
sort	name_asc
sort	name_desc
sort	id_asc
sort	id_desc
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Permissions successfully retrieved.	get_permissions_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:permissions )
Create Permission

Code samples

POST /api/v1/permissions

Create a new permission.

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	false	Permission details.
» name	body	string	false	The permission's name.
» description	body	string	false	The permission's description.
» key	body	string	false	The permission identifier to use in code.
Example responses

201 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
201	Created	Permission successfully created	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:permissions )
Update Permission

Code samples

PATCH /api/v1/permissions/{permission_id}

Update permission

Body parameter

Parameters

Name	In	Type	Required	Description
permission_id	path	integer	true	The identifier for the permission.
body	body	object	false	Permission details.
» name	body	string	false	The permission's name.
» description	body	string	false	The permission's description.
» key	body	string	false	The permission identifier to use in code.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Permission successfully updated	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:permissions )
Delete Permission

Code samples

DELETE /api/v1/permissions/{permission_id}

Delete permission

Parameters

Name	In	Type	Required	Description
permission_id	path	string	true	The identifier for the permission.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	permission successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:permissions )
Properties

List properties

Code samples

GET /api/v1/properties

Returns a list of properties

Parameters

Name	In	Type	Required	Description
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
starting_after	query	string	false	The ID of the property to start after.
ending_before	query	string	false	The ID of the property to end before.
context	query	string	false	Filter results by User or Organization context
Enumerated Values

Parameter	Value
context	usr
context	org
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Properties successfully retrieved.	get_properties_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:properties )
Create Property

Code samples

POST /api/v1/properties

Create property.

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	true	Property details.
» name	body	string	true	The name of the property.
» description	body	string	false	Description of the property purpose.
» key	body	string	true	The property identifier to use in code.
» type	body	string	true	The property type.
» context	body	string	true	The context that the property applies to.
» is_private	body	boolean	true	Whether the property can be included in id and access tokens.
» category_id	body	string	true	Which category the property belongs to.
Enumerated Values

Parameter	Value
» type	single_line_text
» type	multi_line_text
» context	org
» context	usr
Example responses

201 Response

Responses

Status	Meaning	Description	Schema
201	Created	Property successfully created	create_property_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:properties )
Update Property

Code samples

PUT /api/v1/properties/{property_id}

Update property.

Body parameter

Parameters

Name	In	Type	Required	Description
property_id	path	string	true	The unique identifier for the property.
body	body	object	true	The fields of the property to update.
» name	body	string	true	The name of the property.
» description	body	string	false	Description of the property purpose.
» is_private	body	boolean	true	Whether the property can be included in id and access tokens.
» category_id	body	string	true	Which category the property belongs to.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Property successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:properties )
Delete Property

Code samples

DELETE /api/v1/properties/{property_id}

Delete property.

Parameters

Name	In	Type	Required	Description
property_id	path	string	true	The unique identifier for the property.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Property successfully deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:properties )
Property Categories

List categories

Code samples

GET /api/v1/property_categories

Returns a list of categories.

Parameters

Name	In	Type	Required	Description
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
starting_after	query	string	false	The ID of the category to start after.
ending_before	query	string	false	The ID of the category to end before.
context	query	string	false	Filter the results by User or Organization context
Enumerated Values

Parameter	Value
context	usr
context	org
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Categories successfully retrieved.	get_categories_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:property_categories )
Create Category

Code samples

POST /api/v1/property_categories

Create category.

Body parameter

{
  "name": "string",
  "context": "org"
}
Parameters

Name	In	Type	Required	Description
body	body	object	true	Category details.
» name	body	string	true	The name of the category.
» context	body	string	true	The context that the category applies to.
Enumerated Values

Parameter	Value
» context	org
» context	usr
Example responses

201 Response

Responses

Status	Meaning	Description	Schema
201	Created	Category successfully created	create_category_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:property_categories )
Update Category

Code samples

PUT /api/v1/property_categories/{category_id}

Update category.

Body parameter

Parameters

Name	In	Type	Required	Description
category_id	path	string	true	The unique identifier for the category.
body	body	object	true	The fields of the category to update.
» name	body	string	false	The name of the category.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	category successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:property_categories )
Roles

List Roles

Code samples

GET /api/v1/roles

The returned list can be sorted by role name or role ID in ascending or descending order. The number of records to return at a time can also be controlled using the page_size query string parameter.

Parameters

Name	In	Type	Required	Description
sort	query	string	false	Field and order to sort the result by.
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
next_token	query	string	false	A string to get the next page of results if there are more results.
Enumerated Values

Parameter	Value
sort	name_asc
sort	name_desc
sort	id_asc
sort	id_desc
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Roles successfully retrieved.	get_roles_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:roles )
Create Role

Code samples

POST /api/v1/roles

Create role.

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	false	Role details.
» name	body	string	false	The role's name.
» description	body	string	false	The role's description.
» key	body	string	false	The role identifier to use in code.
» is_default_role	body	boolean	false	Set role as default for new users.
Example responses

201 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
201	Created	Role successfully created	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:roles )
Get Role Permissions

Code samples

GET /api/v1/roles/{role_id}/permissions

Get permissions for a role.

Parameters

Name	In	Type	Required	Description
role_id	path	string	true	The role's public id.
sort	query	string	false	Field and order to sort the result by.
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
next_token	query	string	false	A string to get the next page of results if there are more results.
Enumerated Values

Parameter	Value
sort	name_asc
sort	name_desc
sort	id_asc
sort	id_desc
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	A list of permissions for a role	roles_permission_response
400	Bad Request	Error removing user	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:role_permissions )
Update Role Permissions

Code samples

PATCH /api/v1/roles/{role_id}/permissions

Update role permissions.

Body parameter

Parameters

Name	In	Type	Required	Description
role_id	path	string	true	The identifier for the role.
body	body	object	true	none
» permissions	body	[object]	false	Permissions to add or remove from the role.
»» id	body	string	false	The permission id.
»» operation	body	string	false	Optional operation, set to 'delete' to remove the permission from the role.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Permissions successfully updated.	update_role_permissions_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:role_permissions )
Remove Role Permission

Code samples

DELETE /api/v1/roles/{role_id}/permissions/{permission_id}

Remove a permission from a role.

Parameters

Name	In	Type	Required	Description
role_id	path	string	true	The role's public id.
permission_id	path	string	true	The permission's public id.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Permission successfully removed from role	success_response
400	Bad Request	Error removing user	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:role_permissions )
Update Role

Code samples

PATCH /api/v1/roles/{role_id}

Update a role

Body parameter

Parameters

Name	In	Type	Required	Description
role_id	path	string	true	The identifier for the role.
body	body	object	false	Role details.
» name	body	string	true	The role's name.
» description	body	string	false	The role's description.
» key	body	string	true	The role identifier to use in code.
» is_default_role	body	boolean	false	Set role as default for new users.
Example responses

201 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
201	Created	Role successfully updated	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:roles )
Delete Role

Code samples

DELETE /api/v1/roles/{role_id}

Delete role

Parameters

Name	In	Type	Required	Description
role_id	path	string	true	The identifier for the role.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Role successfully deleted.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:roles )
Subscribers

List Subscribers

Code samples

GET /api/v1/subscribers

The returned list can be sorted by full name or email address in ascending or descending order. The number of records to return at a time can also be controlled using the page_size query string parameter.

Parameters

Name	In	Type	Required	Description
sort	query	string	false	Field and order to sort the result by.
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
next_token	query	string	false	A string to get the next page of results if there are more results.
Enumerated Values

Parameter	Value
sort	name_asc
sort	name_desc
sort	email_asc
sort	email_desc
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Subscriber successfully retrieved.	get_subscribers_response
403	Forbidden	Bad request.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:subscribers )
Create Subscriber

Code samples

POST /api/v1/subscribers

Create subscriber.

Parameters

Name	In	Type	Required	Description
first_name	query	string	true	Subscriber's first name.
last_name	query	string	true	Subscriber's last name.
email	query	string	true	The email address of the subscriber.
Example responses

201 Response

Responses

Status	Meaning	Description	Schema
201	Created	Subscriber successfully created	create_subscriber_success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:subscribers )
Get Subscriber

Code samples

GET /api/v1/subscribers/{subscriber_id}

Retrieve a subscriber record.

Parameters

Name	In	Type	Required	Description
subscriber_id	path	string	true	The subscriber's id.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Subscriber successfully retrieved.	get_subscriber_response
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:subscribers )
Users

List Users

Code samples

GET /api/v1/users

The returned list can be sorted by full name or email address in ascending or descending order. The number of records to return at a time can also be controlled using the page_size query string parameter.

Parameters

Name	In	Type	Required	Description
page_size	query	integer	false	Number of results per page. Defaults to 10 if parameter not sent.
user_id	query	string	false	ID of the user to filter by.
next_token	query	string	false	A string to get the next page of results if there are more results.
email	query	string	false	Filter the results by email address. The query string should be comma separated and url encoded.
username	query	string	false	Filter the results by username. The query string should be comma separated and url encoded.
expand	query	string	false	Specify additional data to retrieve. Use "organizations" and/or "identities".
has_organization	query	boolean	false	Filter the results by if the user has at least one organization assigned.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Users successfully retrieved.	users_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:users )
Refresh User Claims and Invalidate Cache

Code samples

POST /api/v1/users/{user_id}/refresh_claims

Refreshes the user's claims and invalidates the current cache.

Parameters

Name	In	Type	Required	Description
user_id	path	string	true	The id of the user whose claims needs to be updated.
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Claims successfully refreshed.	success_response
400	Bad Request	Bad request.	error_response
403	Forbidden	Bad request.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:user_refresh_claims )
Get User

Code samples

GET /api/v1/user

Retrieve a user record.

Parameters

Name	In	Type	Required	Description
id	query	string	true	The user's id.
expand	query	string	false	Specify additional data to retrieve. Use "organizations" and/or "identities".
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	User successfully updated.	user
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:users )
Create User

Code samples

POST /api/v1/user

Creates a user record and optionally zero or more identities for the user. An example identity could be the email address of the user.

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	false	The details of the user to create.
» profile	body	object	false	Basic information required to create a user.
»» given_name	body	string	false	User's first name.
»» family_name	body	string	false	User's last name.
» organization_code	body	string	false	The unique code associated with the organization you want the user to join.
» provided_id	body	string	false	An external id to reference the user.
» identities	body	[object]	false	Array of identities to assign to the created user
»» type	body	string	false	The type of identity to create, for e.g. email.
»» details	body	object	false	Additional details required to create the user.
»»» email	body	string	false	The email address of the user.
»»» phone	body	string	false	The phone number of the user.
»»» username	body	string	false	The username of the user.
Enumerated Values

Parameter	Value
»» type	email
»» type	phone
»» type	username
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	User successfully created.	create_user_response
400	Bad Request	Error creating user.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:users )
Update User

Code samples

PATCH /api/v1/user

Update a user record.

Body parameter

Parameters

Name	In	Type	Required	Description
id	query	string	true	The user's id.
body	body	object	true	The user to update.
» given_name	body	string	false	User's first name.
» family_name	body	string	false	User's last name.
» is_suspended	body	boolean	false	Whether the user is currently suspended or not.
» is_password_reset_requested	body	boolean	false	Prompt the user to change their password on next sign in.
» provided_id	body	string	false	An external id to reference the user.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	User successfully updated.	update_user_response
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:users )
Delete User

Code samples

DELETE /api/v1/user

Delete a user record.

Parameters

Name	In	Type	Required	Description
id	query	string	true	The user's id.
is_delete_profile	query	boolean	false	Delete all data and remove the user's profile from all of Kinde, including the subscriber list
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	User successfully deleted.	success_response
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:users )
Update User Feature Flag Override

Code samples

PATCH /api/v1/users/{user_id}/feature_flags/{feature_flag_key}

Update user feature flag override.

Parameters

Name	In	Type	Required	Description
user_id	path	string	true	The identifier for the user
feature_flag_key	path	string	true	The identifier for the feature flag
value	query	string	true	Override value
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Feature flag override successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:user_feature_flags )
Update Property value

Code samples

PUT /api/v1/users/{user_id}/properties/{property_key}

Update property value.

Parameters

Name	In	Type	Required	Description
user_id	path	string	true	The identifier for the user
property_key	path	string	true	The identifier for the property
value	query	string	true	The new property value
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Property successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:user_properties )
Get property values

Code samples

GET /api/v1/users/{user_id}/properties

Gets properties for an user by ID.

Parameters

Name	In	Type	Required	Description
user_id	path	string	true	The user's ID.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Properties successfully retrieved.	get_property_values_response
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:user_properties )
Update Property values

Code samples

PATCH /api/v1/users/{user_id}/properties

Update property values.

Body parameter

Parameters

Name	In	Type	Required	Description
user_id	path	string	true	The identifier for the user
body	body	object	true	Properties to update.
» properties	body	object	true	Property keys and values
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	Properties successfully updated.	success_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:user_properties )
Set User password

Code samples

PUT /api/v1/users/{user_id}/password

Set user password.

Body parameter

Parameters

Name	In	Type	Required	Description
user_id	path	string	true	The identifier for the user
body	body	object	true	Password details.
» hashed_password	body	string	true	The hashed password.
» hashing_method	body	string	false	The hashing method or algorithm used to encrypt the user’s password. Default is bcrypt.
» salt	body	string	false	Extra characters added to passwords to make them stronger. Not required for bcrypt.
» salt_position	body	string	false	Position of salt in password string. Not required for bcrypt.
» is_temporary_password	body	boolean	false	The user will be prompted to set a new password after entering this one.
Enumerated Values

Parameter	Value
» hashing_method	bcrypt
» hashing_method	crypt
» hashing_method	md5
» hashing_method	wordpress
» salt_position	prefix
» salt_position	suffix
Example responses

200 Response

{
  "message": "Success",
  "code": "OK"
}
Responses

Status	Meaning	Description	Schema
200	OK	User successfully created.	success_response
400	Bad Request	Error creating user.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:user_passwords )
Get identities

Code samples

GET /api/v1/users/{user_id}/identities

Gets a list of identities for an user by ID.

Parameters

Name	In	Type	Required	Description
user_id	path	string	true	The user's ID.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Identities successfully retrieved.	get_identities_response
400	Bad Request	Bad request.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:user_identities )
Create identity

Code samples

POST /api/v1/users/{user_id}/identities

Creates an identity for a user.

Body parameter

Parameters

Name	In	Type	Required	Description
user_id	path	string	true	The user's ID.
body	body	object	false	The identity details.
» value	body	string	false	The email address, or username of the user.
» type	body	string	false	The identity type
» phone_country_id	body	string	false	The country code for the phone number, only required when identity type is 'phone'.
Enumerated Values

Parameter	Value
» type	email
» type	username
» type	phone
» type	enterprise
Example responses

201 Response

Responses

Status	Meaning	Description	Schema
201	Created	Identity successfully created.	create_identity_response
400	Bad Request	Error creating identity.	error_response
403	Forbidden	Invalid credentials.	None
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:user_identities )
Webhooks

Get Event

Code samples

GET /api/v1/events/{event_id}

Returns an event

Parameters

Name	In	Type	Required	Description
event_id	path	string	true	The event id.
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Event successfully retrieved.	get_event_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:events )
List Event Types

Code samples

GET /api/v1/event_types

Returns a list event type definitions

Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Event types successfully retrieved.	get_event_types_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:event_types )
Delete Webhook

Code samples

DELETE /api/v1/webhooks/{webhook_id}

Delete webhook

Parameters

Name	In	Type	Required	Description
webhook_id	path	string	true	The webhook id.
Example responses

200 Response

{
  "code": "string",
  "message": "string"
}
Responses

Status	Meaning	Description	Schema
200	OK	Webhook successfully deleted.	delete_webhook_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: delete:webhooks )
List Webhooks

Code samples

GET /api/v1/webhooks

List webhooks

Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Webhook list successfully returned.	get_webhooks_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: read:webhooks )
Create a Webhook

Code samples

POST /api/v1/webhooks

Create a webhook

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	true	Webhook request specification.
» endpoint	body	string	true	The webhook endpoint url
» event_types	body	[string]	true	Array of event type keys
» name	body	string	true	The webhook name
» description	body	string¦null	false	The webhook description
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Webhook successfully created.	create_webhook_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: create:webhooks )
Update a Webhook

Code samples

PATCH /api/v1/webhooks

Update a webhook

Body parameter

Parameters

Name	In	Type	Required	Description
body	body	object	true	Update webhook request specification.
» event_types	body	[string]	false	Array of event type keys
» name	body	string	false	The webhook name
» description	body	string¦null	false	The webhook description
Example responses

200 Response

Responses

Status	Meaning	Description	Schema
200	OK	Webhook successfully updated.	update_webhook_response
400	Bad Request	Invalid request.	error_response
403	Forbidden	Invalid credentials.	error_response
429	Too Many Requests	Request was throttled.	None
To perform this operation, you must be authenticated by means of one of the following methods: ManagementAPI ( Scopes: update:webhooks )
Schemas

success_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	none
code	string	false	none	none
error

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Error code.
message	string	false	none	Error message.
error_response

Properties

Name	Type	Required	Restrictions	Description
errors	[error]	false	none	none
not_found_response

Properties

Name	Type	Required	Restrictions	Description
errors	object	false	none	none
» code	string	false	none	none
» message	string	false	none	none
get_apis_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
next_token	string	false	none	Pagination token.
apis	[object]	false	none	none
» id	string	false	none	The unique ID for the API.
» name	string	false	none	The API’s name.
» audience	string	false	none	A unique identifier for the API - commonly the URL. This value will be used as the audience parameter in authorization claims.
» is_management_api	boolean	false	none	Whether or not it is the Kinde management API.
create_apis_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	A Kinde generated message.
code	string	false	none	A Kinde generated status code.
api	object	false	none	none
» id	string	false	none	The unique ID for the API.
get_business_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
business	object	false	none	none
» code	string	false	none	The unique ID for the business.
» name	string	false	none	Your business's name.
» phone	string¦null	false	none	Phone number associated with business.
» email	string¦null	false	none	Email address associated with business.
» industry	string¦null	false	none	The industry your business is in.
» timezone	string¦null	false	none	The timezone your business is in.
» privacy_url	string¦null	false	none	Your Privacy policy URL.
» terms_url	string¦null	false	none	Your Terms and Conditions URL.
get_industries_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
industries	[object]	false	none	none
» key	string	false	none	The unique key for the industry.
» name	string	false	none	The display name for the industry.
get_timezones_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
timezones	[object]	false	none	none
» key	string	false	none	The unique key for the timezone.
» name	string	false	none	The display name for the timezone.
get_api_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
api	object	false	none	none
» id	string	false	none	Unique ID of the API.
» name	string	false	none	The API’s name.
» audience	string	false	none	A unique identifier for the API - commonly the URL. This value will be used as the audience parameter in authorization claims.
» is_management_api	boolean	false	none	Whether or not it is the Kinde management API.
» applications	[object]	false	none	none
»» id	string	false	none	The Client ID of the application.
»» name	string	false	none	The application's name.
»» type	string	false	none	The application's type.
»» is_active	boolean¦null	false	none	Whether or not the application is authorized to access the API
Enumerated Values

Property	Value
type	Machine to machine (M2M)
type	Back-end web
type	Front-end and mobile
authorize_app_api_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	none
code	string	false	none	none
applications_disconnected	[string]	false	none	none
applications_connected	[string]	false	none	none
delete_api_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	none
code	string	false	none	none
user

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	Unique id of the user in Kinde.
provided_id	string	false	none	External id for user.
preferred_email	string	false	none	Default email address of the user in Kinde.
username	string	false	none	Primary username of the user in Kinde.
last_name	string	false	none	User's last name.
first_name	string	false	none	User's first name.
is_suspended	boolean	false	none	Whether the user is currently suspended or not.
picture	string	false	none	User's profile picture URL.
total_sign_ins	integer¦null	false	none	Total number of user sign ins.
failed_sign_ins	integer¦null	false	none	Number of consecutive failed user sign ins.
last_signed_in	string¦null	false	none	Last sign in date in ISO 8601 format.
created_on	string¦null	false	none	Date of user creation in ISO 8601 format.
organizations	[string]	false	none	Array of organizations a user belongs to.
identities	[object]	false	none	Array of identities belonging to the user.
» type	string	false	none	none
» identity	string	false	none	none
update_user_response

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	Unique id of the user in Kinde.
given_name	string	false	none	User's first name.
family_name	string	false	none	User's last name.
email	string	false	none	User's preferred email.
is_suspended	boolean	false	none	Whether the user is currently suspended or not.
is_password_reset_requested	boolean	false	none	Whether a password reset has been requested.
picture	string	false	none	User's profile picture URL.
users

Array of users.

Properties

Name	Type	Required	Restrictions	Description
anonymous	[user]	false	none	Array of users.
users_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
users	[object]	false	none	none
» id	string	false	none	Unique id of the user in Kinde.
» provided_id	string	false	none	External id for user.
» email	string	false	none	Default email address of the user in Kinde.
» username	string	false	none	Primary username of the user in Kinde.
» last_name	string	false	none	User's last name.
» first_name	string	false	none	User's first name.
» is_suspended	boolean	false	none	Whether the user is currently suspended or not.
» picture	string	false	none	User's profile picture URL.
» total_sign_ins	integer¦null	false	none	Total number of user sign ins.
» failed_sign_ins	integer¦null	false	none	Number of consecutive failed user sign ins.
» last_signed_in	string¦null	false	none	Last sign in date in ISO 8601 format.
» created_on	string¦null	false	none	Date of user creation in ISO 8601 format.
» organizations	[string]	false	none	Array of organizations a user belongs to.
» identities	[object]	false	none	Array of identities belonging to the user.
»» type	string	false	none	none
»» identity	string	false	none	none
next_token	string	false	none	Pagination token.
create_user_response

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	Unique id of the user in Kinde.
created	boolean	false	none	True if the user was successfully created.
identities	[user_identity]	false	none	none
create_organization_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	Response message.
code	string	false	none	Response code.
organization	object	false	none	none
» code	string	false	none	The organization's unique code.
user_identity

Properties

Name	Type	Required	Restrictions	Description
type	string	false	none	The type of identity object created.
result	object	false	none	The result of the user creation operation.
» created	boolean	false	none	True if the user identity was successfully created.
user_profile

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	Unique id of the user in Kinde.
preferred_email	string	false	none	Default email address of the user in Kinde.
username	string	false	none	Primary username of the user in Kinde.
provided_id	string¦null	false	none	Value of the user's id in a third-party system when the user is imported into Kinde.
last_name	string	false	none	User's last name.
first_name	string	false	none	User's first name.
picture	string	false	none	URL that point's to the user's picture or avatar
create_property_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	none
code	string	false	none	none
property	object	false	none	none
» id	string	false	none	The property's ID.
create_identity_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	none
code	string	false	none	none
identity	object	false	none	none
» id	string	false	none	The identity's ID.
get_identities_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
identities	[identity]	false	none	none
has_more	boolean	false	none	Whether more records exist.
get_properties_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
properties	[property]	false	none	none
has_more	boolean	false	none	Whether more records exist.
get_property_values_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
properties	[property_value]	false	none	none
next_token	string	false	none	Pagination token.
create_category_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	none
code	string	false	none	none
category	object	false	none	none
» id	string	false	none	The category's ID.
get_categories_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
categories	[category]	false	none	none
has_more	boolean	false	none	Whether more records exist.
get_event_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
event	object	false	none	none
» type	string	false	none	none
» source	string	false	none	none
» event_id	string	false	none	none
» timestamp	string	false	none	Timestamp in ISO 8601 format.
» data	object	false	none	Event specific data object.
get_event_types_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
event_types	[event_type]	false	none	none
get_webhooks_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
webhooks	[webhook]	false	none	none
webhook

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
name	string	false	none	none
endpoint	string	false	none	none
description	string	false	none	none
event_types	[string]	false	none	none
created_on	string	false	none	Created on date in ISO 8601 format.
create_webhook_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
webhook	object	false	none	none
» id	string	false	none	none
» endpoint	string	false	none	none
update_webhook_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	none
code	string	false	none	none
webhook	object	false	none	none
» id	string	false	none	none
create_connection_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	none
code	string	false	none	none
connection	object	false	none	none
» id	string	false	none	The connection's ID.
get_connections_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
connections	[connection]	false	none	none
has_more	boolean	false	none	Whether more records exist.
delete_webhook_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
event_type

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
code	string	false	none	none
name	string	false	none	none
origin	string	false	none	none
schema	object	false	none	none
token_introspect

Properties

Name	Type	Required	Restrictions	Description
active	boolean	false	none	Indicates the status of the token.
aud	[string]	false	none	Array of intended token recipients.
client_id	string	false	none	Identifier for the requesting client.
exp	string	false	none	Token expiration timestamp.
iat	string	false	none	Token issuance timestamp.
token_error_response

Properties

Name	Type	Required	Restrictions	Description
error	string	false	none	Error.
error_description	string	false	none	The error description.
user_profile_v2

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	Unique id of the user in Kinde (deprecated).
sub	string	false	none	Unique id of the user in Kinde.
provided_id	string¦null	false	none	Value of the user's id in a third-party system when the user is imported into Kinde.
name	string	false	none	User's first and last name separated by a space.
given_name	string	false	none	User's first name.
family_name	string	false	none	User's last name.
updated_at	integer	false	none	Date the user was last updated at (In Unix time).
email	string	false	none	User's email address if available.
picture	string	false	none	URL that point's to the user's picture or avatar
organization_item_schema

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	The unique identifier for the organization.
name	string	false	none	The organization's name.
handle	string¦null	false	none	A unique handle for the organization - can be used for dynamic callback urls.
is_default	boolean	false	none	Whether the organization is the default organization.
external_id	string¦null	false	none	The organization's external identifier - commonly used when migrating from or mapping to other systems.
is_auto_membership_enabled	boolean	false	none	If users become members of this organization when the org code is supplied during authentication.
get_organization_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	The unique identifier for the organization.
name	string	false	none	The organization's name.
handle	string¦null	false	none	A unique handle for the organization - can be used for dynamic callback urls.
is_default	boolean	false	none	Whether the organization is the default organization.
external_id	string¦null	false	none	The organization's external identifier - commonly used when migrating from or mapping to other systems.
is_auto_membership_enabled	boolean	false	none	If users become members of this organization when the org code is supplied during authentication.
logo	string¦null	false	none	none
link_color	object¦null	false	none	none
» raw	string	false	none	none
» hex	string	false	none	none
» hsl	string	false	none	none
background_color	object¦null	false	none	none
» raw	string	false	none	none
» hex	string	false	none	none
» hsl	string	false	none	none
button_color	object¦null	false	none	none
» raw	string	false	none	none
» hex	string	false	none	none
» hsl	string	false	none	none
button_text_color	object¦null	false	none	none
» raw	string	false	none	none
» hex	string	false	none	none
» hsl	string	false	none	none
link_color_dark	object¦null	false	none	none
» raw	string	false	none	none
» hex	string	false	none	none
» hsl	string	false	none	none
background_color_dark	object¦null	false	none	none
» raw	string	false	none	none
» hex	string	false	none	none
» hsl	string	false	none	none
button_text_color_dark	object¦null	false	none	none
» raw	string	false	none	none
» hex	string	false	none	none
» hsl	string	false	none	none
button_color_dark	object¦null	false	none	none
» raw	string	false	none	none
» hex	string	false	none	none
» hsl	string	false	none	none
is_allow_registrations	boolean¦null	false	none	Deprecated - Use 'is_auto_membership_enabled' instead
organization_user

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
email	string	false	none	none
full_name	string	false	none	none
last_name	string	false	none	none
first_name	string	false	none	none
picture	string	false	none	none
roles	[string]	false	none	none
category

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
name	string	false	none	none
connection

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
name	string	false	none	none
display_name	string	false	none	none
strategy	string	false	none	none
identity

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
type	string	false	none	none
is_confirmed	boolean	false	none	none
created_on	string	false	none	Date of user creation in ISO 8601 format.
last_login_on	string	false	none	Date of user creation in ISO 8601 format.
total_logins	integer	false	none	none
name	string	false	none	none
property

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
key	string	false	none	none
name	string	false	none	none
is_private	boolean	false	none	none
description	string	false	none	none
is_kinde_property	boolean	false	none	none
property_value

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
name	string	false	none	none
description	string	false	none	none
key	string	false	none	none
value	string	false	none	none
role

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
key	string	false	none	none
name	string	false	none	none
description	string	false	none	none
subscribers_subscriber

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
email	string	false	none	none
full_name	string	false	none	none
first_name	string	false	none	none
last_name	string	false	none	none
subscriber

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
preferred_email	string	false	none	none
first_name	string	false	none	none
last_name	string	false	none	none
organization_user_role

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
key	string	false	none	none
name	string	false	none	none
organization_user_role_permissions

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
role	string	false	none	none
permissions	object	false	none	none
» key	string	false	none	none
organization_user_permission

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
key	string	false	none	none
name	string	false	none	none
description	string	false	none	none
roles	[object]	false	none	none
» id	string	false	none	none
» key	string	false	none	none
organization_users

Properties

Name	Type	Required	Restrictions	Description
anonymous	[organization_user]	false	none	none
get_subscriber_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
subscribers	[subscriber]	false	none	none
get_subscribers_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
subscribers	[subscribers_subscriber]	false	none	none
next_token	string	false	none	Pagination token.
get_roles_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
roles	[roles]	false	none	none
next_token	string	false	none	Pagination token.
get_organizations_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
organizations	[organization_item_schema]	false	none	none
next_token	string	false	none	Pagination token.
get_organization_users_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
organization_users	[organization_user]	false	none	none
next_token	string	false	none	Pagination token.
get_organizations_user_roles_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
roles	[organization_user_role]	false	none	none
next_token	string	false	none	Pagination token.
get_organizations_user_permissions_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
permissions	[organization_user_permission]	false	none	none
get_organization_feature_flags_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
feature_flags	object	false	none	The environment's feature flag settings.
» additionalProperties	object	false	none	none
»» type	string	false	none	none
»» value	string	false	none	none
Enumerated Values

Property	Value
type	str
type	int
type	bool
get_environment_feature_flags_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
feature_flags	object	false	none	The environment's feature flag settings.
» additionalProperties	object	false	none	none
»» type	string	false	none	none
»» value	string	false	none	none
next_token	string	false	none	Pagination token.
Enumerated Values

Property	Value
type	str
type	int
type	bool
add_organization_users_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
users_added	[string]	false	none	none
update_role_permissions_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	none
message	string	false	none	none
permissions_added	[string]	false	none	none
permissions_removed	[string]	false	none	none
update_organization_users_response

Properties

Name	Type	Required	Restrictions	Description
message	string	false	none	none
users_added	[string]	false	none	none
users_updated	[string]	false	none	none
users_removed	[string]	false	none	none
connected_apps_auth_url

Properties

Name	Type	Required	Restrictions	Description
url	string	false	none	A URL that is used to authenticate an end-user against a connected app.
session_id	string	false	none	A unique identifier for the login session.
create_subscriber_success_response

Properties

Name	Type	Required	Restrictions	Description
subscriber	object	false	none	none
» subscriber_id	string	false	none	A unique identifier for the subscriber.
connected_apps_access_token

Properties

Name	Type	Required	Restrictions	Description
access_token	string	false	none	The access token to access a third-party provider.
access_token_expiry	string	false	none	The date and time that the access token expires.
api_result

 {
  "result": "string"
}

Properties

Name	Type	Required	Restrictions	Description
result	string	false	none	The result of the api operation.
create_application_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
application	object	false	none	none
» id	string	false	none	The application's identifier.
» client_id	string	false	none	The application's client id.
» client_secret	string	false	none	The application's client secret.
get_application_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
application	object	false	none	none
» id	string	false	none	The application's identifier.
» name	string	false	none	The application's name.
» type	string	false	none	The application's type.
» client_id	string	false	none	The application's client id.
» client_secret	string	false	none	The application's client secret.
» login_uri	string	false	none	The default login route for resolving session issues.
» homepage_uri	string	false	none	The homepage link to your application.
applications

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
name	string	false	none	none
type	string	false	none	none
get_applications_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
applications	[applications]	false	none	none
next_token	string	false	none	Pagination token.
redirect_callback_urls

Properties

Name	Type	Required	Restrictions	Description
redirect_urls	[string]	false	none	An application's redirect URLs.
get_redirect_callback_urls_response

Properties

Name	Type	Required	Restrictions	Description
redirect_urls	[redirect_callback_urls]	false	none	An application's redirect callback URLs.
logout_redirect_urls

Properties

Name	Type	Required	Restrictions	Description
redirect_urls	[string]	false	none	An application's logout URLs.
get_permissions_response

Properties

Name	Type	Required	Restrictions	Description
code	string	false	none	Response code.
message	string	false	none	Response message.
permissions	[permissions]	false	none	none
next_token	string	false	none	Pagination token.
permissions

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	The permission's id.
key	string	false	none	The permission identifier to use in code.
name	string	false	none	The permission's name.
description	string	false	none	The permission's description.
roles

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	The role's id.
key	string	false	none	The role identifier to use in code.
name	string	false	none	The role's name.
description	string	false	none	The role's description.
roles_permission_response

Properties

Name	Type	Required	Restrictions	Description
id	string	false	none	none
key	string	false	none	none
name	string	false	none	none
description	string	false	none	none
