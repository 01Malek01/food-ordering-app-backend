import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import { Request, Response } from "express";
import myUserRouter from "./routes/myUserRoute";
mongoose.connect(process.env.MONGODB_URI as string).then(() => {
  console.log("Connected to Database");
});

const app = express();
app.use(express.json());
app.use(cors());


app.get("/health", async(req:Request, res:Response) => {
  res.send({
    message:"health ok",
  })
});

//once we get a request to /api/my/user, we will route it to myUserRouter
app.use("/api/my/user", myUserRouter);

app.listen(9000, () => {
  console.log("Server is running on port localhost:9000");
});
