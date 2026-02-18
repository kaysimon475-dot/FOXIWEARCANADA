// Login System
class LoginSystem {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateNavbarUI();
  }

  setupEventListeners() {
    // Login/profile button click
    const loginBtn = document.querySelector('.shop-header-account-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        // If logged in, toggle the profile menu. Otherwise open login modal.
        if (this.currentUser) {
          e.preventDefault();
          this.toggleUserMenu();
          return;
        }
        this.openLoginModal();
      });
    }

    // Dedicated LOGIN button
    const dedicatedLoginBtn = document.getElementById('loginBtn');
    if (dedicatedLoginBtn) {
      dedicatedLoginBtn.addEventListener('click', () => this.openLoginModal());
    }

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.login-modal-close');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.closeLoginModal());
    });

    // Modal backdrop click
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeLoginModal();
        }
      });
    }

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }

    // Toggle between login and signup
    const toggleSignup = document.getElementById('toggleSignup');
    if (toggleSignup) {
      toggleSignup.addEventListener('click', () => this.toggleForms());
    }

    const toggleLogin = document.getElementById('toggleLogin');
    if (toggleLogin) {
      toggleLogin.addEventListener('click', () => this.toggleForms());
    }

    // Logout button (may be dynamically created)
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const logoutBtn = target.closest('#logoutBtn');
      if (logoutBtn) {
        e.preventDefault();
        this.logout();
      }
    });

    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const userMenu = document.getElementById('userMenu');
      const accountBtn = document.querySelector('.shop-header-account-btn');
      if (!userMenu || !accountBtn) return;

      const clickedInsideMenu = userMenu.contains(target);
      const clickedAccountBtn = accountBtn.contains(target);

      if (!clickedInsideMenu && !clickedAccountBtn) {
        userMenu.classList.remove('show');
      }
    });

    // Social login buttons
    const googleBtn = document.getElementById('googleLogin');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.handleGoogleLogin());
    }

    const facebookBtn = document.getElementById('facebookLogin');
    if (facebookBtn) {
      facebookBtn.addEventListener('click', () => this.handleFacebookLogin());
    }

    const appleBtn = document.getElementById('appleLogin');
    if (appleBtn) {
      appleBtn.addEventListener('click', () => this.handleAppleLogin());
    }
  }

  openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
      loginForm.classList.toggle('hidden');
      signupForm.classList.toggle('hidden');
    }
  }

  handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Validate inputs
    if (!email || !password) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    // Find user
    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      this.showMessage('User not found', 'error');
      return;
    }

    // Check password (in production, use proper hashing)
    if (user.password !== password) {
      this.showMessage('Invalid password', 'error');
      return;
    }

    // Login successful
    this.currentUser = user;
    this.saveCurrentUser();
    this.showMessage('Login successful!', 'success');
    
    setTimeout(() => {
      this.closeLoginModal();
      this.updateNavbarUI();
      document.getElementById('loginForm').reset();
    }, 1500);
  }

  handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    // Validate email format
    if (!this.isValidEmail(email)) {
      this.showMessage('Please enter a valid email', 'error');
      return;
    }

    // Check if user already exists
    if (this.users.find(u => u.email === email)) {
      this.showMessage('Email already registered', 'error');
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }

    // Check password strength
    if (password.length < 6) {
      this.showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name: name,
      email: email,
      password: password,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    
    this.showMessage('Account created successfully! Please login.', 'success');
    
    setTimeout(() => {
      this.toggleForms();
      document.getElementById('signupForm').reset();
    }, 1500);
  }

  logout() {
    this.currentUser = null;
    this.saveCurrentUser();
    this.updateNavbarUI();
    this.showMessage('Logged out successfully', 'success');

    const userMenu = document.getElementById('userMenu');
    if (userMenu) userMenu.classList.remove('show');
  }

  // Real Google OAuth Implementation
  handleGoogleLogin() {
    // Check if Google Sign-In is available
    if (typeof google === 'undefined' || !google.accounts) {
      this.showMessage('Google Sign-In not loaded. Please check your internet connection.', 'error');
      return;
    }

    // Check if config is available
    if (typeof OAUTH_CONFIG === 'undefined' || !OAUTH_CONFIG.google.clientId) {
      this.showMessage('Google OAuth not configured. Please add your Client ID to oauth-config.js', 'error');
      return;
    }

    // Initialize Google Sign-In
    google.accounts.id.initialize({
      client_id: OAUTH_CONFIG.google.clientId,
      callback: (response) => this.handleGoogleResponse(response)
    });

    // Trigger the sign-in flow
    google.accounts.id.renderButton(
      document.getElementById('googleLoginBtn') || document.body,
      { theme: 'dark', size: 'large' }
    );

    // Programmatically trigger sign-in
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: trigger one-tap
        const button = document.getElementById('googleLoginBtn');
        if (button) {
          button.click();
        }
      }
    });
  }

  handleGoogleResponse(response) {
    if (response.credential) {
      try {
        // Decode JWT token (basic decoding - in production, verify on backend)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userData = JSON.parse(jsonPayload);

        const googleUser = {
          id: userData.sub,
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
          provider: 'google',
          createdAt: new Date().toISOString()
        };

        this.currentUser = googleUser;
        this.saveCurrentUser();
        this.showMessage(`Welcome ${googleUser.name}! Logged in with Google.`, 'success');

        setTimeout(() => {
          this.closeLoginModal();
          this.updateNavbarUI();
        }, 1500);
      } catch (error) {
        console.error('Error processing Google response:', error);
        this.showMessage('Error processing Google login. Please try again.', 'error');
      }
    } else {
      this.showMessage('Google login failed. Please try again.', 'error');
    }
  }

  // Real Facebook OAuth Implementation
  handleFacebookLogin() {
    // Check if Facebook SDK is loaded
    if (typeof FB === 'undefined') {
      this.showMessage('Facebook SDK not loaded. Please check your internet connection.', 'error');
      return;
    }

    // Check if config is available
    if (typeof OAUTH_CONFIG === 'undefined' || !OAUTH_CONFIG.facebook.appId) {
      this.showMessage('Facebook OAuth not configured. Please add your App ID to oauth-config.js', 'error');
      return;
    }

    FB.login((response) => {
      if (response.authResponse) {
        // Get user info
        FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo) => {
          const facebookUser = {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture?.data?.url,
            provider: 'facebook',
            createdAt: new Date().toISOString()
          };

          this.currentUser = facebookUser;
          this.saveCurrentUser();
          this.showMessage(`Welcome ${facebookUser.name}! Logged in with Facebook.`, 'success');

          setTimeout(() => {
            this.closeLoginModal();
            this.updateNavbarUI();
          }, 1500);
        });
      } else {
        this.showMessage('Facebook login failed. Please try again.', 'error');
      }
    }, { scope: 'public_profile,email' });
  }

  handleAppleLogin() {
    // Apple Sign-In requires backend implementation
    // For now, show a message
    this.showMessage('Apple Sign-In requires backend setup. Please use Google or Facebook.', 'info');
  }

  updateNavbarUI() {
    const accountBtn = document.querySelector('.shop-header-account-btn');
    
    if (!accountBtn) return;

    // Ensure a user menu exists (we create it dynamically under the account button)
    let userMenu = document.getElementById('userMenu');
    if (!userMenu) {
      accountBtn.style.position = accountBtn.style.position || 'relative';
      userMenu = document.createElement('div');
      userMenu.id = 'userMenu';
      userMenu.innerHTML = '';
      accountBtn.appendChild(userMenu);
    }

    if (this.currentUser) {
      // User is logged in
      accountBtn.innerHTML = `
        <div class="user-logged-in">
          <span class="user-initial">${this.currentUser.name.charAt(0).toUpperCase()}</span>
        </div>
      `;
      accountBtn.classList.add('logged-in');

      // Re-attach menu after setting innerHTML
      accountBtn.appendChild(userMenu);

      const name = this.currentUser.name || 'User';
      const email = this.currentUser.email || '';

      userMenu.innerHTML = `
        <div class="user-menu-item user-info">
          <div class="user-name">${this.escapeHtml(name)}</div>
          <div class="user-email">${this.escapeHtml(email)}</div>
        </div>
        <a href="#" class="user-menu-item user-menu-logout" id="logoutBtn">LOGOUT</a>
      `;

      // Show menu only when toggled
      userMenu.style.display = 'block';
    } else {
      // User is not logged in
      accountBtn.innerHTML = `
        <svg width="20" height="20" fill="white" class="bi bi-person-circle" viewBox="0 0 16 16">
          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
          <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
        </svg>
      `;
      accountBtn.classList.remove('logged-in');

      if (userMenu) {
        userMenu.classList.remove('show');
        userMenu.style.display = 'none';
      }
    }
  }

  toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    if (!userMenu) return;
    userMenu.classList.toggle('show');
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `login-message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      messageDiv.classList.remove('show');
      setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  saveUsers() {
    localStorage.setItem('foxiwear_users', JSON.stringify(this.users));
  }

  loadUsers() {
    const stored = localStorage.getItem('foxiwear_users');
    return stored ? JSON.parse(stored) : [];
  }

  saveCurrentUser() {
    localStorage.setItem('foxiwear_current_user', JSON.stringify(this.currentUser));
  }

  loadCurrentUser() {
    const stored = localStorage.getItem('foxiwear_current_user');
    return stored ? JSON.parse(stored) : null;
  }
}

// Initialize login system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new LoginSystem();
});
