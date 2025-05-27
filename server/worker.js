import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantVectorStore } from '@langchain/qdrant';
import oepnaiService from './services/oepnai.service.js';
dotenv.config();

new Worker(
  'pdfProcess',
  async job => {
    const { filePath, fileId } = job.data;
    console.log('Job data:', job.data);
    console.log('Processing file:', filePath);
    let actualPath = `./uploads/${filePath}`;
    const loader = new PDFLoader(actualPath);
    const docs = await loader.load();
    const embeddings = oepnaiService.openAiEmbeddings();
    try {
      const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: fileId, 
        Headers: {
          "api-key": process.env.QDRANT_API_KEY,
        },
      }
      );
      await vectorStore.addDocuments(docs);
      console.log('Vector store created and documents added successfully');
    } catch (error) {
      console.error('Error creating vector store:', error);
      throw error;
    }


  },
  {
    connection: {
      url: process.env.REDIS_URL,
    }
  },
);

console.log('Worker is running');

