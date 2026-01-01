/**
 * 지역 데이터 타입
 * /public/data/regions.json 과 동기화
 */

// 시/도
export interface Province {
  code: string;
  name: string;
  shortName: string;
}

// 시/군/구
export interface District {
  code: string;
  name: string;
}

// 지역 데이터 전체 구조
export interface RegionData {
  provinces: Province[];
  districts: Record<string, District[]>;
  version: string;
  lastUpdated: string;
}

// 지역별 동행인 수
export interface RegionCompanionCount {
  [regionCode: string]: number;
}
