/**
 * IP 기반 위치 추적 및 지역 매핑 유틸리티
 */

import { PROVINCES, DISTRICTS } from './constants';

// 좌표 타입
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Haversine 공식을 이용한 두 지점 간 거리 계산 (km)
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * 주어진 반경 내에 있는지 확인
 */
export function isWithinRadius(
  center: Coordinates,
  target: Coordinates,
  radiusKm: number
): boolean {
  return calculateDistance(center, target) <= radiusKm;
}

// IP 기반 위치 정보 타입
export interface GeoLocation {
  province: string; // 시/도 코드
  district: string; // 시/군/구 코드
  provinceName: string;
  districtName: string;
  city?: string;
  country?: string;
  ip?: string;
}

// 도시명 → 시/도 코드 매핑
const CITY_TO_PROVINCE: Record<string, string> = {
  Seoul: 'seoul',
  서울: 'seoul',
  서울특별시: 'seoul',
  Busan: 'busan',
  부산: 'busan',
  부산광역시: 'busan',
  Daegu: 'daegu',
  대구: 'daegu',
  대구광역시: 'daegu',
  Incheon: 'incheon',
  인천: 'incheon',
  인천광역시: 'incheon',
  Gwangju: 'gwangju',
  광주: 'gwangju',
  광주광역시: 'gwangju',
  Daejeon: 'daejeon',
  대전: 'daejeon',
  대전광역시: 'daejeon',
  Ulsan: 'ulsan',
  울산: 'ulsan',
  울산광역시: 'ulsan',
  Sejong: 'sejong',
  세종: 'sejong',
  세종특별자치시: 'sejong',
  Suwon: 'gyeonggi',
  수원: 'gyeonggi',
  Seongnam: 'gyeonggi',
  성남: 'gyeonggi',
  Goyang: 'gyeonggi',
  고양: 'gyeonggi',
  Yongin: 'gyeonggi',
  용인: 'gyeonggi',
  Bucheon: 'gyeonggi',
  부천: 'gyeonggi',
  경기도: 'gyeonggi',
  Gyeonggi: 'gyeonggi',
  강원도: 'gangwon',
  Gangwon: 'gangwon',
  충청북도: 'chungbuk',
  충청남도: 'chungnam',
  전라북도: 'jeonbuk',
  전북특별자치도: 'jeonbuk',
  전라남도: 'jeonnam',
  경상북도: 'gyeongbuk',
  경상남도: 'gyeongnam',
  제주도: 'jeju',
  제주특별자치도: 'jeju',
  Jeju: 'jeju',
};

// 구/군 키워드 → 코드 매핑 (서울 기준 예시)
const DISTRICT_KEYWORDS: Record<string, Record<string, string>> = {
  seoul: {
    강남: 'seoul-gangnam',
    Gangnam: 'seoul-gangnam',
    강동: 'seoul-gangdong',
    강북: 'seoul-gangbuk',
    강서: 'seoul-gangseo',
    관악: 'seoul-gwanak',
    광진: 'seoul-gwangjin',
    구로: 'seoul-guro',
    금천: 'seoul-geumcheon',
    노원: 'seoul-nowon',
    도봉: 'seoul-dobong',
    동대문: 'seoul-dongdaemun',
    동작: 'seoul-dongjak',
    마포: 'seoul-mapo',
    서대문: 'seoul-seodaemun',
    서초: 'seoul-seocho',
    Seocho: 'seoul-seocho',
    성동: 'seoul-seongdong',
    성북: 'seoul-seongbuk',
    송파: 'seoul-songpa',
    Songpa: 'seoul-songpa',
    양천: 'seoul-yangcheon',
    영등포: 'seoul-yeongdeungpo',
    용산: 'seoul-yongsan',
    은평: 'seoul-eunpyeong',
    종로: 'seoul-jongno',
    중구: 'seoul-jung',
    중랑: 'seoul-jungnang',
  },
};

/**
 * IP 기반 위치 정보 가져오기
 * 무료 API: ip-api.com (상업용은 제한 있음)
 */
export async function getLocationByIP(): Promise<GeoLocation | null> {
  try {
    // ip-api.com 무료 API 사용 (HTTP만 지원, 상업용은 pro 버전 필요)
    const response = await fetch('http://ip-api.com/json/?lang=ko', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error('Location lookup failed');
    }

    // 시/도 매핑
    const provinceCode = findProvinceCode(data.regionName, data.city);
    const provinceName = PROVINCES.find((p) => p.code === provinceCode)?.name || data.regionName;

    // 시/군/구 매핑
    const districtCode = findDistrictCode(provinceCode, data.city, data.district);
    const districtName = districtCode
      ? DISTRICTS[provinceCode]?.find((d) => d.code === districtCode)?.name || ''
      : '';

    return {
      province: provinceCode,
      district: districtCode || '',
      provinceName,
      districtName,
      city: data.city,
      country: data.country,
      ip: data.query,
    };
  } catch (error) {
    console.error('위치 정보를 가져오는데 실패했습니다:', error);
    return null;
  }
}

/**
 * 시/도 코드 찾기
 */
function findProvinceCode(regionName: string, city: string): string {
  // 직접 매핑 시도
  if (CITY_TO_PROVINCE[regionName]) {
    return CITY_TO_PROVINCE[regionName];
  }
  if (CITY_TO_PROVINCE[city]) {
    return CITY_TO_PROVINCE[city];
  }

  // 부분 매칭 시도
  for (const [key, value] of Object.entries(CITY_TO_PROVINCE)) {
    if (regionName.includes(key) || city.includes(key)) {
      return value;
    }
  }

  // 기본값: 서울
  return 'seoul';
}

/**
 * 시/군/구 코드 찾기
 */
function findDistrictCode(
  provinceCode: string,
  city: string,
  district?: string
): string | null {
  const keywords = DISTRICT_KEYWORDS[provinceCode];
  if (!keywords) return null;

  const searchTerms = [district, city].filter(Boolean);

  for (const term of searchTerms) {
    if (!term) continue;

    for (const [keyword, code] of Object.entries(keywords)) {
      if (term.includes(keyword)) {
        return code;
      }
    }
  }

  return null;
}

/**
 * 브라우저 Geolocation API로 위치 가져오기 (더 정확하지만 사용자 동의 필요)
 */
export function getBrowserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000, // 5분 캐시
    });
  });
}

/**
 * 좌표를 주소로 변환 (카카오 API 사용 시)
 * 주의: 카카오 API 키가 필요합니다
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ province: string; district: string } | null> {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (!kakaoKey) {
    console.warn('카카오 API 키가 설정되지 않았습니다');
    return null;
  }

  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
      {
        headers: {
          Authorization: `KakaoAK ${kakaoKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to reverse geocode');
    }

    const data = await response.json();
    const region = data.documents?.[0];

    if (!region) return null;

    // region_1depth_name: 시/도
    // region_2depth_name: 시/군/구
    const provinceCode = findProvinceCode(region.region_1depth_name, '');
    const districtCode = findDistrictCode(
      provinceCode,
      region.region_2depth_name,
      region.region_3depth_name
    );

    return {
      province: provinceCode,
      district: districtCode || '',
    };
  } catch (error) {
    console.error('역지오코딩 실패:', error);
    return null;
  }
}
