import { v2 as cloudinary } from "cloudinary";
import environment from "./Environment";

const configureCloudinary = () => {
  if (
    !environment.cloudinaryCloudName ||
    !environment.cloudinaryApiKey ||
    !environment.cloudinaryApiSecret
  ) {
    throw new Error("Cloudinary configuration is missing");
  }

  cloudinary.config({
    cloud_name: environment.cloudinaryCloudName,
    api_key: environment.cloudinaryApiKey,
    api_secret: environment.cloudinaryApiSecret,
    secure: true,
  });

  return cloudinary;
};

export default configureCloudinary;
