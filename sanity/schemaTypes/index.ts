// schemaTypes/index.ts
import { type SchemaTypeDefinition } from 'sanity'
import { page } from './page' // 1. Import the page schema

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [page], // 2. Add it to the array
}
