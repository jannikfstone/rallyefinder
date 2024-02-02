import { S3, S3ServiceException } from "@aws-sdk/client-s3";
import { Search } from "./types";
import { requireEnv } from "./util";
import fs from "fs";

interface IStorageService {
  save(key: string, value: object): Promise<void> | void;
  load(key: string): Promise<object> | object;
}

class NotFoundError extends Error {
  constructor() {
    super();
  }
}

export class StorageService {
  private storageService: IStorageService;
  constructor() {
    if (process.env.IS_PRODUCTION === "true") {
      this.storageService = new S3StorageService();
      return;
    }
    this.storageService = new LocalStorageService();
  }
  async save(key: string, value: Search): Promise<void> {
    await this.storageService.save(key, value);
  }
  async load(key: string): Promise<Search> {
    return (await this.storageService.load(key)) as Search;
  }
}

class S3StorageService implements IStorageService {
  bucketName: string;
  private client: S3;
  constructor() {
    this.client = new S3({ region: "eu-central-1" });
    this.bucketName = requireEnv("S3_BUCKET_NAME");
  }

  async save(key: string, value: object): Promise<void> {
    const json = JSON.stringify(value, undefined, 2);
    await this.client.putObject({
      Bucket: this.bucketName,
      Key: key,
      Body: json,
    });
  }

  async load(key: string): Promise<Search> {
    try {
      const output = await this.client.getObject({
        Bucket: this.bucketName,
        Key: key,
      });
      if (!output.Body) {
        throw new Error("S3 response did not contain a body");
      }
      const bodyJson = await output.Body.transformToString();
      return JSON.parse(bodyJson);
    } catch (error) {
      if (error instanceof S3ServiceException && error.name === "NoSuchKey") {
        throw new NotFoundError();
      }
      throw error;
    }
  }
}

class LocalStorageService implements IStorageService {
  private folderPath = "out/searches";
  constructor() {
    if (!fs.existsSync(this.folderPath)) {
      fs.mkdirSync(this.folderPath, { recursive: true });
    }
  }

  save(key: string, value: object): void {
    fs.writeFileSync(
      `${this.folderPath}/${key}.json`,
      JSON.stringify(value, undefined, 2)
    );
  }

  load(key: string): object {
    try {
      const fileContent = fs.readFileSync(
        `${this.folderPath}/${key}.json`,
        "utf-8"
      );
      return JSON.parse(fileContent);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new NotFoundError();
      }
      throw error;
    }
  }
}
