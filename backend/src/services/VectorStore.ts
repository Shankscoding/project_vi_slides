import { pipeline, env } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

// Configure transformers to use local cache
env.localModelPath = path.join(__dirname, '../../models');
env.allowRemoteModels = true;

interface VectorEntry {
  id: string;
  question: string;
  answer: string;
  embedding: number[];
}

class VectorStore {
  private static instance: VectorStore;
  private embeddingPipeline: any = null;
  private vectors: VectorEntry[] = [];
  private readonly similarityThreshold = 0.75;
  private readonly qaDataPath = path.join(__dirname, '../../data/sample_qa_mern.json');

  private constructor() {}

  public static getInstance(): VectorStore {
    if (!VectorStore.instance) {
      VectorStore.instance = new VectorStore();
    }
    return VectorStore.instance;
  }

  public async init(): Promise<void> {
    try {
      console.log('Initializing Vector Store...');
      
      // Initialize embedding model
      console.log('Loading embedding model: all-MiniLM-L6-v2...');
      this.embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Embedding model loaded successfully');

      // Load Q&A data
      await this.loadQAData();
      
      console.log(`Vector Store initialized with ${this.vectors.length} Q&A pairs`);
    } catch (error) {
      console.error('Failed to initialize Vector Store:', error);
      throw error;
    }
  }

  private async loadQAData(): Promise<void> {
    try {
      if (!fs.existsSync(this.qaDataPath)) {
        throw new Error(`Q&A data file not found: ${this.qaDataPath}`);
      }

      const qaData: { question: string; answer: string }[] = JSON.parse(fs.readFileSync(this.qaDataPath, 'utf-8'));
      console.log(`Loaded ${qaData.length} Q&A pairs`);

      // Generate embeddings for all questions
      for (let i = 0; i < qaData.length; i++) {
        const qa = qaData[i];
        const embedding = await this.generateEmbedding(qa.question);
        
        this.vectors.push({
          id: `qa_${i + 1}`,
          question: qa.question,
          answer: qa.answer,
          embedding
        });

        if ((i + 1) % 10 === 0) {
          console.log(`Processed ${i + 1}/${qaData.length} Q&A pairs`);
        }
      }

      console.log('All Q&A pairs processed and embedded');
    } catch (error) {
      console.error('Error loading Q&A data:', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embeddingPipeline) {
      throw new Error('Embedding pipeline not initialized');
    }

    try {
      const result = await this.embeddingPipeline(text, { pooling: 'mean', normalize: true });
      return Array.from(result.data);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  public async findAnswer(question: string): Promise<{ answer: string | null; similarity: number }> {
    try {
      if (!this.embeddingPipeline || this.vectors.length === 0) {
        console.warn('Vector Store not properly initialized');
        return { answer: null, similarity: 0 };
      }

      // Generate embedding for the question
      const questionEmbedding = await this.generateEmbedding(question);

      // Calculate similarity with all vectors
      const similarities = this.vectors.map(vector => ({
        vector,
        similarity: this.cosineSimilarity(questionEmbedding, vector.embedding)
      }));

      // Sort by similarity (descending)
      similarities.sort((a, b) => b.similarity - a.similarity);

      // Get the best match
      const bestMatch = similarities[0];
      
      console.log(`Best match similarity: ${bestMatch.similarity.toFixed(4)} for question: "${question.substring(0, 50)}..."`);

      // Check if similarity meets threshold
      if (bestMatch.similarity >= this.similarityThreshold) {
        console.log(`Found matching answer with similarity ${bestMatch.similarity.toFixed(4)}`);
        return {
          answer: bestMatch.vector.answer,
          similarity: bestMatch.similarity
        };
      } else {
        console.log(`Similarity ${bestMatch.similarity.toFixed(4)} below threshold ${this.similarityThreshold}`);
        return { answer: null, similarity: bestMatch.similarity };
      }

    } catch (error) {
      console.error('Error finding answer:', error);
      return { answer: null, similarity: 0 };
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must be of same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public isReady(): boolean {
    return !!(this.embeddingPipeline && this.vectors.length > 0);
  }

  public getStats(): { count: number; ready: boolean } {
    return {
      count: this.vectors.length,
      ready: this.isReady()
    };
  }

  public async test(): Promise<void> {
    try {
      console.log('Testing Vector Store...');
      
      const testQuestions = [
        "What is the MERN stack?",
        "What are React hooks?",
        "What is Express.js middleware?",
        "What is TypeScript?",
        "What is MongoDB?"
      ];

      for (const question of testQuestions) {
        console.log(`\nTesting question: "${question}"`);
        const result = await this.findAnswer(question);
        
        if (result.answer) {
          console.log(`Answer found (similarity: ${result.similarity.toFixed(4)}):`);
          console.log(`${result.answer.substring(0, 100)}...`);
        } else {
          console.log(`No answer found (similarity: ${result.similarity.toFixed(4)})`);
        }
      }

      console.log('\nVector Store test completed');
    } catch (error) {
      console.error('Error testing Vector Store:', error);
    }
  }
}

export const vectorStore = VectorStore.getInstance();
export default vectorStore;
