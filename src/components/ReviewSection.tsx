import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Plus, Sparkles, X } from 'lucide-react';
import { Review } from '../types';

interface ReviewSectionProps {
  productId?: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('7 Rose Classic Satin Bouquet');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    let url = '/api/reviews';
    if (productId) url += `?productId=${productId}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !comment) {
      alert('Please fill in your name and review details.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: productId || 'general',
          productName,
          customerName,
          rating,
          title: title || 'A beautiful handmade creation!',
          comment,
          verifiedPurchase: true
        })
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmittedSuccess(false);
          setCustomerName('');
          setComment('');
          setTitle('');
        }, 2000);
      }
    } catch {
      alert('Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B76E79]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real Customer Love</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#5C2533] mt-0.5">
              Customer Reviews
            </h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#FFF9FA] border border-[#FCE7F0] text-[#5C2533] text-xs font-semibold rounded-full hover:bg-[#FCE7F0] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#B76E79]" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews Cards */}
        {loading ? (
          <div className="text-center py-8 text-xs text-[#8C5263]">Loading customer feedback...</div>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-[#8C5263] text-center py-6">Be the first to leave a review for Flora7!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((rev) => (
              <div
                key={rev.id}
                className="bg-[#FFF9FA] rounded-3xl border border-[#FCE7F0] p-6 space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'text-[#D4AF37] fill-current' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.verifiedPurchase && (
                      <span className="text-[10px] text-[#25D366] font-semibold flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-[#FCE7F0]">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified Purchase</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#5C2533]">
                    {rev.title}
                  </h4>
                  <p className="text-xs text-[#5E5254] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#FCE7F0] flex items-center justify-between text-xs text-[#8C5263]">
                  <span className="font-semibold text-[#5C2533]">{rev.customerName}</span>
                  <span className="text-[10px]">{rev.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#FCE7F0] shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#8C5263] hover:text-[#5C2533]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-[#5C2533] mb-1">
              Share Your Flora7 Experience
            </h3>
            <p className="text-xs text-[#8C5263] mb-4">
              Your feedback helps Shwetha continue creating beautiful handmade satin flowers.
            </p>

            {submittedSuccess ? (
              <div className="bg-[#FDF2F5] border border-[#F4B8C7] rounded-2xl p-4 text-center text-xs text-[#5C2533] space-y-1">
                <p className="font-bold">Thank you for your review! 🌸</p>
                <p className="text-[#8C5263]">Your feedback has been submitted to Flora7 Studio.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-[#5C2533]">
                <div>
                  <label className="block font-semibold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swetha S."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating ? 'text-[#D4AF37] fill-current' : 'text-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Review Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Gorgeous satin rose bouquet!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Your Feedback</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us about the craftsmanship, packaging, or recipient's reaction..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-[#FFF9FA] border border-[#FCE7F0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#B76E79]/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#B76E79] text-white font-bold rounded-full hover:bg-[#9E5762] transition-colors shadow-xs uppercase tracking-wider"
                >
                  {submitting ? 'Submitting...' : 'SUBMIT REVIEW'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
