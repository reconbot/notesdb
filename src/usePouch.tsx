import { useEffect, useCallback, useReducer, createContext, useState, useMemo, default as React, ReactNode, useContext } from 'react'
import PouchDB from 'pouchdb'

export const PouchContext = createContext({})

export type Doc<T> = PouchDB.Core.ExistingDocument<T>

interface SetDBName {
  type: "set-db-name"
  data: string
}

interface SetDB<T> {
  type: "set-db"
  data: PouchDB.Database<T>
}


interface CreateAction<T> {
  type: "change",
  id: string,
  data: T
}

interface UpdateAction<T> {
  type: "update",
  id: string,
  data: T
}

interface DeleteAction {
  type: "delete",
  id: string,
}

interface AllDocsAction<T> {
  type: 'all-docs',
  data: Doc<T>[]
}

const allDocs = <T extends unknown>(state: Store<T>, docs: Doc<T>[]): Store<T> => {
  return state
}

type Actions<T> = CreateAction<T> | UpdateAction<T> | DeleteAction | AllDocsAction<T> | SetDB<T> | SetDBName
const reducer = <T extends unknown>(state: Store<T>, action: Actions<T>): Store<T> => {
  console.log('action', action)
  switch (action.type) {
    case 'set-db-name':
      return {...state, dbName: action.data}
      case 'set-db':
        return {...state, db: action.data}
      case 'all-docs':
      return allDocs(state, action.data)
    case 'change':
      return state
    case 'delete':
      return state
    case 'update':
      return state
    default:
      return state
  }
}

interface Store<T> {
  db?: PouchDB.Database<T>
  dbName?: string
  count: number
  documents: {
    [key: string]: {
      doc: Doc<T>
      loading: boolean
      conflict: boolean
    }
  }
  loading: boolean
}

// connect to the db, load all docs
export const usePouch = <T extends {}>(dbName: string) => {
  const { state, dispatch } = useContext(PouchContext)

  useEffect(() => {
    console.log('usePouch open db')
    let canceled = false
    const db = dbRef.current = new PouchDB<T>(dbName)

    const changes = db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      conflicts: true,
    })

    changes.on('change', change => {
      console.log('usePouch:onChange', { change, canceled })
      if (canceled) {
        return
      }
      if (change.deleted) {
        return dispatch({
          type: 'delete',
          id: change.id
        })
      }
      if (!change.doc) {
        console.log('usePouch:onChange', change)
        throw new Error('unknown change all non delete changes should have a doc')
      }
      return dispatch({
        type: 'change',
        id: change.id,
        data: change.doc
      })
    })

    db.allDocs({ include_docs: true }).then(({ rows }) => {
      if (canceled) { return }
      const docs: Doc<T>[] = rows.map(row => row.doc).filter(<R extends any>(n?: R): n is R => Boolean(n))
      dispatch({
        type: 'all-docs',
        data: docs
      })
    })

    return () => {
      changes.cancel()
      console.log('usePouch closing db')
      if (db) {
        db.close()
      }
      dbRef.current = undefined
    }
  }, [dbName, dispatch])

  const remove = useCallback(async (doc: PouchDB.Core.RemoveDocument) => {
    const db = dbRef.current
    if (!db) {
      throw new Error('removing before db loaded, not your fault, usePouch has a race condition?')
    }
    dispatch({
      type: 'delete',
      id: doc._id
    })
    return await db.remove(doc)
  }, [dispatch])

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

  return [docs as Store<T>, { put, post, remove }] as const
}

export const Pouch = ({ dbName, children }: { dbName: string, children: ReactNode}) => {
  const [state, dispatch] = useReducer(reducer, {
    dbName,
    count: 0,
    documents: {},
    loading: true,
  })

  useEffect(() => {
    dispatch({ type: 'set-db-name', data: dbName })
  }, [dbName])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return (<PouchContext.Provider value={value}>
    { children }
  </PouchContext.Provider>)
}
