// Public lesson metadata only. Learning content is served by /api/idioms.
export const IDIOM_LESSONS = [
  { id: 1, title: 'Lesson 1', subtitle: 'Everyday idioms', kicker: 'Everyday expressions', access: 'free', published: true },
  ...[2, 3, 4, 5, 6].map(id => ({
    id, title: `Lesson ${id}`, subtitle: 'Idioms collection', kicker: 'Idioms collection',
    access: 'premium', published: false,
  })),
];
