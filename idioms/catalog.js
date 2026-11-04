// Public lesson metadata only. Learning content is served by /api/idioms.
export const IDIOM_LESSONS = [
  { id: 1, title: 'Lesson 1', subtitle: 'Everyday idioms', kicker: 'Everyday expressions', access: 'free', published: true },
  { id: 2, title: 'Lesson 2', subtitle: 'Idioms collection', kicker: 'Idioms collection', access: 'premium', published: true },
  { id: 3, title: 'Lesson 3', subtitle: 'Idioms collection', kicker: 'Idioms collection', access: 'premium', published: true },
  ...[4, 5, 6].map(id => ({
    id, title: `Lesson ${id}`, subtitle: 'Idioms collection', kicker: 'Idioms collection',
    access: 'premium', published: false,
  })),
];
