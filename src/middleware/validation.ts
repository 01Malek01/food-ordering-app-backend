import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

//express validator will check the request based on the rules
const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
export const validateMyUserReq = [
  //add validation rules for each of properties in the request
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("addressLine1")
    .isString()
    .notEmpty()
    .withMessage("Address line 1 must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  //apply the following validation rules
  handleValidationErrors,
];

export const validateMyRestaurantReq = [
  //add validation rules for each of properties in the request
  body("restaurantName").notEmpty().withMessage("Name is required"),
  body("city").isString().notEmpty().withMessage("City is required"),
  body("country").isString().notEmpty().withMessage("Country is required"),
  body("deliveryPrice")
    .isFloat({ min: 0 })
    .withMessage("Delivery price is required and must be positive"),
  body("estimatedDeliveryTime")
    .isFloat({ min: 0 })
    .withMessage("Estimated delivery time is required and must be positive"),
  body("cuisines")
    .isArray()
    .withMessage("Cuisines must be an array")
    .not()
    .isEmpty()
    .withMessage("Cuisines are required"),
  body("menuItems").isArray().withMessage("Menu items must be an array"),
  //apply the following validation rules for each of the menu items that what the * means
  body("menuItems.*.name").notEmpty().withMessage("Name is required"),
  body("menuItems.*.price")
    .isFloat({ min: 0 })
    .withMessage("Price is required and must be positive"),
  //we don't need to add validation for the imageFile field as multer takes care of it
  handleValidationErrors,
];
