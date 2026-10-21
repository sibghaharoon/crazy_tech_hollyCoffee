import configureCloudinary from "../configs/cloudinary";

class CloudinaryService {


  
  async uploadCategoryImage(buffer: Buffer, mimetype: string) {
    const cloudinary = configureCloudinary();
    return new Promise<{ image: string }>((resolve, reject) => {
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
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async uploadCategoryBanner(buffer: Buffer, mimetype: string) {
    const cloudinary = configureCloudinary();
    return new Promise<{ banner: string }>((resolve, reject) => {
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
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async uploadProfileImage(buffer: Buffer, mimetype: string) {
    const cloudinary = configureCloudinary();
    return new Promise<{ profileImage: string }>((resolve, reject) => {
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
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async uploadProductImage(buffer: Buffer, mimetype: string) {
    const cloudinary = configureCloudinary();
    return new Promise<{ image: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "holy-coffee/products",
          resource_type: "image",
          format: mimetype.split("/")[1],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary product image upload failed"));
            return;
          }
          resolve({
            image: result.secure_url,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async deleteImage(imageUrl: string) {
    const cloudinary = configureCloudinary();
    const publicId = this.extractPublicId(imageUrl);
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  }

  private extractPublicId(imageUrl: string) {
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const uploadIndex = pathSegments.indexOf("upload");
    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary image URL");
    }

    const deliverySegments = pathSegments.slice(uploadIndex + 1);
    const versionIndex = deliverySegments.findIndex((segment) => /^v\d+$/.test(segment));
    if (versionIndex === -1) {
      throw new Error("Cloudinary image URL must include a version");
    }

    const publicIdSegments = deliverySegments.slice(versionIndex + 1);
    if (publicIdSegments.length === 0) {
      throw new Error("Cloudinary public ID is missing from image URL");
    }

    const lastSegment = publicIdSegments.length - 1;
    publicIdSegments[lastSegment] = publicIdSegments[lastSegment].replace(/\.[^/.]+$/, "");
    return decodeURIComponent(publicIdSegments.join("/"));
  }
}

export default new CloudinaryService();
