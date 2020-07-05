import { PouchClient, Node, ID } from './PouchClient'
import { Schema } from "./Schema"

export interface Note extends Node {
  type: 'Note';
  title: string;
  text: string;
  kind: 'note' | '1:1' | 'info';
  people: ID[];
  actions: ID[];
}

export interface Person extends Node {
  type: 'Person';
  name: string;
  title: string;
  needsOneOnOne: Boolean;
}

export interface Action extends Node {
  type: 'Action'
  person: ID;
  note?: ID;
  description: string;
  kind: 'todo' | 'opportunity';
  completedAt?: number;
}

const connect = () => PouchClient.connect({
  dbName: 'todoApp',
  schema: [
    new Schema<Note>({
      name: 'Note',
      timeStamps: true,
      fields: {
        title: { type: 'String' },
        text: { type: 'String' },
        kind: { type: 'Enum', values: new Set(['note','1:1', 'info']) },
        people: { type: 'RefList', kind: 'Person' },
        actions: { type: 'RefList', kind: 'Action'},
      }
    }),
    new Schema<Person>({
      name: 'Person',
      timeStamps: true,
      fields: {
        name: { type: 'String' },
        title: { type: 'String' },
        needsOneOnOne: { type: 'Boolean' },
      }
    }),
    new Schema({
      name: 'Action',
      timeStamps: true,
      fields: {
        person: { type: 'Ref', kind: 'Person' },
        note: { type: 'Ref', kind: 'Note' },
        description: { type: 'String' },
        kind: { type: 'Enum', values: new Set(['todo','opportunity']) },
        completedAt: { type: 'Number', null: true },
      }
    })
  ]
})
