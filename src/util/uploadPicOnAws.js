import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const Access_key = process.env.Access_key;
const Secret_key = process.env.S3_Secret_key;
const Bucket_name = process.env.Bucket_Name;
const Region = process.env.Region;

export const uploadFileToAws = async (file, fileName, fileType) => {
  const uniqueKey = `${Date.now()}-${fileName}`;

  const client = new S3Client({
    region: Region,
    credentials: {
      accessKeyId: Access_key,
      secretAccessKey: Secret_key,
    },
  });

  const command = new PutObjectCommand({
    Bucket: Bucket_name,
    Key: uniqueKey,
    Body: file,
    ContentType: fileType, // Dynamically set content type
  });

  try {
    await client.send(command);
    const url = `https://${Bucket_name}.s3.${Region}.amazonaws.com/${uniqueKey}`;
    return url;
  } catch (error) {
    throw new Error(error?.message || "AWS upload error");
  }
};
