import { vectorStore } from './VectorStore';

export interface RAGResult {
  answer: string | null;
  similarity: number;
  matchedQuestion?: string;
}

class RAGService {
  private static instance: RAGService;

  private constructor() {}

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

    public async init(): Promise<void> {
    try {
      console.log('Initializing RAG Service...');
      await vectorStore.init();
      console.log('RAG Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RAG Service:', error);
      throw error;
    }
  }

    public async findAnswer(question: string): Promise<RAGResult> {
    try {
      const result = await vectorStore.findAnswer(question);
      return {
        answer: result.answer,
        similarity: result.similarity
      };
    } catch (error) {
      console.error('Error finding answer:', error);
      return { answer: null, similarity: 0 };
    }
  }

  public isReady(): boolean {
    return vectorStore.isReady();
  }

  public async getStats(): Promise<{ count: number; ready: boolean }> {
    return vectorStore.getStats();
  }

  public async test(): Promise<void> {
    await vectorStore.test();
  }

}

// Export singleton instance
export const ragService = RAGService.getInstance();

export default ragService;
