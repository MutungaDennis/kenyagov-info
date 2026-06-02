// sanity/schemaTypes/index.ts
import { type SchemaTypeDefinition } from 'sanity';

import { page } from './page';
import { institutionContent } from './institutionContent';
import constitutionArticle from './constitutionArticle';
import actOfParliament from './actOfParliament';
import courtPronouncement from './courtPronouncement';
import reportMandate from './reportMandate';

// Import the two new schemas
import governmentCategory from './governmentCategory';
import governmentService from './governmentService'; // We will create this file next

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    page,
    institutionContent,
    constitutionArticle,
    actOfParliament,
    courtPronouncement,
    reportMandate,
    governmentCategory,  // Added
    governmentService,   // Added
  ],
};
