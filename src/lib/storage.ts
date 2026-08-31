import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

// Support both SUPABASE_URL and typo SUPERBASE_URL from env
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPERBASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "";
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET_NAME || process.env.S3_BUCKET_NAME || "medistra-documents";

// S3 Configurations
const S3_ENDPOINT = process.env.S3_ENDPOINT || (SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/s3` : "");
const S3_REGION = process.env.S3_REGION || "us-east-1";
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
const S3_SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
const S3_BUCKET = process.env.S3_BUCKET_NAME || SUPABASE_BUCKET;

export interface UploadResult {
    fileUrl: string;
    key: string;
    fileName: string;
    fileSize: string;
    contentType: string;
    storageProvider: "supabase" | "s3" | "local_fallback";
}

class StorageService {
    private supabaseClient: SupabaseClient | null = null;
    private s3Client: S3Client | null = null;
    private bucketInitialized = false;

    constructor() {
        // Initialize Supabase Client if URL and Key are available
        if (SUPABASE_URL && SUPABASE_KEY) {
            try {
                this.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
                    auth: { persistSession: false }
                });
            } catch (err) {
                console.error("Failed to initialize Supabase client:", err);
            }
        }

        // Initialize S3 Client if S3 credentials are provided
        if (S3_ACCESS_KEY && S3_SECRET_KEY) {
            try {
                this.s3Client = new S3Client({
                    region: S3_REGION,
                    endpoint: S3_ENDPOINT || undefined,
                    forcePathStyle: true, // Necessary for Supabase S3 & MinIO
                    credentials: {
                        accessKeyId: S3_ACCESS_KEY,
                        secretAccessKey: S3_SECRET_KEY
                    }
                });
            } catch (err) {
                console.error("Failed to initialize S3 client:", err);
            }
        }
    }

    /**
     * Ensures that the target storage bucket exists.
     */
    async ensureBucket(): Promise<void> {
        if (this.bucketInitialized) return;

        if (this.supabaseClient) {
            try {
                const { data: buckets, error } = await this.supabaseClient.storage.listBuckets();
                if (!error && buckets) {
                    const exists = buckets.some((b) => b.name === SUPABASE_BUCKET);
                    if (!exists) {
                        await this.supabaseClient.storage.createBucket(SUPABASE_BUCKET, {
                            public: true,
                            fileSizeLimit: 52428800 // 50 MB
                        });
                    }
                }
            } catch (err) {
                console.warn("Could not verify Supabase bucket existence (may already exist):", err);
            }
        } else if (this.s3Client) {
            try {
                await this.s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
            } catch (err) {
                try {
                    await this.s3Client.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
                } catch (createErr) {
                    // Bucket may already exist or permissions prevent creation
                }
            }
        }

        this.bucketInitialized = true;
    }

    /**
     * Uploads a file buffer or stream to object storage.
     */
    async uploadFile(
        fileBuffer: Buffer | Uint8Array,
        originalName: string,
        contentType: string,
        folder = "documents"
    ): Promise<UploadResult> {
        await this.ensureBucket();

        const timestamp = Date.now();
        const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
        const key = `${folder}/${timestamp}_${safeName}`;
        const sizeBytes = fileBuffer.length;
        const fileSizeFormatted = this.formatBytes(sizeBytes);

        // 1. Try Supabase Storage SDK
        if (this.supabaseClient) {
            try {
                const { data, error } = await this.supabaseClient.storage
                    .from(SUPABASE_BUCKET)
                    .upload(key, fileBuffer, {
                        contentType,
                        upsert: true
                    });

                if (error) {
                    console.error("Supabase storage upload error:", error);
                    throw error;
                }

                const { data: publicUrlData } = this.supabaseClient.storage
                    .from(SUPABASE_BUCKET)
                    .getPublicUrl(key);

                return {
                    fileUrl: publicUrlData.publicUrl,
                    key,
                    fileName: originalName,
                    fileSize: fileSizeFormatted,
                    contentType,
                    storageProvider: "supabase"
                };
            } catch (supabaseErr) {
                console.warn("Supabase upload attempt failed, trying fallback...", supabaseErr);
            }
        }

        // 2. Try S3 SDK
        if (this.s3Client) {
            try {
                const command = new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: key,
                    Body: fileBuffer,
                    ContentType: contentType,
                    ACL: "public-read"
                });

                await this.s3Client.send(command);

                let fileUrl = "";
                if (S3_ENDPOINT) {
                    fileUrl = `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
                } else {
                    fileUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
                }

                return {
                    fileUrl,
                    key,
                    fileName: originalName,
                    fileSize: fileSizeFormatted,
                    contentType,
                    storageProvider: "s3"
                };
            } catch (s3Err) {
                console.error("S3 upload error:", s3Err);
                throw s3Err;
            }
        }

        // 3. Development Fallback (when storage keys not yet filled in env)
        console.warn("⚠️ No Supabase or S3 credentials found. Using fallback mock storage link.");
        const fallbackUrl = `https://storage.medistra.hospital/${SUPABASE_BUCKET}/${key}`;
        return {
            fileUrl: fallbackUrl,
            key,
            fileName: originalName,
            fileSize: fileSizeFormatted,
            contentType,
            storageProvider: "local_fallback"
        };
    }

    /**
     * Deletes a file from storage.
     */
    async deleteFile(key: string): Promise<boolean> {
        if (this.supabaseClient) {
            try {
                const { error } = await this.supabaseClient.storage
                    .from(SUPABASE_BUCKET)
                    .remove([key]);
                return !error;
            } catch (err) {
                console.error("Supabase file delete error:", err);
                return false;
            }
        }

        if (this.s3Client) {
            try {
                await this.s3Client.send(new DeleteObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: key
                }));
                return true;
            } catch (err) {
                console.error("S3 file delete error:", err);
                return false;
            }
        }

        return true;
    }

    private formatBytes(bytes: number, decimals = 1): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }
}

export const storage = new StorageService();
export default storage;
