import { googleReviews } from "@/data/reviews";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function ReviewsSection() {
  return (
    <section className="section reviews" id="reviews">
      <div className="wrap">
        <SectionHeading
          kicker="Відгуки в Google"
          title="Відгуки пацієнтів"
          lede="Уривки відгуків із Google у перекладі українською. Оригінали — за посиланнями."
        />
        <div className="reviews-grid">
          {googleReviews.map((review, index) => (
            <Reveal as="article" className="review-card" delay={index * 80} key={review.name}>
              <div className="review-card-head">
                <h3>{review.name}</h3>
                <span className="review-stars" aria-label={`${review.rating} з 5 зірок`}>
                  ★★★★★
                </span>
              </div>
              <blockquote lang="uk">«{review.excerpt}»</blockquote>
              <a href={review.sourceLink} target="_blank" rel="noreferrer">
                Переглянути джерело в Google <span aria-hidden="true">→</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
