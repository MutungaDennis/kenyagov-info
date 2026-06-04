// sanity/schemaTypes/index.ts
import { type SchemaTypeDefinition } from 'sanity';

import { page } from './page';
import { institutionContent } from './institutionContent';
import constitutionArticle from './constitutionArticle';
import actOfParliament from './actOfParliament';
import courtPronouncement from './courtPronouncement';
import reportMandate from './reportMandate';

// Import your government navigation schemas
import governmentCategory from './governmentCategory';
import governmentService from './governmentService'; 
import governmentMinistry from './governmentMinistry'; // NEW: Added reusable Ministry reference file

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    page,
    institutionContent,
    constitutionArticle,
    actOfParliament,
    courtPronouncement,
    reportMandate,
    governmentCategory,  
    governmentService,
    governmentMinistry, // NEW: Enlisted into Sanity Core configuration matrix
  ],
};
