const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const mockContent = [
  {
    id: '1',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Video)',
    note: 'Classic example of internet culture. Great for understanding viral phenomena and how certain content becomes culturally significant.',
    duration: '3:33',
    author: 'Rick Astley',
    createdAt: '2024-01-15T10:30:00.000Z',
    location: 'Home Office',
    thumbnail: null
  },
  {
    id: '2',
    type: 'article',
    url: 'https://example.com/article',
    title: 'The Future of Web Development: Trends to Watch in 2024',
    note: 'Key insights: Server Components, Edge Computing, and AI-powered development tools are reshaping how we build web applications.',
    author: 'Tech Weekly',
    createdAt: '2024-02-22T14:15:00.000Z',
    location: 'Coffee Shop',
    thumbnail: null
  },
  {
    id: '3',
    type: 'reddit',
    url: 'https://reddit.com/r/programming',
    title: 'TIL: You can use CSS Grid for complex layouts without JavaScript',
    note: 'Reminded me to explore CSS Grid more deeply. The examples shown were particularly useful for responsive design patterns.',
    author: 'dev_enthusiast',
    createdAt: '2024-03-08T09:45:00.000Z',
    thumbnail: null
  },
  {
    id: '4',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
    title: 'React in 100 Seconds',
    note: 'Perfect quick refresher on React fundamentals. Bookmarked for when I need to explain React to beginners.',
    duration: '2:14',
    author: 'Fireship',
    createdAt: '2024-03-20T16:22:00.000Z',
    location: 'Library',
    thumbnail: null
  },
  {
    id: '5',
    type: 'twitter',
    url: 'https://x.com/damnGruz/status/1929548182440034529',
    title: 'Thread on the importance of semantic HTML',
    note: 'Excellent thread about accessibility and SEO benefits. Contains practical examples I want to implement in future projects.',
    author: 'damnGruz',
    createdAt: '2024-04-12T11:18:00.000Z',
    thumbnail: null
  },
  {
    id: '6',
    type: 'article',
    url: 'https://example.com/design-systems',
    title: 'Building Scalable Design Systems with Tailwind CSS',
    note: 'Comprehensive guide on creating consistent design systems. The component library approach is exactly what our team needs.',
    author: 'Design Systems Weekly',
    createdAt: '2024-05-03T13:40:00.000Z',
    location: 'Co-working Space',
    thumbnail: null
  },
  {
    id: '7',
    type: 'reddit',
    url: 'https://reddit.com/r/webdev',
    title: 'What are some underrated developer tools that changed your workflow?',
    note: 'Great discussion with tool recommendations. Need to try out the terminal multiplexer and code snippet manager mentioned.',
    author: 'productive_dev',
    createdAt: '2024-06-17T08:25:00.000Z',
    thumbnail: null
  },
  {
    id: '8',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
    title: 'Advanced TypeScript Patterns for Better Code',
    note: 'Mind-blowing techniques for type safety. The conditional types section will help me refactor our API layer.',
    duration: '28:45',
    author: 'TypeScript Weekly',
    createdAt: '2024-07-29T19:12:00.000Z',
    location: 'Home',
    thumbnail: null
  },
  {
    id: '9',
    type: 'twitter',
    url: 'https://twitter.com/dan_abramov/status/1336713671528689666',
    title: 'The psychology of user experience design',
    note: 'Fascinating insights into user behavior and decision-making. Will apply these principles to our onboarding flow.',
    author: 'dan_abramov',
    createdAt: '2024-08-14T15:07:00.000Z',
    location: 'Airport',
    thumbnail: null
  },
  {
    id: '10',
    type: 'spotify',
    url: 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
    title: 'The Killers - Mr. Brightside',
    note: 'Iconic rock track with a timeless riff that always pumps me up.',
    author: 'The Killers',
    createdAt: '2024-09-01T12:00:00.000Z',
    location: 'Gym',
    thumbnail: null
  },
  {
    id: '11',
    type: 'soundcloud',
    url: 'https://soundcloud.com/forss/flickermood',
    title: 'Forss - Flickermood',
    note: 'Atmospheric track with chill vibes, great for focusing.',
    author: 'Forss',
    createdAt: '2024-09-02T12:00:00.000Z',
    location: 'Studio',
    thumbnail: null
  }
];

async function main() {
  console.log('Seeding database...');
  for (const item of mockContent) {
    await prisma.contentItem.create({
      data: {
        id: item.id,
        type: item.type,
        url: item.url,
        title: item.title,
        note: item.note,
        createdAt: new Date(item.createdAt),
        thumbnail: item.thumbnail,
        author: item.author ?? null,
        duration: item.duration ?? null,
        location: item.location ?? null,
      },
    });
  }
  console.log('Seeding completed.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 