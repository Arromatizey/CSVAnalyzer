import { environment } from "../environments/environment";
export const s3Config = {
    accessKeyId: environment.accessKeyId,
    secretAccessKey: environment.secretAccessKey,
    region: environment.region,
    bucketName: environment.bucketName
  };