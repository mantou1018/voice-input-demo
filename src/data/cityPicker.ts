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
  districtId: string | null;
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

export function findCityPickerSelection(value: string): CityPickerSelection | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  for (const province of CITY_PICKER_PROVINCES) {
    if (normalized === province.label) {
      return {
        provinceId: province.id,
        cityId: province.cities[0]?.id ?? '',
        districtId: null,
      };
    }

    for (const city of province.cities) {
      if (normalized.includes(city.label)) {
        const district = city.districts.find((item) => normalized.includes(item.label));
        return {
          provinceId: province.id,
          cityId: city.id,
          districtId: district?.id ?? null,
        };
      }
    }
  }

  return null;
}

export function formatCityPickerValue(
  provinceId: string,
  cityId: string,
  districtId: string | null,
) {
  const province = getCityPickerProvince(provinceId);
  const city = getCityPickerCity(provinceId, cityId);
  const district = city.districts.find((item) => item.id === districtId);

  return [province.label, city.label, district?.label].filter(Boolean).join(' / ');
}
