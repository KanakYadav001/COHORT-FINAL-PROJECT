const { body, validationResult } = require("express-validator");

// Validation rules for creating an order
const validateCreateOrder = [
  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isObject()
    .withMessage("Address must be an object"),

  body("address.street")
    .if(body("address").exists())
    .notEmpty()
    .withMessage("Street is required in address")
    .isString()
    .withMessage("Street must be a string")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Street must be at least 5 characters long"),

  body("address.city")
    .if(body("address").exists())
    .notEmpty()
    .withMessage("City is required in address")
    .isString()
    .withMessage("City must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("City must be at least 2 characters long"),

  body("address.state")
    .if(body("address").exists())
    .notEmpty()
    .withMessage("State is required in address")
    .isString()
    .withMessage("State must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("State must be at least 2 characters long"),

  body("address.zipCode")
    .if(body("address").exists())
    .notEmpty()
    .withMessage("ZipCode is required in address")
    .matches(/^[0-9]{5,10}$/)
    .withMessage("ZipCode must be between 5-10 digits"),

  body("address.country")
    .if(body("address").exists())
    .notEmpty()
    .withMessage("Country is required in address")
    .isString()
    .withMessage("Country must be a string")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Country must be at least 2 characters long"),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = {
  validateCreateOrder,
  handleValidationErrors,
};
