# Secure Registration Test Suite

This directory contains comprehensive security tests for the user registration endpoint.

## Installation

Install required testing dependencies:

```bash
npm install --save-dev jest supertest
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run tests in watch mode (re-run on file changes)
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- src/__tests__/auth.register.test.js
```

### Run tests with verbose output
```bash
npm test -- --verbose
```

## Test Coverage

The test suite covers the following security aspects:

### 1. **Valid Registration Data**
   - Successfully registers with valid data
   - Accepts valid usernames with alphanumeric and underscores

### 2. **Email Validation**
   - Rejects missing email
   - Rejects invalid email formats
   - Rejects emails with special characters
   - Rejects extremely long emails
   - Rejects duplicate emails (unique constraint)

### 3. **Username Validation**
   - Rejects missing username
   - Rejects usernames with special characters
   - Rejects usernames shorter than 3 characters
   - Rejects usernames longer than 30 characters
   - Rejects duplicate usernames

### 4. **Password Validation**
   - Rejects missing password
   - Requires uppercase letters
   - Requires lowercase letters
   - Requires numbers
   - Requires special characters
   - Enforces minimum 8 characters
   - Rejects passwords longer than 128 characters

### 5. **Full Name Validation**
   - Requires firstName and lastName
   - Rejects special characters in names
   - Rejects numeric-only names
   - Allows hyphens and apostrophes in names

### 6. **Security Attack Prevention**
   - SQL injection attempts in username
   - SQL injection attempts in email
   - XSS (Cross-Site Scripting) attacks
   - NoSQL injection attempts
   - Prototype pollution attacks

### 7. **Input Type Validation**
   - Rejects non-string inputs
   - Rejects null values
   - Rejects undefined values

### 8. **Whitespace and Trimming**
   - Trims whitespace from inputs
   - Rejects usernames with spaces

### 9. **Request Validation**
   - Rejects empty request body
   - Handles malformed JSON
   - Rejects extra/suspicious fields
   - Requires POST method

### 10. **Case Sensitivity**
   - Handles email case-insensitivity for duplicate checking

### 11. **Response Security**
   - Does not expose sensitive error details
   - Does not return plaintext passwords
   - Includes security headers

## Validation Utility Functions

The `src/middleware/validation.middleware.js` file provides ready-to-use validation functions:

### Available Functions

```javascript
const {
  validateEmail,
  validateUsername,
  validatePassword,
  validateFirstName,
  validateLastName,
  validateRegistration,
  sanitizeUserData
} = require('./src/middleware/validation.middleware');

// Validate individual fields
const emailResult = validateEmail('user@example.com');
const passwordResult = validatePassword('SecurePass123!@');

// Validate entire registration
const registrationResult = validateRegistration(userData);

// Sanitize user data
const cleanData = sanitizeUserData(userData);
```

## Implementation Example

Here's how to implement validation in your controller:

```javascript
const { validateRegistration, sanitizeUserData } = require('../middleware/validation.middleware');

async function register(req, res) {
  try {
    // Validate input
    const validation = validateRegistration(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    // Sanitize data
    const userData = sanitizeUserData(req.body);

    // Check for duplicates
    const existingUser = await UserModel.findOne({
      $or: [
        { email: userData.email.toLowerCase() },
        { username: userData.username }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    // Hash password and save user
    // ... rest of implementation
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred during registration'
    });
  }
}
```

## Key Security Features Tested

✅ **Input Validation**: All fields are validated for type, format, and length
✅ **XSS Prevention**: Special characters and script patterns are rejected
✅ **SQL/NoSQL Injection Prevention**: Common injection patterns are blocked
✅ **Prototype Pollution Defense**: Suspicious fields are filtered
✅ **Password Security**: Strong password requirements enforced
✅ **Email Security**: RFC-compliant email validation
✅ **Unique Constraints**: Duplicate username/email detection
✅ **Response Security**: No sensitive data leakage
✅ **Type Safety**: Strict input type checking
✅ **Case Handling**: Proper case-insensitive email handling

## Test Statistics

- **Total Test Cases**: 60+
- **Coverage Areas**: 11 major security categories
- **Attack Scenarios**: 8+ different types

## Notes

- The test suite assumes you'll implement a `/api/auth/register` POST endpoint
- Tests expect HTTP status codes: 400 (Bad Request), 409 (Conflict), 500 (Server Error)
- Make sure to implement proper error handling middleware
- Consider adding rate limiting to prevent brute force attacks
- Always use HTTPS in production
- Implement CSRF protection for form submissions

## Continuous Integration

Add to your CI/CD pipeline:

```bash
npm test -- --coverage --watchAll=false
```

This ensures all security tests pass before deployment.
