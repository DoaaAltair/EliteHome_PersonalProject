require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with service role key (backend only!)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("⚠️ Supabase Storage: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    console.warn("   File uploads will not work. Please set these environment variables.");
}

const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

/**
 * Upload a file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name
 * @param {string} bucket - Storage bucket name (default: 'invoices')
 * @returns {Promise<{url: string, path: string}>} Public URL and file path
 */
async function uploadToSupabase(fileBuffer, fileName, bucket = "invoices") {
    if (!supabase) {
        throw new Error("Supabase Storage not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    }

    try {
        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
        const filePath = `${uniqueFileName}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileBuffer, {
                contentType: "application/octet-stream",
                upsert: false
            });

        if (error) {
            console.error("❌ Supabase Storage upload error:", error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
            throw new Error("Failed to get public URL for uploaded file");
        }

        console.log(`✅ File uploaded to Supabase Storage: ${filePath}`);
        return {
            url: urlData.publicUrl,
            path: filePath
        };
    } catch (error) {
        console.error("❌ Error uploading to Supabase Storage:", error);
        throw error;
    }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath - File path in storage
 * @param {string} bucket - Storage bucket name (default: 'invoices')
 * @returns {Promise<boolean>} Success status
 */
async function deleteFromSupabase(filePath, bucket = "invoices") {
    if (!supabase) {
        console.warn("⚠️ Supabase Storage not configured, cannot delete file");
        return false;
    }

    try {
        // Extract just the filename from URL or path
        const fileName = filePath.includes("/")
            ? filePath.split("/").pop()
            : filePath;

        const { error } = await supabase.storage
            .from(bucket)
            .remove([fileName]);

        if (error) {
            console.error("❌ Error deleting from Supabase Storage:", error);
            return false;
        }

        console.log(`✅ File deleted from Supabase Storage: ${fileName}`);
        return true;
    } catch (error) {
        console.error("❌ Error deleting from Supabase Storage:", error);
        return false;
    }
}

module.exports = {
    uploadToSupabase,
    deleteFromSupabase,
    supabase
};

