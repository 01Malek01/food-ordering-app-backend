import express from "express";
import multer from "multer";
import {
  createMyRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
} from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantReq } from "../middleware/validation";
const router = express.Router();

//define multer middleware
const storage = multer.memoryStorage(); //creates a storage engine that stores files in memory. This is useful for small files or when you don't want to save files to disk.

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});
// /api/my/restaurant
router.get("/", jwtCheck, jwtParse, getMyRestaurant);
//whenever there is a post req to this api endpoint it will check for image file property
router.post(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantReq,
  jwtCheck,
  jwtParse,
  createMyRestaurant
);
router.put(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantReq,
  jwtCheck,
  jwtParse,
  updateMyRestaurant
);

export default router;
