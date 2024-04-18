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
  handleValidationErrors,
];
