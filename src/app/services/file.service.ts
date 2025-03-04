import { Injectable } from '@angular/core';
import { S3Client, PutObjectCommand, ListObjectsV2Command, _Object, ListObjectsV2CommandOutput, GetObjectCommand } from '@aws-sdk/client-s3';
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

  async listFiles(folder: string): Promise<{ key: string; url: string; content?: string; lastModified?: string }[]> {
    // Ensure folder path ends with '/'
    const folderPath = folder.endsWith("/") ? folder : `${folder}/`;

    const params = {
      Bucket: s3Config.bucketName,
      Prefix: folderPath,
    };

    try {
      const command = new ListObjectsV2Command(params);
      const response = await this.s3Client.send(command);
      console.log("S3 response contents:", response.Contents);

      // Fetch CSV and JSON file contents
      const files = await Promise.all(
        (response.Contents || [])
          .filter(item => item.Key !== folderPath && (item.Key?.endsWith(".csv") || item.Key?.endsWith(".json")))
          .map(async item => {
            const fileKey = item.Key!;
            const url = `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${fileKey}`;
            const lastModified = item.LastModified?.toISOString(); // Adding the LastModified field

            try {
              // Fetch file content
              const getObjectCommand = new GetObjectCommand({
                Bucket: s3Config.bucketName,
                Key: fileKey,
              });

              const fileResponse = await this.s3Client.send(getObjectCommand);
              const bodyStream = fileResponse.Body;

              // Convert stream to string
              const content = await this.streamToString(bodyStream);

              return { key: fileKey, url, content, lastModified }; // Include lastModified in the return value
            } catch (error) {
              console.error(`❌ Error fetching content for ${fileKey}:`, error);
              return { key: fileKey, url, content: undefined, lastModified }; // Include lastModified even in case of error
            }
          })
      );

      return files;
    } catch (error) {
      console.error("❌ Error listing files:", error);
      throw error;
    }
  }

  private async streamToString(stream: any): Promise<string> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // Use TextDecoder instead of Buffer to decode the stream into a string
    const decoder = new TextDecoder("utf-8");
    const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => {
      const temp = new Uint8Array(acc.length + chunk.length);
      temp.set(acc, 0);
      temp.set(chunk, acc.length);
      return temp;
    }, new Uint8Array()));
    return decoder.decode(concatenatedChunks);
  }

}
