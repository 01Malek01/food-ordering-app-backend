import express from "express";
import {
  createCurrentUser,
  updateCurrentUser,
  getCurrentUser,
} from "../controllers/MyUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserReq } from "../middleware/validation";

/*
1-jwtCheck checks if the token is valid
2-jwtParse extracts info the token
3-validateMyUserReq validates the request body and makes sure it has all the required properties
*/
const router = express.Router();
router.get("/",jwtCheck,jwtParse,getCurrentUser);
router.post("/", jwtCheck, createCurrentUser);
router.put("/", jwtCheck, jwtParse, validateMyUserReq, updateCurrentUser);

export default router;
