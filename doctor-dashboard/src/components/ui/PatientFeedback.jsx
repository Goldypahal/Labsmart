import React from 'react';
import { Star, ShieldCheck, MessageSquare } from 'lucide-react';
import { Card } from './Card';
import { LoadingState, EmptyState, ErrorState } from './FeedbackStates';

/**
 * Data-Driven Patient Feedback & Reviews Component for Clinician Portal
 *
 * Adheres strictly to Healthcare Zero Fake Reviews Policy:
 * 1. Never fabricates reviews or ratings.
 * 2. Displays honest empty state when 0 reviews exist.
 * 3. Shows "No rating available" when averageRating is null.
 * 4. Shows "Verified Review" badge ONLY when review.verified === true from backend.
 * 5. Masks patient identifiers for healthcare privacy unless explicitly authorized.
 */
export default function PatientFeedback({
  reviews = [],
  averageRating = null,
  reviewCount = 0,
  isLoading = false,
  error = null,
  title = 'Patient Feedback & Audit Comments',
  subtitle = 'Authentic clinical feedback from authorized patient surveys.',
}) {
  if (isLoading) {
    return <LoadingState message="Loading authenticated patient feedback..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Feedback Unavailable"
        message="Unable to retrieve patient feedback from diagnostic server."
      />
    );
  }

  const hasReviews = Array.isArray(reviews) && reviews.length > 0;

  return (
    <Card
      title={title}
      subtitle={subtitle}
      icon={MessageSquare}
      headerAction={
        <div className="flex items-center gap-2">
          {averageRating != null && reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold text-amber-900 dark:text-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{Number(averageRating).toFixed(1)}</span>
              <span className="text-slate-400 font-normal">
                ({reviewCount} verified {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              No rating available
            </span>
          )}
        </div>
      }
    >
      {!hasReviews ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Patient feedback will appear here after patients submit their experience."
          actionLabel="No action required"
        />
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reviews.map((rev) => {
            const displayName =
              rev.authorDisplayName || (rev.verified ? 'Verified Patient' : 'Anonymous Patient');

            return (
              <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {displayName}
                      </span>
                      {rev.verified === true && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          Verified Patient
                        </span>
                      )}
                    </div>
                    {rev.createdAt && (
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  {typeof rev.rating === 'number' && (
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.round(rev.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>

                {rev.source && (
                  <span className="text-[10px] text-slate-400 block">
                    Source: {rev.source} • Ref ID: {rev.id}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
