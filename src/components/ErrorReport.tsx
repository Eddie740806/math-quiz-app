'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ErrorReportProps {
  questionId: string;
  questionContent: string;
  questionAnswer: string;
  onClose: () => void;
}

const ERROR_TYPES = [
  { id: 'wrong_answer', label: '答案錯誤', emoji: '❌' },
  { id: 'wrong_explanation', label: '解析錯誤', emoji: '📝' },
  { id: 'typo', label: '題目有錯字', emoji: '✏️' },
  { id: 'unclear', label: '題目看不懂', emoji: '❓' },
  { id: 'duplicate', label: '重複的題目', emoji: '🔄' },
  { id: 'other', label: '其他問題', emoji: '💬' },
];

export default function ErrorReport({ questionId, questionContent, questionAnswer, onClose }: ErrorReportProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) return;
    
    setIsSubmitting(true);
    
    try {
      // 儲存到 Supabase
      if (supabase) {
        await supabase.from('error_reports').insert({
          question_id: questionId,
          question_content: questionContent.substring(0, 500),
          current_answer: questionAnswer,
          error_type: selectedType,
          correct_answer: correctAnswer || null,
          description: description || null,
          status: 'pending',
          created_at: new Date().toISOString()
        });
      }
      
      // 同時存到 localStorage 備份
      const reports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      reports.push({
        questionId,
        errorType: selectedType,
        correctAnswer,
        description,
        timestamp: Date.now()
      });
      localStorage.setItem('errorReports', JSON.stringify(reports));
      
      setSubmitted(true);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error submitting report:', error);
      // 即使 Supabase 失敗，localStorage 已經存了
      setSubmitted(true);
      setTimeout(() => onClose(), 1500);
    }
    
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">感謝回報！</h3>
          <p className="text-gray-500">我們會盡快修正</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">🚨 回報題目問題</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        
        {/* 題目預覽 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <div className="text-gray-500 mb-1">題目：</div>
          <div className="text-gray-800">{questionContent.substring(0, 100)}{questionContent.length > 100 ? '...' : ''}</div>
          <div className="text-gray-500 mt-2">目前答案：<span className="text-blue-600 font-medium">{questionAnswer}</span></div>
        </div>
        
        {/* 問題類型 */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">問題類型</div>
          <div className="grid grid-cols-2 gap-2">
            {ERROR_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`py-2 px-3 rounded-lg text-sm flex items-center gap-2 transition ${
                  selectedType === type.id
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* 正確答案（如果選了答案錯誤）*/}
        {selectedType === 'wrong_answer' && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">正確答案應該是？</div>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="輸入你認為的正確答案"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}
        
        {/* 補充說明 */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">補充說明（選填）</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述你發現的問題..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>
        
        {/* 送出按鈕 */}
        <button
          onClick={handleSubmit}
          disabled={!selectedType || isSubmitting}
          className={`w-full py-3 rounded-xl font-medium transition ${
            selectedType && !isSubmitting
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '送出中...' : '送出回報'}
        </button>
      </div>
    </div>
  );
}
