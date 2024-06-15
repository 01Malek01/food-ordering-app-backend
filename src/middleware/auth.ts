import { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken";
import User from "../models/user";

//when we add custom props to the express request we add these lines of code and add whatever we want to the request interface
declare global {
  namespace Express {
    // Interfaces are a way to define the structure of an object
    interface Request {
      auth0Id: string;
      userId: string;
    }
  }
}

//this will verify the token we get from the request
export const jwtCheck = auth({
  audience: process.env.AUTH0_API_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});


//ensure authorization and extract id from the jwt and pass it to request object
export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //extract authorization from the request headers
  //the token is the second part of the authorization header
  const { authorization } = req.headers as Record<string, string>;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).send();
  }
  //the token is the second part of the authorization header
  const token = authorization.split(" ")[1] ;
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const auth0Id = decoded.sub; //sub contains the id
    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(401).send();
    }

    //append info about the user trying to make the request then the request is gonna be passed to the controller
    req.auth0Id = auth0Id as string; // we tell it that we are sure this variable is a string
    req.userId = user._id.toString();
  } catch (error) {
    return res.status(401).send();
  }
  next();
};
