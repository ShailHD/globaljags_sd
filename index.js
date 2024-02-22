const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const sharp = require('sharp');

const UPLOADS_BUCKET_NAME = 'sp24-41200-shail-globaljags-uploads';
const THUMBNAILS_BUCKET_NAME = 'sp24-41200-shail-globaljags-thumbnails';
const FINAL_BUCKET_NAME = 'sp24-41200-shail-globaljags-final';

exports.generateThumbnail = async (event, context) => {
  const file = event.data;
  const contentType = file.contentType;
  const fileName = file.name;
  const fileGeneration = file.generation;

  // Check if the file is an image
  if (contentType !== 'image/jpeg' && contentType !== 'image/png') {
    console.log(`The file ${fileName} is not an image.`);
    // Delete the non-image file
    await storage.bucket(UPLOADS_BUCKET_NAME).file(fileName).delete();
    console.log(`Non-image file ${fileName} deleted.`);
    return;
  }

  // Copy the original image to the final bucket
  await storage.bucket(UPLOADS_BUCKET_NAME).file(fileName)
    .copy(storage.bucket(FINAL_BUCKET_NAME).file(fileName));
  console.log(`File ${fileName} copied to final bucket.`);

  // Create a thumbnail for the image
  const thumbnailFileName = `thumbnail-${fileGeneration}${contentType === 'image/jpeg' ? '.jpg' : '.png'}`;
  const thumbnail = await sharp(file.data)
    .resize({ width: 200 })
    .toBuffer();

  // Save the thumbnail to the thumbnails bucket
  await storage.bucket(THUMBNAILS_BUCKET_NAME).file(thumbnailFileName).save(thumbnail);
  console.log(`Thumbnail ${thumbnailFileName} saved to thumbnails bucket.`);

  // Delete the original file from the uploads bucket
  await storage.bucket(UPLOADS_BUCKET_NAME).file(fileName).delete();
  console.log(`Original file ${fileName} deleted from uploads bucket.`);
};
