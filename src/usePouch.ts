import { useState, useEffect, useRef, useCallback } from 'react'
import PouchDB from 'pouchdb'

export interface Docs<T> {
  [key: string]: PouchDB.Core.ExistingDocument<T>
}

// connect to the db, load all docs
export const usePouch = <T>(dbName: string) => {
  let db: PouchDB.Database<T> | null = null
  const [docs, setDocs] = useState<Docs<T>>({})
  useEffect(() => {
    console.log('useEffect open db')
    let canceled = false
    db = new PouchDB<T>(dbName)

    const changes = db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      conflicts: true,
    }).on('change', change => {
      console.log({change, canceled })
      if (canceled) {
        return
      }
      if (change.deleted) {
        setDocs(data => {
          const newDocs = {...data}
          delete newDocs[change.id]
          return newDocs
        })
        return
      }
      setDocs(data => {
        if (!change.doc) {
          return data
        }
        return {...data, [change.id]: change.doc }
      })
    })

    db.allDocs({include_docs: true}).then(({ rows }) => {
      console.log('updating docs', {rows})
      if (canceled) { return }
      const newDocs: Docs<T> = {}
      for (const row of rows) {
        if (row.doc) {
          newDocs[row.id] = row.doc
        }
      }
      setDocs(newDocs)
    })

    return () => {
      changes.cancel()
      console.log('closing db')
      if (db) {
        db.close()
      }
      db = null
    }
  }, [dbName])

  const remove = useCallback(async (doc: PouchDB.Core.RemoveDocument) => {
    if (!db) {
      throw new Error('removing before db loaded, not your fault, usePouch has a race condition?')
    }
    return await db.remove(doc)
  }, [])

  const put = useCallback(async <I extends T & { _id: string }>(doc: I) => {
    if (!db) {
      throw new Error('putting before db loaded, not your fault, usePouch has a race condition?')
    }
    return await db.put(doc)
  }, [])

  const post = useCallback(async (doc: T) => {
    if (!db) {
      throw new Error('posting before db loaded, not your fault, usePouch has a race condition?')
    }
    return await db.post(doc)
  }, [])

  return [docs, { put, post, remove }] as const
}
