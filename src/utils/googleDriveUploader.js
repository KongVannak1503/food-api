const { google } = require('googleapis');
const fs = require('fs');

async function uploadFilesToGoogleDrive(files) {
  try {
    // Initialize Google Auth
    const auth = new google.auth.GoogleAuth({
      keyFile: 'upload.json', // Ensure this file exists and is correct
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: 'v3', auth });
    const uploadedFiles = [];

    // Loop through files and upload each one
    for (const file of files) {
      const originalName = file.originalname.split('.')[0];
      const extension = file.originalname.split('.').pop();
      const timestamp = Date.now();
      const uniqueFilename = `${originalName}-${timestamp}.${extension}`;

      try {
        const response = await drive.files.create({
          requestBody: {
            name: uniqueFilename,
            mimeType: file.mimetype,
            parents: ['1JfQibF9ELQH1KBIQPfkvTEXQf8suaWN7'],
          },
          media: {
            body: fs.createReadStream(file.path),
          },
        });

        uploadedFiles.push(response.data);
      } catch (error) {
        console.error(`Error uploading file "${file.originalname}":`, error);
      }
    }

    return uploadedFiles; // Return the array of uploaded files' metadata
  } catch (error) {
    console.error("Error during file upload:", error);
    throw error; // Propagate the error to the caller
  }
}

module.exports = { uploadFilesToGoogleDrive };
