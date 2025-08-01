'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Question } from '@/types';
import Navigation from '@/components/Navigation';

export default function EditQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'mcq',
    points: 1,
    correctAnswer: '',
    options: ['', '', '', ''],
    explanation: '',
    hints: [''],
    difficulty: 'medium',
    category: 'General'
  });

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
        setFormData({
          title: questionData.title || '',
          content: questionData.content || '',
          type: questionData.type || 'mcq',
          points: questionData.points || 1,
          correctAnswer: questionData.correctAnswer || '',
          options: questionData.options || ['', '', '', ''],
          explanation: questionData.explanation || '',
          hints: questionData.hints || [''],
          difficulty: questionData.difficulty || 'medium',
          category: questionData.category || 'General'
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/questions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/assessments/questions/${params.id}`);
      } else {
        alert('Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData(prev => ({ 
      ...prev, 
      options: [...prev.options, ''] 
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData(prev => ({ ...prev, hints: newHints }));
  };

  const addHint = () => {
    setFormData(prev => ({ 
      ...prev, 
      hints: [...prev.hints, ''] 
    }));
  };

  const removeHint = (index: number) => {
    if (formData.hints.length > 1) {
      const newHints = formData.hints.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, hints: newHints }));
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
            <p className="text-gray-600 mb-4">The question you're trying to edit doesn't exist.</p>
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
              href={`/assessments/questions/${params.id}`}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Question</h1>
              <p className="text-gray-600">Update question information</p>
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
                  Question Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="fill-in-blank">Fill in the Blank</option>
                  <option value="coding">Coding</option>
                  <option value="drag-drop">Drag & Drop</option>
                  <option value="short-text">Short Text</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., JavaScript, React, Algorithms"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter question title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter the question content"
                required
              />
            </div>
          </div>

          {/* Options (for MCQ) */}
          {formData.type === 'mcq' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Options</h2>
                <button
                  type="button"
                  onClick={addOption}
                  className="btn-secondary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={option}
                      checked={formData.correctAnswer === option}
                      onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm text-gray-500">Correct</span>
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer (for non-MCQ) */}
          {formData.type !== 'mcq' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Correct Answer</h2>
              <textarea
                value={formData.correctAnswer}
                onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter the correct answer"
              />
            </div>
          )}

          {/* Explanation */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Explanation</h2>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleInputChange('explanation', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Explain why this is the correct answer (optional)"
            />
          </div>

          {/* Hints */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Hints</h2>
              <button
                type="button"
                onClick={addHint}
                className="btn-secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Hint
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.hints.map((hint, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => handleHintChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={`Hint ${index + 1}`}
                  />
                  {formData.hints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href={`/assessments/questions/${params.id}`}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={saving}
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