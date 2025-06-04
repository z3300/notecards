import { extractInstagramMetadata, extractPinterestMetadata, extractGenericMetadata } from '../route';

describe('metadata extraction', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('extracts instagram metadata', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<meta property="og:title" content="Insta" /><meta property="instapp:owner_user_name" content="user" /><meta property="og:image" content="img.jpg" /><meta property="og:description" content="desc" />'),
    });
    const data = await extractInstagramMetadata('https://instagram.com/p/1');
    expect(data).toEqual({
      type: 'instagram',
      title: 'Insta',
      author: 'user',
      thumbnailUrl: 'img.jpg',
      description: 'desc',
    });
  });

  it('fails instagram extraction', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(extractInstagramMetadata('https://instagram.com/p/1')).rejects.toThrow('Failed to extract Instagram metadata');
  });

  it('extracts pinterest metadata', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('<meta property="og:title" content="Pin" /><meta name="pinterestapp:ownername" content="puser" /><meta property="og:image" content="p.jpg" /><meta property="og:description" content="pdesc" />'),
    });
    const data = await extractPinterestMetadata('https://pinterest.com/pin/1');
    expect(data).toEqual({
      type: 'pinterest',
      title: 'Pin',
      author: 'puser',
      thumbnailUrl: 'p.jpg',
      description: 'pdesc',
    });
  });

  it('falls back to screenshot in generic extraction', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        text: () => Promise.resolve('<title>Article</title>'),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, screenshotPath: '/screenshots/1.png' }),
      });
    const data = await extractGenericMetadata('https://example.com');
    expect(data.thumbnailUrl).toBe('/screenshots/1.png');
  });
});
