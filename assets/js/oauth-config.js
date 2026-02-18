// OAuth Configuration
// Add your OAuth credentials here

const OAUTH_CONFIG = {
  google: {
    clientId: ''
    // Get this from: https://console.cloud.google.com/
    // Steps:
    // 1. Create a new project
    // 2. Enable Google+ API
    // 3. Create OAuth 2.0 Client ID (Web application)
    // 4. Add authorized redirect URIs:
    //    - http://localhost:3000
    //    - http://localhost:8000
    //    - https://yourdomain.com
    // 5. Copy the Client ID here
  },
  facebook: {
    appId: 'YOUR_FACEBOOK_APP_ID',
    version: 'v18.0'
    // Get this from: https://developers.facebook.com/
    // Steps:
    // 1. Create a new app
    // 2. Add "Facebook Login" product
    // 3. Configure OAuth Redirect URIs:
    //    - http://localhost:3000
    //    - http://localhost:8000
    //    - https://yourdomain.com
    // 4. Copy the App ID here
  }
};
