import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import environment from "../configs/environment";

type R2Image = {
  url: string;
  key: string;
};

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

class R2Service {
  private readonly client = new S3Client({
    region: "auto",
    endpoint: `https://${environment.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: environment.r2AccessKeyId,
      secretAccessKey: environment.r2SecretAccessKey,
    },
  });

  async uploadImage(
    buffer: Buffer,
    mimetype: string,
    folder: "categories" | "category-banners" | "products" | "profiles",
  ): Promise<R2Image> {
    const extension = extensionByMimeType[mimetype];
    if (!extension) throw new Error("Unsupported image type");

    const key = `${folder}/${randomUUID()}.${extension}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: environment.r2BucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return { key, url: `${environment.r2PublicUrl}/${key}` };
  }

  async deleteImage(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: environment.r2BucketName,
        Key: key,
      }),
    );
  }
}

export default new R2Service();
