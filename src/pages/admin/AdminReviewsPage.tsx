import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { useToast } from '../../contexts/ToastContext';
import { Review } from '../../types';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApprove = async (review: Review) => {
    try {
      await reviewService.toggleApproval(review.id, !review.is_approved);
      success(`Review ${!review.is_approved ? 'approved' : 'hidden'}.`);
      loadReviews();
    } catch (err: any) {
      error(err.message || 'Failed to update approval');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await reviewService.deleteReview(id);
      success('Review deleted.');
      loadReviews();
    } catch (err: any) {
      error(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Audit verified purchase testimonials and approve customer feedback for public display.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No customer reviews registered yet.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Comment Feedback</th>
                <th className="py-3 px-3">Submitted Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-sans">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-neutral-900 dark:text-white">
                    {r.customer_name || 'Verified Buyer'}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-current' : 'text-neutral-300'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 max-w-sm text-neutral-600 dark:text-neutral-300">
                    <p className="line-clamp-2">{r.comment}</p>
                  </td>
                  <td className="py-3.5 px-3 text-neutral-400 text-[11px]">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.is_approved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {r.is_approved ? 'Approved' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleApprove(r)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      {r.is_approved ? 'Hide' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
