// ==========================================
// KAMUI STREAMING PLATFORM - CORE JAVASCRIPT
// ==========================================

// ---------- Anime Realm Color Themes (Moon Triggered) ----------
const REALM_THEMES = [
  { id: 'kamui-gold', name: 'Solar Kamui (Gold)', hues: ['232,185,79', '213,110,58'] },
  { id: 'blood-moon', name: 'Tsukuyomi (Blood Crimson)', hues: ['244,63,94', '190,18,60'] },
  { id: 'abyssal-blue', name: 'Celestial Azure (Six Eyes)', hues: ['56,189,248', '2,132,199'] },
  { id: 'jade-dragon', name: 'Jade Dragon (Emerald)', hues: ['16,185,129', '5,150,105'] },
  { id: 'void-amethyst', name: 'Void Amethyst (Purple)', hues: ['192,132,252', '147,51,234'] },
  { id: 'silver-eclipse', name: 'Shinigami Silver (Eclipse)', hues: ['248,250,252', '148,163,184'] }
];

const THEME_STORAGE_KEY = 'kamui_theme';

function getCurrentThemeId() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'kamui-gold';
  } catch (e) {
    return 'kamui-gold';
  }
}

function applyTheme(themeId, notify = false) {
  const target = REALM_THEMES.find(t => t.id === themeId) || REALM_THEMES[0];
  document.documentElement.setAttribute('data-theme', target.id);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, target.id);
  } catch (e) {}

  if (window.__updateParticleHues) {
    window.__updateParticleHues(target.hues);
  }

  const moon = document.querySelector('.hero-moon');
  if (moon) {
    moon.classList.remove('pulse');
    void moon.offsetWidth; // trigger reflow
    moon.classList.add('pulse');
  }

  if (notify) {
    showToast(`✦ Realm shifted to ${target.name}!`, 'info');
  }
}

let isCyclingTheme = false;
function cycleTheme(notify = true) {
  if (isCyclingTheme) return;
  isCyclingTheme = true;
  setTimeout(() => { isCyclingTheme = false; }, 200);

  const currentId = getCurrentThemeId();
  const currentIdx = REALM_THEMES.findIndex(t => t.id === currentId);
  const nextIdx = (currentIdx + 1) % REALM_THEMES.length;
  const nextTheme = REALM_THEMES[nextIdx];
  applyTheme(nextTheme.id, notify);
}

// Early boot application
applyTheme(getCurrentThemeId(), false);

// ---------- Realistic Anime Female Character Chibi Avatar Presets ----------
const DEFAULT_AVATARS = [
  { id: 'nami', name: 'Nami', anime: 'One Piece', src: 'avatars/nami.svg' },
  { id: 'robin', name: 'Robin', anime: 'One Piece', src: 'avatars/robin.svg' },
  { id: 'hancock', name: 'Hancock', anime: 'One Piece', src: 'avatars/hancock.svg' },
  { id: 'rukia', name: 'Rukia', anime: 'Bleach', src: 'avatars/rukia.svg' },
  { id: 'yoruichi', name: 'Yoruichi', anime: 'Bleach', src: 'avatars/yoruichi.svg' },
  { id: 'orihime', name: 'Orihime', anime: 'Bleach', src: 'avatars/orihime.svg' },
  { id: 'hinata', name: 'Hinata', anime: 'Naruto', src: 'avatars/hinata.svg' },
  { id: 'sakura', name: 'Sakura', anime: 'Naruto', src: 'avatars/sakura.svg' },
  { id: 'tsunade', name: 'Tsunade', anime: 'Naruto', src: 'avatars/tsunade.svg' }
];

function getRandomDefaultAvatar() {
  const index = Math.floor(Math.random() * DEFAULT_AVATARS.length);
  return DEFAULT_AVATARS[index].src;
}

// ---------- Authentication & Account State Management ----------
const AUTH_STORAGE_KEY = 'kamui_user_session';
const ACCOUNTS_STORAGE_KEY = 'kamui_registered_accounts';
let pendingRedirectUrl = 'watch.html';

function getRegisteredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveRegisteredAccount(account) {
  if (!account || !account.name) return;
  const accounts = getRegisteredAccounts();
  const existingIdx = accounts.findIndex(acc => 
    (account.email && acc.email && acc.email.toLowerCase() === account.email.toLowerCase()) ||
    (acc.name && acc.name.toLowerCase() === account.name.toLowerCase())
  );
  if (existingIdx >= 0) {
    accounts[existingIdx] = { ...accounts[existingIdx], ...account };
  } else {
    accounts.push(account);
  }
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function findRegisteredAccount(query) {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  return accounts.find(acc => 
    (acc.email && acc.email.toLowerCase() === q) ||
    (acc.name && acc.name.toLowerCase() === q)
  ) || null;
}

// Smart Name Parser / Formatter
function parseUserDisplayName(input) {
  if (!input) return 'Member';
  const clean = input.trim();
  if (!clean) return 'Member';
  
  // If previously registered on this device, reuse saved display name
  const existing = findRegisteredAccount(clean);
  if (existing && existing.name) {
    return existing.name;
  }

  // If email was entered
  if (clean.includes('@')) {
    const prefix = clean.split('@')[0];
    const parts = prefix.split(/[\._\-+]/).filter(Boolean);
    if (parts.length > 0) {
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    }
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }

  // If username was entered, capitalize first letter if lowercase, else preserve exact casing
  if (clean === clean.toLowerCase()) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean;
}

function getAuthUser() {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!data) return null;
    const user = JSON.parse(data);
    if (user && !user.avatar) {
      user.avatar = getRandomDefaultAvatar();
    }
    return user;
  } catch (e) {
    return null;
  }
}

function setAuthUser(user) {
  if (user) {
    if (!user.avatar) {
      user.avatar = getRandomDefaultAvatar();
    }
    saveRegisteredAccount(user);
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  updateNavAuth();
}

function updateUserAvatar(newAvatarSrc, customLabel) {
  const user = getAuthUser();
  if (!user) return;
  user.avatar = newAvatarSrc;
  setAuthUser(user);
  showToast(`Profile picture set to ${customLabel || 'custom photo'}!`, 'success');
}

function logoutUser() {
  const user = getAuthUser();
  localStorage.removeItem(AUTH_STORAGE_KEY);
  updateNavAuth();
  showToast(user ? `Signed out (${user.name || 'Member'})` : 'Signed out successfully.', 'info');
}

// ---------- Toast Notification System ----------
function showToast(message, type = 'info') {
  let container = document.querySelector('.kamui-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'kamui-toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `kamui-toast ${type}`;
  toast.innerHTML = `<span class="kamui-toast-icon">✦</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastFadeOut .3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ---------- Google OAuth Account Selector Modal ----------
function ensureGoogleAuthModal() {
  if (document.getElementById('googleAuthOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'googleAuthOverlay';
  overlay.className = 'google-auth-overlay';
  
  const lastUser = getAuthUser() || (getRegisteredAccounts().length > 0 ? getRegisteredAccounts()[0] : null);
  const defaultGoogleName = (lastUser && lastUser.name && lastUser.name !== 'Anime Member') ? lastUser.name : 'Manan';
  const defaultGoogleEmail = (lastUser && lastUser.email && lastUser.email !== 'member@kamui.stream') ? lastUser.email : `${defaultGoogleName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

  overlay.innerHTML = `
    <div class="google-auth-card" role="dialog" aria-modal="true" aria-labelledby="googleModalTitle">
      <button type="button" class="google-auth-close" id="googleAuthClose" aria-label="Close modal">&times;</button>
      
      <div class="google-auth-header">
        <div class="google-logo-wrap">
          <svg width="22" height="22" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"/>
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"/>
          </svg>
        </div>
        <h3 id="googleModalTitle">Sign in with Google</h3>
        <p>Choose an account to continue to <span class="brand-highlight">Kamui</span></p>
      </div>

      <form id="googleAuthForm">
        <div class="google-accounts-box">
          <div class="google-account-row" id="googleQuickAccount">
            <div class="google-avatar-icon" id="googleAvatarPreview">${defaultGoogleName.charAt(0).toUpperCase()}</div>
            <div class="google-account-details">
              <div class="google-acc-name" id="googlePreviewName">${defaultGoogleName}</div>
              <div class="google-acc-email" id="googlePreviewEmail">${defaultGoogleEmail}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4285f4" stroke-width="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <div class="google-custom-inputs">
            <div class="google-field">
              <label for="googleInputName">Google Account Name</label>
              <input type="text" id="googleInputName" value="${defaultGoogleName}" required placeholder="Your Google Name">
            </div>
            <div class="google-field">
              <label for="googleInputEmail">Gmail Address</label>
              <input type="email" id="googleInputEmail" value="${defaultGoogleEmail}" required placeholder="you@gmail.com">
            </div>
          </div>
        </div>

        <button type="submit" class="google-auth-btn-submit" id="googleBtnSubmit">
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#fff" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"/>
            <path fill="#fff" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"/>
            <path fill="#fff" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"/>
            <path fill="#fff" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"/>
          </svg>
          Continue as <span id="googleBtnNameLabel" style="margin-left:4px;">${defaultGoogleName}</span>
        </button>

        <p class="google-auth-disclaimer">To continue, Google will share your name, email address, and language preference with Kamui.</p>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  const nameInput = overlay.querySelector('#googleInputName');
  const emailInput = overlay.querySelector('#googleInputEmail');
  const previewName = overlay.querySelector('#googlePreviewName');
  const previewEmail = overlay.querySelector('#googlePreviewEmail');
  const avatarIcon = overlay.querySelector('#googleAvatarPreview');
  const btnLabel = overlay.querySelector('#googleBtnNameLabel');

  nameInput.addEventListener('input', () => {
    const val = nameInput.value.trim() || 'User';
    previewName.textContent = val;
    btnLabel.textContent = val;
    avatarIcon.textContent = val.charAt(0).toUpperCase();
  });

  emailInput.addEventListener('input', () => {
    previewEmail.textContent = emailInput.value.trim() || 'user@gmail.com';
  });

  overlay.querySelector('#googleAuthClose').addEventListener('click', closeGoogleAuthModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeGoogleAuthModal();
  });

  overlay.querySelector('#googleAuthForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const gName = nameInput.value.trim() || 'Google User';
    const gEmail = emailInput.value.trim() || `${gName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
    
    const existing = findRegisteredAccount(gEmail) || findRegisteredAccount(gName);
    const avatar = (existing && existing.avatar) ? existing.avatar : getRandomDefaultAvatar();
    
    const userSession = {
      name: gName,
      email: gEmail,
      loggedIn: true,
      avatar: avatar,
      authProvider: 'google'
    };

    saveRegisteredAccount(userSession);
    setAuthUser(userSession);
    showToast(`Signed in with Google as ${gName}! Welcome to Kamui.`, 'success');
    closeGoogleAuthModal();
    closeAuthModal();

    if (pendingRedirectUrl) {
      setTimeout(() => {
        window.location.href = pendingRedirectUrl;
      }, 400);
    }
  });
}

function openGoogleAuthModal(redirectUrl = 'watch.html') {
  ensureGoogleAuthModal();
  pendingRedirectUrl = redirectUrl;
  const overlay = document.getElementById('googleAuthOverlay');
  if (overlay) {
    overlay.classList.add('open');
  }
}

function closeGoogleAuthModal() {
  const overlay = document.getElementById('googleAuthOverlay');
  if (overlay) {
    overlay.classList.remove('open');
  }
}

// ---------- Standard Auth Prompt Modal ----------
function ensureAuthModal() {
  if (document.getElementById('authPromptOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'authPromptOverlay';
  overlay.className = 'auth-prompt-overlay';
  overlay.innerHTML = `
    <div class="auth-prompt-modal" role="dialog" aria-modal="true" aria-labelledby="authPromptTitle">
      <button class="auth-prompt-close" id="authPromptClose" aria-label="Close modal">&times;</button>
      <div class="auth-prompt-header">
        <div class="kanji-mark"><span class="glyph">入</span> Access Kamui</div>
        <h2 id="authPromptTitle">Sign in to start watching</h2>
        <p id="authPromptSub">Please sign in or create a free account to stream titles in 4K HDR with zero ads.</p>
      </div>

      <div class="auth-tabs">
        <button type="button" class="auth-tab-btn active" data-tab="signin">Sign In</button>
        <button type="button" class="auth-tab-btn" data-tab="signup">Create Account</button>
      </div>

      <!-- Sign In Tab Pane -->
      <div class="auth-tab-pane active" id="tabPaneSignin">
        <form class="auth-prompt-form" id="modalSigninForm">
          <div class="field">
            <label for="modalSigninEmail">Username or Email</label>
            <input type="text" id="modalSigninEmail" placeholder="e.g. Manan or you@example.com" required autocomplete="username">
          </div>
          <div class="field">
            <label for="modalSigninPass">Password</label>
            <input type="password" id="modalSigninPass" placeholder="••••••••" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn filled auth-prompt-submit">Sign in &amp; Stream</button>
        </form>
        <div class="auth-prompt-divider">or</div>
        <button type="button" class="btn auth-alt auth-prompt-google" id="modalGoogleSignin">
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"/>
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"/>
          </svg>
          Continue with Google
        </button>
        <p class="auth-prompt-footer">Prefer standard page? <a href="signin.html">Full Sign In</a></p>
      </div>

      <!-- Sign Up Tab Pane -->
      <div class="auth-tab-pane" id="tabPaneSignup">
        <form class="auth-prompt-form" id="modalSignupForm">
          <div class="field">
            <label for="modalSignupName">Username / Display Name</label>
            <input type="text" id="modalSignupName" placeholder="Your name or username" required autocomplete="name">
          </div>
          <div class="field">
            <label for="modalSignupEmail">Email</label>
            <input type="email" id="modalSignupEmail" placeholder="you@example.com" required autocomplete="email">
          </div>
          <div class="field">
            <label for="modalSignupPass">Password</label>
            <input type="password" id="modalSignupPass" placeholder="At least 8 characters" required minlength="8" autocomplete="new-password">
          </div>
          <button type="submit" class="btn filled auth-prompt-submit">Create Account &amp; Stream</button>
        </form>
        <div class="auth-prompt-divider">or</div>
        <button type="button" class="btn auth-alt auth-prompt-google" id="modalGoogleSignup">
          <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"/>
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"/>
          </svg>
          Continue with Google
        </button>
        <p class="auth-prompt-footer">Prefer standard page? <a href="signup.html">Full Sign Up</a></p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Tab switching
  const tabBtns = overlay.querySelectorAll('.auth-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      overlay.querySelector('#tabPaneSignin').classList.toggle('active', target === 'signin');
      overlay.querySelector('#tabPaneSignup').classList.toggle('active', target === 'signup');
    });
  });

  // Close triggers
  overlay.querySelector('#authPromptClose').addEventListener('click', closeAuthModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAuthModal();
  });

  // Modal Sign In Form Submit
  overlay.querySelector('#modalSigninForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const loginInput = overlay.querySelector('#modalSigninEmail').value.trim();
    const existing = findRegisteredAccount(loginInput);
    const name = parseUserDisplayName(loginInput);
    const email = loginInput.includes('@') ? loginInput : (existing && existing.email ? existing.email : `${loginInput.toLowerCase()}@kamui.stream`);
    const avatar = (existing && existing.avatar) ? existing.avatar : getRandomDefaultAvatar();
    
    setAuthUser({ name, email, loggedIn: true, avatar });
    showToast(`Welcome back, ${name}! Redirecting...`, 'success');
    closeAuthModal();
    if (pendingRedirectUrl) {
      setTimeout(() => {
        window.location.href = pendingRedirectUrl;
      }, 400);
    }
  });

  // Modal Sign Up Form Submit
  overlay.querySelector('#modalSignupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = overlay.querySelector('#modalSignupName').value.trim() || 'Member';
    const email = overlay.querySelector('#modalSignupEmail').value.trim();
    const avatar = getRandomDefaultAvatar();
    
    setAuthUser({ name, email, loggedIn: true, avatar });
    showToast(`Account created! Welcome to Kamui, ${name}.`, 'success');
    closeAuthModal();
    if (pendingRedirectUrl) {
      setTimeout(() => {
        window.location.href = pendingRedirectUrl;
      }, 400);
    }
  });

  // Modal Google Auth triggers
  overlay.querySelector('#modalGoogleSignin').addEventListener('click', () => {
    openGoogleAuthModal(pendingRedirectUrl || 'watch.html');
  });
  overlay.querySelector('#modalGoogleSignup').addEventListener('click', () => {
    openGoogleAuthModal(pendingRedirectUrl || 'watch.html');
  });
}

function openAuthModal(heading, sub, redirectUrl = 'watch.html', defaultTab = 'signin') {
  ensureAuthModal();
  pendingRedirectUrl = redirectUrl;
  const overlay = document.getElementById('authPromptOverlay');
  if (heading) overlay.querySelector('#authPromptTitle').textContent = heading;
  if (sub) overlay.querySelector('#authPromptSub').textContent = sub;

  const tabBtns = overlay.querySelectorAll('.auth-tab-btn');
  tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === defaultTab));
  overlay.querySelector('#tabPaneSignin').classList.toggle('active', defaultTab === 'signin');
  overlay.querySelector('#tabPaneSignup').classList.toggle('active', defaultTab === 'signup');

  overlay.classList.add('open');
}

function closeAuthModal() {
  const overlay = document.getElementById('authPromptOverlay');
  if (overlay) overlay.classList.remove('open');
}

// ---------- Update Navigation Bar with User Profile, Avatar & Moon Theme Switcher ----------
function updateNavAuth() {
  const user = getAuthUser();
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  const pathname = window.location.pathname;
  const isWatchPage = pathname.endsWith('watch.html');
  const isSigninPage = pathname.endsWith('signin.html');
  const isSignupPage = pathname.endsWith('signup.html');

  const themeBtnHtml = `
    <button type="button" class="theme-moon-btn" id="themeToggleBtn" title="Shift Realm Theme (Click to cycle colors)" aria-label="Shift realm theme">
      <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
  `;

  if (user && user.loggedIn) {
    const currentAvatar = user.avatar || 'avatars/nami.svg';
    
    // Build Realistic Anime Chibi Avatar Grid HTML
    const chibiGridHtml = DEFAULT_AVATARS.map(item => `
      <div class="chibi-card ${currentAvatar === item.src ? 'active' : ''}" data-src="${item.src}" data-name="${item.name}" data-anime="${item.anime}" title="${item.name} (${item.anime})">
        <img class="chibi-img" src="${item.src}" alt="${item.name}">
        <span class="chibi-name">${item.name}</span>
        <span class="chibi-anime">${item.anime}</span>
      </div>
    `).join('');

    navActions.innerHTML = `
      ${themeBtnHtml}
      <div class="nav-profile-wrap" id="navProfileWrap">
        <button type="button" class="nav-profile-btn" id="navProfileBtn" aria-label="Open profile menu" aria-expanded="false">
          <img class="nav-avatar-img" id="navAvatarImg" src="${currentAvatar}" alt="${user.name || 'Profile'}">
          <span class="nav-profile-name">${user.name || 'Member'}</span>
          <svg class="nav-profile-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Profile Dropdown Menu -->
        <div class="nav-profile-dropdown" id="navProfileDropdown">
          <div class="profile-dropdown-head">
            <div class="profile-avatar-preview-wrap">
              <img class="profile-large-avatar" id="dropdownAvatarImg" src="${currentAvatar}" alt="${user.name || 'Profile'}">
              <label class="avatar-upload-badge" for="deviceAvatarInput" title="Upload from your device">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </label>
            </div>
            <div class="profile-user-info">
              <h4 class="profile-dropdown-name">${user.name || 'Member'}</h4>
              <p class="profile-dropdown-email">${user.email || 'user@kamui.stream'}</p>
              <span class="profile-tier-badge">✦ KAMUI MEMBER · 4K HDR</span>
            </div>
          </div>

          <div class="profile-dropdown-section">
            <div class="profile-section-title-row">
              <span class="profile-section-heading">Avatar Image</span>
              <label class="btn-import-device" for="deviceAvatarInput">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                Import from Device
              </label>
              <input type="file" id="deviceAvatarInput" accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml" style="display:none;">
            </div>
            <p class="chibi-subheading">Choose an authentic Chibi character (One Piece, Bleach, Naruto):</p>
            <div class="chibi-avatar-grid" id="chibiAvatarGrid">
              ${chibiGridHtml}
            </div>
          </div>

          <div class="profile-dropdown-footer">
            <a href="${isWatchPage ? 'index.html' : 'watch.html'}" class="profile-link-btn">
              ${isWatchPage ? 'Home' : 'Watch Library'}
            </a>
            <button type="button" class="profile-logout-btn" id="profileLogoutBtn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
      ${!isWatchPage ? '<a href="watch.html" class="btn filled">Watch</a>' : '<a href="index.html" class="btn">Home</a>'}
    `;

    // Dropdown toggle
    const profileWrap = document.getElementById('navProfileWrap');
    const profileBtn = document.getElementById('navProfileBtn');
    if (profileBtn && profileWrap) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = profileWrap.classList.toggle('open');
        profileBtn.setAttribute('aria-expanded', isOpen);
      });
    }

    // Chibi avatar selection clicks
    const chibiCards = navActions.querySelectorAll('.chibi-card');
    chibiCards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = card.dataset.src;
        const name = card.dataset.name;
        const anime = card.dataset.anime;
        updateUserAvatar(src, `${name} (${anime})`);
      });
    });

    // File input: Import from device
    const fileInput = document.getElementById('deviceAvatarInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          showToast('Please select a valid image file.', 'info');
          return;
        }

        const reader = new FileReader();
        reader.onload = function(evt) {
          const dataUrl = evt.target.result;
          updateUserAvatar(dataUrl, 'your device photo');
        };
        reader.readAsDataURL(file);
      });
    }

    // Sign out button
    const logoutBtn = document.getElementById('profileLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (profileWrap) profileWrap.classList.remove('open');
        logoutUser();
      });
    }

  } else {
    if (isSigninPage) {
      navActions.innerHTML = `
        ${themeBtnHtml}
        <a href="signup.html" class="link-cta">Sign up</a>
        <a href="index.html" class="btn filled">Home</a>
      `;
    } else if (isSignupPage) {
      navActions.innerHTML = `
        ${themeBtnHtml}
        <a href="signin.html" class="link-cta">Sign in</a>
        <a href="index.html" class="btn filled">Home</a>
      `;
    } else if (isWatchPage) {
      navActions.innerHTML = `
        ${themeBtnHtml}
        <a href="signin.html" class="link-cta">Sign in</a>
        <a href="index.html" class="btn filled">Home</a>
      `;
    } else {
      navActions.innerHTML = `
        ${themeBtnHtml}
        <a href="signin.html" class="link-cta">Sign in</a>
        <a href="watch.html" class="btn filled">Start watching</a>
      `;
    }
  }

  // Wire up theme toggle in nav
  initThemeSwitchers();
}

// Close profile dropdown when clicking outside
document.addEventListener('click', (e) => {
  const profileWrap = document.getElementById('navProfileWrap');
  if (profileWrap && !profileWrap.contains(e.target)) {
    profileWrap.classList.remove('open');
    const profileBtn = document.getElementById('navProfileBtn');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
  }
});

// ---------- Interactive Hero Moon & Theme Listeners ----------
function initThemeSwitchers() {
  const heroMoon = document.querySelector('.hero-moon');
  if (heroMoon && !heroMoon._themeBound) {
    heroMoon._themeBound = true;
    heroMoon.addEventListener('click', () => {
      cycleTheme(true);
    });
    heroMoon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cycleTheme(true);
      }
    });
  }

  document.querySelectorAll('.theme-moon-btn').forEach(btn => {
    if (!btn._themeBound) {
      btn._themeBound = true;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleTheme(true);
      });
    }
  });
}

// ---------- Attach "Start Watching" Auth Interceptors ----------
function initStartWatchingInterceptors() {
  document.addEventListener('click', (e) => {
    const targetLink = e.target.closest('a[href*="watch.html"], a[href="signup.html"]');
    if (!targetLink) return;

    if (targetLink.getAttribute('href') === 'index.html' || targetLink.getAttribute('href') === '#top') return;

    const user = getAuthUser();
    if (user && user.loggedIn) {
      return;
    }

    e.preventDefault();
    const targetHref = targetLink.getAttribute('href') || 'watch.html';
    const isSignUpBtn = targetLink.textContent.toLowerCase().includes('sign up') || targetHref.includes('signup.html');
    
    openAuthModal(
      'Sign in to start watching',
      'Please sign in or create an account to stream Kamui simulcasts, dubs & subs in 4K HDR.',
      targetHref.includes('signup.html') ? 'watch.html' : targetHref,
      isSignUpBtn ? 'signup' : 'signin'
    );
  });
}

// ---------- Full Sign In & Sign Up Page Form Handlers ----------
function initAuthPages() {
  const signinForm = document.getElementById('signinForm');
  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loginInput = document.getElementById('email').value.trim();
      const existing = findRegisteredAccount(loginInput);
      const name = parseUserDisplayName(loginInput);
      const email = loginInput.includes('@') ? loginInput : (existing && existing.email ? existing.email : `${loginInput.toLowerCase()}@kamui.stream`);
      const avatar = (existing && existing.avatar) ? existing.avatar : getRandomDefaultAvatar();
      
      setAuthUser({ name, email, loggedIn: true, avatar });
      showToast(`Welcome back, ${name}! Taking you to stream...`, 'success');
      setTimeout(() => {
        window.location.href = 'watch.html';
      }, 500);
    });
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim() || 'Member';
      const email = document.getElementById('email').value.trim();
      const avatar = getRandomDefaultAvatar();
      
      setAuthUser({ name, email, loggedIn: true, avatar });
      showToast(`Account created! Welcome, ${name}.`, 'success');
      setTimeout(() => {
        window.location.href = 'watch.html';
      }, 500);
    });
  }

  // Google buttons on standalone auth pages
  document.querySelectorAll('.auth-alt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openGoogleAuthModal('watch.html');
    });
  });
}

// ---------- Nav background on scroll ----------
const nav = document.getElementById('siteNav');
const onScroll = () => {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Mobile menu toggle ----------
const menuToggle = document.getElementById('menuToggle');
const links = document.querySelector('nav.links');
if (menuToggle && links) {
  menuToggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.cssText = open
      ? ''
      : 'display:flex; position:fixed; inset:70px 0 auto 0; flex-direction:column; gap:0; background:var(--night); padding:10px 30px 30px; border-bottom:1px solid var(--line); z-index:99;';
    if (!open) {
      links.querySelectorAll('a').forEach(a => a.style.padding = '14px 0');
    }
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.removeAttribute('style');
  }));
}

// ---------- Scroll reveal ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}

// ---------- Ember particle canvas (Hero) ----------
const canvas = document.getElementById('ember-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  let currentThemeObj = REALM_THEMES.find(t => t.id === getCurrentThemeId()) || REALM_THEMES[0];
  let activeHues = currentThemeObj.hues;

  window.__updateParticleHues = (newHues) => {
    activeHues = newHues;
    if (particles) {
      particles.forEach(p => {
        p.hue = Math.random() > 0.6 ? activeHues[0] : activeHues[1];
      });
    }
  };

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * w,
      y: h + Math.random() * 100,
      r: 0.6 + Math.random() * 2,
      speed: 0.25 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 0.4,
      alpha: 0.15 + Math.random() * 0.5,
      hue: Math.random() > 0.6 ? activeHues[0] : activeHues[1]
    };
  }

  function initParticles() {
    const count = Math.min(90, Math.floor((w * h) / 14000));
    particles = Array.from({ length: count }, makeParticle);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
      ctx.fill();
    });
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10) Object.assign(p, makeParticle(), { y: h + 10 });
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
    if (reduceMotion) drawStatic();
  });

  resize();
  initParticles();
  if (reduceMotion) {
    drawStatic();
  } else {
    tick();
  }
}

// ---------- Watch page: genre filter ----------
const filterBar = document.getElementById('filterBar');
if (filterBar) {
  const chips = filterBar.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.watch-card');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const genre = chip.dataset.genre;
      cards.forEach(card => {
        const match = genre === 'all' || card.dataset.genre === genre;
        card.classList.toggle('hidden', !match);
      });
    });
  });
}

// ---------- Watch page: title modal ----------
const modalOverlay = document.getElementById('modalOverlay');
if (modalOverlay) {
  const modalArt = document.getElementById('modalArt');
  const modalGenre = document.getElementById('modalGenre');
  const modalTitle = document.getElementById('modalTitle');
  const modalSynopsis = document.getElementById('modalSynopsis');
  const modalEps = document.getElementById('modalEps');
  const modalClose = document.getElementById('modalClose');
  const modalPlay = document.getElementById('modalPlay');

  function openModal(card) {
    if (!card) return;
    const artSvg = card.querySelector('.art');
    modalArt.innerHTML = artSvg ? artSvg.outerHTML : '';
    modalGenre.textContent = card.dataset.genreLabel || '';
    modalTitle.textContent = card.dataset.title || '';
    modalSynopsis.textContent = card.dataset.synopsis || '';
    modalEps.textContent = card.dataset.eps || '';
    modalOverlay.classList.add('open');
    if (modalPlay) {
      modalPlay.textContent = 'Play episode 1';
      modalPlay.disabled = false;
    }
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
  }

  document.querySelectorAll('.watch-card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  if (modalPlay) {
    modalPlay.addEventListener('click', () => {
      const user = getAuthUser();
      if (!user || !user.loggedIn) {
        openAuthModal(
          'Sign in required to play',
          `Please sign in or create an account to start streaming "${modalTitle.textContent || 'this title'}" in 4K HDR.`,
          null
        );
        return;
      }
      modalPlay.textContent = `▶ Now streaming for ${user.name || 'you'} in 4K HDR...`;
      modalPlay.disabled = true;
      setTimeout(() => {
        if (modalPlay) {
          modalPlay.textContent = 'Play episode 1';
          modalPlay.disabled = false;
        }
      }, 3000);
    });
  }

  const checkHash = () => {
    const hashId = window.location.hash.replace('#', '');
    if (hashId) {
      const target = document.getElementById(hashId);
      if (target) {
        setTimeout(() => openModal(target), 200);
        target.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
  };

  checkHash();
  window.addEventListener('hashchange', checkHash);
}

// ---------- Escape Key Listener for Modals ----------
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAuthModal();
    closeGoogleAuthModal();
    if (modalOverlay) modalOverlay.classList.remove('open');
  }
});

// ---------- Title Video Autoplay & Loop Assurance ----------
const titleVideo = document.querySelector('.title-bg-video');
if (titleVideo) {
  titleVideo.muted = true;
  const playVideo = () => {
    const p = titleVideo.play();
    if (p !== undefined) {
      p.catch(() => {
        titleVideo.muted = true;
        titleVideo.play();
      });
    }
  };
  playVideo();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) playVideo();
  });
}

// ---------- Initialize App State & Interceptors ----------
function initApp() {
  applyTheme(getCurrentThemeId(), false);
  ensureAuthModal();
  ensureGoogleAuthModal();
  updateNavAuth();
  initThemeSwitchers();
  initStartWatchingInterceptors();
  initAuthPages();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
