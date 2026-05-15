import { POSITION_PICKER_CATEGORIES, findPositionPickerSelection } from '../data/positionPicker.js';

const POSITION_SPEECH_ALIASES: Record<string, string> = {
  宝安: '保安',
  宝杰: '保洁',
  宝洁: '保洁',
  蒲公: '普工',
  分检员: '分拣员',
  包装公: '包装工',
  操作公: '操作工',
  装卸公: '装卸工',
  搬运公: '搬运工',
  洗车公: '洗车工',
  汽修公: '汽修工',
  跟车原: '跟车员',
  安检原: '安检员',
  安全原: '安全员',
  保安原: '保安员',
};

const KNOWN_POSITIONS = [
  ...new Set(POSITION_PICKER_CATEGORIES.flatMap((category) => category.options)),
];

function normalizeSegment(segment: string) {
  const trimmed = segment.trim();
  if (!trimmed) {
    return '';
  }

  const aliased = POSITION_SPEECH_ALIASES[trimmed] ?? trimmed;
  const exactSelections = findPositionPickerSelection(aliased);
  if (exactSelections.length > 0) {
    return exactSelections[0]?.option ?? aliased;
  }

  const included = KNOWN_POSITIONS.find((position) => aliased.includes(position));
  if (included) {
    return included;
  }

  return aliased;
}

export function normalizePositionSpeechText(input: string) {
  let output = input;

  for (const [alias, canonical] of Object.entries(POSITION_SPEECH_ALIASES)) {
    output = output.split(alias).join(canonical);
  }

  return output;
}

export function normalizePositionFieldValue(input: string) {
  return input
    .split(/[、,，]/u)
    .map(normalizeSegment)
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join('、');
}
