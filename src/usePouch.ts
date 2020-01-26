import { useState, useEffect, useRef, useCallback } from 'react'
import PouchDB from 'pouchdb'

export type Doc<T> = PouchDB.Core.ExistingDocument<T>

export interface Docs<T> {
  [key: string]: Doc<T>
}

// connect to the db, load all docs
export const usePouch = <T>(dbName: string) => {
  const dbRef = useRef<PouchDB.Database<T> | null>(null)
  const [docs, setDocs] = useState<Docs<T>>({})
  useEffect(() => {
    console.log('usePouch open db')
    let canceled = false
    const db = dbRef.current = new PouchDB<T>(dbName)

    const changes = db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      conflicts: true,
    }).on('change', change => {
      console.log('usePouch', { change, canceled })
      if (canceled) {
        return
      }
      setDocs(data => {
        if (change.deleted) {
          const newDocs = {...data}
          delete newDocs[change.id]
          return newDocs
        }
        if (!change.doc) {
          return data
        }
        return {...data, [change.id]: change.doc }
      })
    })

    db.allDocs({ include_docs: true }).then(({ rows }) => {
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
      console.log('usePouch closing db')
      if (db) {
        db.close()
      }
      dbRef.current = null
    }
  }, [dbName])

  const remove = useCallback(async (doc: PouchDB.Core.RemoveDocument) => {
    const db = dbRef.current
    if (!db) {
      throw new Error('removing before db loaded, not your fault, usePouch has a race condition?')
    }
    return await db.remove(doc)
  }, [])

  const put = useCallback(async <I extends T & { _id: string }>(doc: I) => {
    const db = dbRef.current
    if (!db) {
      throw new Error('putting before db loaded, not your fault, usePouch has a race condition?')
    }
    return await db.put(doc)
  }, [])

  const post = useCallback(async (doc: T) => {
    const db = dbRef.current
    if (!db) {
      throw new Error('posting before db loaded, not your fault, usePouch has a race condition?')
    }
    return await db.post(doc)
  }, [])

  return [docs, { put, post, remove }] as const
}
