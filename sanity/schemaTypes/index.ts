// sanity/schemaTypes/index.ts
import { type SchemaTypeDefinition } from 'sanity';

import { page } from './page';
import { institutionContent } from './institutionContent';
import constitutionArticle from './constitutionArticle';
import actOfParliament from './actOfParliament';
import courtPronouncement from './courtPronouncement';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    page,
    institutionContent,
    constitutionArticle,
    actOfParliament,
    courtPronouncement,
  ],
};