import { throws, deepStrictEqual } from 'assert'
import { Schema, Node } from "./Schema"


interface Pokemon extends Node {
  type: 'Pokemon'
  name: string
  team?: null | string
  favoriteColor?: string
  age?: number
  happy?: boolean
  enemies?: string[]
  attackType?: 'fire' | 'ice'
  friend?: string
}

const makePokemon = (optional: Partial<Pokemon> = {}): Pokemon => {
  return {
    id: '44',
    type: 'Pokemon',
    name: 'Pikachu',
    createdAt: 0,
    updatedAt: 0,
    ...optional
  }
}

const makeSchema = () => new Schema<Pokemon>({
  name: 'Pokemon',
  timeStamps: true,
  fields: {
    name:  { type: 'String' },
    team:  { type: 'String', null: true, undef: true },
    favoriteColor: { type: 'String', undef: true },
    age: { type: 'Number', undef: true },
    happy: { type: 'Boolean', undef: true },
    attackType: { type: 'Enum', values: new Set(['fire', 'ice']), undef: true },
    friend: { type: 'Ref', kind: 'Pokemon', undef: true },
    enemies: { type: 'RefList' , kind: 'Pokemon', undef: true }
  }
})

describe('Schema', () => {
  describe('#validate', () => {
    it('validates undefined fields', () => {
      const schema = makeSchema()
      schema.validate(makePokemon())
      schema.validate(makePokemon(makePokemon({ favoriteColor: undefined })))
      schema.validate(makePokemon({ favoriteColor: 'yellow' }))
      throws(() => schema.validate(makePokemon({ favoriteColor: null })))
      throws(() => schema.validate(makePokemon({ name: null })))
    })
    it('validates null fields', () => {
      const schema = makeSchema()
      schema.validate(makePokemon({ team: 'red' }))
      schema.validate(makePokemon({ team: null }))
      throws(() => schema.validate(makePokemon({ team: 4 })))
    })
    it('validates unknown fields', () => {
      const schema = makeSchema()
      throws(() => schema.validate(makePokemon({ dinosaur: false })))
    })
    it('validates string values', () =>{
      const schema = makeSchema()
      schema.validate(makePokemon({ name: 'Pika' }))
      throws(() => schema.validate(makePokemon({ name: null })))
      throws(() => schema.validate(makePokemon({ name: 4 })))
      throws(() => schema.validate(makePokemon({ name: {} })))
      throws(() => schema.validate(makePokemon({ name: NaN })))
    })
    it('validates number values', () =>{
      const schema = makeSchema()
      schema.validate(makePokemon({ age: 0 }))
      throws(() => schema.validate(makePokemon({ age: null })))
      throws(() => schema.validate(makePokemon({ age: 'foo' })))
      throws(() => schema.validate(makePokemon({ age: {} })))
      throws(() => schema.validate(makePokemon({ age: NaN })))
    })
    it('validates boolean values', () =>{
      const schema = makeSchema()
      schema.validate(makePokemon({ happy: true }))
      schema.validate(makePokemon({ happy: false }))
      throws(() => schema.validate(makePokemon({ happy: null })))
      throws(() => schema.validate(makePokemon({ happy: 'foo' })))
      throws(() => schema.validate(makePokemon({ happy: {} })))
      throws(() => schema.validate(makePokemon({ happy: NaN })))
    })
    it('validates an enum values', () =>{
      const schema = makeSchema()
      schema.validate(makePokemon({ attackType: 'fire' }))
      schema.validate(makePokemon({ attackType: 'ice' }))
      throws(() => schema.validate(makePokemon({ happy: 'foo' })))
      throws(() => schema.validate(makePokemon({ happy: 4 })))
      throws(() => schema.validate(makePokemon({ happy: null })))
      throws(() => schema.validate(makePokemon({ happy: {} })))
      throws(() => schema.validate(makePokemon({ happy: NaN })))
    })
    it('validates Ref values', () =>{
      const schema = makeSchema()
      schema.validate(makePokemon({ friend: 'squirtle' }))
      throws(() => schema.validate(makePokemon({ friend: null })))
      throws(() => schema.validate(makePokemon({ friend: {} })))
      throws(() => schema.validate(makePokemon({ friend: NaN })))
    })
    it('validates RefList values', () =>{
      const schema = makeSchema()
      schema.validate(makePokemon({ enemies: ['squirtle'] }))
      throws(() => schema.validate(makePokemon({ enemies: 'squirtle' })))
      throws(() => schema.validate(makePokemon({ enemies: [null] })))
      throws(() => schema.validate(makePokemon({ enemies: null })))
      throws(() => schema.validate(makePokemon({ enemies: {} })))
      throws(() => schema.validate(makePokemon({ enemies: NaN })))
    })
  })
  describe('#designDocument', () => {
    it('emits a design document', () => {
      const schema = makeSchema()
      deepStrictEqual(schema.views(), {
          Pokemon_by_friend: {
            map: `function (doc) {
  if (doc.type !== 'Pokemon') {
    return
  }
  emit(doc["friend"]);
}`
          },
          Pokemon_by_enemies: {
            map: `function (doc) {
  if (doc.type !== 'Pokemon') {
    return
  }
  for (var i in doc["enemies"]) {
    emit(doc["enemies"][i]);
  }
}`
          }
      })
    })
  })
})
