if(!document.querySelector('link[href="responsive.css"]')){const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='responsive.css';document.head.appendChild(sheet)}const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('.main-nav');if(toggle){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open);toggle.innerHTML=open?'Close <span>×</span>':'Menu <span>☰</span>'})}const heroLabel=document.querySelector('.hero .eyebrow');if(heroLabel)heroLabel.textContent='GET SET FOR LIFE COACHING IN PRACTICE';const cards=document.querySelectorAll('.service-card');const services=[['Empower','Build confidence, discover your strengths, and take ownership of the life you want.'],['Grow','Create steady momentum through purposeful choices and supportive guidance.'],['Thrive','Turn your vision into a life that feels balanced, meaningful, and fully yours.']];cards.forEach((card,i)=>{const title=card.querySelector('h3'),description=card.querySelector('p');if(title)title.textContent=services[i][0];if(description)description.textContent=services[i][1]});const contactCopy=document.querySelector('.contact-copy');if(contactCopy){const details=document.createElement('div');details.className='contact-details';details.innerHTML='<p class="eyebrow">CONNECT WITH GET</p><a href="tel:0761184608">076 118 4608</a><a href="tel:0130014420">013 001 4420</a><a href="https://instagram.com/getsetforlife_coachingpractice" target="_blank" rel="noreferrer">Instagram: @getsetforlife_coachingpractice</a><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook: Get Set For Life In Practice</a>';contactCopy.appendChild(details)}

// FORM HANDLING FOR SECONDARY PAGES
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

  // Show success message
  form.innerHTML = '<div class="success-message"><p><strong>Thanks for reaching out!</strong></p><p>We\'ll be in touch within two working days.</p></div>';
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
}

setupFormValidation();

// KEYBOARD NAVIGATION
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('[data-open]').forEach(el => el.removeAttribute('data-open'));
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

