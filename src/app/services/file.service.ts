import { Injectable } from '@angular/core';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Config } from '../aws-config';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey
      }
    });
  }

  async uploadFile(file: File): Promise<string> {
    const params = {
      Bucket: s3Config.bucketName, // Ensure this is set correctly
      Key: `uploads/${file.name}`, // File path in S3
      Body: new Uint8Array(await file.arrayBuffer()), // Convert file to ArrayBuffer
      ContentType: file.type // Set the correct MIME type
    };
  
    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
      return `✅ File ${file.name} uploaded successfully!`;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
  }
}  