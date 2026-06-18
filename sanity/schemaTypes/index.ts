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
import governmentMinistry from './governmentMinistry'; 
import presidentialTrip from './presidentialTrip'; // 1. IMPORT THE NEW SCHEMA HERE

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
    governmentMinistry, 
    presidentialTrip, // 2. ENLIST IT INTO THE CORE ARRAY
  ],
};
