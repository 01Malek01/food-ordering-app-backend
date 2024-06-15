import { Request, Response } from "express"; //import express request and response types
import User from "../models/user";



export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    //remember that req.userId is coming from the middleware we created which is jwtParse
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.toObject());
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
}
export const createCurrentUser = async (req: Request, res: Response) => {
  //1) check if the user exists
  //2) create the user
  //3) return the user object to the calling client (frontend)

  try {
    //get the auth0Id from the request body
    const { auth0Id } = req.body;
    //check if the user already exists
    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      return res.status(200).send();
    }

    //create the user using auth0Id and email which will be in the body
    const newUser = await User.create(req.body);
    await newUser.save();
    res.status(201).json(newUser.toObject()); // we return the user object to the frontend
  } catch (err) {
    console.log(err);
    //we don't wanna pass the err object to the frontend as it might have sensitive information
    res.status(500).json({ message: "Error creating user" });
  }
};

export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, city, country } = req.body; //form data that comes from the frontend
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.name = name;
    user.addressLine1 = addressLine1;
    user.city = city;
    user.country = country;
    await user.save();
    res.send(user); //it's important to send the user object back to the frontend as we might need the new properties in the frontend
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
