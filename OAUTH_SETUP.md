# OAuth Login System Setup Guide

## Overview
This guide will help you set up real Google and Facebook OAuth authentication for your FOXIWEAR® website.

## Prerequisites
- A Google account
- A Facebook account
- Access to Google Cloud Console
- Access to Facebook Developers

---

## Part 1: Google OAuth Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: "FOXIWEAR Login"
5. Click "CREATE"

### Step 2: Enable Google+ API
1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "ENABLE"

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields (app name, user support email, etc.)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (your email)
4. For Application type, select "Web application"
5. Add Authorized redirect URIs:
   ```
   http://localhost:3000
   http://localhost:8000
   http://127.0.0.1:5500
   https://yourdomain.com
   https://www.yourdomain.com
   ```
6. Click "CREATE"
7. Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### Step 4: Add Google Client ID to Your Project
1. Open `assets/js/oauth-config.js`
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID:
   ```javascript
   google: {
     clientId: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com'
   }
   ```

---

## Part 2: Facebook OAuth Setup

### Step 1: Create a Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" > "Create App"
3. Choose app type: "Consumer"
4. Fill in app details:
   - App Name: "FOXIWEAR Login"
   - App Contact Email: your email
   - App Purpose: Select appropriate category
5. Click "Create App"

### Step 2: Add Facebook Login Product
1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" as your platform
4. Skip the quick start

### Step 3: Configure Facebook Login Settings
1. Go to "Settings" > "Basic"
2. Copy your **App ID** and **App Secret**
3. Go to "Products" > "Facebook Login" > "Settings"
4. Add Valid OAuth Redirect URIs:
   ```
   http://localhost:3000
   http://localhost:8000
   http://127.0.0.1:5500
   https://yourdomain.com
   https://www.yourdomain.com
   ```
5. Save changes

### Step 4: Add Facebook App ID to Your Project
1. Open `assets/js/oauth-config.js`
2. Replace `YOUR_FACEBOOK_APP_ID` with your actual App ID:
   ```javascript
   facebook: {
     appId: 'YOUR_ACTUAL_APP_ID',
     version: 'v18.0'
   }
   ```

---

## Part 3: Testing the Login System

### Local Testing
1. Start a local server (if not already running):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

2. Open your browser to `http://localhost:8000` (or your server port)

3. Click the "LOGIN" button in the navbar

4. Try logging in with:
   - **Google**: Click the Google button
   - **Facebook**: Click the Facebook button
   - **Email/Password**: Create an account or use test credentials

### What to Expect
- Google login will show a sign-in popup or one-tap prompt
- Facebook login will show a Facebook login dialog
- On successful login, user data is saved to localStorage
- The navbar account icon will show the user's initial
- User can logout from the account menu

---

## Part 4: Production Deployment

### Before Going Live
1. **Update Redirect URIs**: Add your production domain to both Google and Facebook
2. **Security**: 
   - Never commit real credentials to version control
   - Use environment variables for production
   - Verify tokens on your backend (don't trust client-side only)
3. **HTTPS**: Ensure your site uses HTTPS in production
4. **Privacy Policy**: Add privacy policy and terms of service
5. **Backend Integration**: 
   - Verify OAuth tokens on your server
   - Store user data securely in a database
   - Implement proper session management

### Environment Variables (Recommended for Production)
```javascript
// Instead of hardcoding, use environment variables
const OAUTH_CONFIG = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    version: 'v18.0'
  }
};
```

---

## Part 5: Troubleshooting

### Google Login Not Working
- **Issue**: "Google Sign-In not loaded"
  - Solution: Check internet connection, verify Client ID is correct
- **Issue**: "Redirect URI mismatch"
  - Solution: Add your current URL to Google Cloud Console redirect URIs
- **Issue**: CORS errors
  - Solution: Ensure you're using the correct Client ID for your domain

### Facebook Login Not Working
- **Issue**: "Facebook SDK not loaded"
  - Solution: Check internet connection, verify App ID is correct
- **Issue**: "App not set up"
  - Solution: Ensure Facebook Login product is added and configured
- **Issue**: Email not returned
  - Solution: Make sure user has public email on Facebook, or request email permission

### General Issues
- Clear browser cache and localStorage
- Check browser console for error messages
- Verify OAuth credentials are correctly entered
- Test in incognito/private mode to avoid cache issues

---

## File Structure

```
assets/
├── js/
│   ├── oauth-config.js          ← OAuth credentials (UPDATE THIS)
│   ├── login.js                 ← Login system logic
│   └── login-system.css         ← Login styling
└── css/
    └── login-system.css         ← Additional styles
```

---

## Security Notes

⚠️ **Important**: 
- Never expose your OAuth secrets in client-side code
- Always verify tokens on your backend
- Use HTTPS in production
- Implement proper CSRF protection
- Store user data securely
- Follow OAuth 2.0 best practices

---

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your OAuth credentials are correct
3. Ensure redirect URIs match your current domain
4. Check Google Cloud Console and Facebook Developers for any warnings
5. Review the official documentation:
   - [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web)
   - [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)

---

## Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Set up Facebook OAuth credentials
3. ✅ Update `oauth-config.js` with your credentials
4. ✅ Test login functionality locally
5. ✅ Deploy to production with proper security measures
6. ✅ Monitor for any authentication issues

Happy coding! 🦊
