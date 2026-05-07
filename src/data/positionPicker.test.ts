import { describe, expect, it } from 'vitest';
import {
  DEFAULT_POSITION_PICKER_CATEGORY_ID,
  findPositionPickerSelection,
  getPositionPickerCategory,
} from './positionPicker';

describe('position picker helpers', () => {
  it('finds the exact category and option for configured positions', () => {
    expect(findPositionPickerSelection('司机')).toEqual({
      categoryId: 'popular',
      option: '司机',
    });
    expect(findPositionPickerSelection('滴滴司机')).toEqual({
      categoryId: 'driver',
      option: '滴滴司机',
    });
  });

  it('falls back to the driver category for unknown driver roles', () => {
    expect(findPositionPickerSelection('商务司机长途线')).toEqual({
      categoryId: 'driver',
      option: null,
    });
  });

  it('returns null for positions that cannot be mapped', () => {
    expect(findPositionPickerSelection('算法工程师')).toBeNull();
  });

  it('returns the default category when the category id is unknown', () => {
    expect(getPositionPickerCategory('unknown').id).toBe(DEFAULT_POSITION_PICKER_CATEGORY_ID);
  });
});
