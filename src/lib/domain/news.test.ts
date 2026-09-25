import { describe, expect, it } from 'vitest';
import { neuesteNews, newsListeUrl, newsSeo, newsUrl, sortiereNews } from './news';

describe('URLs', () => {
  it('points to the list and the detail pages', () => {
    expect(newsListeUrl).toBe('/aktuelles');
    expect(newsUrl('welpen-sind-da')).toBe('/aktuelles/welpen-sind-da');
  });
});

describe('sortiereNews', () => {
  it('shows the newest post first, posts without date last', () => {
    const news = [
      { titel: 'alt', datum: '2023-02-01T12:00:00.000Z' },
      { titel: 'ohne', datum: null },
      { titel: 'neu', datum: '2026-05-04T12:00:00.000Z' },
      { titel: 'mittel', datum: '2025-04-02T12:00:00.000Z' },
    ];
    expect(sortiereNews(news).map((n) => n.titel)).toEqual(['neu', 'mittel', 'alt', 'ohne']);
  });

  it('does not mutate the input', () => {
    const news = [{ datum: '2023-02-01T12:00:00.000Z' }, { datum: '2026-05-04T12:00:00.000Z' }];
    sortiereNews(news);
    expect(news[0].datum).toBe('2023-02-01T12:00:00.000Z');
  });
});

describe('neuesteNews', () => {
  const alle = ['e', 'd', 'c', 'b', 'a'];

  it('takes the first n posts and links to all when there are more', () => {
    expect(neuesteNews(alle, 3)).toEqual({ beitraege: ['e', 'd', 'c'], zeigeAlleLink: true });
  });

  it('shows all posts without a limit, and no link', () => {
    expect(neuesteNews(alle, null)).toEqual({ beitraege: alle, zeigeAlleLink: false });
    expect(neuesteNews(alle, 0)).toEqual({ beitraege: alle, zeigeAlleLink: false });
  });

  it('shows no link when the limit covers all posts', () => {
    expect(neuesteNews(alle, 5)).toEqual({ beitraege: alle, zeigeAlleLink: false });
    expect(neuesteNews(alle, 10)).toEqual({ beitraege: alle, zeigeAlleLink: false });
  });
});

describe('newsSeo', () => {
  it('uses the title, the short text and the image', () => {
    expect(newsSeo({ titel: 'Welpen sind da', kurztext: 'Unser B-Wurf ist geboren.', bild: '/uploads/aktuelles/b.jpg' })).toEqual({
      title: 'Welpen sind da',
      description: 'Unser B-Wurf ist geboren.',
      image: '/uploads/aktuelles/b.jpg',
    });
  });

  it('keeps missing text and image empty', () => {
    expect(newsSeo({ titel: 'Kurz notiert' })).toEqual({ title: 'Kurz notiert', description: null, image: null });
  });
});
