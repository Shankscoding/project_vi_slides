import { pipeline, env } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure transformers to use local cache
env.localModelPath = path.join(__dirname, '../models');
env.allowRemoteModels = true;

// Interface for Q&A data
interface QAData {
  question: string;
  answer: string;
}

// Initialize embedding model
class EmbeddingModel {
  private embeddingPipeline: any;

  async init() {
    try {
      console.log('Loading embedding model: all-MiniLM-L6-v2...');
      this.embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Embedding model loaded successfully');
    } catch (error) {
      console.error('Failed to load embedding model:', error);
      throw error;
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.embeddingPipeline) {
      throw new Error('Embedding model not initialized');
    }

    try {
      const result = await this.embeddingPipeline(text, { pooling: 'mean', normalize: true });
      return Array.from(result.data);
    } catch (error) {
      console.error('Error embedding text:', error);
      throw error;
    }
  }
}

// Main seeding function
async function seedQAData() {
  try {
    console.log('Starting Q&A data seeding...');

    // Read Q&A data
    const qaDataPath = path.join(__dirname, '../data/sample_qa_mern.json');
    if (!fs.existsSync(qaDataPath)) {
      throw new Error(`Q&A data file not found: ${qaDataPath}`);
    }

    const qaData: QAData[] = JSON.parse(fs.readFileSync(qaDataPath, 'utf-8'));
    console.log(`Loaded ${qaData.length} Q&A pairs`);

    // Initialize embedding model
    const embeddingModel = new EmbeddingModel();
    await embeddingModel.init();

    // Initialize ChromaDB
    const { ChromaApi, OpenAIEmbeddingFunction } = require('chromadb');
    const chroma = new ChromaApi({ path: 'http://localhost:8000' });

    // Get or create collection
    const collectionName = 'vi_slides_qa';
    let collection;
    
    try {
      // Try to get existing collection
      collection = await chroma.getCollection({ name: collectionName });
      console.log(`Using existing collection: ${collectionName}`);
    } catch (error) {
      // Create new collection if it doesn't exist
      console.log(`Creating new collection: ${collectionName}`);
      collection = await chroma.createCollection({ 
        name: collectionName,
        metadata: { description: 'VI Slides Q&A collection for closed-domain RAG' }
      });
    }

    // Prepare data for ChromaDB
    const ids: string[] = [];
    const documents: string[] = [];
    const embeddings: number[][] = [];
    const metadatas: any[] = [];

    console.log('Generating embeddings for Q&A pairs...');

    for (let i = 0; i < qaData.length; i++) {
      const qa = qaData[i];
      const id = `qa_${i + 1}`;
      
      try {
        const embedding = await embeddingModel.embed(qa.question);
        
        ids.push(id);
        documents.push(qa.question);
        embeddings.push(embedding);
        metadatas.push({ 
          answer: qa.answer,
          question_index: i + 1
        });

        console.log(`Processed Q&A ${i + 1}/${qaData.length}: ${qa.question.substring(0, 50)}...`);
      } catch (error) {
        console.error(`Error processing Q&A ${i + 1}:`, error);
        throw error;
      }
    }

    // Clear existing data if any
    try {
      const existingItems = await collection.get({ limit: 1 });
      if (existingItems.ids.length > 0) {
        console.log('Clearing existing data from collection...');
        await collection.delete({ ids: existingItems.ids });
      }
    } catch (error) {
      console.log('No existing data to clear');
    }

    // Add data to collection
    console.log('Adding data to ChromaDB collection...');
    
    const batchSize = 100; // Process in batches to avoid memory issues
    for (let i = 0; i < ids.length; i += batchSize) {
      const endIndex = Math.min(i + batchSize, ids.length);
      const batchIds = ids.slice(i, endIndex);
      const batchDocuments = documents.slice(i, endIndex);
      const batchEmbeddings = embeddings.slice(i, endIndex);
      const batchMetadatas = metadatas.slice(i, endIndex);

      await collection.add({
        ids: batchIds,
        documents: batchDocuments,
        embeddings: batchEmbeddings,
        metadatas: batchMetadatas
      });

      console.log(`Added batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ids.length / batchSize)}`);
    }

    console.log(`Successfully seeded ${qaData.length} Q&A pairs to ChromaDB collection '${collectionName}'`);
    
    // Verify the data
    const count = await collection.count();
    console.log(`Total items in collection: ${count}`);

    // Test query
    console.log('Testing query with sample question...');
    const testQuestion = "What is binary search?";
    const testEmbedding = await embeddingModel.embed(testQuestion);
    
    const results = await collection.query({
      queryEmbeddings: [testEmbedding],
      nResults: 3
    });

    console.log('Test query results:');
    results.documents[0].forEach((doc: string, idx: number) => {
      const distance = results.distances?.[0]?.[idx] || 0;
      const similarity = 1 - distance;
      console.log(`  ${idx + 1}. Similarity: ${similarity.toFixed(4)}, Question: ${doc.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('Error seeding Q&A data:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedQAData()
    .then(() => {
      console.log('Q&A data seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Q&A data seeding failed:', error);
      process.exit(1);
    });
}

export default seedQAData;
