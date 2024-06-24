import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;
type CheckoutSessionRequest = {
  cartItems: {
    name: string;
    menuItemId: string;
    quantity: string; //received as string from frontend
  }[];
  deliveryDetails: {
    email: string;
    addressLine1: string;
    city: string;
    name: string;
  };
  restaurantId: string;
};

export const getMyOrder = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig as string,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: `webhook error: ${err.message}` });
  }
  if (event.type === "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";
    await order.save();
  }
  res.status(200).send();
};
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;
    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    );
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }
    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });
    //line items , which we will display on stripe checkout page. we'll take the cart items and transform them into a format that stripe accepts
    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );
    const session = await createSession(
      lineItems,
      //even we didn't save the order document yet,mongoose has created an id for it
      newOrder._id.toString(),
      restaurant.deliveryPrice,
      restaurant._id.toString()
    );
    if (!session.url) {
      //url of the hosted page on stripe
      return res.status(500).json({ message: "Something went wrong" });
    }
    //save order to database after successful checkout
    await newOrder.save();
    res.json({ url: session.url });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ message: err.raw.message });
  }
};

const createLineItems = (
  checkOutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  //1. foreach cartItem , get the menuItem object from the restaurant
  //(to get the price) as we shouldn't rely on frontend for the price, it's not safe
  //2.foreach cartItem, convert it to stripe line item
  //3. return the line items array

  const lineItems = checkOutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );
    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }
    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "usd",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };
    return line_item;
  });
  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  const session = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice * 100,
            currency: "usd",
          },
        },
      },
    ],
    mode: "payment",
    success_url: `${FRONTEND_URL}/order-status?success=true}`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?canceled=true}`,
    metadata: {
      orderId,
      restaurantId,
    },
  });
  return session;
};
