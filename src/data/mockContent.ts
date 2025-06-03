import { ContentItem } from '@/components/ContentCard';

export const mockContent: ContentItem[] = [
  {
    id: '1',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Video)',
    note: 'Classic example of internet culture. Great for understanding viral phenomena and how certain content becomes culturally significant.',
    duration: '3:33',
    author: 'Rick Astley',
    createdAt: new Date('2024-01-15T10:30:00'),
    location: 'Home Office'
  },
  {
    id: '2',
    type: 'article',
    url: 'https://example.com/article',
    title: 'The Future of Web Development: Trends to Watch in 2024',
    note: 'Key insights: Server Components, Edge Computing, and AI-powered development tools are reshaping how we build web applications.',
    author: 'Tech Weekly',
    createdAt: new Date('2024-02-22T14:15:00'),
    location: 'Coffee Shop'
  },
  {
    id: '3',
    type: 'reddit',
    url: 'https://reddit.com/r/programming',
    title: 'TIL: You can use CSS Grid for complex layouts without JavaScript',
    note: 'Reminded me to explore CSS Grid more deeply. The examples shown were particularly useful for responsive design patterns.',
    author: 'dev_enthusiast',
    createdAt: new Date('2024-03-08T09:45:00')
  },
  {
    id: '4',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
    title: 'React in 100 Seconds',
    note: 'Perfect quick refresher on React fundamentals. Bookmarked for when I need to explain React to beginners.',
    duration: '2:14',
    author: 'Fireship',
    createdAt: new Date('2024-03-20T16:22:00'),
    location: 'Library'
  },
  {
    id: '5',
    type: 'twitter',
    url: 'https://x.com/damnGruz/status/1929548182440034529',
    title: 'Thread on the importance of semantic HTML',
    note: 'Excellent thread about accessibility and SEO benefits. Contains practical examples I want to implement in future projects.',
    author: 'damnGruz',
    createdAt: new Date('2024-04-12T11:18:00')
  },
  {
    id: '6',
    type: 'article',
    url: 'https://example.com/design-systems',
    title: 'Building Scalable Design Systems with Tailwind CSS',
    note: 'Comprehensive guide on creating consistent design systems. The component library approach is exactly what our team needs.',
    author: 'Design Systems Weekly',
    createdAt: new Date('2024-05-03T13:40:00'),
    location: 'Co-working Space'
  },
  {
    id: '7',
    type: 'reddit',
    url: 'https://reddit.com/r/webdev',
    title: 'What are some underrated developer tools that changed your workflow?',
    note: 'Great discussion with tool recommendations. Need to try out the terminal multiplexer and code snippet manager mentioned.',
    author: 'productive_dev',
    createdAt: new Date('2024-06-17T08:25:00')
  },
  {
    id: '8',
    type: 'youtube',
    url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
    title: 'Advanced TypeScript Patterns for Better Code',
    note: 'Mind-blowing techniques for type safety. The conditional types section will help me refactor our API layer.',
    duration: '28:45',
    author: 'TypeScript Weekly',
    createdAt: new Date('2024-07-29T19:12:00'),
    location: 'Home'
  },
  {
    id: '9',
    type: 'twitter',
    url: 'https://twitter.com/dan_abramov/status/1336713671528689666',
    title: 'The psychology of user experience design',
    note: 'Fascinating insights into user behavior and decision-making. Will apply these principles to our onboarding flow.',
    author: 'dan_abramov',
    createdAt: new Date('2024-08-14T15:07:00'),
    location: 'Airport'
  }
]; 