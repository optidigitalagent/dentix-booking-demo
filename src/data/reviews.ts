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
      "Дуже вдячна стоматологічній клініці Dentix, усьому персоналу за якість, чудовий підхід до пацієнтів.",
    sourceLink: googleReviewsUrl,
  },
  {
    name: "Даша Шаповаленко",
    rating: 5,
    excerpt:
      "Відвідування стоматолога, який лікує під мікроскопом, стало для мене справжнім відкриттям.",
    sourceLink: googleReviewsUrl,
  },
  {
    name: "Сан Саныч",
    rating: 5,
    excerpt:
      "Величезна подяка Станіславу Ігоровичу за те, що зробив усе на найвищому рівні.",
    sourceLink: googleReviewsUrl,
  },
];
