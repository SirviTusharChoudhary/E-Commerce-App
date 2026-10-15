import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ override: false });

const requiredCloudinaryEnv = [
    "cloud_name",
    "cloud_api_key",
    "cloud_api_secret"
];

const missingCloudinaryEnv = requiredCloudinaryEnv.filter(
    (key) => !process.env[key]
);

if (missingCloudinaryEnv.length > 0) {
    throw new Error(
        `Missing Cloudinary environment variables: ${missingCloudinaryEnv.join(", ")}`
    );
}

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.cloud_api_key,
    api_secret: process.env.cloud_api_secret,
});

export default cloudinary;