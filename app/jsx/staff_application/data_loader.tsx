import { CompetitionData } from './types/competition_data';

export async function CompetitionDataLoader(params: any) : Promise<CompetitionData> {
  const wcif = await fetch(`/staff_api/${params.competitionId}/wcif`);
  return {
    wcif: await wcif.json()
  };
};
