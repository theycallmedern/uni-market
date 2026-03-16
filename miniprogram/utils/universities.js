const NONE_UNIVERSITY_OPTION = 'None'
const OTHER_UNIVERSITY_OPTION = 'Other'

const HANGZHOU_UNIVERSITIES = [
  NONE_UNIVERSITY_OPTION,
  'Zhejiang University',
  'Westlake University',
  'Hangzhou Dianzi University',
  'Zhejiang University of Technology',
  'Zhejiang Sci-Tech University',
  'Zhejiang A & F University',
  'Zhejiang Chinese Medical University',
  'Hangzhou Normal University',
  'Zhejiang Gongshang University',
  'China Jiliang University',
  'Zhejiang University of Finance and Economics',
  'China Academy of Art',
  'Zhejiang University of Science and Technology',
  'Zhejiang University of Water Resources and Electric Power',
  'Zhejiang Police College',
  'Zhejiang University of Media and Communications',
  'Hangzhou Medical College',
  'Zhejiang International Studies University',
  'Zhejiang Conservatory of Music',
  OTHER_UNIVERSITY_OPTION
]

function normalizeUniversity(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function toUniversityKey(value) {
  return normalizeUniversity(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getUniversityIndex(value, list = HANGZHOU_UNIVERSITIES) {
  if (!normalizeUniversity(value)) {
    const noneIndex = list.indexOf(NONE_UNIVERSITY_OPTION)
    return noneIndex >= 0 ? noneIndex : 0
  }

  const targetKey = toUniversityKey(value)
  const index = list.findIndex((item) => toUniversityKey(item) === targetKey)
  return index >= 0 ? index : 0
}

function isUniversityPrivateValue(value) {
  const normalized = normalizeUniversity(value)
  return normalized === NONE_UNIVERSITY_OPTION || normalized === OTHER_UNIVERSITY_OPTION
}

module.exports = {
  HANGZHOU_UNIVERSITIES,
  NONE_UNIVERSITY_OPTION,
  OTHER_UNIVERSITY_OPTION,
  normalizeUniversity,
  toUniversityKey,
  getUniversityIndex,
  isUniversityPrivateValue
}
