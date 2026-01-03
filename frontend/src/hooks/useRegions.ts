'use client';

import { useState, useEffect, useCallback } from 'react';

// 지역 데이터 타입
export interface Province {
  code: string;
  name: string;
  shortName: string;
  lat?: number;
  lng?: number;
}

export interface District {
  code: string;
  name: string;
  lat?: number;
  lng?: number;
}

export interface RegionData {
  provinces: Province[];
  districts: Record<string, District[]>;
  version: string;
  lastUpdated: string;
}

// 캐시된 지역 데이터
let cachedRegionData: RegionData | null = null;
let fetchPromise: Promise<RegionData> | null = null;

/**
 * 지역 데이터를 JSON 파일에서 동적으로 로딩하는 훅
 * - 가입 시 지역 선택
 * - 서비스 지역 설정
 * - 동행인 검색 필터
 */
export function useRegions() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<Record<string, District[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 지역 데이터 로딩
  useEffect(() => {
    const loadRegions = async () => {
      try {
        // 캐시된 데이터가 있으면 사용
        if (cachedRegionData) {
          setProvinces(cachedRegionData.provinces);
          setDistricts(cachedRegionData.districts);
          setIsLoading(false);
          return;
        }

        // 이미 fetch 중이면 기다림
        if (fetchPromise) {
          const data = await fetchPromise;
          setProvinces(data.provinces);
          setDistricts(data.districts);
          setIsLoading(false);
          return;
        }

        // 새로 fetch
        fetchPromise = fetch('/data/regions.json').then((res) => {
          if (!res.ok) {
            throw new Error('지역 데이터를 불러오는데 실패했습니다.');
          }
          return res.json();
        });

        const data = await fetchPromise;
        cachedRegionData = data;

        setProvinces(data.provinces);
        setDistricts(data.districts);
        setIsLoading(false);
      } catch (err) {
        console.error('지역 데이터 로딩 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        setIsLoading(false);
        fetchPromise = null;
      }
    };

    loadRegions();
  }, []);

  // 시/도 코드로 시/도 정보 가져오기
  const getProvince = useCallback(
    (code: string): Province | undefined => {
      return provinces.find((p) => p.code === code);
    },
    [provinces]
  );

  // 시/도 코드로 해당 시/군/구 목록 가져오기
  const getDistrictsByProvince = useCallback(
    (provinceCode: string): District[] => {
      return districts[provinceCode] || [];
    },
    [districts]
  );

  // 시/군/구 코드로 시/군/구 정보 가져오기
  const getDistrict = useCallback(
    (code: string): District | undefined => {
      const [provinceCode] = code.split('-');
      const provinceDistricts = districts[provinceCode];
      return provinceDistricts?.find((d) => d.code === code);
    },
    [districts]
  );

  // 시/군/구 코드로 전체 지역명 가져오기 (예: "서울 강남구")
  const getFullRegionName = useCallback(
    (districtCode: string): string => {
      const [provinceCode] = districtCode.split('-');
      const province = provinces.find((p) => p.code === provinceCode);
      const district = getDistrict(districtCode);

      if (!province) return districtCode;
      if (!district) return province.shortName;

      return `${province.shortName} ${district.name}`;
    },
    [provinces, getDistrict]
  );

  // 시/도 코드로 시/도 이름 가져오기 (짧은 이름)
  const getProvinceName = useCallback(
    (code: string, useShort: boolean = true): string => {
      const province = provinces.find((p) => p.code === code);
      if (!province) return code;
      return useShort ? province.shortName : province.name;
    },
    [provinces]
  );

  // 지역 코드 배열을 지역명 배열로 변환
  const getRegionNames = useCallback(
    (codes: string[]): string[] => {
      return codes.map((code) => {
        if (code.includes('-')) {
          return getFullRegionName(code);
        }
        return getProvinceName(code);
      });
    },
    [getFullRegionName, getProvinceName]
  );

  return {
    provinces,
    districts,
    isLoading,
    error,
    getProvince,
    getDistrictsByProvince,
    getDistrict,
    getFullRegionName,
    getProvinceName,
    getRegionNames,
  };
}

/**
 * 서버 컴포넌트에서 사용할 수 있는 정적 지역 데이터 가져오기
 * (빌드 타임에 사용)
 */
export async function getRegionDataStatic(): Promise<RegionData> {
  if (cachedRegionData) {
    return cachedRegionData;
  }

  // 서버사이드에서는 직접 import
  const data = await import('../../public/data/regions.json');
  cachedRegionData = data.default as RegionData;
  return cachedRegionData;
}

/**
 * 지역 데이터 캐시 초기화 (테스트용)
 */
export function clearRegionCache() {
  cachedRegionData = null;
  fetchPromise = null;
}
