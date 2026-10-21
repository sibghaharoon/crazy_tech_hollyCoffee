import configureCloudinary from "../configs/Cloudinary";

class CloudinaryService {
  async uploadCategoryImage(buffer: Buffer, mimetype: string) {
    const cloudinary = configureCloudinary();
    return new Promise<{ image: string; imagePublicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "holy-coffee/categories",
          resource_type: "image",
          format: mimetype.split("/")[1],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary image upload failed"));
            return;
          }
          resolve({
            image: result.secure_url,
            imagePublicId: result.public_id,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async uploadCategoryBanner(buffer: Buffer, mimetype: string) {
    const cloudinary = configureCloudinary();
    return new Promise<{ banner: string; bannerPublicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "holy-coffee/category-banners",
          resource_type: "image",
          format: mimetype.split("/")[1],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary category banner upload failed"));
            return;
          }
          resolve({
            banner: result.secure_url,
            bannerPublicId: result.public_id,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async uploadProfileImage(buffer: Buffer, mimetype: string) {
    const cloudinary = configureCloudinary();
    return new Promise<{ profileImage: string; profileImagePublicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "holy-coffee/profiles",
          resource_type: "image",
          format: mimetype.split("/")[1],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary profile image upload failed"));
            return;
          }
          resolve({
            profileImage: result.secure_url,
            profileImagePublicId: result.public_id,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async deleteImage(publicId: string) {
    const cloudinary = configureCloudinary();
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  }
}

export default new CloudinaryService();
