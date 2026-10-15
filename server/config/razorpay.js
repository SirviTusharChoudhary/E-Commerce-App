import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getRazorpayInstance = () => {
  dotenv.config({ path: path.join(__dirname, "../.env"), override: true });
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const razorpayProxy = new Proxy(
  {},
  {
    get(target, prop) {
      const instance = getRazorpayInstance();
      const val = instance[prop];
      if (typeof val === "function") {
        return val.bind(instance);
      }
      return val;
    },
  }
);

export default razorpayProxy;
