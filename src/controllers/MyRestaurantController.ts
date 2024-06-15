import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

const uploadImage = async (file: Express.Multer.File) => {
  const image = file as Express.Multer.File;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};
export const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    //if we used .find instead of findOne it will return an array and the condition will be true
    const existingRestaurant = await Restaurant.findOne({
      user: req.userId, //id we get from token
    });
    if (existingRestaurant) {
      return res.status(409).json({ message: "User already has a restaurant" });
    }
    // const image = req.file as Express.Multer.File;
    // //convert image to base64
    // const base64Image = Buffer.from(image.buffer).toString("base64");
    // //mime type is the type of image like jpeg
    // //we passed the base64 image to the dataURI which represents the image
    // const dataURI = `data:${image.mimetype};base64,${base64Image}`;

    // const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = imageUrl; //the url of the imag that is uploaded to cloudinary
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();
    res.status(201).send(restaurant);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "User has no restaurant" });
    }
    res.json(restaurant);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { user: req.userId },
      req.body,
      { new: true }
    );
    if (!restaurant) {
      return res.status(404).json({ message: "User has no restaurant" });
    }
    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();
    if (req.file) {
      restaurant.imageUrl = await uploadImage(req.file as Express.Multer.File);
    }
    await restaurant.save();

    res.status(200).json(restaurant);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
