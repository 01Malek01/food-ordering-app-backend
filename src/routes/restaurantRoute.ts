import express from "express";

import { param } from "express-validator";
import {
  searchRestaurants,
  getRestaurant,
} from "../controllers/RestaurantController";

const router = express.Router();
router.get(
  "/:restaurantId",
  param("restaurantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Restaurant id must be a valid string"),
    getRestaurant
);
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