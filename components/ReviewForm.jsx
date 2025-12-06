'use client';

import { useState } from 'react';
import { reviewService } from '@/services/reviewService';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export function ReviewForm({ coachId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      await reviewService.createReview({
        coach_id: coachId,
        rating,
        text: text || null,
      });
      
      alert('Review submitted successfully!');
      setRating(0);
      setText('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-700">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block text-gray-700">Review (Optional)</label>
        <textarea
          className="flex min-h-[100px] w-full rounded-none border-2 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none"
          style={{
            borderColor: 'rgba(151, 7, 71, 0.2)',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your review..."
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#970747';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(151, 7, 71, 0.1), 0 1px 2px 0 rgba(151, 7, 71, 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(151, 7, 71, 0.2)';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={submitting || rating === 0}
        className="bg-[#970747] hover:bg-[#970747]/90 text-white rounded-none disabled:opacity-50"
        style={{
          boxShadow: '0 4px 6px -1px rgba(151, 7, 71, 0.3), 0 2px 4px -1px rgba(151, 7, 71, 0.2)'
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}

