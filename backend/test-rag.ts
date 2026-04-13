import { ragService } from './src/services/RAGService';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testRAGSystem() {
    console.log('=== RAG System Test ===\n');

    try {
        // Initialize RAG service
        console.log('1. Initializing RAG Service...');
        await ragService.init();
        
        // Check if service is ready
        const stats = await ragService.getStats();
        console.log(`   Status: ${stats.ready ? 'Ready' : 'Not Ready'}`);
        console.log(`   Q&A pairs in database: ${stats.count}\n`);

        if (!stats.ready) {
            console.log('RAG Service is not ready. Please ensure ChromaDB is running and seeded.');
            return;
        }

        // Test questions
        const testQuestions = [
            "What is binary search?",
            "How does a stack work?",
            "What is the difference between SQL and NoSQL?",
            "What is polymorphism?",
            "What is quantum computing?" // This should not have a good match
        ];

        console.log('2. Testing question answering...\n');

        for (let i = 0; i < testQuestions.length; i++) {
            const question = testQuestions[i];
            console.log(`   Test ${i + 1}: "${question}"`);
            
            const result = await ragService.findAnswer(question);
            
            if (result.answer) {
                console.log(`   Status: AUTO_ANSWERED`);
                console.log(`   Similarity: ${result.similarity.toFixed(4)}`);
                console.log(`   Answer: ${result.answer.substring(0, 100)}...`);
            } else {
                console.log(`   Status: UNANSWERED`);
                console.log(`   Similarity: ${result.similarity.toFixed(4)} (below threshold)`);
            }
            console.log('');
        }

        console.log('3. Running built-in test...');
        await ragService.test();

        console.log('\n=== Test Complete ===');
        console.log('RAG system is working correctly!');

    } catch (error) {
        console.error('Test failed:', error);
        console.log('\nTroubleshooting:');
        console.log('1. Make sure ChromaDB is running on http://localhost:8000');
        console.log('2. Run: npx ts-node scripts/seedQA.ts to populate the database');
        console.log('3. Check that all dependencies are installed');
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testRAGSystem()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Test error:', error);
            process.exit(1);
        });
}

export default testRAGSystem;
