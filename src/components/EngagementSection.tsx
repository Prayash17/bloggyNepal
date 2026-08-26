import ReactionBar from "@/components/ReactionBar";
import Comments from "@/components/Comments";
import FeedbackForm from "@/components/FeedbackForm";
import NewsletterSignup from "@/components/NewsletterSignup";

type ContentType =
  | "district"
  | "destination"
  | "story";

interface EngagementSectionProps {
  postId: string;
  postSlug: string;
  contentType: ContentType;
}

export default function EngagementSection({
  postId,
  postSlug,
  contentType,
}: EngagementSectionProps) {
  return (
    <section className="mx-auto mt-20 w-full max-w-5xl px-4 sm:px-6">
      {/* =====================================================
          REACTIONS
      ====================================================== */}

      <ReactionBar
        postId={postId}
        postSlug={postSlug}
        contentType={contentType}
      />

      {/* =====================================================
          COMMENTS
      ====================================================== */}

      <Comments
        postSlug={postSlug}
        contentType={contentType}
      />

      {/* =====================================================
          FEEDBACK
      ====================================================== */}

      <div className="mt-20 border-t border-stone-200 pt-14">
        <div className="mx-auto max-w-3xl">
          <FeedbackForm />
        </div>
      </div>

      {/* =====================================================
          NEWSLETTER
      ====================================================== */}

      <div className="mt-16 border-t border-stone-200 pt-14">
        <NewsletterSignup />
      </div>
    </section>
  );
}