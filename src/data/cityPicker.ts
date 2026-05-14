export interface CityPickerDistrict {
  id: string;
  label: string;
}

export interface CityPickerCity {
  id: string;
  label: string;
  districts: CityPickerDistrict[];
}

export interface CityPickerProvince {
  id: string;
  label: string;
  cities: CityPickerCity[];
}

export interface CityPickerSelection {
  provinceId: string;
  cityId: string;
}

import { CITY_PICKER_PROVINCES } from './cityPickerData';

export { CITY_PICKER_PROVINCES };

export const DEFAULT_CITY_PICKER_PROVINCE_ID = CITY_PICKER_PROVINCES[0].id;

export function getCityPickerProvince(provinceId: string) {
  return (
    CITY_PICKER_PROVINCES.find((province) => province.id === provinceId) ??
    CITY_PICKER_PROVINCES[0]
  );
}

export function getCityPickerCity(provinceId: string, cityId: string) {
  const province = getCityPickerProvince(provinceId);
  return province.cities.find((city) => city.id === cityId) ?? province.cities[0];
}

export function findCityPickerSelection(value: string): CityPickerSelection[] {
  const normalized = value.trim();
  if (!normalized) {
    return [];
  }

  const segments = normalized
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
  const selections: CityPickerSelection[] = [];

  for (const segment of segments) {
    for (const province of CITY_PICKER_PROVINCES) {
      for (const city of province.cities) {
        if (segment === city.label || segment === `${province.label}-${city.label}`) {
          selections.push({
            provinceId: province.id,
            cityId: city.id,
          });
          break;
        }
      }
    }
  }

  if (selections.length > 0) {
    return selections;
  }

  for (const province of CITY_PICKER_PROVINCES) {
    for (const city of province.cities) {
      if (normalized.includes(city.label)) {
        return [{
          provinceId: province.id,
          cityId: city.id,
        }];
      }
    }
  }

  return [];
}

export function formatCityPickerValue(
  selections: Array<{ provinceId: string; cityId: string }>,
) {
  return selections
    .map(({ provinceId, cityId }) => {
      const city = getCityPickerCity(provinceId, cityId);
      return city.label;
    })
    .join('、');
}
