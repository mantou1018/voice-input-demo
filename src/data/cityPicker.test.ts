import { describe, expect, it } from 'vitest';
import {
  CITY_PICKER_PROVINCES,
  DEFAULT_CITY_PICKER_PROVINCE_ID,
  findCityPickerSelection,
  formatCityPickerValue,
  getCityPickerCity,
  getCityPickerProvince,
} from './cityPicker';

describe('city picker helpers', () => {
  it('finds configured province-city selections from display text', () => {
    expect(findCityPickerSelection('广东-深圳、云南-昆明')).toEqual([
      {
        provinceId: '44',
        cityId: '4403',
      },
      {
        provinceId: '53',
        cityId: '5301',
      },
    ]);
  });

  it('formats selections into the display value', () => {
    expect(formatCityPickerValue([
      { provinceId: '11', cityId: '1101' },
      { provinceId: '31', cityId: '3101' },
    ])).toBe('北京、上海');
  });

  it('returns defaults when province or city ids are unknown', () => {
    expect(getCityPickerProvince('unknown').id).toBe(DEFAULT_CITY_PICKER_PROVINCE_ID);
    expect(getCityPickerCity('unknown', 'missing').id).toBe(getCityPickerProvince(DEFAULT_CITY_PICKER_PROVINCE_ID).cities[0].id);
  });

  it('includes every province-level division with complete city and district coverage', () => {
    const cityCount = CITY_PICKER_PROVINCES.reduce((sum, province) => sum + province.cities.length, 0);
    const districtCount = CITY_PICKER_PROVINCES.reduce(
      (sum, province) =>
        sum + province.cities.reduce((citySum, city) => citySum + city.districts.length, 0),
      0,
    );

    expect(CITY_PICKER_PROVINCES).toHaveLength(34);
    expect(cityCount).toBe(367);
    expect(districtCount).toBe(3439);
    expect(findCityPickerSelection('新疆-乌鲁木齐')).toEqual([
      {
        provinceId: '65',
        cityId: '6501',
      },
    ]);
    expect(findCityPickerSelection('香港-香港岛')).toEqual([
      {
        provinceId: '81',
        cityId: '8101',
      },
    ]);
    expect(findCityPickerSelection('台湾-台北')).toEqual([
      {
        provinceId: '71',
        cityId: '7101',
      },
    ]);
  });
});
