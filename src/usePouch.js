import { useState, useEffect, useRef, useCallback } from 'react'
import PouchDB from 'pouchdb'

// connect to the db, load all docs
export const usePouch = (dbName, { rejectErrors = false } = {}) => {
  const ref = useRef(null)
  const [docs, setDocs] = useState({})
  useEffect(() => {
    console.log('useEffect open db')
    let canceled = false
    const db = new PouchDB(dbName)
    ref.current = db
    const changes = db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      conflicts: true,
    }).on('change', function (change) {
      console.log({change, canceled })
      if (canceled) {
        return
      }
      if (change.deleted) {
        setDocs((data) => {
          const newDocs = {...data}
          delete newDocs[change.id]
          return newDocs
        })
        return
      }
      setDocs((data) => {
        return {...data, [change.id]: change.doc }
      })
    })

    db.allDocs({include_docs: true}).then(({ rows }) => {
      console.log('updating docs', {rows})
      if (canceled) { return }
      const newDocs = {}
      rows.forEach(row => {
        newDocs[row.id] = row.doc
      })
      setDocs(newDocs)
    })
    return () => {
      changes.cancel()
      ref.current = null
      db.close()
      console.log('close db')
    }
  }, [dbName, rejectErrors])

  const [removeError, setRemoveError] = useState(null)
  const remove = useCallback(id => {
    const db = ref.current
    setRemoveError(null)
    return db.remove(id).then(val => {
      return val
    }, err => {
      setRemoveError(err)
      if (rejectErrors) { throw err }
    })
  }, [rejectErrors])

  const [putError, setPutError] = useState(null)
  const put = useCallback(doc => {
    console.log('put', doc)
    const db = ref.current
    setPutError(null)
    return db.post(doc).then(val => {
      return val
    }, err => {
      setPutError(err)
      if (rejectErrors) {
        throw err
      }
    })
  }, [rejectErrors])
  return [docs, { put, putError, remove, removeError }]
}
