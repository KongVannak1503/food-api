const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require('cors');
const dbConfig = require("./src/config/db");
const {google} = require('googleapis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploaded = multer({ dest: 'uploads/' });

const app = express();

const storage = multer.diskStorage({
  destination: 'uploads',
  filename: function(req, file, callback) {
    const extension = file.originalname.split(".").pop();
    callback(null, `${file.fieldname}-${Date.now()}.${extension}`);
  }
});


app.use(express.json());
app.use(cors());
const upload = multer({ dest: 'uploads/' });
// app.post('/api/upload', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const auth = new google.auth.GoogleAuth({
//       keyFile: 'upload.json',
//       scopes: ["https://www.googleapis.com/auth/drive"]
//     });

//     const drive = google.drive({ version: 'v3', auth });

//     const file = req.file;

//     const originalName = file.originalname.split(".")[0];
//     const extension = file.originalname.split(".").pop();
//     const timestamp = Date.now();
//     const uniqueFilename = `${originalName}-${timestamp}.${extension}`;

//     const response = await drive.files.create({
//       requestBody: {
//         name: uniqueFilename,
//         mimeType: file.mimetype,
//         parents: ['1JfQibF9ELQH1KBIQPfkvTEXQf8suaWN7']
//       },
//       media: {
//         body: fs.createReadStream(file.path)
//       }
//     });

//     res.json({ file: response.data });
//   } catch (error) {
//     console.error('Error during file upload:', error);
//     res.status(500).json({ error: 'Error occurred while uploading the file.' });
//   }
// });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api/users", require('./src/routes/userRoutes'));
app.use("/api/restaurants", require('./src/routes/restaurantRoutes'));
app.use("/api/restaurant/items", require('./src/routes/menuItemRoutes'));
app.use("/api/delivery-partners", require('./src/routes/deliveryPartnerRoutes'));
app.use("/api/orders", require('./src/routes/orderRoutes'));
app.use("/api/orderItems", require('./src/routes/orderItemRoutes'));
app.use("/api/deliveries", require('./src/routes/deliveryRoutes'));




const PORT = process.env.PORT || 5000;
// Connect to the database 
dbConfig()
  .then(() => {
    console.log("Database connected successfully");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.message);
  });
