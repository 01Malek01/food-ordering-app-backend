import express from "express";

import { jwtCheck, jwtParse } from "../middleware/auth";
import { param } from "express-validator";
import { searchRestaurants } from "../controllers/RestaurantController";

const router = express.Router();
router.get(
  "/search/:city",
  //validating request params, it's a middleware after all
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City must be a valid string"),
  searchRestaurants
);

export default router;