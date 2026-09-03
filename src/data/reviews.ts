const googleReviewsUrl = "https://maps.app.goo.gl/jB5eSXHDwYmx6cZs9?g_st=ic";

export type GoogleReview = {
  name: string;
  rating: 5;
  excerpt: string;
  sourceLink: string;
};

export const googleReviews: GoogleReview[] = [
  {
    name: "Oksana Zhatkina",
    rating: 5,
    excerpt:
      "Очень благодарна стоматологической клинике Dentix, всему персоналу за качество, замечательный подход к пациентам.",
    sourceLink: googleReviewsUrl,
  },
  {
    name: "Даша Шаповаленко",
    rating: 5,
    excerpt:
      "Посещение стоматолога, который лечит под микроскопом, стало для меня настоящим открытием.",
    sourceLink: googleReviewsUrl,
  },
  {
    name: "Сан Саныч",
    rating: 5,
    excerpt:
      "Огромная благодарность Станиславу Игоревичу, что сделал всё на высшем уровне.",
    sourceLink: googleReviewsUrl,
  },
];
