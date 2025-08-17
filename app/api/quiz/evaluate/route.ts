import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quiz, userAnswers } = body;
    
    if (!quiz || !userAnswers) {
      return NextResponse.json(
        { error: 'Quiz and user answers are required' },
        { status: 400 }
      );
    }

    // Simple evaluation without calling OpenAI again
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;
    let results = [];

    // Process each question
    for (const question of quiz.questions) {
      const questionId = question.id;
      const userAnswer = userAnswers[questionId];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
      }
      
      results.push({
        questionId,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    }

    // Calculate score as percentage
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Generate feedback directly without calling OpenAI
    const feedback = generateFeedbackWithoutLLM(score);
    
    return NextResponse.json({
      score,
      correctAnswers,
      totalQuestions,
      results,
      feedback
    });

  } catch (error: any) {
    console.error('Quiz evaluation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateFeedbackWithoutLLM(score: number) {
  // Provide tailored feedback based on the score range
  if (score >= 90) {
    return "Outstanding! Your excellent score demonstrates a deep understanding of this material. You've mastered the key concepts and details.";
  } else if (score >= 80) {
    return "Great job! You have a solid grasp of this material. Review the questions you missed to further strengthen your knowledge.";
  } else if (score >= 70) {
    return "Good work! You've understood many important aspects of this topic. Reviewing the explanations for missed questions will help you improve.";
  } else if (score >= 60) {
    return "Nice effort! You're on the right track. Focus on the explanations for the questions you missed to build a stronger understanding.";
  } else {
    return "Thank you for completing the quiz! This topic might need some additional review. Read through all the explanations to reinforce your knowledge.";
  }
}
