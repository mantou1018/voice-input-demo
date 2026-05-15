import { describe, expect, it } from 'vitest';
import {
  DEFAULT_POSITION_PICKER_CATEGORY_ID,
  findPositionPickerSelection,
  getPositionPickerCategory,
} from './positionPicker';

describe('position picker helpers', () => {
  it('finds the exact category and option for configured positions', () => {
    expect(findPositionPickerSelection('司机、滴滴司机、保洁')).toEqual([
      {
        categoryId: 'popular',
        option: '司机',
      },
      {
        categoryId: 'driver',
        option: '滴滴司机',
      },
      {
        categoryId: 'popular',
        option: '保洁',
      },
    ]);
  });

  it('returns an empty array for positions that cannot be mapped', () => {
    expect(findPositionPickerSelection('算法工程师')).toEqual([]);
  });

  it('returns the default category when the category id is unknown', () => {
    expect(getPositionPickerCategory('unknown').id).toBe(DEFAULT_POSITION_PICKER_CATEGORY_ID);
  });
});
