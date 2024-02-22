// Imports
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const getExif = require('exif-async');
const parseDMS = require('parse-dms');

// This code will initialize Google Cloud clients
const storage = new Storage();
const firestore = new Firestore();

// These are the Bucket Details
const thumbnailBucketName = 'sp24-41200-shail-globaljags-thumbnails';
const imageBucketName = 'sp24-41200-shail-globaljags-uploads';

// This is Entry Point Function
async function extractExif(file, context) {
    console.log("Script started");
    const filePath = file.name;
    const fileName = filePath.split('/').pop();

    try {
        let gpsObject = await readExifData(`./${fileName}`); // Ensure the path to the image is correct
        if (gpsObject) {
            let gpsDecimal = getGPSCoordinates(gpsObject);
            const thumbnailUrl = `https://storage.googleapis.com/${thumbnailBucketName}/${fileName}`;
            const imageUrl = `https://storage.googleapis.com/${imageBucketName}/${filePath}`;

            // This code will construct the document to be written to Firestore
            const photoData = {
                thumbnailUrl,
                imageUrl,
                latitude: gpsDecimal.latitude,
                longitude: gpsDecimal.longitude,
                imageName: fileName
            };

            // This code will write to Firestore
            await firestore.collection('photos').doc(fileName).set(photoData);
            console.log('Document written to Firestore:', photoData);
        } else {
            console.log("No GPS data found or unable to read EXIF.");
        }
    } catch (error) {
        console.error("Error in extractExif:", error);
    }
}

// These are the helper functions
async function readExifData(localFile) {
    try {
        const exifData = await getExif(localFile);
        return exifData.gps;
    } catch (err) {
        console.error('Error reading EXIF data:', err);
        return null;
    }
}

function getGPSCoordinates(gpsData) {
    if (!gpsData) {
        console.log("No GPS Data available");
        return {};
    }
    const latString = `${gpsData.GPSLatitude[0]}:${gpsData.GPSLatitude[1]}:${gpsData.GPSLatitude[2]}${gpsData.GPSLatitudeRef}`;
    const lonString = `${gpsData.GPSLongitude[0]}:${gpsData.GPSLongitude[1]}:${gpsData.GPSLongitude[2]}${gpsData.GPSLongitudeRef}`;

    const degCoords = parseDMS(`${latString} ${lonString}`);
    return {
        latitude: degCoords.lat,
        longitude: degCoords.lon
    };
}

exports.extractExif = extractExif; // Export the function
