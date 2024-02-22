# Starter Code: GlobalJags
**GlobalJags** is a cloud-based application that is intended to demonstrate how to integrate several cloud services together.

This project will be deployed on the *Google Cloud Platform (GCP)* using the credits that you have been granted. However, the concepts and implementation presented here can be accomplished on any of the major cloud providers.

## Getting Started
1. Create a **fork** of this GitHub repository into your own GitHub account. Note the URL for your version of repository.
2. Log in to the [*Google Cloud Shell*](https://shell.cloud.google.com) using your IU username and passphrase. (If you are logged in to Google with a personal account, you should use a Private or Incognito window.)
3. Use `git clone` to download your version of the repository and access the starter code.

### Create a Google Cloud Project
1. Create a NEW Google Cloud Project. The name must be unique, but it should be something like `sp24-41200-username-globaljags`
2. Create THREE new buckets in Cloud Storage:
    1. sp24-41200-elliott-globaljags-uploadscdcd
    2. sp24-41200-elliott-globaljags-thumbnails
    3. sp24-41200-elliott-globaljags-final

## Cloud Services
Several GCP services will work in concert to produce the application.

### App Engine
We will create a highly simplified **Node.js** application that allows users to upload photos and displays a thumbnail of the photo on a **Google Map**.

### Cloud Storage
Photos will be uploaded to a bucket where they will await processing. Processed photos will be served to the website from Cloud Storage.

### Google Cloud Function
Uploading a file to a bucket will trigger a **Node.js** cloud function (lambda) that will extract the location data from the photo and generate a thumbnail image stored in a different storage bucket. Photos that do not meet the criteria of the application will be rejected and deleted.

### Firestore Database
Location data for each valid photograph will be stored in a collection in a realtime database. Updates to this database will automatically trigger a refresh of the Google Map being displayed on the website.