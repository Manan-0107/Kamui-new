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

    // Do not intercept if clicking anime poster, as that opens the Netflix preview modal directly
    if (targetLink.classList.contains('poster') || targetLink.hasAttribute('data-anime-id') || targetLink.closest('.poster')) {
      return;
    }

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

// ---------- RICH ANIME CATALOG DATABASE (NETFLIX PREVIEW METADATA) ----------
const ANIME_CATALOG = {
  'kamui': {
    id: 'kamui',
    title: 'Kamui',
    kanji: '神威',
    badge: 'KAMUI ORIGINAL',
    badgeType: 'original',
    genre: 'Dark fantasy',
    genres: ['Dark Fantasy', 'Supernatural', 'Action', 'Mythology'],
    year: '2026',
    rating: '16+',
    match: '98% Match',
    seasonsCount: '1 Season (24 Episodes)',
    trailerVideo: 'kamui-animation.mp4',
    fullVideo: 'kamui-animation.mp4',
    hook: 'When the northern bells chime in the dead of winter, the banished wolf-god must answer.',
    synopsis: 'A shrine girl who hears what the bells are saying, and the exiled wolf-god bound to her by a debt neither of them chose. Together they walk north into the forbidden frost to find out why winter has stopped ending.',
    cast: 'Kenjiro Tsuda, Megumi Ogata, Mamoru Miyano, Saori Hayami',
    mood: 'Mythological, Dark Fantasy, Gripping, Visual Masterpiece',
    studio: 'Kamui Originals × Studio MAPPA',
    director: 'Sunao Katabuchi',
    audio: 'Japanese [Original], English (Dub), French, German',
    subtitles: 'English [CC], Japanese, Spanish, German, French',
    maturityDesc: 'Violence, dark supernatural themes, intense action scenes.',
    episodes: [
      { num: 1, title: 'The Bell of Frozen Ash', duration: '24m', desc: 'A frost settles over the mountain shrine, and a voice in the chime awakens an ancient pact between maiden and exiled wolf.' },
      { num: 2, title: 'Howling at the Eclipse', duration: '23m', desc: 'Tracked by imperial hunters, the maiden and the wolf enter the forbidden forest of Oku under a blood moon.' },
      { num: 3, title: 'Crimson Snowfall', duration: '25m', desc: 'An encounter with a shrine sentinel reveals the dark truth behind the endless blizzard consuming the northern realm.' },
      { num: 4, title: 'The Blade that Remembers', duration: '24m', desc: 'In the ruins of the northern capital, a spirit forge reignites to temper a blade capable of cutting divinity.' }
    ],
    relatedIds: ['long-thaw', 'iron-tide', 'nine-crows-inn']
  },
  'ashfall-district': {
    id: 'ashfall-district',
    title: 'Ashfall District',
    kanji: '灰落街',
    badge: 'TRENDING #1',
    genre: 'Sci-fi',
    genres: ['Sci-Fi', 'Cyberpunk', 'Mystery', 'Action'],
    year: '2026',
    rating: '13+',
    match: '96% Match',
    seasonsCount: '1 Season (22 Episodes)',
    trailerVideo: 'kamui-hero.mp4',
    fullVideo: 'kamui-hero.mp4',
    hook: 'Deep inside the volcanic crater, neon lights flicker as the geothermal plasma grid destabilizes.',
    synopsis: 'A city built inside the crater of an extinct volcano runs on power no one can explain. When the grid starts failing block by block, two rival engineers have to trust each other to find out what is hidden underneath it.',
    cast: 'Kaito Ishikawa, Sora Amamiya, Takahiro Sakurai, Yoko Hikasa',
    mood: 'Neon Noir, Cyberpunk, Mind-Bending, High Octane',
    studio: 'Studio Trigger × Kamui',
    director: 'Hiroyuki Imaishi',
    audio: 'Japanese [Original], English (Dub), Portuguese, Italian',
    subtitles: 'English [CC], Japanese, Spanish, Italian, German',
    maturityDesc: 'Sci-fi violence, peril, language.',
    episodes: [
      { num: 1, title: 'Blackout Protocol', duration: '23m', desc: 'Sector 7 loses auxiliary power as a phantom signal spreads through the plasma reactor conduits.' },
      { num: 2, title: 'Sub-Level Zero', duration: '24m', desc: 'Descending into the magma shaft, the engineers discover ancient subterranean machinery that shouldn\'t exist.' },
      { num: 3, title: 'Neon Ash', duration: '22m', desc: 'Corporate enforcers move in to silence the maintenance crew before the grid malfunction leaks to the populace.' },
      { num: 4, title: 'Overclocked Pulse', duration: '25m', desc: 'A desperate gamble to jumpstart the secondary geothermal turbine before the core implodes.' }
    ],
    relatedIds: ['static-requiem', 'iron-tide', 'kamui']
  },
  'paper-moon-society': {
    id: 'paper-moon-society',
    title: 'Paper Moon Society',
    kanji: '紙月会',
    badge: 'STAFF PICK',
    genre: 'Slice of life',
    genres: ['Slice of Life', 'Comedy', 'Drama', 'Cozy'],
    year: '2026',
    rating: 'All Ages',
    match: '95% Match',
    seasonsCount: '1 Season (12 Episodes)',
    trailerVideo: 'kamui-animation.mp4',
    fullVideo: 'kamui-animation.mp4',
    hook: 'Four strangers, an antique bookstore after midnight, and stories that heal quiet wounds.',
    synopsis: 'Four strangers rent the same failing bookshop after hours, one night a week, for reasons none of them explain to each other. A quiet, funny season about the kind of friendship you don\'t plan for.',
    cast: 'Nao Toyama, Yoshitsugu Matsuoka, Rie Takahashi, Hiroshi Kamiya',
    mood: 'Heartwarming, Nostalgic, Quirky, Soothing',
    studio: 'Kyoto Animation × Kamui',
    director: 'Naoko Yamada',
    audio: 'Japanese [Original], English (Dub), German',
    subtitles: 'English [CC], Japanese, French, Spanish',
    maturityDesc: 'Mild emotional themes, suitable for all audiences.',
    episodes: [
      { num: 1, title: 'Friday at Midnight', duration: '22m', desc: 'The bell rings above the door at 12:05 AM as four unlikely visitors claim different corners of the shop.' },
      { num: 2, title: 'The Book of Lost Marginalia', duration: '23m', desc: 'Notes left in the margins of a 1920s poetry book spark an unexpected late-night investigation.' },
      { num: 3, title: 'Tea and Second Chances', duration: '21m', desc: 'A rainy night brings homemade matcha treats and unspoken confessions between the bookshelves.' },
      { num: 4, title: 'The Bookmark with No Name', duration: '24m', desc: 'A hidden photograph between the pages of an antique dictionary connects two patrons\' pasts.' }
    ],
    relatedIds: ['glasshouse', 'hollow-meridian', 'kamui']
  },
  'iron-tide': {
    id: 'iron-tide',
    title: 'Iron Tide',
    kanji: '鉄潮',
    badge: 'POPULAR',
    genre: 'Mecha',
    genres: ['Mecha', 'Sci-Fi', 'Military Action', 'Adventure'],
    year: '2026',
    rating: '16+',
    match: '97% Match',
    seasonsCount: '1 Season (26 Episodes)',
    trailerVideo: 'kamui-hero.mp4',
    fullVideo: 'kamui-hero.mp4',
    hook: 'The rising oceans took the continents. Only titan-class pilot frames can reclaim the abyss.',
    synopsis: 'The ocean took back three coastal nations in a single decade. What\'s left of their navies is now a scrapyard of pilot-grade frames, and a teenage salvager just found the one still worth flying.',
    cast: 'Jun Fukuyama, Marina Inoue, Tomokazu Sugita, Kana Hanazawa',
    mood: 'Epic, Heavy Machinery, Strategic, Adrenaline',
    studio: 'Sunrise × Kamui',
    director: 'Goro Taniguchi',
    audio: 'Japanese [Original], English (Dub), Spanish',
    subtitles: 'English [CC], Japanese, Korean, Italian',
    maturityDesc: 'Mecha combat, mild blood, explosions.',
    episodes: [
      { num: 1, title: 'Dredged from the Deep', duration: '26m', desc: 'A routine salvage dive in the underwater trench unearths an intact Mark-IV combat rig.' },
      { num: 2, title: 'Pressure Breach', duration: '24m', desc: 'Pirate cruisers ambush the salvage barge during heavy sea storms to seize the relic.' },
      { num: 3, title: 'Echo of the Reactor', duration: '25m', desc: 'The neural sync interface accepts an unregistered teenage pilot for the first time in thirty years.' },
      { num: 4, title: 'Trench Warfare', duration: '24m', desc: 'Deploying into the pitch-black ocean depths against rogue automated defense drones.' }
    ],
    relatedIds: ['ashfall-district', 'kamui', 'hollow-meridian']
  },
  'nine-crows-inn': {
    id: 'nine-crows-inn',
    title: 'Nine Crows Inn',
    kanji: '九烏亭',
    badge: 'NEW RELEASE',
    genre: 'Mystery',
    genres: ['Mystery', 'Psychological Suspense', 'Supernatural'],
    year: '2026',
    rating: '16+',
    match: '94% Match',
    seasonsCount: '1 Season (13 Episodes)',
    trailerVideo: 'kamui-animation.mp4',
    fullVideo: 'kamui-animation.mp4',
    hook: 'Every guest checked in under a false name. Then room seven was found locked from the inside.',
    synopsis: 'Every guest at the Nine Crows arrives already lying about something. The innkeeper doesn\'t mind — until a body turns up in room seven and everyone\'s alibi is the same story, word for word.',
    cast: 'Takehito Koyasu, Yoko Hikasa, Hiroshi Kamiya, Kenjiro Tsuda',
    mood: 'Tense, Atmospheric, Clever Whodunit, Chilling',
    studio: 'Ufotable × Kamui',
    director: 'Haruo Sotozaki',
    audio: 'Japanese [Original], English (Dub), French',
    subtitles: 'English [CC], Japanese, Spanish, German',
    maturityDesc: 'Murder mystery, dark suspense, psychological tension.',
    episodes: [
      { num: 1, title: 'The Sealed Room', duration: '24m', desc: 'Heavy snowfall cuts off the mountain pass just as the bell rings ominously in room seven.' },
      { num: 2, title: 'Nine Alibis', duration: '25m', desc: 'The detective begins interrogations, only to discover every suspect gives the exact same statement.' },
      { num: 3, title: 'Crow in the Rafters', duration: '23m', desc: 'A missing ledger reveals the true identity of the inn\'s mysterious masked patron.' },
      { num: 4, title: 'The Midnight Footsteps', duration: '24m', desc: 'Creaking floorboards outside the east wing hallway reveal an unseen ninth guest.' }
    ],
    relatedIds: ['static-requiem', 'kamui', 'long-thaw']
  },
  'glasshouse': {
    id: 'glasshouse',
    title: 'Glasshouse',
    kanji: '温室',
    badge: 'ROMANCE HIT',
    genre: 'Romance',
    genres: ['Romance', 'Drama', 'Slice of Life'],
    year: '2026',
    rating: '13+',
    match: '93% Match',
    seasonsCount: '1 Season (12 Episodes)',
    trailerVideo: 'kamui-hero.mp4',
    fullVideo: 'kamui-hero.mp4',
    hook: 'Two rival florists who refuse to speak share a single delivery van when disaster strikes.',
    synopsis: 'Two florists share a wall and a delivery van and have never once agreed to speak to each other. Then a citywide frost kills both their shops\' stock on the same morning.',
    cast: 'Reina Ueda, Yuichi Nakamura, Ayane Sakura, Nobunaga Shimazaki',
    mood: 'Bittersweet, Aesthetic, Romantic, Tender',
    studio: 'CloverWorks × Kamui',
    director: 'Shinichiro Ushijima',
    audio: 'Japanese [Original], English (Dub), Italian',
    subtitles: 'English [CC], Japanese, French, Portuguese',
    maturityDesc: 'Emotional themes, romantic relationships.',
    episodes: [
      { num: 1, title: 'Morning Frost', duration: '23m', desc: 'The temperature drops drastically overnight, forcing two competitors to share heating generators.' },
      { num: 2, title: 'Winter Roses', duration: '22m', desc: 'A joint rush order for an elite city gala forces them onto the icy road together.' },
      { num: 3, title: 'Behind the Glass', duration: '24m', desc: 'Late night tending of rare orchids leads to an honest conversation in the greenhouse.' },
      { num: 4, title: 'The Blooming Season', duration: '23m', desc: 'The city garden festival arrives with surprising revelations and newfound feelings.' }
    ],
    relatedIds: ['paper-moon-society', 'hollow-meridian', 'nine-crows-inn']
  },
  'hollow-meridian': {
    id: 'hollow-meridian',
    title: 'Hollow Meridian',
    kanji: '空子午線',
    badge: 'ADVENTURE EPIC',
    genre: 'Adventure',
    genres: ['Adventure', 'Fantasy', 'World Exploration'],
    year: '2026',
    rating: '13+',
    match: '95% Match',
    seasonsCount: '1 Season (24 Episodes)',
    trailerVideo: 'kamui-animation.mp4',
    fullVideo: 'kamui-animation.mp4',
    hook: 'The continent rearranges its geography every full moon. A young cartographer just found the edge.',
    synopsis: 'A cartographer\'s guild has spent three centuries mapping a continent that keeps rearranging itself. The newest apprentice just found a coastline that wasn\'t there yesterday — or maybe wasn\'t there ever.',
    cast: 'Nobuhiko Okamoto, Aoi Yuki, Daisuke Ono, Miyuki Sawashiro',
    mood: 'Sense of Wonder, Grand Journey, Mysterious, Epic',
    studio: 'Wit Studio × Kamui',
    director: 'Tetsuro Araki',
    audio: 'Japanese [Original], English (Dub), German',
    subtitles: 'English [CC], Japanese, Spanish, Russian',
    maturityDesc: 'Fantasy action, exploration peril.',
    episodes: [
      { num: 1, title: 'The Shifting Coast', duration: '25m', desc: 'The guild\'s compass spins wildly as a new mountain range appears overnight.' },
      { num: 2, title: 'Isle of Whispering Wind', duration: '24m', desc: 'Navigating uncharted archipelagos using ancient celestial charts and wind stones.' },
      { num: 3, title: 'The Horizon Gate', duration: '25m', desc: 'A monolithic ruin at the edge of the world responds to the apprentice\'s map.' },
      { num: 4, title: 'Beyond the Meridian', duration: '24m', desc: 'Entering the realm where geography no longer obeys mortal physics.' }
    ],
    relatedIds: ['kamui', 'iron-tide', 'long-thaw']
  },
  'static-requiem': {
    id: 'static-requiem',
    title: 'Static Requiem',
    kanji: '雑音鎮魂歌',
    badge: 'MUST WATCH',
    genre: 'Psychological',
    genres: ['Psychological Thriller', 'Supernatural', 'Mystery'],
    year: '2026',
    rating: '18+',
    match: '96% Match',
    seasonsCount: '1 Season (13 Episodes)',
    trailerVideo: 'kamui-hero.mp4',
    fullVideo: 'kamui-hero.mp4',
    hook: 'A radio frequency that died eleven years ago is broadcasting tonight. And only she can hear the caller.',
    synopsis: 'A radio station that\'s been off the air for eleven years starts broadcasting again, and only one former host can still hear it. Nobody believes her except the show\'s original audience — who never stopped listening.',
    cast: 'Nana Mizuki, Kenichi Suzumura, Akira Ishida, Megumi Ogata',
    mood: 'Unsettling, Psychological Masterpiece, Mind-Bending, Haunting',
    studio: 'Production I.G × Kamui',
    director: 'Tensai Okamura',
    audio: 'Japanese [Original], English (Dub), French',
    subtitles: 'English [CC], Japanese, Spanish, German',
    maturityDesc: 'Psychological horror elements, existential themes, disturbing audio.',
    episodes: [
      { num: 1, title: 'Dead Air at 3 AM', duration: '25m', desc: 'The static on channel 88.4 MHz resolves into a hauntingly familiar voice calling from the past.' },
      { num: 2, title: 'The Memory Toll', duration: '24m', desc: 'A caller describes tomorrow\'s morning headlines with terrifying precision.' },
      { num: 3, title: 'Feedback Loop', duration: '26m', desc: 'Searching for the transmission tower leads to an empty field untouched for eleven years.' },
      { num: 4, title: 'The Final Broadcast', duration: '25m', desc: 'Going live on air to confront the entity behind the phantom station once and for all.' }
    ],
    relatedIds: ['nine-crows-inn', 'ashfall-district', 'kamui']
  },
  'long-thaw': {
    id: 'long-thaw',
    title: 'The Long Thaw',
    kanji: '長解',
    badge: 'KAMUI UNIVERSE',
    genre: 'Dark fantasy',
    genres: ['Dark Fantasy', 'Mythological', 'Action', 'Sequel'],
    year: '2026',
    rating: '16+',
    match: '97% Match',
    seasonsCount: '1 Season (24 Episodes)',
    trailerVideo: 'kamui-animation.mp4',
    fullVideo: 'kamui-animation.mp4',
    hook: 'Two centuries after Kamui, the slumbering deity of the north was supposed to awaken. It didn\'t.',
    synopsis: 'Set two hundred years after Kamui, a new god has slept through every winter since — and this is the season it doesn\'t wake up. Standalone story, same north.',
    cast: 'Yuuki Kaji, Maaya Sakamoto, Akio Otsuka, Saori Hayami',
    mood: 'Mythic, Breathtaking, Dark Fantasy, Melancholic',
    studio: 'Kamui Originals × Studio MAPPA',
    director: 'Sunao Katabuchi',
    audio: 'Japanese [Original], English (Dub), French, German',
    subtitles: 'English [CC], Japanese, Spanish, Portuguese',
    maturityDesc: 'Fantasy combat, mythic violence.',
    episodes: [
      { num: 1, title: 'Century of Slumber', duration: '25m', desc: 'The sacred ice shrines fail to melt as the solar equinox passes in silence.' },
      { num: 2, title: 'The Glacial Path', duration: '24m', desc: 'Trekking across the frozen sea towards the dormant deity\'s mountain sanctuary.' },
      { num: 3, title: 'Remnants of the Pack', duration: '25m', desc: 'Echoes of the ancient wolf-god guide the hunter through violent spirit blizzards.' },
      { num: 4, title: 'Dawn over the Glacier', duration: '26m', desc: 'The glacial seal begins to crack under the weight of divine awakening.' }
    ],
    relatedIds: ['kamui', 'hollow-meridian', 'nine-crows-inn']
  }
};

// User List & Likes State Storage
const MY_LIST_STORAGE_KEY = 'kamui_user_watchlist';
const LIKED_STORAGE_KEY = 'kamui_user_liked_titles';

function getUserWatchlist() {
  try {
    const raw = localStorage.getItem(MY_LIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function toggleUserWatchlist(animeId) {
  const list = getUserWatchlist();
  const index = list.indexOf(animeId);
  let added = false;
  if (index >= 0) {
    list.splice(index, 1);
    added = false;
  } else {
    list.push(animeId);
    added = true;
  }
  localStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(list));
  return added;
}

function getUserLikedTitles() {
  try {
    const raw = localStorage.getItem(LIKED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function toggleUserLiked(animeId) {
  const list = getUserLikedTitles();
  const index = list.indexOf(animeId);
  let liked = false;
  if (index >= 0) {
    list.splice(index, 1);
    liked = false;
  } else {
    list.push(animeId);
    liked = true;
  }
  localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(list));
  return liked;
}

// ---------- NETFLIX PREVIEW CONTROLLER & STATE ----------
let currentPreviewAnimeId = 'kamui';
let currentStreamingEpNum = 1;
let previewVideoMuted = true;
let isPlayerControlsVisible = true;
let playerIdleTimeout = null;

function getAnimeData(animeId) {
  if (ANIME_CATALOG[animeId]) return ANIME_CATALOG[animeId];
  // Fallback if not found
  return ANIME_CATALOG['kamui'];
}

function openAnimePreview(animeId, autoPlayTrailer = true) {
  const overlay = document.getElementById('netflixPreviewOverlay');
  if (!overlay) return;

  const data = getAnimeData(animeId);
  currentPreviewAnimeId = data.id;

  // Title, Badges, Kanji
  const titleEl = document.getElementById('previewTitle');
  if (titleEl) titleEl.textContent = data.title;

  const kanjiEl = document.getElementById('previewKanjiBadge');
  if (kanjiEl) kanjiEl.textContent = `${data.kanji} · ${data.badge}`;

  const matchEl = document.getElementById('previewMatchBadge');
  if (matchEl) matchEl.textContent = data.match;

  const ratingEl = document.getElementById('previewAgeRating');
  if (ratingEl) ratingEl.textContent = data.rating;

  const seasonEl = document.getElementById('previewSeasonBadge');
  if (seasonEl) seasonEl.textContent = data.seasonsCount.split(' ')[0] + ' ' + data.seasonsCount.split(' ')[1];

  // Synopsis, Hook & Metadata
  const hookEl = document.getElementById('previewHook');
  if (hookEl) hookEl.textContent = data.hook;

  const synopsisEl = document.getElementById('previewSynopsis');
  if (synopsisEl) synopsisEl.textContent = data.synopsis;

  const castEl = document.getElementById('previewCast');
  if (castEl) castEl.textContent = data.cast;

  const genresEl = document.getElementById('previewGenres');
  if (genresEl) genresEl.textContent = data.genres.join(', ');

  const moodEl = document.getElementById('previewMood');
  if (moodEl) moodEl.textContent = data.mood;

  const studioEl = document.getElementById('previewStudio');
  if (studioEl) studioEl.textContent = data.studio;

  const audioEl = document.getElementById('previewAudioLangs');
  if (audioEl) audioEl.textContent = data.audio;

  const subEl = document.getElementById('previewSubLangs');
  if (subEl) subEl.textContent = data.subtitles;

  const tabTitleEl = document.getElementById('tabAnimeTitleName');
  if (tabTitleEl) tabTitleEl.textContent = data.title;

  // Update My List button state
  const addListBtn = document.getElementById('previewAddListBtn');
  if (addListBtn) {
    const isSaved = getUserWatchlist().includes(data.id);
    addListBtn.classList.toggle('active', isSaved);
    const iconPlus = addListBtn.querySelector('.icon-plus');
    const iconCheck = addListBtn.querySelector('.icon-check');
    if (iconPlus && iconCheck) {
      iconPlus.style.display = isSaved ? 'none' : 'block';
      iconCheck.style.display = isSaved ? 'block' : 'none';
    }
    addListBtn.title = isSaved ? 'Remove from My List' : 'Add to My List';
  }

  // Update Like button state
  const likeBtn = document.getElementById('previewLikeBtn');
  if (likeBtn) {
    const isLiked = getUserLikedTitles().includes(data.id);
    likeBtn.classList.toggle('active', isLiked);
    likeBtn.style.color = isLiked ? 'var(--gold)' : '#ffffff';
    likeBtn.title = isLiked ? 'Liked' : 'I like this';
  }

  // Update Video Trailer Preview
  const videoPlayer = document.getElementById('previewVideoPlayer');
  const artFallback = document.getElementById('previewArtFallback');
  if (videoPlayer) {
    videoPlayer.src = data.trailerVideo || 'kamui-animation.mp4';
    videoPlayer.muted = previewVideoMuted;
    if (autoPlayTrailer) {
      const playPromise = videoPlayer.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          videoPlayer.muted = true;
          videoPlayer.play();
        });
      }
    }
  }

  // Grab Card SVG Art if available to use as fallback/thumbnail
  const cardElement = document.getElementById(data.id) || document.querySelector(`[data-anime-id="${data.id}"]`);
  let cardSvgHtml = '';
  if (cardElement) {
    const svgArt = cardElement.querySelector('.art');
    if (svgArt) {
      cardSvgHtml = svgArt.outerHTML;
      if (artFallback) {
        artFallback.innerHTML = cardSvgHtml;
      }
    }
  }

  // Render Episode List for this Anime
  renderEpisodesList(data, cardSvgHtml);

  // Render "More Like This" Recommendations
  renderMoreLikeThis(data);

  // Render "About" Details
  renderAboutDetails(data);

  // Reset tab to Episodes
  activatePreviewTab('episodes');

  // Open the modal
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const closeBtn = document.getElementById('previewCloseBtn');
  if (closeBtn) closeBtn.focus();
}

function closeAnimePreview() {
  const overlay = document.getElementById('netflixPreviewOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
  
  const videoPlayer = document.getElementById('previewVideoPlayer');
  if (videoPlayer) {
    videoPlayer.pause();
  }

  // Close full player if open
  closeFullPlayer();
}

// Render dynamic episode list in Netflix drawer
function renderEpisodesList(animeData, fallbackSvg) {
  const container = document.getElementById('episodesListContainer');
  if (!container) return;

  const episodes = animeData.episodes || [];
  container.innerHTML = episodes.map((ep) => {
    return `
      <div class="episode-card" data-ep="${ep.num}" data-anime="${animeData.id}">
        <span class="ep-number">${ep.num}</span>
        <div class="ep-thumb-wrap">
          ${fallbackSvg ? `<div class="ep-thumb-art">${fallbackSvg}</div>` : `<div class="ep-thumb-art" style="background:#1a2233;"></div>`}
          <div class="ep-play-overlay">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        <div class="ep-info">
          <div class="ep-title-row">
            <h4 class="ep-title">${ep.num}. ${ep.title}</h4>
            <span class="ep-duration">${ep.duration}</span>
          </div>
          <p class="ep-desc">${ep.desc}</p>
        </div>
      </div>
    `;
  }).join('');

  // Attach episode click handlers
  container.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', () => {
      const epNum = parseInt(card.dataset.ep, 10) || 1;
      startFullPlayer(animeData.id, epNum);
    });
  });
}

// Render "More Like This" recommendations grid
function renderMoreLikeThis(animeData) {
  const container = document.getElementById('moreLikeGridContainer');
  if (!container) return;

  const relatedIds = animeData.relatedIds || Object.keys(ANIME_CATALOG).filter(id => id !== animeData.id).slice(0, 3);
  
  container.innerHTML = relatedIds.map(recId => {
    const recData = getAnimeData(recId);
    return `
      <div class="rec-card" data-anime-id="${recData.id}">
        <div class="rec-thumb">
          <div style="width:100%; height:100%; background:linear-gradient(135deg, #182236 0%, #0d121c 100%); display:flex; align-items:center; justify-content:center;">
            <span style="font-family:var(--serif); font-size:32px; color:var(--gold); opacity:0.6;">${recData.kanji}</span>
          </div>
          <span class="rec-badge">${recData.badge}</span>
        </div>
        <div class="rec-body">
          <div class="rec-meta">
            <span class="badge-match">${recData.match}</span>
            <span class="badge-rating">${recData.rating}</span>
            <span class="badge-hd">4K HDR</span>
          </div>
          <h4 class="rec-title">${recData.title}</h4>
          <p class="rec-synopsis">${recData.synopsis}</p>
        </div>
      </div>
    `;
  }).join('');

  // Clicks on recommendation cards immediately load that anime's preview
  container.querySelectorAll('.rec-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const recAnimeId = card.dataset.animeId;
      openAnimePreview(recAnimeId, true);
    });
  });
}

// Render "About" production & studio details
function renderAboutDetails(animeData) {
  const container = document.getElementById('aboutAnimeDetails');
  if (!container) return;

  container.innerHTML = `
    <div class="about-block">
      <h4>Director</h4>
      <p>${animeData.director || 'Sunao Katabuchi'}</p>
    </div>
    <div class="about-block">
      <h4>Animation Studio</h4>
      <p>${animeData.studio || 'Kamui Originals × Studio MAPPA'}</p>
    </div>
    <div class="about-block">
      <h4>Voice Cast</h4>
      <p>${animeData.cast || 'Kenjiro Tsuda, Megumi Ogata, Mamoru Miyano, Saori Hayami'}</p>
    </div>
    <div class="about-block">
      <h4>Maturity Rating</h4>
      <p><span class="badge-rating" style="margin-right:6px;">${animeData.rating}</span> Recommended for ages ${animeData.rating.replace('+', '')} and up. ${animeData.maturityDesc || 'Violence, fantasy action.'}</p>
    </div>
    <div class="about-block">
      <h4>Genres</h4>
      <p>${animeData.genres.join(' · ')}</p>
    </div>
    <div class="about-block">
      <h4>Audio Formats</h4>
      <p>Dolby Atmos 5.1, Lossless Stereo (${animeData.audio})</p>
    </div>
  `;
}

// Tab switcher handler
function activatePreviewTab(tabKey) {
  const tabsHeader = document.getElementById('previewTabsHeader');
  if (!tabsHeader) return;

  tabsHeader.querySelectorAll('.preview-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabKey);
  });

  const modal = document.getElementById('netflixPreviewModal');
  if (modal) {
    modal.querySelectorAll('.preview-tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    const activePane = modal.querySelector(`#tabPane${tabKey.charAt(0).toUpperCase() + tabKey.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`);
    if (activePane) activePane.classList.add('active');
  }
}

// ---------- NETFLIX FULL VIDEO PLAYER CONTROLLER ----------
function startFullPlayer(animeId, episodeNum = 1) {
  const user = getAuthUser();
  if (!user || !user.loggedIn) {
    const data = getAnimeData(animeId);
    openAuthModal(
      'Sign in required to stream',
      `Please sign in or create an account to start streaming "${data.title}" Episode ${episodeNum} in 4K HDR.`,
      `watch.html#${animeId}`
    );
    return;
  }

  const data = getAnimeData(animeId);
  currentStreamingEpNum = episodeNum;

  // Pause the background preview trailer
  const previewVideo = document.getElementById('previewVideoPlayer');
  if (previewVideo) previewVideo.pause();

  const playerOverlay = document.getElementById('netflixFullPlayerOverlay');
  const streamVideo = document.getElementById('fullStreamVideo');
  const epTitleLabel = document.getElementById('playerCurrentEpTitle');

  if (!playerOverlay || !streamVideo) return;

  const currentEp = (data.episodes && data.episodes[episodeNum - 1]) || { title: `Episode ${episodeNum}`, duration: '24m' };
  if (epTitleLabel) {
    epTitleLabel.textContent = `${data.title} — Episode ${episodeNum}: ${currentEp.title}`;
  }

  streamVideo.src = data.fullVideo || 'kamui-animation.mp4';
  streamVideo.currentTime = 0;

  playerOverlay.classList.add('open');
  playerOverlay.setAttribute('aria-hidden', 'false');

  const playPromise = streamVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Auto-fallback
      streamVideo.muted = true;
      streamVideo.play();
    });
  }

  showToast(`▶ Now streaming "${data.title}" Ep. ${episodeNum} in 4K HDR`, 'success');
  updatePlayerPlayPauseIcons(true);
}

function closeFullPlayer() {
  const playerOverlay = document.getElementById('netflixFullPlayerOverlay');
  const streamVideo = document.getElementById('fullStreamVideo');
  if (playerOverlay) {
    playerOverlay.classList.remove('open');
    playerOverlay.setAttribute('aria-hidden', 'true');
  }
  if (streamVideo) {
    streamVideo.pause();
  }

  // Resume trailer video if preview modal is open
  const previewOverlay = document.getElementById('netflixPreviewOverlay');
  const previewVideo = document.getElementById('previewVideoPlayer');
  if (previewOverlay && previewOverlay.classList.contains('open') && previewVideo) {
    previewVideo.play().catch(() => {});
  }
}

function updatePlayerPlayPauseIcons(isPlaying) {
  const playBtn = document.getElementById('playerPlayPauseBtn');
  if (!playBtn) return;
  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');
  if (iconPlay && iconPause) {
    iconPlay.style.display = isPlaying ? 'none' : 'block';
    iconPause.style.display = isPlaying ? 'block' : 'none';
  }
}

function formatPlayerTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// ---------- INITIALIZE NETFLIX PREVIEW & PLAYER LISTENERS ----------
function initNetflixPreviewAndPlayer() {
  // Close preview button
  const closeBtn = document.getElementById('previewCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAnimePreview);
  }

  // Overlay click to close
  const previewOverlay = document.getElementById('netflixPreviewOverlay');
  if (previewOverlay) {
    previewOverlay.addEventListener('click', (e) => {
      if (e.target === previewOverlay) {
        closeAnimePreview();
      }
    });
  }

  // Audio mute/unmute button in preview banner
  const muteBtn = document.getElementById('previewMuteBtn');
  const previewVideo = document.getElementById('previewVideoPlayer');
  if (muteBtn && previewVideo) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      previewVideoMuted = !previewVideoMuted;
      previewVideo.muted = previewVideoMuted;
      const offIcon = muteBtn.querySelector('.icon-volume-off');
      const onIcon = muteBtn.querySelector('.icon-volume-on');
      if (offIcon && onIcon) {
        offIcon.style.display = previewVideoMuted ? 'block' : 'none';
        onIcon.style.display = previewVideoMuted ? 'none' : 'block';
      }
      showToast(previewVideoMuted ? 'Preview audio muted' : 'Preview audio unmuted', 'info');
    });
  }

  // Main Play Button in preview banner
  const mainPlayBtn = document.getElementById('previewMainPlayBtn');
  if (mainPlayBtn) {
    mainPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startFullPlayer(currentPreviewAnimeId, 1);
    });
  }

  // Add to My List button in preview
  const addListBtn = document.getElementById('previewAddListBtn');
  if (addListBtn) {
    addListBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const added = toggleUserWatchlist(currentPreviewAnimeId);
      const data = getAnimeData(currentPreviewAnimeId);
      addListBtn.classList.toggle('active', added);
      const iconPlus = addListBtn.querySelector('.icon-plus');
      const iconCheck = addListBtn.querySelector('.icon-check');
      if (iconPlus && iconCheck) {
        iconPlus.style.display = added ? 'none' : 'block';
        iconCheck.style.display = added ? 'block' : 'none';
      }
      showToast(added ? `✦ Added "${data.title}" to your Watchlist!` : `Removed "${data.title}" from your Watchlist.`, 'info');
    });
  }

  // Like button in preview
  const likeBtn = document.getElementById('previewLikeBtn');
  if (likeBtn) {
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const liked = toggleUserLiked(currentPreviewAnimeId);
      const data = getAnimeData(currentPreviewAnimeId);
      likeBtn.classList.toggle('active', liked);
      likeBtn.style.color = liked ? 'var(--gold)' : '#ffffff';
      showToast(liked ? `👍 Liked "${data.title}"!` : `Removed like for "${data.title}".`, 'info');
    });
  }

  // Tabs clicking in preview
  const tabsHeader = document.getElementById('previewTabsHeader');
  if (tabsHeader) {
    tabsHeader.querySelectorAll('.preview-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activatePreviewTab(btn.dataset.tab);
      });
    });
  }

  // Catalog Cards Click: Open Netflix Preview
  document.querySelectorAll('.watch-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const animeId = card.id || card.dataset.title?.toLowerCase().replace(/\s+/g, '-') || 'kamui';
      openAnimePreview(animeId, true);
    });
  });

  // Homepage Posters Click: Open Netflix Preview directly
  document.querySelectorAll('.poster').forEach(poster => {
    poster.addEventListener('click', (e) => {
      e.preventDefault();
      let animeId = poster.dataset.animeId;
      if (!animeId) {
        const href = poster.getAttribute('href') || '';
        animeId = href.split('#')[1] || 'kamui';
      }
      openAnimePreview(animeId, true);
    });
  });

  // Full Player Controls
  const streamVideo = document.getElementById('fullStreamVideo');
  const playerBackBtn = document.getElementById('playerBackBtn');
  const playerPlayPauseBtn = document.getElementById('playerPlayPauseBtn');
  const playerRewindBtn = document.getElementById('playerRewindBtn');
  const playerForwardBtn = document.getElementById('playerForwardBtn');
  const playerVolumeToggleBtn = document.getElementById('playerVolumeToggleBtn');
  const playerVolumeSlider = document.getElementById('playerVolumeSlider');
  const playerSpeedBtn = document.getElementById('playerSpeedBtn');
  const playerFullscreenBtn = document.getElementById('playerFullscreenBtn');
  const playerNextEpBtn = document.getElementById('playerNextEpBtn');
  const btnSkipIntro = document.getElementById('btnSkipIntro');
  const playerScrubberWrap = document.getElementById('playerScrubberWrap');
  const playerScrubberProgress = document.getElementById('playerScrubberProgress');
  const playerScrubberThumb = document.getElementById('playerScrubberThumb');
  const playerScrubberBuffered = document.getElementById('playerScrubberBuffered');
  const playerTimeDisplay = document.getElementById('playerTimeDisplay');
  const playerWrapper = document.getElementById('fullPlayerWrapper');

  if (playerBackBtn) {
    playerBackBtn.addEventListener('click', closeFullPlayer);
  }

  if (streamVideo) {
    // Play/Pause toggle
    const toggleStreamPlay = () => {
      if (streamVideo.paused) {
        streamVideo.play();
        updatePlayerPlayPauseIcons(true);
      } else {
        streamVideo.pause();
        updatePlayerPlayPauseIcons(false);
      }
    };

    if (playerPlayPauseBtn) {
      playerPlayPauseBtn.addEventListener('click', toggleStreamPlay);
    }
    streamVideo.addEventListener('click', toggleStreamPlay);

    // Rewind / Forward 10s
    if (playerRewindBtn) {
      playerRewindBtn.addEventListener('click', () => {
        streamVideo.currentTime = Math.max(0, streamVideo.currentTime - 10);
      });
    }
    if (playerForwardBtn) {
      playerForwardBtn.addEventListener('click', () => {
        streamVideo.currentTime = Math.min(streamVideo.duration || 1000, streamVideo.currentTime + 10);
      });
    }

    // Volume & Mute
    if (playerVolumeToggleBtn) {
      playerVolumeToggleBtn.addEventListener('click', () => {
        streamVideo.muted = !streamVideo.muted;
        const iconHigh = playerVolumeToggleBtn.querySelector('.icon-vol-high');
        const iconMuted = playerVolumeToggleBtn.querySelector('.icon-vol-muted');
        if (iconHigh && iconMuted) {
          iconHigh.style.display = streamVideo.muted ? 'none' : 'block';
          iconMuted.style.display = streamVideo.muted ? 'block' : 'none';
        }
      });
    }
    if (playerVolumeSlider) {
      playerVolumeSlider.addEventListener('input', (e) => {
        streamVideo.volume = parseFloat(e.target.value);
        streamVideo.muted = streamVideo.volume === 0;
      });
    }

    // Playback Speed
    const SPEEDS = [1.0, 1.25, 1.5, 2.0];
    let currentSpeedIdx = 0;
    if (playerSpeedBtn) {
      playerSpeedBtn.addEventListener('click', () => {
        currentSpeedIdx = (currentSpeedIdx + 1) % SPEEDS.length;
        const newSpeed = SPEEDS[currentSpeedIdx];
        streamVideo.playbackRate = newSpeed;
        playerSpeedBtn.textContent = `${newSpeed.toFixed(1)}x`;
      });
    }

    // Fullscreen Toggle
    if (playerFullscreenBtn && playerWrapper) {
      playerFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          playerWrapper.requestFullscreen?.() || playerWrapper.webkitRequestFullscreen?.();
        } else {
          document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
      });
    }

    // Next Episode
    if (playerNextEpBtn) {
      playerNextEpBtn.addEventListener('click', () => {
        const data = getAnimeData(currentPreviewAnimeId);
        const maxEps = data.episodes ? data.episodes.length : 4;
        const nextEpNum = currentStreamingEpNum < maxEps ? currentStreamingEpNum + 1 : 1;
        startFullPlayer(currentPreviewAnimeId, nextEpNum);
      });
    }

    // Skip Intro
    if (btnSkipIntro) {
      btnSkipIntro.addEventListener('click', () => {
        streamVideo.currentTime = Math.max(streamVideo.currentTime, 24);
        btnSkipIntro.style.display = 'none';
        showToast('⏩ Skipped Intro', 'info');
      });
    }

    // Time update & Scrubber
    streamVideo.addEventListener('timeupdate', () => {
      const cur = streamVideo.currentTime;
      const dur = streamVideo.duration || (24 * 60); // fallback to simulated 24 min if short video
      const pct = dur > 0 ? (cur / dur) * 100 : 0;

      if (playerScrubberProgress) playerScrubberProgress.style.width = `${pct}%`;
      if (playerScrubberThumb) playerScrubberThumb.style.left = `${pct}%`;
      if (playerTimeDisplay) {
        playerTimeDisplay.textContent = `${formatPlayerTime(cur)} / ${formatPlayerTime(dur)}`;
      }

      // Skip Intro button visibility (show between 2s and 20s)
      if (btnSkipIntro) {
        btnSkipIntro.style.display = (cur > 2 && cur < 22) ? 'block' : 'none';
      }
    });

    // Scrubber click seek
    if (playerScrubberWrap) {
      playerScrubberWrap.addEventListener('click', (e) => {
        const rect = playerScrubberWrap.getBoundingClientRect();
        const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const dur = streamVideo.duration || (24 * 60);
        streamVideo.currentTime = clickPos * dur;
      });
    }

    // Controls Idle Fade
    const resetPlayerIdleTimer = () => {
      if (playerWrapper) playerWrapper.classList.remove('idle');
      clearTimeout(playerIdleTimeout);
      playerIdleTimeout = setTimeout(() => {
        if (streamVideo && !streamVideo.paused && playerWrapper) {
          playerWrapper.classList.add('idle');
        }
      }, 3500);
    };

    if (playerWrapper) {
      playerWrapper.addEventListener('mousemove', resetPlayerIdleTimer);
      playerWrapper.addEventListener('click', resetPlayerIdleTimer);
    }
  }

  // Check URL Hash for direct deep link (e.g., watch.html#ashfall-district)
  const checkHashPreview = () => {
    const hashId = window.location.hash.replace('#', '').trim();
    if (hashId && ANIME_CATALOG[hashId]) {
      setTimeout(() => {
        openAnimePreview(hashId, true);
      }, 250);
    }
  };
  checkHashPreview();
  window.addEventListener('hashchange', checkHashPreview);
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

// ---------- Global Keyboard Listener for Modals & Full Player ----------
document.addEventListener('keydown', (e) => {
  const playerOverlay = document.getElementById('netflixFullPlayerOverlay');
  const isPlayerOpen = playerOverlay && playerOverlay.classList.contains('open');
  const streamVideo = document.getElementById('fullStreamVideo');

  if (e.key === 'Escape') {
    if (isPlayerOpen) {
      closeFullPlayer();
    } else {
      closeAnimePreview();
      closeAuthModal();
      closeGoogleAuthModal();
    }
  }

  // Spacebar toggle play/pause when full video player is open
  if (isPlayerOpen && streamVideo && (e.key === ' ' || e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    if (streamVideo.paused) {
      streamVideo.play();
      updatePlayerPlayPauseIcons(true);
    } else {
      streamVideo.pause();
      updatePlayerPlayPauseIcons(false);
    }
  }

  // Left Arrow / Right Arrow for 10s seeking
  if (isPlayerOpen && streamVideo && (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J')) {
    e.preventDefault();
    streamVideo.currentTime = Math.max(0, streamVideo.currentTime - 10);
  }
  if (isPlayerOpen && streamVideo && (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L')) {
    e.preventDefault();
    streamVideo.currentTime = Math.min(streamVideo.duration || 1000, streamVideo.currentTime + 10);
  }

  // Mute toggle (M)
  if (isPlayerOpen && streamVideo && (e.key === 'm' || e.key === 'M')) {
    e.preventDefault();
    streamVideo.muted = !streamVideo.muted;
  }

  // Fullscreen (F)
  if (isPlayerOpen && (e.key === 'f' || e.key === 'F')) {
    e.preventDefault();
    const playerWrapper = document.getElementById('fullPlayerWrapper');
    if (!document.fullscreenElement && playerWrapper) {
      playerWrapper.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
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
  initNetflixPreviewAndPlayer();
  initStartWatchingInterceptors();
  initAuthPages();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

