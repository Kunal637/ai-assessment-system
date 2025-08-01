'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  Search,
  Check,
  X
} from 'lucide-react';
import { Test, Question } from '@/types';
import Navigation from '@/components/Navigation';

export default function EditTestPage() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    totalPoints: 0,
    isActive: true,
    questions: [] as string[]
  });

  useEffect(() => {
    if (params.id) {
      fetchTest(params.id as string);
      fetchAllQuestions();
    }
  }, [params.id]);

  const fetchTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/tests/${testId}`);
      if (response.ok) {
        const testData = await response.json();
        setTest(testData);
        setFormData({
          title: testData.title || '',
          description: testData.description || '',
          timeLimit: testData.timeLimit || 30,
          totalPoints: testData.totalPoints || 0,
          isActive: testData.isActive ?? true,
          questions: testData.questions || []
        });
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

  const fetchAllQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      if (response.ok) {
        const questionsData = await response.json();
        setAllQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/tests/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/assessments/tests/${params.id}`);
      } else {
        alert('Failed to update test');
      }
    } catch (error) {
      console.error('Error updating test:', error);
      alert('Failed to update test');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = (questionId: string) => {
    if (!formData.questions.includes(questionId)) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, questionId]
      }));
    }
  };

  const removeQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(id => id !== questionId)
    }));
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

  const filteredQuestions = allQuestions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const notAlreadyAdded = !formData.questions.includes(question.id);
    return matchesSearch && notAlreadyAdded;
  });

  const selectedQuestions = allQuestions.filter(question => 
    formData.questions.includes(question.id)
  );

  // Calculate total points
  const calculatedTotalPoints = selectedQuestions.reduce((total, question) => total + question.points, 0);

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
            <p className="text-gray-600 mb-4">The test you're trying to edit doesn't exist.</p>
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
              href={`/assessments/tests/${params.id}`}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Test</h1>
              <p className="text-gray-600">Update test information and questions</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter test title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.timeLimit}
                  onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter test description"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              
              <div className="text-sm text-gray-600">
                Total Points: <span className="font-medium text-gray-900">{calculatedTotalPoints}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Selected Questions */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Selected Questions ({selectedQuestions.length})
              </h2>
              
              {selectedQuestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions selected</p>
                  <p className="text-sm">Add questions from the right panel</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedQuestions.map((question, index) => (
                    <div key={question.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getQuestionTypeIcon(question.type)}</span>
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
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Questions */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Available Questions</h2>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Search questions..."
                  />
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No questions available</p>
                    <p className="text-sm">All questions are already added or no matches found</p>
                  </div>
                ) : (
                  filteredQuestions.map((question) => (
                    <div key={question.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getQuestionTypeIcon(question.type)}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{question.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(question.type)}`}>
                              {question.type.replace('-', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">{question.points} points</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addQuestion(question.id)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href={`/assessments/tests/${params.id}`}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={saving || selectedQuestions.length === 0}
              className="btn-primary"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 