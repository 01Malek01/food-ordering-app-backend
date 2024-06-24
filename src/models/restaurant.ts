import mongoose, { InferSchemaType } from "mongoose";

const menuItemsSchema = new mongoose.Schema({
  //we added _id to the type as we will use the type in the controller
  //we added a default value as we are overriding the default behavior of mongoose
  _id:{type:mongoose.Schema.Types.ObjectId,required:true,default:()=>new mongoose.Types.ObjectId()},
 name: {
  type: String,
  required: true,
},
 price: {
  type: Number,
  required: true,
 },
});

export type MenuItemType = InferSchemaType<typeof menuItemsSchema>;
const restaurantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  restaurantName: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  deliveryPrice: {
    type: Number,
    required: true,
  },
  estimatedDeliveryTime: {
    type: Number,
    required: true,
  },
  cuisines: [
    {
      type: String,
      required: true,
    },
  ],
  menuItems: [menuItemsSchema],
  imageUrl: {
    type: String,
    required : true
  },
  lastUpdated: {
    type: Date,
    required : true
  }
});


const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant