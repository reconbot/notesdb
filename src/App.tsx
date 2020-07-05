import React from 'react'
import { BrowserRouter as Router, Route } from "react-router-dom"
import { MainView } from './MainView'
import { Pouch } from './usePouch'


export const App = () => {
  return (
  <Pouch dbName="notes">
    <Router>
      <Route exact path="/">
        <MainView />
      </Route>
      <Route exact path="/OneOnOnes">
        <OneOnOnes />
      </Route>
      <Route>
        404?
      </Route>
    </Router>
  </Pouch>)
}
