// Imports
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const sharp = require('sharp');

// Google Cloud Storage configuration
const PROJECT_ID = 'sp24-41200-shaild-globaljags';
const UPLOADS_BUCKET_NAME = 'sp24-41200-shail-globaljags-uploads';
const THUMBNAILS_BUCKET_NAME = 'sp24-41200-shail-globaljags-thumbnails';
const FINAL_BUCKET_NAME = 'sp24-41200-shail-globaljags-final';

// Entry point function
exports.generateThumbnail = async (file, context) => {
  const gcsFile = file;
  const storage = new Storage({ projectId: PROJECT_ID });
  const sourceBucket = storage.bucket(UPLOADS_BUCKET_NAME);
  const thumbnailsBucket = storage.bucket(THUMBNAILS_BUCKET_NAME);
  const finalBucket = storage.bucket(FINAL_BUCKET_NAME);

  // Logging the version of the Cloud Function
  const version = process.env.K_REVISION;
  console.log(`Running Cloud Function version ${version}`);

  // Processing file information
  console.log(`File name: ${gcsFile.name}`);
  console.log(`Generation number: ${gcsFile.generation}`);
  console.log(`Content type: ${gcsFile.contentType}`);

  // Reject images that are not jpeg or png files
  let fileExtension = '';
  let validFile = false;

  if (gcsFile.contentType === 'image/jpeg') {
    console.log('This is a JPG file.');
    fileExtension = 'jpg';
    validFile = true;
  } else if (gcsFile.contentType === 'image/png') {
    console.log('This is a PNG file.');
    fileExtension = 'png';
    validFile = true;
  } else {
    console.log('This is not a valid file type.');
  }

  // Download, process, and upload the image if it's a valid file
  if (validFile) {
    // Constructing filenames and paths
    const finalFileName = `${gcsFile.generation}.${fileExtension}`;
    const workingDir = path.join(os.tmpdir(), 'thumbs');
    const tempFilePath = path.join(workingDir, finalFileName);

    // Ensuring the working directory exists
    await fs.ensureDir(workingDir);

    // Downloading the original file
    await sourceBucket.file(gcsFile.name).download({ destination: tempFilePath });

    // Uploading the original file to the final bucket
    await finalBucket.upload(tempFilePath);

    // Generating and uploading the thumbnail
    const thumbName = `thumb@64_${finalFileName}`;
    const thumbPath = path.join(workingDir, thumbName);
    await sharp(tempFilePath).resize(64).withMetadata().toFile(thumbPath);
    await thumbnailsBucket.upload(thumbPath);

    // Cleaning up the local filesystem
    await fs.remove(workingDir);
  }

  // Deleting the original file from the uploads bucket
  if (validFile) {
    await sourceBucket.file(gcsFile.name).delete();
    console.log(`Deleted original file: ${gcsFile.name}`);
  }
};
