# Get Set For Life - Website Documentation

## Overview
This is a fully functional coaching practice website with Firebase authentication, membership plans, lead capture, and contact form management.

## Architecture

### Frontend Files
- **index.html** - Main landing page with hero, services, testimonials, FAQ, membership showcase
- **membership.html** - Membership plans display and checkout modal
- **about.html, coaching.html, programs.html, resources.html** - Information pages
- **contact.html** - Contact form for inquiries
- **app.css** - Primary stylesheet for index.html and membership.html (with form validation styles)
- **styles.css** - Secondary stylesheet for about/coaching/programs/resources pages
- **responsive.css** - Mobile responsive styles
- **app.js** - Main application logic with Firebase integration
- **script.js** - Secondary page logic for static pages

### Firebase Configuration
- **firebase-config.js** - Firebase project configuration (API keys, project ID)
- **firestore.rules** - Database security rules

## Key Features

### 1. Authentication System
- Email/password registration and login
- User profile creation in Firestore
- Session persistence
- User badge showing login status in header

**Flow:**
- Click "Log in" button → Login modal appears
- Enter email and password → Sign in or create account
- User badge updates with name and status

### 2. Membership Plans
- Three tiers: Free, Grow (R199/month), Thrive (R499/month)
- Plan selection triggers authentication if needed
- Checkout modal displays selected plan
- Enquiries saved to Firestore

**Flow:**
- Click "Choose a plan" button
- If not logged in → redirects to login, then back to plans
- If logged in → checkout modal appears
- Contact support to finalize payment setup

### 3. Lead Capture
- Email collection for free checklist
- Saves to `lead-capture` Firestore collection
- Email validation included

### 4. Contact Form
- Full form validation (name, email, message required)
- Email format validation
- Saves submissions to `contact-submissions` collection
- Success feedback message displayed after submission

**Form Logic:**
1. User enters name, email, message
2. Email format validated on blur
3. On submit: all fields checked, email re-validated
4. Submit button disabled during processing
5. Success message replaces form after submission

### 5. Hamburger Menu Navigation
- Mobile-friendly toggle navigation
- Works on all pages
- Closes when clicking outside or selecting link

## Firestore Database Structure

### Collections

**clients/** - User profiles
```
{
  email: string,
  role: "client",
  createdAt: timestamp
}
```

**lead-capture/** - Email list for free resources
```
{
  email: string,
  source: "homepage-checklist",
  createdAt: timestamp
}
```

**contact-submissions/** - Contact form submissions
```
{
  name: string,
  email: string,
  message: string,
  source: "contact-form",
  createdAt: timestamp
}
```

**enquiries/** - Membership interest
```
{
  clientId: string,
  type: "membership-interest",
  plan: string,
  createdAt: timestamp
}
```

## Security Rules

- **Public access**: lead-capture and contact-submissions can be submitted by anyone
- **User data**: Only users can read/update their own profile
- **User content**: Only users can create/read their own bookings and enquiries
- **Admin only**: Resources are read-only to public, editable by admin only

## Form Validation Features

### Email Validation
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Triggered on blur and submit
- Visual feedback with aria-invalid attribute

### Password Strength Indicator
- Weak: less than 8 characters
- Fair: 8+ characters but missing uppercase or numbers
- Strong: 8+ characters with uppercase and numbers
- Visual indicator via data-strength attribute

### Form Feedback
- Error messages displayed in `.auth-message` element
- Success messages shown after successful submission
- Button disabled state during processing
- Loading text ("Sending...") shown on submit button

## Payment Integration

Current status: **Placeholder**
- Update `PAYMENT_URL` in app.js to connect Stripe/PayFast/Paystack
- URL format: `https://payment-provider.com/checkout?plan={planName}`
- Currently shows checkout modal and saves enquiry to database

## User Flows

### Sign Up Flow
1. Click "Log in" button on any page
2. Click "Create an account"
3. Enter email and password
4. Click "Create an account" button
5. Account created in Firebase Auth + Firestore
6. If membership plan was pending, redirect to membership page
7. Modal closes after 0.8s

### Login Flow
1. Click "Log in" button
2. Enter credentials
3. Click "Log in"
4. User badge updates
5. If pending plan, redirect to membership
6. Modal closes

### Membership Selection Flow
1. Click "Choose a plan" on any page
2. If not logged in → redirected to index.html with login modal
3. After login → redirected back to membership.html
4. Selected plan displayed in checkout modal
5. Contact support to complete payment

### Contact Form Flow
1. Go to contact.html
2. Fill in name, email, message
3. Click "Send my note"
4. Form validated
5. Data saved to Firestore
6. Success message displayed
7. Form replaced with confirmation text

## Testing Checklist

- [ ] Load index.html - all sections display correctly
- [ ] Mobile menu toggle works on all pages
- [ ] Click login button - modal appears
- [ ] Create account with valid email/password
- [ ] Log in with existing account
- [ ] Log out from user badge dropdown
- [ ] Click plan button - checkout modal appears
- [ ] Lead capture form validates email
- [ ] Contact form validates all fields
- [ ] Contact form shows success message
- [ ] All internal links work
- [ ] Navigation links highlight active page
- [ ] Responsive design on mobile (360px, 768px, 1024px)
- [ ] All buttons have proper hover/active states
- [ ] Images load correctly
- [ ] Slideshow auto-rotates every 15 seconds
- [ ] Smooth scroll works for anchor links

## Setup Instructions

### 1. Firebase Project
- Go to https://console.firebase.google.com
- Create new project or use existing
- Enable Authentication (Email/Password)
- Create Firestore database
- Copy config to firebase-config.js

### 2. Security Rules
- Go to Firestore → Rules tab
- Copy rules from firestore.rules
- Deploy rules

### 3. Payment Provider
- Set up Stripe/PayFast/Paystack account
- Update PAYMENT_URL in app.js
- Test checkout flow

### 4. Hosting
- Option 1: Firebase Hosting
  ```
  npm install -g firebase-tools
  firebase init
  firebase deploy
  ```
- Option 2: Netlify, Vercel, or static host
- Just upload HTML/CSS/JS files

## File Structure
```
project/
├── index.html
├── membership.html
├── about.html
├── coaching.html
├── programs.html
├── resources.html
├── contact.html
├── app.js
├── script.js
├── firebase-config.js
├── app.css
├── styles.css
├── responsive.css
├── firestore.rules
└── [images & assets]
```

## Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations
- CSS variables for theming
- Smooth scrolling behavior
- Lazy loading placeholders for images
- Minimal JavaScript dependencies (Firebase SDK)
- Responsive images and media queries

## Maintenance

### Regular Tasks
- Monitor Firestore database for submissions
- Export contact/lead data monthly
- Check auth success rates
- Review user feedback
- Update testimonials quarterly

### Common Issues

**Contact form not submitting:**
- Check Firebase Auth is enabled
- Verify Firestore rules allow submissions
- Check browser console for errors
- Ensure email validation passes

**Login modal not appearing:**
- Verify app.js is loaded
- Check browser console for JavaScript errors
- Clear browser cache
- Check Firebase config is correct

**Images not loading:**
- Verify image files exist in project directory
- Check file paths are correct
- Use absolute paths if on subdomain

## Support
For Firebase issues: https://firebase.google.com/support
For website bugs: Check browser console and verify Firestore rules
