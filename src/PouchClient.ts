import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

import { Schema, Node, ID } from './Schema'

export const REFERENCES_DOC_ID = '_design/references'

type FieldType = 'RefList'

type UpdateNode<T> = Partial<T> & { id: string }
type CreateNode<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>


interface PouchClientConstructorOptions<T extends Node> {
  db: PouchDB.Database<{}>
  schema: Schema<T>[]
}

interface PouchClientConnectOptions<T extends Node> {
  dbName: string
  schema: Schema<T>[]
}

class PouchClient<T extends Node> {
  readonly db: PouchDB.Database<{}>
  readonly schema: Schema<T>[]

  static async connect<P extends Node>(options: PouchClientConnectOptions<P>) {
    PouchDB.plugin(PouchDBFind)
    const db = new PouchDB(options.dbName)

    const client = new PouchClient<P>({
      db,
      schema: options.schema
    })

    await this.ensureIndexes(client)
    return client
  }

  static async ensureIndexes<T extends Node>(client: PouchClient<T>) {
    const { db, schema } = client
    const designDocument = PouchClient.buildDesignDocument(schema)
    const { views } = designDocument

    const existingDoc = await db.get(REFERENCES_DOC_ID).catch(() => null)
    if (existingDoc) {
      const { _id, _rev, views: existingViews } = existingDoc as any
      if (views !== existingViews) {
        await db.put({ _id, _rev, views })
        await db.viewCleanup()
      }
    } else {
      await db.put(designDocument)
    }

    // force build of indexes by using them?
    const indexes = Object.keys(views)
    await Promise.all(indexes.map(index => db.query(`references/${index}`, { key: null })))
  }

  static buildDesignDocument<T extends Node>(schema: Schema<T>[]) {
    const views = schema.reduce((views, schema) => ({
      ...views,
      ...schema.views()
    }), {} as { [ key: string]: { map: string } })
    return {
      _id: REFERENCES_DOC_ID,
      views,
    }
  }

  constructor(options: PouchClientConstructorOptions<T>) {
    this.db = options.db
    this.schema = options.schema
  }

  async get(id: ID): Promise<T> {
    return this.db.get(id)
  }

  async getBatch(ids: ID[]): Promise<T[]> {
    const docIds = ids.map(id => ({ id }))
    const { docs } = await this.db.bulkGet({ docs: docIds })
    return docs
  }

  async save(obj: T): Promise<T> {
    throw new Error('not implimented')
  }

  async create(obj: Omit<T, 'id'>) {
    throw new Error()
  }

}

export { Node, ID, PouchClient }
