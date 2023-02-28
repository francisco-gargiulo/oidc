# Authorization Server

This is an Authorization Server built using Node.js and Express.js. It provides endpoints for authentication, authorization, and token issuance for a client application.

## Requirements

The following packages are required to run this application:

- express
- body-parser
- crypto
- jsonwebtoken

## Usage

To start the server, run the following command:

    node app.js

The server will start listening on port 3000.

## Endpoints

### Authorization Endpoint

    GET /authorize

This endpoint initiates the authorization flow. The client application should redirect the user to this endpoint with the following query parameters:

- `response_type`: The value should be `code` for this flow.
- `client_id`: The client ID provided by the authorization server.
- `redirect_uri`: The URI to which the authorization server will redirect the user after authentication.
- `scope`: The scope of the access being requested.

If the request is valid, the authorization server will redirect the user to the login page.

### Login Endpoint

    GET /login

This endpoint renders the login form. The user must enter their email and password to authenticate.

    POST /login

This endpoint handles the login request. If the user's credentials are valid, the authorization server will generate an authorization code and redirect the user to the client application with the authorization code and the state parameter.

### Token Endpoint

    POST /token

This endpoint issues access tokens and ID tokens in exchange for authorization codes. The client application should send a POST request with the following parameters in the request body:

- `grant_type`: The value should be `authorization_code` for this flow.
- `client_id`: The client ID provided by the authorization server.
- `client_secret`: The client secret provided by the authorization server.
- `code`: The authorization code received from the authorization server.
- `redirect_uri`: The same redirect URI used in the authorization request.

If the request is valid, the authorization server will generate an access token and an ID token and send them in the response.

### Userinfo Endpoint

    GET /userinfo

This endpoint returns information about the authenticated user. The client application should send a GET request with the access token in the Authorization header as a Bearer token. If the access token is valid, the authorization server will return the user's email and ID.

## Dependencies

This application requires the following dependencies:

- express: A web framework for Node.js
- body-parser: Middleware for parsing HTTP request bodies
- crypto: A library for cryptographic operations
- jsonwebtoken: A library for JSON Web Tokens (JWTs)

## References

- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)
- [OpenID Connect Dynamic Client Registration 1.0](https://openid.net/specs/openid-connect-registration-1_0.html)
- [OpenID Connect Session Management 1.0](https://openid.net/specs/openid-connect-session-1_0.html)
- [OpenID Connect Front-Channel Logout 1.0](https://openid.net/specs/openid-connect-frontchannel-1_0.html)
- [OpenID Connect Back-Channel Logout 1.0](https://openid.net/specs/openid-connect-backchannel-1_0.html)
- [OpenID Connect Multiple Response Types 1.0](https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html)
- [OpenID Connect Form Post Response Mode 1.0](https://openid.net/specs/oauth-v2-form-post-response-mode-1_0.html)
- [OpenID Connect Token Introspection 1.0](https://openid.net/specs/openid-connect-token-introspection-1_0.html)
- [OpenID Connect UserInfo 1.0](https://openid.net/specs/openid-connect-userinfo-1_0.html)
- [OpenID Connect Basic Client Profile 1.0](https://openid.net/specs/openid-connect-basic-1_0.html)
- [OpenID Connect Implicit Client Profile 1.0](https://openid.net/specs/openid-connect-implicit-1_0.html)
- [OpenID Connect Hybrid Client Profile 1.0](https://openid.net/specs/openid-connect-hybrid-1_0.html)
- [OpenID Connect Client Initiated Backchannel Authentication Flow 1.0](https://openid.net/specs/openid-connect-ci-1_0.html)
- [OpenID Connect Front-Channel Logout 1.0](https://openid.net/specs/openid-connect-frontchannel-1_0.html)
- [OpenID Connect Back-Channel Logout 1.0](https://openid.net/specs/openid-connect-backchannel-1_0.html)
- [OpenID Connect Discovery 1.0](https://openid.net/specs/openid-connect-discovery-1_0.html)
- [OpenID Connect Dynamic Client Registration 1.0](https://openid.net/specs/openid-connect-registration-1_0.html)
- [OpenID Connect Session Management 1.0](https://openid.net/specs/openid-connect-session-1_0.html)
- [OpenID Connect Multiple Response Types 1.0](https://openid.net/specs/oauth-v2-multiple-response-types-1_0.html)
