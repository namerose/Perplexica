import { searchSearxng } from '@/lib/searxng';

// International news sources
const internationalWebsites = [
  'yahoo.com',
  'www.exchangewire.com',
  'businessinsider.com',
  'theverge.com',
  'cnet.com',
];

// Indonesian news sources
const indonesianWebsites = [
  'detik.com',
  'kompas.com',
  'tribunnews.com',
  'liputan6.com',
  'tempo.co',
];

// Topics for international news
const internationalTopics = ['AI', 'tech']; 

// Topics for Indonesian news (in Indonesian language)
const indonesianTopics = ['kecerdasan buatan', 'teknologi']; /* TODO: Add UI to customize this */

export const GET = async (req: Request) => {
  try {
    // Fetch Indonesian news - specify Indonesian language and use Indonesian topics
    const indonesianNews = (
      await Promise.all([
        ...new Array(indonesianWebsites.length * indonesianTopics.length)
          .fill(0)
          .map(async (_, i) => {
            return (
              await searchSearxng(
                `site:${indonesianWebsites[i % indonesianWebsites.length]} ${
                  indonesianTopics[i % indonesianTopics.length]
                }`,
                {
                  engines: ['bing news'],
                  pageno: 1,
                  language: 'id', // Set language to Indonesian
                },
              )
            ).results;
          }),
      ])
    )
      .map((result) => result)
      .flat()
      .sort(() => Math.random() - 0.5);

    // Fetch international news with English topics and language
    const internationalNews = (
      await Promise.all([
        ...new Array(internationalWebsites.length * internationalTopics.length)
          .fill(0)
          .map(async (_, i) => {
            return (
              await searchSearxng(
                `site:${internationalWebsites[i % internationalWebsites.length]} ${
                  internationalTopics[i % internationalTopics.length]
                }`,
                {
                  engines: ['bing news'],
                  pageno: 1,
                  language: 'en', // Set language to English
                },
              )
            ).results;
          }),
      ])
    )
      .map((result) => result)
      .flat()
      .sort(() => Math.random() - 0.5);

    return Response.json(
      {
        indonesian: indonesianNews,
        international: internationalNews,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error(`An error ocurred in discover route: ${err}`);
    return Response.json(
      {
        message: 'An error has occurred',
      },
      {
        status: 500,
      },
    );
  }
};
