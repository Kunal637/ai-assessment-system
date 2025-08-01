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
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';
import { Test, Question } from '@/types';
import Navigation from '@/components/Navigation';

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTest(params.id as string);
    }
  }, [params.id]);

  const fetchTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/tests/${testId}`);
      if (response.ok) {
        const testData = await response.json();
        setTest(testData);
        
        // Fetch questions for this test
        if (testData.questions && testData.questions.length > 0) {
          const questionsResponse = await fetch('/api/questions');
          if (questionsResponse.ok) {
            const allQuestions = await questionsResponse.json();
            const testQuestions = allQuestions.filter((q: Question) => 
              testData.questions.includes(q.id)
            );
            setQuestions(testQuestions);
          }
        }
      } else {
        console.error('Test not found');
        router.push('/assessments/assessments');
      }
    } catch (error) {
      console.error('Error fetching test:', error);
      router.push('/assessments/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!test || !confirm('Are you sure you want to delete this test?')) return;

    try {
      const response = await fetch(`/api/tests/${test.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/assessments/assessments');
      } else {
        alert('Failed to delete test');
      }
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test');
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
            <p className="mt-4 text-gray-600">Loading test...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation role="assessments" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Test not found</h3>
            <p className="text-gray-600 mb-4">The test you're looking for doesn't exist.</p>
            <Link href="/assessments/assessments" className="btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assessments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="assessments" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/assessments/assessments" 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-gray-600">Test details and configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/assessments/tests/${test.id}/edit`}
              className="btn-secondary"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDeleteTest}
              className="btn-danger"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Overview */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Overview</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-700">{test.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Time Limit</p>
                      <p className="font-medium text-gray-900">{test.timeLimit} minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Total Points</p>
                      <p className="font-medium text-gray-900">{test.totalPoints}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Questions</p>
                      <p className="font-medium text-gray-900">{test.questions.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${
                        test.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`font-medium ${
                        test.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {test.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Questions ({questions.length})</h2>
                <Link
                  href={`/assessments/tests/${test.id}/edit`}
                  className="btn-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Manage Questions
                </Link>
              </div>
              
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <FileText className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added</h3>
                  <p className="text-gray-600 mb-4">Add questions to this test to get started</p>
                  <Link
                    href={`/assessments/tests/${test.id}/edit`}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Questions
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div key={question.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getQuestionTypeIcon(question.type)}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {index + 1}. {question.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(question.type)}`}>
                              {question.type.replace('-', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">{question.points} points</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/assessments/questions/${question.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Test Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Statistics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">
                    {new Date(test.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Test ID</span>
                  <span className="font-medium text-gray-900 font-mono text-sm">
                    {test.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-2">
                <Link
                  href={`/assessments/candidates/new?testId=${test.id}`}
                  className="w-full btn-primary"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Assign to Candidate
                </Link>
                <Link
                  href={`/assessments/tests/${test.id}/edit`}
                  className="w-full btn-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Test
                </Link>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/candidate/test/${test.id}`);
                    alert('Test link copied to clipboard!');
                  }}
                  className="w-full btn-secondary"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Copy Test Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 