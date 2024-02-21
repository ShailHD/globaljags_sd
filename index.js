// Imports
const {Storage} = require('@google-cloud/storage');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

// Entry point for the Cloud Function
exports.generateThumbnail = async (event, context) => {
  const storage = new Storage();
  const file = event;
  const sourceBucketName = file.bucket;
  const sourceFileName = file.name;
  const contentType = file.contentType;
  const generation = file.generation;

  // Buckets
  const sourceBucket = storage.bucket(sourceBucketName);
  const finalBucket = storage.bucket('sp24-41200-shail-globaljags-final'); 

  
  if (!['image/jpeg', 'image/png'].includes(contentType)) {
    console.log(`Deleting non-image file: ${sourceFileName} of type ${contentType}`);
    await sourceBucket.file(sourceFileName).delete();
    return;
  }

  // Unique filename for the final image
  const finalFileName = `${generation}.${contentType.split('/')[1]}`; 
  const destinationFilePath = path.join('final', finalFileName);

  // This code will copy the image to the final bucket
  await sourceBucket.file(sourceFileName).copy(finalBucket.file(destinationFilePath));
  console.log(`File ${sourceFileName} copied to ${destinationFilePath}`);

  // This code will delete the original file from the uploads bucket
  await sourceBucket.file(sourceFileName).delete();
  console.log(`Deleted original file: ${sourceFileName} from uploads bucket`);
};
