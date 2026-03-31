const { body, validationResult } = require("express-validator");

const validateCartItem = [
	body("productId")
		.notEmpty()
		.withMessage("productId is required")
		.bail()
		.isMongoId()
		.withMessage("productId must be a valid Mongo ID"),

	body("quantity")
		.notEmpty()
		.withMessage("quantity is required")
		.bail()
		.isInt({ min: 1 })
		.withMessage("quantity must be an integer greater than or equal to 1"),

	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		next();
	},
];

module.exports = {
	validateCartItem,
};
