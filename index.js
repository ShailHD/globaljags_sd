// Updated index.js

// Imports
const fs = require('fs');
const getExif = require('exif-async');
const parseDMS = require('parse-dms');

// Entry Point Function
async function extractExif() {
    console.log("Script started");
    try {
        let gpsObject = await readExifData('./china1.jpeg'); // Ensure the path to the image is correct
        if (gpsObject) {
            console.log(gpsObject);
            let gpsDecimal = getGPSCoordinates(gpsObject);
            console.log('Decimal Coordinates:', gpsDecimal);
        } else {
            console.log("No GPS data found or unable to read EXIF.");
        }
    } catch (error) {
        console.error("Error in extractExif:", error);
    }
}

// Helper Functions
async function readExifData(localFile) {
    try {
        const exifData = await getExif(localFile);
        return exifData.gps;
    } catch(err) {
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
    return degCoords;
}

// Start the process
extractExif();
