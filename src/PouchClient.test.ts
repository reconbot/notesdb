import { throws, deepStrictEqual } from 'assert'
import { PouchClient, REFERENCES_DOC_ID } from './PouchClient'
import { Schema } from "./Schema"
import PouchDB from 'pouchdb'
import 'pouchdb-find'

const buildSchema = () => [
  new Schema({
    name: 'Pokemon',
    fields: { name: { type: 'String' }, trainer: { type: 'Ref', kind: 'Trainer' } },
    timeStamps: true,
  }),
  new Schema({
    name: 'Trainer',
    fields: { name: { type: 'String' }, pokemon: { type: 'RefList', kind: 'Pokemon' } },
    timeStamps: true,
  })
]

describe('PouchClient', () => {
  beforeEach(async () => {
    // const client = new PouchDB('test-db')
    // await client.destroy()
  })

  it('builds a design document', async () => {
    const designDocument = PouchClient.buildDesignDocument(buildSchema())
    deepStrictEqual(designDocument, {
      _id: REFERENCES_DOC_ID,
      views: {
        Pokemon_by_trainer: {
          map: 'function (doc) {\n' +
            "  if (doc.type !== 'Pokemon') {\n" +
            '    return\n' +
            '  }\n' +
            '  emit(doc["trainer"]);\n' +
            '}'
        },
        Trainer_by_pokemon: {
          map: 'function (doc) {\n' +
            "  if (doc.type !== 'Trainer') {\n" +
            '    return\n' +
            '  }\n' +
            '  for (var i in doc["pokemon"]) {\n' +
            '    emit(doc["pokemon"][i]);\n' +
            '  }\n' +
            '}'
        }
      }
    })
  })

  it('constructs and connects', async () => {
    const client = await PouchClient.connect({
      dbName: 'test-db',
      schema: buildSchema()
    })
  })
})
