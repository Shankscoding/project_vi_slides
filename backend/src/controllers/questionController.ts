// import { Request, Response } from 'express';
// import Question from '../models/Question';
// import Session from '../models/Session';
// import { emitToSession } from '../config/socket';
// import { analyzeQuestion } from '../services/aiService';
// import User from '../models/User';

// // @desc    Create a new question
// // @route   POST /api/questions
// // @access  Private
// export const createQuestion = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { content, sessionId, isDirectToTeacher } = req.body;

//         if (!content || !sessionId) {
//             res.status(400).json({ success: false, message: 'Content and session ID are required' });
//             return;
//         }

//         const session = await Session.findById(sessionId);
//         if (!session) {
//             res.status(404).json({ success: false, message: 'Session not found' });
//             return;
//         }

//         const question = await Question.create({
//             content,
//             user: req.user?._id,
//             session: sessionId,
//             isDirectToTeacher: !!isDirectToTeacher,
//             analysisStatus: 'not_requested' // Teacher will trigger AI analysis manually
//         });

//         // Reward points for asking a question (+10)
//         await User.findByIdAndUpdate(req.user?._id, { $inc: { points: 10 } });

//         // Populate user info for the response and emission
//         const populatedQuestion = await Question.findById(question._id).populate('user', 'name');

//         // Emit real-time event
//         emitToSession(session.code, 'new_question', populatedQuestion);

//         res.status(201).json({
//             success: true,
//             data: populatedQuestion
//         });

//     } catch (error) {
//         console.error('Create question error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error during question creation'
//         });
//     }
// };

// // @desc    Get all questions for a session
// // @route   GET /api/questions/session/:sessionId
// // @access  Private
// export const getSessionQuestions = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { sessionId } = req.params;
//         const questions = await Question.find({ session: sessionId, status: 'active' })
//             .populate('user', 'name')
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: questions.length,
//             data: questions
//         });
//     } catch (error) {
//         console.error('Get questions error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error fetching questions'
//         });
//     }
// };

// // @desc    Update a question
// // @route   PUT /api/questions/:id
// // @access  Private (Owner only)
// export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { content } = req.body;
//         let question = await Question.findById(req.params.id).populate('session', 'code');

//         if (!question) {
//             res.status(404).json({ success: false, message: 'Question not found' });
//             return;
//         }

//         // Check if user is the one who asked the question
//         // Guest questions cannot be updated
//         if (!question.user || question.user.toString() !== req.user?._id.toString()) {
//             res.status(403).json({ success: false, message: 'Not authorized to update this question' });
//             return;
//         }

//         question.content = content || question.content;
//         await question.save();

//         const updatedQuestion = await Question.findById(question._id).populate('user', 'name');

//         // Notify others about update
//         const session = question.session as any;
//         emitToSession(session.code, 'update_question', updatedQuestion);

//         res.status(200).json({
//             success: true,
//             data: updatedQuestion
//         });
//     } catch (error) {
//         console.error('Update question error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error updating question'
//         });
//     }
// };

// // @desc    Delete a question
// // @route   DELETE /api/questions/:id
// // @access  Private (Owner or Teacher)
// export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const question = await Question.findById(req.params.id).populate('session', 'code');

//         if (!question) {
//             res.status(404).json({ success: false, message: 'Question not found' });
//             return;
//         }

//         const session = await Session.findById(question.session).populate('teacher');

//         // Check if user is owner OR teacher of the session
//         // For guest questions (no user), only teacher can delete
//         const isOwner = question.user ? question.user.toString() === req.user?._id.toString() : false;
//         const isTeacher = session?.teacher.toString() === req.user?._id.toString();

//         if (!isOwner && !isTeacher) {
//             res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
//             return;
//         }

//         await Question.findByIdAndDelete(req.params.id);

//         // Notify others about deletion
//         const sessionCode = (question.session as any).code;
//         emitToSession(sessionCode, 'delete_question', req.params.id);

//         res.status(200).json({
//             success: true,
//             message: 'Question removed'
//         });
//     } catch (error) {
//         console.error('Delete question error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error deleting question'
//         });
//     }
// };

// // @desc    Toggle pin status of a question
// // @route   PATCH /api/questions/:id/pin
// // @access  Private (Teacher only)
// export const togglePin = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const question = await Question.findById(req.params.id).populate('session', 'code teacher');

//         if (!question) {
//             res.status(404).json({ success: false, message: 'Question not found' });
//             return;
//         }

//         const session = question.session as any;

//         // Only teacher can pin questions
//         if (session.teacher.toString() !== req.user?._id.toString()) {
//             res.status(403).json({ success: false, message: 'Only the teacher can pin questions' });
//             return;
//         }

//         question.isPinned = !question.isPinned;
//         await question.save();

//         const updatedQuestion = await Question.findById(question._id).populate('user', 'name');

//         // Notify session about pinning change
//         emitToSession(session.code, 'question_pinned_toggle', updatedQuestion);

//         res.status(200).json({
//             success: true,
//             data: updatedQuestion
//         });
//     } catch (error) {
//         console.error('Toggle pin error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error toggling pin status'
//         });
//     }
// };

// // @desc    Respond to a question
// // @route   PATCH /api/questions/:id/respond
// // @access  Private (Teacher only)
// export const respondToQuestion = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { answer } = req.body;
//         const question = await Question.findById(req.params.id).populate('session', 'code teacher');

//         if (!question) {
//             res.status(404).json({ success: false, message: 'Question not found' });
//             return;
//         }

//         const session = question.session as any;

//         // Only teacher can respond to questions
//         if (session.teacher.toString() !== req.user?._id.toString()) {
//             res.status(403).json({ success: false, message: 'Only the teacher can respond to questions' });
//             return;
//         }

//         question.teacherAnswer = answer;
//         question.teacherAnsweredAt = new Date();
//         await question.save();

//         const updatedQuestion = await Question.findById(question._id).populate('user', 'name');

//         // Notify session about teacher response
//         emitToSession(session.code, 'update_question', updatedQuestion);

//         res.status(200).json({
//             success: true,
//             data: updatedQuestion
//         });
//     } catch (error) {
//         console.error('Respond to question error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error responding to question'
//         });
//     }
// };

// // @desc    Toggle upvote on a question
// // @route   PATCH /api/questions/:id/upvote
// // @access  Private
// export const toggleUpvote = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const userId = req.user?._id;

//         if (!userId) {
//             res.status(401).json({ success: false, message: 'Not authorized' });
//             return;
//         }

//         const question = await Question.findById(req.params.id).populate('session', 'code');

//         if (!question) {
//             res.status(404).json({ success: false, message: 'Question not found' });
//             return;
//         }

//         const isUpvoted = question.upvotes.map(id => id.toString()).includes(userId.toString());
//         const session = question.session as any;

//         if (isUpvoted) {
//             // Remove upvote
//             question.upvotes = question.upvotes.filter((id: any) => id.toString() !== userId.toString());
//             // Deduct points from author (-5) - only if question has a user (not guest)
//             if (question.user) {
//                 await User.findByIdAndUpdate(question.user, { $inc: { points: -5 } });
//             }
//         } else {
//             // Add upvote
//             question.upvotes.push(userId);
//             // Reward points to author (+5) - only if question has a user (not guest)
//             if (question.user) {
//                 await User.findByIdAndUpdate(question.user, { $inc: { points: 5 } });
//             }
//         }

//         await question.save();

//         const updatedQuestion = await Question.findById(question._id).populate('user', 'name');

//         // Notify others
//         emitToSession(session.code, 'update_question', updatedQuestion);

//         res.status(200).json({
//             success: true,
//             data: updatedQuestion
//         });
//     } catch (error) {
//         console.error('Toggle upvote error:', error);
//         res.status(500).json({ success: false, message: 'Server error toggling upvote' });
//     }
// };

// // @desc    Request AI analysis for a question (Teacher only)
// // @route   PATCH /api/questions/:id/analyze
// // @access  Private (Teacher only)
// export const requestAIAnalysis = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const question = await Question.findById(req.params.id).populate('session', 'code teacher');

//         if (!question) {
//             res.status(404).json({ success: false, message: 'Question not found' });
//             return;
//         }

//         const session = question.session as any;

//         // Only teacher can request AI analysis
//         if (session.teacher.toString() !== req.user?._id.toString()) {
//             res.status(403).json({ success: false, message: 'Only the teacher can request AI analysis' });
//             return;
//         }

//         // Check if already analyzed
//         if (question.analysisStatus === 'completed' && question.aiAnalysis) {
//             res.status(200).json({
//                 success: true,
//                 data: question,
//                 message: 'Question already analyzed'
//             });
//             return;
//         }

//         // Set status to pending
//         question.analysisStatus = 'pending';
//         await question.save();

//         // Emit pending status
//         const pendingQuestion = await Question.findById(question._id).populate('user', 'name');
//         emitToSession(session.code, 'update_question', pendingQuestion);

//         // Send immediate response
//         res.status(200).json({
//             success: true,
//             data: pendingQuestion,
//             message: 'AI analysis started'
//         });

//         // Perform AI analysis asynchronously
//         (async () => {
//             try {
//                 const analysis = await analyzeQuestion(question.content);

//                 await Question.findByIdAndUpdate(question._id, {
//                     aiAnalysis: analysis,
//                     analysisStatus: 'completed'
//                 });

//                 const analyzedQuestion = await Question.findById(question._id).populate('user', 'name');
//                 emitToSession(session.code, 'question_analyzed', analyzedQuestion);
//             } catch (err) {
//                 console.error('AI Analysis failed:', err);
//                 await Question.findByIdAndUpdate(question._id, { analysisStatus: 'failed' });

//                 const failedQuestion = await Question.findById(question._id).populate('user', 'name');
//                 emitToSession(session.code, 'update_question', failedQuestion);
//             }
//         })();

//     } catch (error) {
//         console.error('Request AI analysis error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error requesting AI analysis'
//         });
//     }
// };



import { Request, Response } from 'express';
import Question from '../models/Question';
import Session from '../models/Session';
import { emitToSession } from '../config/socket';
import { ragService } from '../services/RAGService';
import { queueQuestion } from '../services/questionBatchService';
import { analyzeQuestion } from '../services/aiService';
import User from '../models/User';
// @desc    Create a new question
// @route   POST /api/questions
// @access  Private
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { content, sessionId, isDirectToTeacher } = req.body;

        if (!content || !sessionId) {
            res.status(400).json({ success: false, message: 'Content and session ID are required' });
            return;
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        // Try to find answer using RAG service
        const ragResult = await ragService.findAnswer(content);
        
        let questionData: any = {
            content,
            question: content, // Store question for RAG system
            answer: ragResult.answer || '', // Store RAG answer
            sessionId: sessionId.toString(), // Store session ID for RAG queries
            timestamp: new Date(), // Store timestamp for RAG queries
            user: req.user?._id,
            session: sessionId,
            isDirectToTeacher: !!isDirectToTeacher,
            analysisStatus: 'not_requested',
            refinementStatus: 'pending',
            originalContent: content
        };

        // Set status based on RAG result
        if (ragResult.answer && ragResult.similarity >= 0.75) {
            questionData.status = 'auto_answered';
            console.log(`Question auto-answered with similarity ${ragResult.similarity.toFixed(4)}`);
        } else {
            questionData.status = 'unanswered';
            console.log(`Question marked as unanswered, similarity ${ragResult.similarity.toFixed(4)}`);
        }

        const question = await Question.create(questionData);

        // Reward points for asking a question (+10)
        await User.findByIdAndUpdate(req.user?._id, { $inc: { points: 10 } });

        // Populate user info for the response and emission
        const populatedQuestion = await Question.findById(question._id).populate('user', 'name');

        // Emit real-time event with appropriate status
        const emitData = {
            ...populatedQuestion?.toObject(),
            refinementStatus: 'pending',
            ragStatus: questionData.status,
            ragAnswer: ragResult.answer || null,
            ragSimilarity: ragResult.similarity
        };

        if (questionData.status === 'auto_answered') {
            emitToSession(session.code, 'new_question', {
                ...emitData,
                message: 'Question automatically answered using RAG system'
            });
        } else {
            emitToSession(session.code, 'new_question', {
                ...emitData,
                message: 'Question submitted and queued for refinement'
            });
            
            // Queue for batch refinement only if unanswered
            queueQuestion({
                _id: question._id,
                content,
                sessionId: sessionId.toString(),
                userId: req.user?._id?.toString(),
                timestamp: Date.now()
            });
        }

        res.status(201).json({
            success: true,
            data: populatedQuestion,
            ragStatus: questionData.status,
            ragAnswer: ragResult.answer || null,
            ragSimilarity: ragResult.similarity,
            message: questionData.status === 'auto_answered' 
                ? 'Question automatically answered using RAG system'
                : 'Question submitted and queued for grammar/clarity refinement'
        });

    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during question creation'
        });
    }
};

// @desc    Get all questions for a session
// @route   GET /api/questions/session/:sessionId
// @access  Private
export const getSessionQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const questions = await Question.find({ session: sessionId, status: 'active' })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching questions'
        });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (Owner only)
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { content } = req.body;
        let question = await Question.findById(req.params.id).populate('session', 'code');

        if (!question) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }

        // Check if user is the one who asked the question
        // Guest questions cannot be updated
        if (!question.user || question.user.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this question' });
            return;
        }

        question.content = content || question.content;
        await question.save();

        const updatedQuestion = await Question.findById(question._id).populate('user', 'name');

        // Notify others about update
        const session = question.session as any;
        emitToSession(session.code, 'update_question', updatedQuestion);

        res.status(200).json({
            success: true,
            data: updatedQuestion
        });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating question'
        });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (Owner or Teacher)
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const question = await Question.findById(req.params.id).populate('session', 'code');

        if (!question) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }

        const session = await Session.findById(question.session).populate('teacher');

        // Check if user is owner OR teacher of the session
        // For guest questions (no user), only teacher can delete
        const isOwner = question.user ? question.user.toString() === req.user?._id.toString() : false;
        const isTeacher = session?.teacher.toString() === req.user?._id.toString();

        if (!isOwner && !isTeacher) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
            return;
        }

        await Question.findByIdAndDelete(req.params.id);

        // Notify others about deletion
        const sessionCode = (question.session as any).code;
        emitToSession(sessionCode, 'delete_question', req.params.id);

        res.status(200).json({
            success: true,
            message: 'Question removed'
        });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting question'
        });
    }
};

// @desc    Toggle pin status of a question
// @route   PATCH /api/questions/:id/pin
// @access  Private (Teacher only)
export const togglePin = async (req: Request, res: Response): Promise<void> => {
    try {
        const question = await Question.findById(req.params.id).populate('session', 'code teacher');

        if (!question) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }

        const session = question.session as any;

        // Only teacher can pin questions
        if (session.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Only the teacher can pin questions' });
            return;
        }

        question.isPinned = !question.isPinned;
        await question.save();

        const updatedQuestion = await Question.findById(question._id).populate('user', 'name');

        // Notify session about pinning change
        emitToSession(session.code, 'question_pinned_toggle', updatedQuestion);

        res.status(200).json({
            success: true,
            data: updatedQuestion
        });
    } catch (error) {
        console.error('Toggle pin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error toggling pin status'
        });
    }
};

// @desc    Respond to a question
// @route   PATCH /api/questions/:id/respond
// @access  Private (Teacher only)
export const respondToQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { answer } = req.body;
        const question = await Question.findById(req.params.id).populate('session', 'code teacher');

        if (!question) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }

        const session = question.session as any;

        // Only teacher can respond to questions
        if (session.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Only the teacher can respond to questions' });
            return;
        }

        question.teacherAnswer = answer;
        question.teacherAnsweredAt = new Date();
        await question.save();

        const updatedQuestion = await Question.findById(question._id).populate('user', 'name');

        // Notify session about teacher response
        emitToSession(session.code, 'update_question', updatedQuestion);

        res.status(200).json({
            success: true,
            data: updatedQuestion
        });
    } catch (error) {
        console.error('Respond to question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error responding to question'
        });
    }
};

// @desc    Toggle upvote on a question
// @route   PATCH /api/questions/:id/upvote
// @access  Private
export const toggleUpvote = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;
        }

        const question = await Question.findById(req.params.id).populate('session', 'code');

        if (!question) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }

        const isUpvoted = question.upvotes.map(id => id.toString()).includes(userId.toString());
        const session = question.session as any;

        if (isUpvoted) {
            // Remove upvote
            question.upvotes = question.upvotes.filter((id: any) => id.toString() !== userId.toString());
            // Deduct points from author (-5) - only if question has a user (not guest)
            if (question.user) {
                await User.findByIdAndUpdate(question.user, { $inc: { points: -5 } });
            }
        } else {
            // Add upvote
            question.upvotes.push(userId);
            // Reward points to author (+5) - only if question has a user (not guest)
            if (question.user) {
                await User.findByIdAndUpdate(question.user, { $inc: { points: 5 } });
            }
        }

        await question.save();

        const updatedQuestion = await Question.findById(question._id).populate('user', 'name');

        // Notify others
        emitToSession(session.code, 'update_question', updatedQuestion);

        res.status(200).json({
            success: true,
            data: updatedQuestion
        });
    } catch (error) {
        console.error('Toggle upvote error:', error);
        res.status(500).json({ success: false, message: 'Server error toggling upvote' });
    }
};

// @desc    Request analysis for a question (Teacher only)
// @route   PATCH /api/questions/:id/analyze
// @access  Private (Teacher only)
export const requestAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
        const question = await Question.findById(req.params.id).populate('session', 'code teacher');

        if (!question) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }

        const session = question.session as any;

        // Only teacher can request analysis
        if (session.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Only the teacher can request analysis' });
            return;
        }

        // Check if already analyzed
        if (question.analysisStatus === 'completed' && question.aiAnalysis) {
            res.status(200).json({
                success: true,
                data: question,
                message: 'Question already analyzed'
            });
            return;
        }

        // Set status to pending
        question.analysisStatus = 'pending';
        await question.save();

        // Emit pending status
        const pendingQuestion = await Question.findById(question._id).populate('user', 'name');
        emitToSession(session.code, 'update_question', pendingQuestion);

        // Send immediate response
        res.status(200).json({
            success: true,
            data: pendingQuestion,
            message: 'Analysis started'
        });

        // Perform analysis asynchronously
        (async () => {
            try {
                const analysis = await analyzeQuestion(question.content);

                await Question.findByIdAndUpdate(question._id, {
                    aiAnalysis: analysis,
                    analysisStatus: 'completed'
                });

                const analyzedQuestion = await Question.findById(question._id).populate('user', 'name');
                emitToSession(session.code, 'question_analyzed', analyzedQuestion);
            } catch (err) {
                console.error('Analysis failed:', err);
                await Question.findByIdAndUpdate(question._id, { analysisStatus: 'failed' });

                const failedQuestion = await Question.findById(question._id).populate('user', 'name');
                emitToSession(session.code, 'update_question', failedQuestion);
            }
        })();

    } catch (error) {
        console.error('Request analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error requesting analysis'
        });
    }
};

// @desc    Get unanswered questions for a session
// @route   GET /api/sessions/:id/unanswered-questions
// @access  Private
export const getUnansweredQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Find all questions where sessionId matches and status is 'unanswered'
        const questions = await Question.find({ 
            sessionId: id, 
            status: 'unanswered' 
        })
        .populate('user', 'name')
        .sort({ timestamp: 1 }); // Sort by timestamp ascending

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        console.error('Get unanswered questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching unanswered questions'
        });
    }
};

// @desc    Manually trigger batch question refinement (Teacher only)
// @route   POST /api/questions/batch/process/:sessionId
// @access  Private (Teacher only)
export const processBatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findById(sessionId).populate('teacher');

        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        // Only teacher can manually trigger batch processing
        if (session.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Only the teacher can trigger batch processing' });
            return;
        }

        // Import here to avoid circular dependency
        const { triggerBatchProcessing } = await import('../services/questionBatchService');

        // Trigger batch processing asynchronously
        triggerBatchProcessing(sessionId);

        res.status(202).json({
            success: true,
            message: 'Batch refinement triggered. Questions will be refined and updated shortly.'
        });

    } catch (error) {
        console.error('Process batch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error processing batch'
        });
    }
};