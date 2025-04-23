import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
dotenv.config();

new Worker(
  'pdfProcess',
  async job => {
    const { filePath } = job.data;
    let actualPath = `./uploads/${filePath}`;
    const loader = new PDFLoader(actualPath);
    const docs = await loader.load();
    console.log(docs[0]);
  },
  { 
    connection : {
        url: process.env.REDIS_URL,
    }
  },
);

console.log('Worker is running');

