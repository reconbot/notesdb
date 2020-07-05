export type ID = string

export interface Node {
  type: string
  id: ID
  createdAt: number
  updatedAt: number
}

interface BaseFieldConfig {
  undef?: boolean
  null?: boolean
}

interface ScalarConfig extends BaseFieldConfig {
  type: 'String' | 'Number' | 'Boolean'
}

interface EnumConfig extends BaseFieldConfig {
  type: 'Enum'
  values: Set<string>
}

interface RefConfig extends BaseFieldConfig {
  type: 'Ref' | 'RefList'
  kind: string // is this needed?
}

export interface SchemaOptions {
  name: string
  timeStamps?: boolean
  fields: {
    [key: string]: ScalarConfig | EnumConfig | RefConfig
  }
}

export class Schema<T extends Node> {
  readonly name: string
  readonly fields: SchemaOptions['fields']

  constructor(options: SchemaOptions) {
    const { name, fields, timeStamps } = options
    this.name = name
    this.fields = fields
    this.fields.id = { type: 'String' }
    this.fields.type = { type: 'Enum', values: new Set([name]) }

    if (timeStamps) {
      this.fields['createdAt'] = { type: 'Number' }
      this.fields['updatedAt'] = { type: 'Number' }
    }
  }

  views() {
    const views: { [key: string]: { map: string } } = {}
    for (const [field, fieldConfig] of Object.entries(this.fields)) {
      if (fieldConfig.type === 'Ref') {
        views[`${this.name}_by_${field}`] = {
          map: `function (doc) {
  if (doc.type !== '${this.name}') {
    return
  }
  emit(doc["${field}"]);
}`
        }
      } else if (fieldConfig.type === 'RefList') {
        views[`${this.name}_by_${field}`] = {
          map: `function (doc) {
  if (doc.type !== '${this.name}') {
    return
  }
  for (var i in doc["${field}"]) {
    emit(doc["${field}"][i]);
  }
}`
        }
      }
    }
    return views
  }

  validate(obj: T) {
    for (const field of Object.keys(obj)) {
      if (!this.fields[field]) {
        throw new Error(`${this.name}: unknown field "${field}"`)
      }
    }
    for (const field of Object.keys(this.fields)) {
      const value = (obj as any)[field]
      this.validateType(field, value)
    }
  }

  validateType(field: string, value: any) {
    const fieldConfig = this.fields[field]
    if (fieldConfig.undef && value === undefined) {
      return
    }

    if (fieldConfig.null && value === null) {
      return
    }

    if (fieldConfig.type === 'Number') {
      if (typeof value === 'number' && !isNaN(value)) {
        return
      }
      throw new Error(`${this.name}: field "${field}" is not a ${fieldConfig.type}`)
    }

    if (fieldConfig.type === 'String' || fieldConfig.type === 'Ref') {
      if (typeof value === 'string') {
        return
      }
      throw new Error(`${this.name}: field "${field}" is not a ${fieldConfig.type}`)
    }

    if (fieldConfig.type === 'Boolean') {
      if (typeof value === 'boolean') {
        return
      }
      throw new Error(`${this.name}: field "${field}" is not a ${fieldConfig.type}`)
    }

    if (fieldConfig.type === 'Enum') {
      if (fieldConfig.values.has(value)) {
        return
      }
      throw new Error(`${this.name}: Enum field "${field}" has a value of "${value}" but must be one of "${Array.from(fieldConfig.values)}"`)
    }
    if (fieldConfig.type === 'RefList') {
      if (Array.isArray(value)) {
        for (const ref of value) {
          if (typeof ref !== 'string') {
            throw new Error(`${this.name}: field "${field}" is not a ${fieldConfig.type}`)
          }
        }
        return
      }
      throw new Error(`${this.name}: field "${field}" is not a ${fieldConfig.type}`)
    }
    throw new Error(`${this.name}: field "${field}" is of an unknown type ${fieldConfig.type}`)
  }
}
