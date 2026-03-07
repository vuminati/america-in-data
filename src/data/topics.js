/**
 * Question type definitions.
 *
 * Each entry describes one "mode" of play:
 *   dataPath     — path under /public to the JSON data file
 *   valueKey     — item field compared to determine the correct answer
 *   pairingKey   — item field used to prevent same-group pairings
 *   formatType   — how to display the revealed value ('currency' | 'wage' | 'count' | 'percent')
 *   idKey        — (optional) item field to show as an ID in the More Info modal
 *   idLabel      — (optional) label prefix for the ID (e.g. 'HTS', 'SOC')
 *   displayKey   — item field holding the pre-formatted string shown in the More Info modal
 *   contextLabel — descriptor shown at the top of the More Info modal
 *
 * To add a new question type: add an entry here and place its JSON file in /public/data/.
 */
export const questionTypes = [
  {
    id: 'imports-value',
    question: 'What does the US import more of, in $ value?',
    dataPath: '/data/imports.json',
    source: 'Source: US Census\nBureau, 2024',
    valueKey: 'value',
    pairingKey: 'heading',
    formatType: 'currency',
    idKey: 'hts_code',
    idLabel: 'HTS',
    displayKey: 'value_formatted',
    contextLabel: 'imported by value in 2024',
  },
  {
    id: 'employment-wage',
    question: 'Which job has a higher median hourly wage?',
    dataPath: '/data/employment.json',
    source: 'Source: BLS Occupational\nEmployment Statistics, 2024',
    valueKey: 'median_hourly_wage',
    pairingKey: 'major_group',
    formatType: 'wage',
    idKey: 'occ_code',
    idLabel: 'SOC',
    displayKey: 'wage_formatted',
    contextLabel: 'median hourly wage',
  },
  {
    id: 'employment-count',
    question: 'Which job employs more people?',
    dataPath: '/data/employment.json',
    source: 'Source: BLS Occupational\nEmployment Statistics, 2024',
    valueKey: 'total_employment',
    pairingKey: 'major_group',
    formatType: 'count',
    idKey: 'occ_code',
    idLabel: 'SOC',
    displayKey: 'employment_formatted',
    contextLabel: 'total US employment',
  },
  {
    id: 'cpi-weight',
    question: 'What do US households spend more on?',
    dataPath: '/data/cpi.json',
    source: 'Source: BLS Consumer\nPrice Index, 2024',
    valueKey: 'value',
    pairingKey: 'parent_serial',
    formatType: 'percent',
    displayKey: 'value_formatted',
    contextLabel: 'share of US consumer spending',
  },
  {
    id: 'country-imports',
    question: 'Which country does the US import more from, in $ value?',
    dataPath: '/data/country_imports.json',
    source: 'Source: US Census\nBureau, 2024',
    valueKey: 'value',
    pairingKey: 'name',       // unique per country → no constraint
    formatType: 'currency',
    displayKey: 'value_formatted',
    contextLabel: 'US imports from country, 2024',
  },
  {
    id: 'jobs-age',
    question: 'Which job has an older median age?',
    dataPath: '/data/jobs_age.json',
    source: 'Source: BLS Current\nPopulation Survey, 2023',
    valueKey: 'median_age',
    pairingKey: 'occ_group',
    formatType: 'age',
    idKey: 'occ',
    idLabel: 'OCC',
    displayKey: 'age_formatted',
    contextLabel: 'median worker age',
  },
]
