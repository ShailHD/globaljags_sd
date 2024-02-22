// Imports
const getExif = require('exif-async');
const parseDMS = require('parse-dms');

// Entry Point Function
async function extractExif() {
    try {
        let gpsObject = await readExifData('china1.jpeg');
        if (gpsObject) {
            let gpsDecimal = getGPSCoordinates(gpsObject);
            if (gpsDecimal) {
                console.log(gpsDecimal);
                console.log(`Latitude: ${gpsDecimal.lat}`);
                console.log(`Longitude: ${gpsDecimal.lon}`);
            } else {
                console.log('No GPS coordinates could be extracted.');
            }
        } else {
            console.log('No EXIF data found.');
        }
    } catch (error) {
        console.error('Error in extractExif:', error);
    }
}

// Helper Functions
async function readExifData(localFile) {
    try {
        let exifData = await getExif(localFile);
        return exifData.gps || null;
    } catch (error) {
        console.error('Error reading EXIF data:', error);
        return null;
    }
}

function getGPSCoordinates(gpsData) {
    try {
        const latString = `${gpsData.GPSLatitude[0]}:${gpsData.GPSLatitude[1]}:${gpsData.GPSLatitude[2]}${gpsData.GPSLatitudeRef}`;
        const lonString = `${gpsData.GPSLongitude[0]}:${gpsData.GPSLongitude[1]}:${gpsData.GPSLongitude[2]}${gpsData.GPSLongitudeRef}`;
        return parseDMS(`${latString} ${lonString}`);
    } catch (error) {
        console.error('Error parsing GPS coordinates:', error);
        return null;
    }
}

// Run the function for testing purposes (not needed in actual GCF)
extractExif();
