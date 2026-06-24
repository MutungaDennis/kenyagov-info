import { type SchemaTypeDefinition } from 'sanity';

import { page } from './page';
import { institutionContent } from './institutionContent';
import constitutionArticle from './constitutionArticle';
import actOfParliament from './actOfParliament';
import courtPronouncement from './courtPronouncement';
import reportMandate from './reportMandate';

import governmentCategory from './governmentCategory';
import governmentService from './governmentService';
import governmentMinistry from './governmentMinistry';
import presidentialTrip from './presidentialTrip';

// NEW HANSARD & LEGISLATIVE SCHEMAS
import hansardSitting from './hansardSitting';
import hansardSpeech from './hansardSpeech';
import legislativeItem from './legislativeItem';
import hansardDivision from './hansardDivision';

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
    presidentialTrip,

    // Hansard & Legislative Tracker
    hansardSitting,
    hansardSpeech,
    legislativeItem,
    hansardDivision,
  ],
};