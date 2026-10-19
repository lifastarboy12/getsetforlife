async function initApp(){
  const { firebaseConfig } = await import('./firebase-config.js');
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js');
  const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js');
  const { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js');
  const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);

  const PAYMENT_URL = 'https://your-payment-provider.com/checkout';
  const menu = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav nav');
  const modal = document.querySelector('#login');
  const pendingPlanKey = 'get-set-pending-plan';

  function savePendingPlan(plan) {
    if (plan) sessionStorage.setItem(pendingPlanKey, plan);
  }

  function continueAfterLogin(plan) {
    const targetPlan = plan || new URLSearchParams(window.location.search).get('plan');
    if (!targetPlan) {
      window.location.href = 'membership.html';
      return;
    }
    window.location.href = `membership.html?plan=${encodeURIComponent(targetPlan)}`;
  }

  function handleLeadCapture(event) {
    const form = event.currentTarget;
    const emailInput = form.querySelector('input[type="email"]');
    if (!emailInput) return;
    const email = emailInput.value.trim();
    if (!email) {
      emailInput.focus();
      return;
    }

    event.preventDefault();
    const button = form.querySelector('button');
    const originalText = button ? button.textContent : 'Get the checklist';
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending...';
    }

    addDoc(collection(db, 'lead-capture'), {
      email,
      source: 'homepage-checklist',
      createdAt: serverTimestamp()
    }).then(() => {
      form.innerHTML = '<p class="success-message">Thanks! Your checklist is on the way.</p>';
    }).catch(() => {
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
      emailInput.focus();
      alert('Something went wrong. Please try again.');
    });
  }

  const leadForm = document.querySelector('.lead-form');
  if (leadForm) leadForm.addEventListener('submit', handleLeadCapture);

  if (menu) menu.addEventListener('click', () => nav.classList.toggle('open'));
  document.querySelectorAll('[data-modal]').forEach(button => button.addEventListener('click', () => modal?.classList.add('show')));
  document.querySelectorAll('.close').forEach(button => button.addEventListener('click', () => button.closest('.modal').classList.remove('show')));

  function message(text, error = false) { const el = document.querySelector('.auth-message'); if (el) { el.textContent = text; el.classList.toggle('error', error); } }

  // Insert a visible user badge in the header if not present (so login state is obvious)
  const navActions = document.querySelector('.nav .nav-actions') || document.querySelector('.nav-actions');
  let userBadge = document.querySelector('.user-badge');
  if (!userBadge && navActions) {
    userBadge = document.createElement('div');
    userBadge.className = 'user-badge';
    userBadge.setAttribute('aria-live','polite');
    userBadge.innerHTML = '<span class="status-dot"></span><span class="status-text">Not signed in</span>';
    navActions.appendChild(userBadge);
  }
  // create profile dropdown container (hidden by default)
  let profileDropdown = document.querySelector('.profile-dropdown');
  if (!profileDropdown && userBadge) {
    profileDropdown = document.createElement('div');
    profileDropdown.className = 'profile-dropdown';
    profileDropdown.innerHTML = `
      <button class="profile-item" data-action="profile">Profile</button>
      <button class="profile-item" data-action="membership">My membership</button>
      <button class="profile-item" data-action="logout">Log out</button>
    `;
    userBadge.appendChild(profileDropdown);
  }

  // Ensure there's a plan-action button in the membership band (for animated CTA)
  let planBtn = document.querySelector('.plan-action');
  const band = document.querySelector('.membership-band');
  if (!planBtn && band) {
    planBtn = document.createElement('button');
    planBtn.className = 'primary light plan-action';
    planBtn.setAttribute('data-plan', 'monthly');
    planBtn.textContent = 'Choose a plan ';
    const arrow = document.createElement('span'); arrow.textContent = '→'; planBtn.appendChild(arrow);
    band.querySelector('div')?.appendChild(planBtn);
  }

  // Update header & badge when auth state changes
  onAuthStateChanged(auth, user => {
    const login = document.querySelector('.login-link');
    const statusText = document.querySelector('.user-badge .status-text');
    const statusDot = document.querySelector('.user-badge .status-dot');
    if (login) {
      if (user) { login.textContent = 'Log out'; login.onclick = () => signOut(auth); }
      else { login.textContent = 'Log in'; login.onclick = () => modal?.classList.add('show'); }
    }
    if (statusText) {
      if (user) {
        const name = user.displayName || (user.email ? user.email.split('@')[0] : 'Member');
        statusText.textContent = name;
        statusDot.classList.remove('pulse');
        userBadge.classList.add('signed');
      } else {
        statusText.textContent = 'Not signed in';
        statusDot.classList.add('pulse');
        userBadge.classList.remove('signed');
      }
    }
    if (userBadge) {
      userBadge.onclick = (e) => {
        if (!auth.currentUser) return;
        profileDropdown.classList.toggle('open');
      };
    }
    profileDropdown?.addEventListener('click', (e) => {
      const btn = e.target.closest('.profile-item');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'logout') signOut(auth);
      if (action === 'membership') window.location.href = 'membership.html#my-membership';
      if (action === 'profile') alert('Profile page coming soon');
    });
    document.addEventListener('click', (ev) => {
      if (!userBadge || !profileDropdown) return;
      if (!userBadge.contains(ev.target)) profileDropdown.classList.remove('open');
    });

    const chosenPlan = sessionStorage.getItem(pendingPlanKey) || new URLSearchParams(window.location.search).get('plan');
    if (user && window.location.pathname.toLowerCase().endsWith('membership.html') && chosenPlan) {
      const checkout = document.querySelector('#checkout');
      if (checkout) {
        const label = checkout.querySelector('[data-plan-label]') || document.createElement('p');
        label.className = 'plan-label';
        label.setAttribute('data-plan-label', 'true');
        label.textContent = chosenPlan.charAt(0).toUpperCase() + chosenPlan.slice(1);
        if (!checkout.querySelector('[data-plan-label]')) {
          const title = checkout.querySelector('h2');
          title.insertAdjacentElement('afterend', label);
        }
        checkout.classList.add('show');
      }
      sessionStorage.removeItem(pendingPlanKey);
    }
  });

  const form = document.querySelector('#login form');
  if (form) {
    let register = document.querySelector('.auth-switch');
    if (!register) {
      register = document.createElement('button'); register.type = 'button'; register.className = 'auth-switch'; register.textContent = 'Create an account'; form.insertAdjacentElement('afterend', register);
    }
    let note = document.querySelector('.auth-message');
    if (!note) { note = document.createElement('p'); note.className = 'auth-message'; register.insertAdjacentElement('afterend', note); }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const [email, password] = form.querySelectorAll('input');
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        message('You are now logged in.');
        const plannedPlan = sessionStorage.getItem(pendingPlanKey) || new URLSearchParams(window.location.search).get('plan');
        if (plannedPlan) {
          continueAfterLogin(plannedPlan);
          return;
        }
        setTimeout(() => modal?.classList.remove('show'), 800);
      }
      catch (error) { message(error.message.replace('Firebase: ', ''), true); }
    });

    register.addEventListener('click', async () => {
      const [email, password] = form.querySelectorAll('input');
      if (!email.value || !password.value) return message('Enter an email address and password first.', true);
      try {
        const result = await createUserWithEmailAndPassword(auth, email.value, password.value);
        await setDoc(doc(db, 'clients', result.user.uid), { email: result.user.email, role: 'client', createdAt: serverTimestamp() });
        message('Your client account has been created.');
        const plannedPlan = sessionStorage.getItem(pendingPlanKey) || new URLSearchParams(window.location.search).get('plan');
        if (plannedPlan) {
          continueAfterLogin(plannedPlan);
          return;
        }
        setTimeout(() => modal?.classList.remove('show'), 800);
      } catch (error) { message(error.message.replace('Firebase: ', ''), true); }
    });
  }

  function redirectToPayment(plan) {
    const safePlan = encodeURIComponent(plan || 'membership');
    const url = PAYMENT_URL && PAYMENT_URL !== 'https://your-payment-provider.com/checkout' ? `${PAYMENT_URL}${PAYMENT_URL.includes('?') ? '&' : '?'}plan=${safePlan}` : '';
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    }
    return false;
  }

  // Plan/action behavior: if not signed in, show modal; if signed in, go to membership page or save enquiry
  function handlePlanClick(e){
    const button = e.currentTarget;
    const plan = button.getAttribute('data-plan') || button.closest('article')?.querySelector('h2')?.textContent.trim() || 'Membership';

    if (!auth.currentUser) {
      savePendingPlan(plan);
      window.location.href = `index.html?redirect=membership&plan=${encodeURIComponent(plan)}`;
      return;
    }

    const checkout = document.querySelector('#checkout');
    if (checkout) {
      const label = checkout.querySelector('[data-plan-label]') || document.createElement('p');
      label.className = 'plan-label';
      label.setAttribute('data-plan-label', 'true');
      label.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
      if (!checkout.querySelector('[data-plan-label]')) {
        const title = checkout.querySelector('h2');
        title.insertAdjacentElement('afterend', label);
      }
      checkout.classList.add('show');
    }

    if (redirectToPayment(plan)) {
      return;
    }

    addDoc(collection(db, 'enquiries'), { clientId: auth.currentUser.uid, type: 'membership-interest', plan, createdAt: serverTimestamp() })
      .catch(() => {});
  }

  document.querySelectorAll('.plan-action').forEach(button => button.removeEventListener('click', handlePlanClick) || button.addEventListener('click', handlePlanClick));

  const redirectParam = new URLSearchParams(window.location.search).get('redirect');
  if (redirectParam === 'membership' && !auth.currentUser && modal) {
    modal.classList.add('show');
    message('Please log in to continue with your selected plan.');
  }

  const joinBtn = document.querySelector('.join-button');
  if (joinBtn) {
    joinBtn.addEventListener('click', e => {
      if (!auth.currentUser) { e.preventDefault(); modal?.classList.add('show'); message('Please log in or create an account to join.'); }
    });
  }

  const slideshowImages = document.querySelectorAll('.slide');
  if (slideshowImages.length > 1) {
    let slideIndex = 0;
    setInterval(() => {
      slideIndex = (slideIndex + 1) % slideshowImages.length;
      slideshowImages.forEach((img, index) => img.classList.toggle('active', index === slideIndex));
    }, 15000);
  }

  // CONTACT FORM HANDLING
  function handleContactFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#mail');
    const messageInput = form.querySelector('#message');
    const button = form.querySelector('button[type="submit"]');
    
    // Validation
    if (!nameInput?.value.trim() || !emailInput?.value.trim() || !messageInput?.value.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      alert('Please enter a valid email address.');
      emailInput.focus();
      return;
    }

    const originalText = button?.textContent || 'Send my note →';
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending...';
    }

    // Save to Firestore
    addDoc(collection(db, 'contact-submissions'), {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim(),
      source: 'contact-form',
      createdAt: serverTimestamp()
    }).then(() => {
      form.innerHTML = '<div class="success-message"><p><strong>Thanks for reaching out!</strong></p><p>We\'ll be in touch within two working days.</p></div>';
    }).catch((error) => {
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
      console.error('Form submission error:', error);
      alert('Something went wrong. Please try again or call us directly.');
    });
  }

  // Attach contact form handler
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }

  // FORM VALIDATION UTILITIES
  function setupFormValidation() {
    // Email input validation
    document.querySelectorAll('input[type="email"]').forEach(input => {
      input.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
          this.setAttribute('aria-invalid', 'true');
        } else {
          this.removeAttribute('aria-invalid');
        }
      });
    });

    // Password strength indicator
    document.querySelectorAll('input[type="password"]').forEach(input => {
      input.addEventListener('input', function() {
        const strength = calculatePasswordStrength(this.value);
        this.setAttribute('data-strength', strength);
      });
    });
  }

  function calculatePasswordStrength(password) {
    if (!password) return 'empty';
    if (password.length < 8) return 'weak';
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'fair';
    return 'strong';
  }

  setupFormValidation();

  // MODAL CLOSE ON OUTSIDE CLICK
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });

  // KEYBOARD NAVIGATION
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
    }
  });

  // SMOOTH SCROLL FOR ANCHOR LINKS
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

initApp();

