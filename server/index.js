import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import  {uploadFile}  from './middlewares/multer.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';


dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());

app.use(express.json());


app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Chat with Pdf API</h1>');
});

app.post('/upload-file',ClerkExpressRequireAuth(), uploadFile, async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    
    res.status(200).json({
        message: 'File uploaded successfully',
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})