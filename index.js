// Imports
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const getExif = require('exif-async');
const parseDMS = require('parse-dms');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');

// This code will initialize Google Cloud clients
const storage = new Storage();
const firestore = new Firestore({ projectId: 'sp24-41200-shaild-globaljags' });

// This Function will generate the public URL of a file in a bucket
function getPublicUrl(bucketName, fileName) {
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}

// This is the cloud Function Entry Point
exports.processImage = async (event, context) => {
  const file = event;
  const contentType = file.contentType;
  const fileName = file.name;
  const generation = file.generation;
  const bucketName = file.bucket;

  // This code will check if the uploaded file is an image
  if (!['image/jpeg', 'image/png'].includes(contentType)) {
    console.log(`Deleting non-image file: ${fileName} of type ${contentType}`);
    await storage.bucket(bucketName).file(fileName).delete();
    return;
  }

  // This code will proceed with valid image files
  const tempFilePath = path.join(os.tmpdir(), fileName);
  await storage.bucket(bucketName).file(fileName).download({ destination: tempFilePath });

  // This code will read EXIF data for GPS information
  const exifData = await getExif(tempFilePath);
  const gpsData = exifData.gps;
  let gpsDecimal = null;
  if (gpsData) {
    gpsDecimal = getGPSCoordinates(gpsData);
  }

  // This code will extract the image name from the file path
  const imageName = path.basename(tempFilePath);

  // URLs for the images stored in Cloud Storage
  const thumbnailUrl = getPublicUrl('sp24-41200-shail-globaljags-thumbnails', `${generation}.jpeg`);
  const finalImageUrl = getPublicUrl('sp24-41200-shail-globaljags-final', `${generation}.jpeg`);

  // This code will create a document in Firestore
  const photoDocument = {
    imageName, // The name of the image file
    thumbnailUrl,
    finalImageUrl,
    latitude: gpsDecimal ? gpsDecimal.lat : null,
    longitude: gpsDecimal ? gpsDecimal.lon : null,
    uploaded: Firestore.Timestamp.now()
  };

  // This code will write to Firestore
  await firestore.collection('photos').add(photoDocument);

  // This code will cleanup local file
  await fs.remove(tempFilePath);

  console.log(`Processed file ${fileName} with Firestore document:`, photoDocument);
};

// This function will parse GPS EXIF to decimal
function getGPSCoordinates(gpsData) {
  const latString = `${gpsData.GPSLatitude[0]}:${gpsData.GPSLatitude[1]}:${gpsData.GPSLatitude[2]}${gpsData.GPSLatitudeRef}`;
  const lonString = `${gpsData.GPSLongitude[0]}:${gpsData.GPSLongitude[1]}:${gpsData.GPSLongitude[2]}${gpsData.GPSLongitudeRef}`;
  return parseDMS(`${latString} ${lonString}`);
}
