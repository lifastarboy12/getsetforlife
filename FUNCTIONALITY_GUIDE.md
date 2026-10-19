# Website Functionality & Algorithm Guide

## System Architecture Overview

### Core Components

#### 1. Authentication Module (Firebase Auth)
**Purpose:** User registration, login, session management
**Algorithm Flow:**
```
User clicks login → Modal opens → 
  If creating account:
    - Validate email format
    - Check password strength (8+ chars, uppercase, numbers)
    - createUserWithEmailAndPassword()
    - Save user profile to Firestore
    - Show success message
    - Redirect if plan pending
  If logging in:
    - signInWithEmailAndPassword()
    - Update user badge
    - Redirect if plan pending
```

**Key Functions:**
- `initApp()` - Initializes Firebase and all handlers
- `onAuthStateChanged()` - Listens for login state changes
- `signInWithEmailAndPassword()` - Authenticates existing users
- `createUserWithEmailAndPassword()` - Creates new accounts
- `signOut()` - Logs out current user

**Session Storage:**
- `get-set-pending-plan` - Stores plan selection before login
- Redirects user back to membership.html after login with plan parameter

#### 2. Plan Selection & Checkout Module
**Purpose:** Handle membership plan selections and payment
**Algorithm Flow:**
```
User clicks "Choose Plan" button → 
  Check if user logged in:
    If NO:
      - Save plan to sessionStorage
      - Redirect to index.html with login modal
      - After login, redirect back with plan param
    If YES:
      - Extract plan name from button/article
      - Create plan-label element
      - Show checkout modal
      - Save enquiry to Firestore
      - (Redirect to payment provider if URL configured)
```

**Plan Data Structure:**
- free: Free tier
- grow: R199/month
- thrive: R499/month

**Checkout Process:**
1. User selects plan
2. Modal displays "Your plan is selected"
3. Plan name shown in modal
4. User clicks "Contact us to join"
5. Enquiry saved to database

#### 3. Form Validation Module
**Purpose:** Validate user inputs across all forms
**Email Validation Algorithm:**
```
Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
Triggers: On blur, on submit
Result: Sets aria-invalid="true" if invalid
```

**Password Strength Algorithm:**
```
Input: password string
Output: "empty" | "weak" | "fair" | "strong"

Logic:
  if (password.length === 0) return "empty"
  if (password.length < 8) return "weak"
  if (!hasUppercase || !hasNumbers) return "fair"
  return "strong"
```

**Contact Form Validation Flow:**
```
User submits form →
  1. Check all fields not empty
  2. Trim whitespace
  3. Validate email format
  4. If invalid: show alert, focus field
  5. If valid: disable button, show "Sending..."
  6. Save to Firestore
  7. If success: replace form with success message
  8. If error: re-enable button, show alert
```

#### 4. Lead Capture Module
**Purpose:** Collect emails for free resources
**Flow:**
```
User enters email → Click "Get the checklist" →
  1. Validate email not empty
  2. Focus if empty
  3. Disable button, show "Sending..."
  4. Save to lead-capture collection
  5. Replace form with success message
  6. If error: re-enable, show alert
```

**Firestore Document:**
```
{
  email: "user@example.com",
  source: "homepage-checklist",
  createdAt: Timestamp
}
```

#### 5. Navigation & Menu Module
**Purpose:** Handle mobile menu and navigation
**Algorithm:**
```
Hamburger click →
  toggle .open class on nav element
  Update aria-expanded attribute
  Change button text: "Menu ☰" ↔ "Close ×"
  
Outside click →
  if click outside nav: remove .open class
```

**Smooth Scrolling:**
```
Click anchor link (#services, #how, etc) →
  Find target element
  scrollIntoView({ behavior: 'smooth' })
```

#### 6. Image Slideshow Module
**Purpose:** Auto-rotate hero images
**Algorithm:**
```
Initialize:
  slideIndex = 0
  Get all .slide images
  Mark first as active
  
Every 15 seconds:
  slideIndex = (slideIndex + 1) % totalSlides
  Remove active class from all
  Add active class to current slide
```

#### 7. User Badge & Profile Dropdown
**Purpose:** Show login status and provide user options
**Algorithm:**
```
Auth state changes →
  If logged in:
    Get user name from displayName or email
    Update badge text
    Remove pulse animation
    Add .signed class
    Enable dropdown click
    
Dropdown menu items:
  - Profile (placeholder)
  - My membership (links to membership.html#my-membership)
  - Log out (calls signOut())
  
Outside click →
  if target not badge: close dropdown
```

## Data Flow Diagrams

### Authentication Flow
```
[Login Modal] 
    ↓
[Email/Password Input]
    ↓
[Create Account Button]
    ↓
Firebase Auth → Firebase Firestore (save user profile)
    ↓
[User Badge Updates] → [Show Success Message]
    ↓
[Close Modal] OR [Redirect to Membership]
```

### Plan Selection Flow
```
[Choose Plan Button]
    ↓
[Check Auth State]
    ↓
Not Logged In → [Save to sessionStorage] → [Show Login Modal]
    ↓
Logged In → [Show Checkout Modal] → [Save Enquiry to Firestore]
    ↓
[User Contacts Support to Complete Payment]
```

### Contact Form Submission Flow
```
[Form Submit Event]
    ↓
[Validate All Fields]
    ↓
[Validate Email Format]
    ↓
[Disable Submit Button]
    ↓
[Save to Firestore contact-submissions]
    ↓
Success → [Show Success Message]
Failed → [Re-enable Button] → [Show Error Alert]
```

## Firestore Operations

### Create Operations
**User Profile:**
```javascript
setDoc(doc(db, 'clients', userId), {
  email: userEmail,
  role: 'client',
  createdAt: serverTimestamp()
})
```

**Lead Capture:**
```javascript
addDoc(collection(db, 'lead-capture'), {
  email: userEmail,
  source: 'homepage-checklist',
  createdAt: serverTimestamp()
})
```

**Contact Submission:**
```javascript
addDoc(collection(db, 'contact-submissions'), {
  name: formName,
  email: formEmail,
  message: formMessage,
  source: 'contact-form',
  createdAt: serverTimestamp()
})
```

**Enquiry:**
```javascript
addDoc(collection(db, 'enquiries'), {
  clientId: auth.currentUser.uid,
  type: 'membership-interest',
  plan: selectedPlan,
  createdAt: serverTimestamp()
})
```

## Event Listeners & Handlers

### Global Event Listeners
| Event | Selector | Handler | Action |
|-------|----------|---------|--------|
| click | .hamburger | toggleMenu | Toggle navigation |
| click | [data-modal] | showModal | Open login modal |
| click | .close | closeModal | Close modal |
| click | .plan-action | handlePlanClick | Handle plan selection |
| click | .user-badge | toggleDropdown | Toggle profile menu |
| click | .profile-item | handleProfile | Handle profile actions |
| submit | .lead-form | handleLeadCapture | Capture email |
| submit | #login form | handleLoginSubmit | Login handler |
| click | .auth-switch | handleRegister | Create account |
| submit | .contact-form | handleContactForm | Submit contact |
| click | a[href^="#"] | smoothScroll | Smooth scroll anchor |
| keydown | document | handleEscape | Close modals on Esc |
| click | .modal | closeOnBackdrop | Close on outside click |

## CSS Classes & States

### Authentication States
- `.user-badge.signed` - User is logged in
- `.profile-dropdown.open` - Dropdown is visible
- `.modal.show` - Modal is visible
- `.auth-message.error` - Error message style

### Form States
- `input[aria-invalid="true"]` - Invalid field
- `input[data-strength="weak|fair|strong"]` - Password strength
- `button:disabled` - Button disabled
- `.success-message` - Success feedback

### Navigation States
- `.nav nav.open` - Mobile menu open
- `a.active` - Active page link
- `.hamburger` - Mobile menu button

## Performance Optimizations

### Lazy Loading
- Images load on demand
- Slideshow only initializes if multiple images present

### Event Delegation
- Single listener for multiple modal close buttons
- Single listener for multiple plan action buttons
- Single listener for multiple dropdown items

### Debouncing
- Window resize handled by media queries only
- No debounced scroll listeners

### Caching
- sessionStorage for pending plan
- localStorage could be used for preferences

## Security Considerations

### Frontend Security
- Email validation prevents most invalid entries
- Password strength encourages secure passwords
- XSS prevention: textContent used instead of innerHTML where possible
- CSRF: Firebase handles CSRF tokens automatically

### Backend Security (Firestore Rules)
```
- Public collections: lead-capture, contact-submissions
- User-owned: clients, bookings, enquiries
- Read-only: resources
- Admin-only operations: protected in console
```

## Error Handling

### Try-Catch Blocks
- Firebase auth operations wrapped in try-catch
- Firestore operations wrapped in try-catch
- Error messages shown to user

### User Feedback
- Alert messages for validation errors
- Auth messages for auth errors (Firebase error codes cleaned)
- Success messages for successful submissions
- Button loading states during async operations

### Fallbacks
- Missing modal elements: ignored gracefully
- Missing elements for enhancement: checked before use
- Fallback text for buttons if not found in DOM

## Testing Scenarios

### Authentication
✓ Create account with valid email
✓ Create account with duplicate email (should fail)
✓ Create account with weak password
✓ Login with correct credentials
✓ Login with incorrect credentials
✓ Logout from dropdown
✓ Verify user badge updates

### Plan Selection
✓ Click plan before login
✓ Click plan after login
✓ Verify checkout modal shows selected plan
✓ Verify enquiry saved to Firestore

### Forms
✓ Submit contact form with empty fields
✓ Submit contact form with invalid email
✓ Submit contact form with all valid data
✓ Verify success message appears
✓ Lead capture email validation

### Navigation
✓ Mobile menu toggle
✓ Outside click closes menu
✓ Anchor links smooth scroll
✓ All navigation links work
✓ Active page highlighted

### Responsive
✓ Test at 360px (mobile)
✓ Test at 768px (tablet)
✓ Test at 1024px (desktop)
✓ Test at 1440px (large desktop)
✓ Menu works on all sizes

## Deployment Checklist

- [ ] Update PAYMENT_URL in app.js
- [ ] Test all forms with real Firestore
- [ ] Verify Firebase rules deployed
- [ ] Test authentication flow
- [ ] Test payment redirect (if implemented)
- [ ] Check all images load
- [ ] Verify responsive design
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify contact form saves to Firestore
- [ ] Set up email notifications for submissions
- [ ] Document admin procedures
- [ ] Create user manual for coach
- [ ] Set up analytics (if needed)
- [ ] Enable HTTPS/SSL
- [ ] Set up CDN for images
