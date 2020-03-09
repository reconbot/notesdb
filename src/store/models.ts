
export const Person = {
  name: 'string',
  title: 'string',
  needsOneOnOne: 'boolean',
  actions: ['string'],
  notes: ['string'],
  createdAt: 'number',
  updatedAt: 'number',
}

export const Note = {
  title: 'string',
  text: 'string',
  type: 'string', // note, 1:1, bio
  people: ['string'],
  actions: ['string'],
  createdAt: 'number',
  updatedAt: 'number',
}

export const Action = {
  person: 'string',
  note: 'string',
  type: 'string', // todo, opportunity
  text: 'string',
  completedAt: 'number',
  createdAt: 'number',
  updatedAt: 'number',
}
