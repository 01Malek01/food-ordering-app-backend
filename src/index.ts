import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { Request, Response } from "express";
import myUserRouter from "./routes/myUserRoute";
import { v2 as cloudinary } from "cloudinary";
import myRestaurantRouter from "./routes/myRestaurantRoute";
import restaurantRouter from "./routes/restaurantRoute";
mongoose.connect(process.env.MONGODB_URI as string).then(() => {
  console.log("Connected to Database");
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", async (req: Request, res: Response) => {
  res.send({
    message: "health ok",
  });
});

//once we get a request to /api/my/user, we will route it to myUserRouter
app.use("/api/my/user", myUserRouter);
app.use("/api/my/restaurant", myRestaurantRouter);
app.use("/api/restaurant", restaurantRouter);
app.listen(9000, () => {
  console.log("Server is running on port localhost:9000");
});
