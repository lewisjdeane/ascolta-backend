import { BlobServiceClient } from "@azure/storage-blob"
import { DefaultAzureCredential } from "@azure/identity"
import uuidv1 from "uuidv1"
import axios from "axios"
import config from "../config/config"

/**
 * Uploads an audio file to a storage container and returns the link to the object in Azure Storage.
 *
 * @param path path to the local file to upload
 * @returns The URL of the path to the uploaded audio file in Azure Storage.
 */
export async function uploadAudioFileToContainer(path): Promise<string> {
    const accountName = config.AZURE_STORAGE_ACCOUNT_NAME
    if (!accountName) {
        throw Error("Azure Storage accountName not found")
    }

    const containerName = config.AZURE_STORAGE_AUDIO_CONTAINER_NAME
    if (!containerName) {
        throw Error("Azure Storage audio containerName not found")
    }

    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    )

    // Create a unique name for the blob
    const blobName = `audio-${uuidv1()}.mp3`

    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    console.log(`Uploading to Azure storage as blob: ${blockBlobClient.url}`)

    // Upload data to the blob
    await blockBlobClient.uploadFile(path)
    console.log("Blob was uploaded successfully.") // Probably should add some error handling here.
    return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`
}

/**
 * Uploads an image at a given URL into an Azure storage container.
 *
 * @param url the URL of the image to upload.
 * @returns The URL to the uploaded image in Azure storage.
 */
export async function uploadImageAtUrl(url: string): Promise<string> {
    const accountName = config.AZURE_STORAGE_ACCOUNT_NAME
    if (!accountName) throw Error("Azure Storage accountName not found")

    const containerName = config.AZURE_STORAGE_AVATAR_CONTAINER_NAME
    if (!containerName)
        throw Error("Azure Storage avatar containerName not found")

    const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new DefaultAzureCredential()
    )

    // Create a unique name for the blob
    const blobName = `avatar-${uuidv1()}.png`

    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    console.log(`Uploading to Azure storage as blob: ${blockBlobClient.url}`)

    const response = await axios.get(url, { responseType: "arraybuffer" })
    await blockBlobClient.upload(response.data, response.data.byteLength)

    console.log(
        `File ${blobName} has been uploaded to container ${containerName} in Azure storage.`
    )

    return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`
}
