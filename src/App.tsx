import React, { useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { TodoInput } from './TodoInput'
import { DeleteForever } from '@material-ui/icons'
import { Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'
import { useTodoStore, TodoDoc } from './useTodoStore'

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {

  },
  input: {
    width: '100%'
  }
}))

const viewModel = (todo: TodoDoc) => ({
  ...todo,
  createdAtDisplay: new Date(todo.createdAt).toLocaleDateString()
})

function App() {
  console.log('render App')
  const [todos, { create }] = useTodoStore()
  const [inputText, updateInput] = useState('')
  const [seelctedTodo, setSelectedTodo] = useState<null|string>(null)

  const todosArray = useMemo(() => Object.values(todos).map(viewModel), [todos])
  const todosByDate = useMemo(() => [...todosArray].sort(({createdAt}) => createdAt), [todosArray])
  const filteredTodos = useMemo(() => todosByDate.filter(({text}) => text.match(inputText)), [inputText, todosByDate])

  const todosToRender = filteredTodos

  const submit = () => {
    if (inputText.replace(/\n/g, '') === '') {
      return
    }
    create({ text: inputText }).then(doc => {
      setSelectedTodo(doc.id)
    })
    updateInput('')
  }

  const classes = useStyles()
  return (
    <Paper className={classes.root}>
      <TodoInput value={inputText} updateValue={updateInput} onSubmit={submit} className={classes.input} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Note</TableCell>
            <TableCell align="right">Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {todosToRender.map(({ _id, text, createdAtDisplay }) => (
            <TableRow key={_id}>
              <TableCell component="th" scope="row" align="center">
                {text}
              </TableCell>
              <TableCell align="right">{createdAtDisplay}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div style={{ maxWidth: "100%" }}>
      </div>
    </Paper>
  );
}

export default App;
