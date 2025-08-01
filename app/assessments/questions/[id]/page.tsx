'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Clock, 
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Question } from '@/types';
import Navigation from '@/components/Navigation';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchQuestion(params.id as string);
    }
  }, [params.id]);

  const fetchQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/questions/${questionId}`);
      if (response.ok) {
        const questionData = await response.json();
        setQuestion(questionData);
      } else {
        console.error('Question not found');
        router.push('/assessments/questions');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      router.push('/assessments/questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!question || !confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/assessments/questions');
      } else {
        alert('Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question');
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq': return '📝';
      case 'fill-in-blank': return '✏️';
      case 'coding': return '💻';
      case 'drag-drop': return '🔄';
      case 'short-text': return '📄';
      default: return '❓';
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'mcq': return 'bg-blue-100 text-blue-800';
      case 'fill-in-blank': return 'bg-green-100 text-green-800';
      case 'coding': return 'bg-purple-100 text-purple-800';
      case 'drag-drop': return 'bg-orange-100 text-orange-800';
      case 'short-text': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation role="assessments" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation role="assessments" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Question not found</h3>
            <p className="text-gray-600 mb-4">The question you're looking for doesn't exist.</p>
            <Link href="/assessments/questions" className="btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="assessments" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/assessments/questions" 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Question Details</h1>
              <p className="text-gray-600">View and manage question information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/assessments/questions/${question.id}/edit`}
              className="btn-secondary"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDeleteQuestion}
              className="btn-danger"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getQuestionTypeIcon(question.type)}</span>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQuestionTypeColor(question.type)}`}>
                  {question.type.replace('-', ' ').toUpperCase()}
                </span>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{question.points} points</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated {new Date(question.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Question Title */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Question</h3>
              <p className="text-gray-700 leading-relaxed">{question.title}</p>
            </div>

            {/* Question Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
              </div>
            </div>

            {/* Question Options (for MCQ) */}
            {question.type === 'mcq' && question.options && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Options</h3>
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        question.correctAnswer === option 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-500">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-gray-700">{option}</span>
                      {question.correctAnswer === option && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correct Answer */}
            {question.correctAnswer && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Correct Answer</h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">{question.correctAnswer}</p>
                </div>
              </div>
            )}

            {/* Additional Fields */}
            {question.explanation && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Explanation</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800">{question.explanation}</p>
                </div>
              </div>
            )}

            {question.hints && question.hints.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Hints</h3>
                <div className="space-y-2">
                  {question.hints.map((hint, index) => (
                    <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800 text-sm">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Difficulty:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {question.difficulty || 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {question.category || 'General'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="ml-2 font-medium text-gray-900 font-mono">
                    {question.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 