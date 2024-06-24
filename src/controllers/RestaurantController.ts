import { Request, Response } from "express";
import Restaurant from "../models/restaurant";


export const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findById(restaurantId);
    if(!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
}
export const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const { city } = req.params; // Extract city parameter from the request

    const searchQuery = (req.query.searchQuery as string) || ""; // Extract searchQuery from query string or default to empty string
    const selectedCuisines = (req.query.selectedCuisines as string) || ""; // Extract selectedCuisines from query string or default to empty string
    const sortOption = (req.query.sortOption as string) || "lastUpdated"; // Extract sortOption from query string or default to "lastUpdated"
    const page = parseInt(req.query.page as string) || 1; // Extract page number from query string or default to 1
    let query: any = {}; // Initialize query object

    // Add city filter to query with case-insensitive regex
    query["city"] = new RegExp(city, "i");
    const cityCheck = await Restaurant.countDocuments(query);
    if (cityCheck === 0) {
      return res.status(404).json({
        //we want to display consistent data so the UI doesn't struggle
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      }); // Return 404 if no documents match the city
    }

    // Add cuisines filter to query if selectedCuisines is provided
    if (selectedCuisines) {
      const cuisinesArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i")); // Create case-insensitive regex for each cuisine
      query["cuisines"] = { $all: cuisinesArray }; // Use $all to match documents containing all cuisines
    }

    // Add search query filter if searchQuery is provided
    if (searchQuery) {
     const searchRegex = new RegExp(searchQuery, "i"); // Create case-insensitive regex for search query
     query["$or"] = [
       { restaurantName: searchRegex }, // Match restaurant name with search query
       { cuisines: { $in: [searchRegex] } }, // Match cuisines with search query
     ];
    }

    // Pagination and sorting setup
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const restaurants = await Restaurant.find(query) // Find documents matching the query
      .sort({ [sortOption]: 1 }) // Sort results by the sortOption field
      .skip(skip) // Skip documents for pagination
      .limit(pageSize) // Limit the number of documents
      .lean(); // Return plain JavaScript objects

    const total = await Restaurant.countDocuments(query); // Get total count of matching documents
    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize), // Calculate total number of pages
      },
    };

    res.json(response); // Send response with data and pagination info
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" }); // Handle errors
  }
};
