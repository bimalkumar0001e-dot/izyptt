
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface OrderRatingProps {
  orderId: string;
  onSubmit: (rating: number, review: string) => Promise<void>;
}

export const OrderRating: React.FC<OrderRatingProps> = ({ orderId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(rating, review);
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <h3 className="font-medium text-lg mb-3">Rate your experience</h3>
      
      <div className="flex justify-center my-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="mx-1 focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                (hoveredRating ? star <= hoveredRating : star <= rating)
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      
      <div className="mt-4">
        <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
          Share your feedback (optional)
        </label>
        <Textarea
          id="review"
          placeholder="Tell us about your experience..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="w-full"
        />
      </div>
      
      <Button
        onClick={handleRatingSubmit}
        disabled={rating === 0 || isSubmitting}
        className="mt-4 w-full bg-app-primary hover:bg-app-primary/90"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </Button>
    </div>
  );
};
