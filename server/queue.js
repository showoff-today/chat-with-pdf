import { Queue } from "bullmq";
import dotenv from 'dotenv';
dotenv.config();

const pdfProcessQueue = new Queue('pdfProcess',{
    connection : {
        url: process.env.REDIS_URL,
    } ,
});

export default pdfProcessQueue;