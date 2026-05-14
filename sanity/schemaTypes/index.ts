// sanity/schemaTypes/index.ts
import { type SchemaTypeDefinition } from 'sanity';

import { page } from './page';
import { institutionContent } from './institutionContent';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    page,
    institutionContent,     // ← Make sure this is included
  ],
};