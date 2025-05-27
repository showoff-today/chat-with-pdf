import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { uploadFile } from './middlewares/multer.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import pdfProcessQueue from './queue.js';
import oepnaiService from './services/oepnai.service.js';
import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());

app.use(express.json());


app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Chat with Pdf API</h1>');
});

app.post('/upload-file', ClerkExpressRequireAuth(), uploadFile, async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    console.log(req.body.id)
    await pdfProcessQueue.add('pdfProcess', {
        filePath: req.file.filename,
        userId: req.auth.userId,
        fileId: req.body.id,
    })

    res.status(200).json({
        message: 'File uploaded successfully',
    });
});

app.post('/chat', ClerkExpressRequireAuth(), async (req, res) => {
    let { question, userId, id } = req.body;
    if (!question || !userId) {
        return res.status(400).send('Question and userId are required');
    }

    let context;
    try {
        const embeddings = oepnaiService.openAiEmbeddings();

        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: process.env.QDRANT_URL,
            collectionName: id,
            Headers: {
                "api-key": process.env.QDRANT_API_KEY,
            },
        });

        const retriever = vectorStore.asRetriever({ k: 2 });
        const result = await retriever.invoke(question);
        context = JSON.stringify(result);
    } catch (error) {
        console.error('Error retrieving context:', error);
        return res.status(500).json({ error: 'Error retrieving context' });
    }
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the prompt similar to the attachment
    const SYSTEM_PROMPT = `You are a helpful assistant. Who answers questions based on the provided context.
Context: ${context}`;

    try {
        // Call Gemini model with system and user messages
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Understood, please provide your question." }] },
            ],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        // Send the user question and get the response
        const result = await chat.sendMessage(question);
        const response = await result.response;
        const content = response.text();

        return res.status(200).json({
            role: 'assistant',
            content: content,
            result: result,
        });
    } catch (error) {
        console.error('Error with Gemini API:', error);
        return res.status(500).json({ error: 'Error processing request with Gemini API' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
})