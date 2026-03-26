const { body, validationResult } = require("express-validator");

const IsvalidRegisterInputError = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const IsvalidInput = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be 3-30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores")
    .custom((value) => {
      // Prevent SQL injection patterns
      if (
        value.includes("'") ||
        value.includes('"') ||
        value.includes(";") ||
        value.includes("--")
      ) {
        throw new Error("Username contains invalid characters");
      }
      // Prevent XSS patterns
      if (
        value.includes("<") ||
        value.includes(">") ||
        value.includes("script")
      ) {
        throw new Error("Username contains invalid characters");
      }
      return true;
    }),

  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 254 })
    .withMessage("Email is too long")
    .custom((value) => {
      // Prevent SQL injection in email
      if (value.includes(";") || value.includes("--") || value.includes("/*")) {
        throw new Error("Email contains invalid characters");
      }
      return true;
    }),

  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be 8-128 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain at least one special character"),

  body("fullName.firstName")
    .isString()
    .withMessage("First name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be 2-50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    ).custom((value) => {
      // Prevent XSS
      if (
        value.includes("<") ||
        value.includes(">") ||
        value.includes("script")
      ) {
        throw new Error("First name contains invalid characters");
      }
      return true;
    }),

  body("fullName.lastName")
    .isString()
    .withMessage("Last name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be 2-50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Last name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .custom((value) => {
      // Prevent XSS
      if (
        value.includes("<") ||
        value.includes(">") ||
        value.includes("script")
      ) {
        throw new Error("Last name contains invalid characters");
      }
      return true;
    }),

    body('role')
    .optional()
    .isIn(['user','seller'])
    .withMessage("Role eather be user or seller"),

  IsvalidRegisterInputError,
];
const CheckLoginInput = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .isLength({ max: 254 })
    .withMessage("Email is too long"),

  body("password").isLength({ min: 1 }).withMessage("Password is required"),

  IsvalidRegisterInputError,
];

const ValidateAddressInput = [
  body("street")
    .isString()
    .withMessage("Street must be a string")
    .isLength({ min: 5, max: 100 })
    .withMessage("Street must be 5-100 characters"),
  body("city")
    .isString()
    .withMessage("City must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("City must be 2-50 characters"),
  body("state")
    .isString()
    .withMessage("State must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("State must be 2-50 characters"),
  body("zipCode")
    .isString()
    .withMessage("ZipCode must be a string")
    .isLength({ min: 3, max: 20 })
    .withMessage("ZipCode must be 3-20 characters")
    .matches(/^[0-9a-zA-Z\s\-]+$/)
    .withMessage("ZipCode contains invalid characters"),
  body("country")
    .isString()
    .withMessage("Country must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Country must be 2-50 characters"),
  IsvalidRegisterInputError,
];

module.exports = {
  IsvalidInput,
  CheckLoginInput,
  ValidateAddressInput,
};
