// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// 서비스 가격 (원/시간)
export const SERVICE_PRICES = {
  full_care: 35000,
  hospital_care: 25000,
  special_care: 0, // 별도 협의
} as const;

// 추가 요금
export const EXTRA_CHARGES = {
  DISTANCE_PER_KM: 500, // 10km 초과 시 km당
  URGENT_RATE: 1.5, // 당일 예약 50% 할증
  NIGHT_WEEKEND_RATE: 1.3, // 야간/주말 30% 할증
} as const;

// 수수료 구조 (공익 목적 최소 수수료)
export const FEE_STRUCTURE = {
  DEPOSIT_RATE: 0.2, // 예약금 비율 20%
  PG_FEE_RATE: 0.033, // PG사 수수료 3.3%
  PLATFORM_FEE: 2000, // 플랫폼 운영비 2,000원 고정
} as const;

// 전국 시/도 목록
// NOTE: 동적 로딩이 필요한 경우 useRegions 훅 사용 권장
// 지역 데이터는 /public/data/regions.json 에서 관리됩니다.
export const PROVINCES = [
  { code: 'seoul', name: '서울특별시', shortName: '서울' },
  { code: 'busan', name: '부산광역시', shortName: '부산' },
  { code: 'daegu', name: '대구광역시', shortName: '대구' },
  { code: 'incheon', name: '인천광역시', shortName: '인천' },
  { code: 'gwangju', name: '광주광역시', shortName: '광주' },
  { code: 'daejeon', name: '대전광역시', shortName: '대전' },
  { code: 'ulsan', name: '울산광역시', shortName: '울산' },
  { code: 'sejong', name: '세종특별자치시', shortName: '세종' },
  { code: 'gyeonggi', name: '경기도', shortName: '경기' },
  { code: 'gangwon', name: '강원특별자치도', shortName: '강원' },
  { code: 'chungbuk', name: '충청북도', shortName: '충북' },
  { code: 'chungnam', name: '충청남도', shortName: '충남' },
  { code: 'jeonbuk', name: '전북특별자치도', shortName: '전북' },
  { code: 'jeonnam', name: '전라남도', shortName: '전남' },
  { code: 'gyeongbuk', name: '경상북도', shortName: '경북' },
  { code: 'gyeongnam', name: '경상남도', shortName: '경남' },
  { code: 'jeju', name: '제주특별자치도', shortName: '제주' },
] as const;

// 시/도별 시/군/구 목록
// NOTE: 동적 로딩이 필요한 경우 useRegions 훅 사용 권장
// 지역 데이터는 /public/data/regions.json 에서 관리됩니다.
export const DISTRICTS: Record<string, { code: string; name: string }[]> = {
  seoul: [
    { code: 'seoul-gangnam', name: '강남구' },
    { code: 'seoul-gangdong', name: '강동구' },
    { code: 'seoul-gangbuk', name: '강북구' },
    { code: 'seoul-gangseo', name: '강서구' },
    { code: 'seoul-gwanak', name: '관악구' },
    { code: 'seoul-gwangjin', name: '광진구' },
    { code: 'seoul-guro', name: '구로구' },
    { code: 'seoul-geumcheon', name: '금천구' },
    { code: 'seoul-nowon', name: '노원구' },
    { code: 'seoul-dobong', name: '도봉구' },
    { code: 'seoul-dongdaemun', name: '동대문구' },
    { code: 'seoul-dongjak', name: '동작구' },
    { code: 'seoul-mapo', name: '마포구' },
    { code: 'seoul-seodaemun', name: '서대문구' },
    { code: 'seoul-seocho', name: '서초구' },
    { code: 'seoul-seongdong', name: '성동구' },
    { code: 'seoul-seongbuk', name: '성북구' },
    { code: 'seoul-songpa', name: '송파구' },
    { code: 'seoul-yangcheon', name: '양천구' },
    { code: 'seoul-yeongdeungpo', name: '영등포구' },
    { code: 'seoul-yongsan', name: '용산구' },
    { code: 'seoul-eunpyeong', name: '은평구' },
    { code: 'seoul-jongno', name: '종로구' },
    { code: 'seoul-jung', name: '중구' },
    { code: 'seoul-jungnang', name: '중랑구' },
  ],
  busan: [
    { code: 'busan-jung', name: '중구' },
    { code: 'busan-seo', name: '서구' },
    { code: 'busan-dong', name: '동구' },
    { code: 'busan-yeongdo', name: '영도구' },
    { code: 'busan-busanjin', name: '부산진구' },
    { code: 'busan-dongnae', name: '동래구' },
    { code: 'busan-nam', name: '남구' },
    { code: 'busan-buk', name: '북구' },
    { code: 'busan-haeundae', name: '해운대구' },
    { code: 'busan-saha', name: '사하구' },
    { code: 'busan-geumjeong', name: '금정구' },
    { code: 'busan-gangseo', name: '강서구' },
    { code: 'busan-yeonje', name: '연제구' },
    { code: 'busan-suyeong', name: '수영구' },
    { code: 'busan-sasang', name: '사상구' },
    { code: 'busan-gijang', name: '기장군' },
  ],
  daegu: [
    { code: 'daegu-jung', name: '중구' },
    { code: 'daegu-dong', name: '동구' },
    { code: 'daegu-seo', name: '서구' },
    { code: 'daegu-nam', name: '남구' },
    { code: 'daegu-buk', name: '북구' },
    { code: 'daegu-suseong', name: '수성구' },
    { code: 'daegu-dalseo', name: '달서구' },
    { code: 'daegu-dalseong', name: '달성군' },
    { code: 'daegu-gunwi', name: '군위군' },
  ],
  incheon: [
    { code: 'incheon-jung', name: '중구' },
    { code: 'incheon-dong', name: '동구' },
    { code: 'incheon-michuhol', name: '미추홀구' },
    { code: 'incheon-yeonsu', name: '연수구' },
    { code: 'incheon-namdong', name: '남동구' },
    { code: 'incheon-bupyeong', name: '부평구' },
    { code: 'incheon-gyeyang', name: '계양구' },
    { code: 'incheon-seo', name: '서구' },
    { code: 'incheon-ganghwa', name: '강화군' },
    { code: 'incheon-ongjin', name: '옹진군' },
  ],
  gwangju: [
    { code: 'gwangju-dong', name: '동구' },
    { code: 'gwangju-seo', name: '서구' },
    { code: 'gwangju-nam', name: '남구' },
    { code: 'gwangju-buk', name: '북구' },
    { code: 'gwangju-gwangsan', name: '광산구' },
  ],
  daejeon: [
    { code: 'daejeon-dong', name: '동구' },
    { code: 'daejeon-jung', name: '중구' },
    { code: 'daejeon-seo', name: '서구' },
    { code: 'daejeon-yuseong', name: '유성구' },
    { code: 'daejeon-daedeok', name: '대덕구' },
  ],
  ulsan: [
    { code: 'ulsan-jung', name: '중구' },
    { code: 'ulsan-nam', name: '남구' },
    { code: 'ulsan-dong', name: '동구' },
    { code: 'ulsan-buk', name: '북구' },
    { code: 'ulsan-ulju', name: '울주군' },
  ],
  sejong: [
    { code: 'sejong-all', name: '세종시 전체' },
  ],
  gyeonggi: [
    { code: 'gyeonggi-suwon', name: '수원시' },
    { code: 'gyeonggi-seongnam', name: '성남시' },
    { code: 'gyeonggi-goyang', name: '고양시' },
    { code: 'gyeonggi-yongin', name: '용인시' },
    { code: 'gyeonggi-bucheon', name: '부천시' },
    { code: 'gyeonggi-ansan', name: '안산시' },
    { code: 'gyeonggi-anyang', name: '안양시' },
    { code: 'gyeonggi-namyangju', name: '남양주시' },
    { code: 'gyeonggi-hwaseong', name: '화성시' },
    { code: 'gyeonggi-pyeongtaek', name: '평택시' },
    { code: 'gyeonggi-uijeongbu', name: '의정부시' },
    { code: 'gyeonggi-siheung', name: '시흥시' },
    { code: 'gyeonggi-paju', name: '파주시' },
    { code: 'gyeonggi-gimpo', name: '김포시' },
    { code: 'gyeonggi-gwangmyeong', name: '광명시' },
    { code: 'gyeonggi-gwangju', name: '광주시' },
    { code: 'gyeonggi-gunpo', name: '군포시' },
    { code: 'gyeonggi-hanam', name: '하남시' },
    { code: 'gyeonggi-osan', name: '오산시' },
    { code: 'gyeonggi-icheon', name: '이천시' },
    { code: 'gyeonggi-anseong', name: '안성시' },
    { code: 'gyeonggi-uiwang', name: '의왕시' },
    { code: 'gyeonggi-yangju', name: '양주시' },
    { code: 'gyeonggi-pocheon', name: '포천시' },
    { code: 'gyeonggi-yeoju', name: '여주시' },
    { code: 'gyeonggi-dongducheon', name: '동두천시' },
    { code: 'gyeonggi-guri', name: '구리시' },
    { code: 'gyeonggi-yangpyeong', name: '양평군' },
    { code: 'gyeonggi-gapyeong', name: '가평군' },
    { code: 'gyeonggi-yeoncheon', name: '연천군' },
  ],
  gangwon: [
    { code: 'gangwon-chuncheon', name: '춘천시' },
    { code: 'gangwon-wonju', name: '원주시' },
    { code: 'gangwon-gangneung', name: '강릉시' },
    { code: 'gangwon-donghae', name: '동해시' },
    { code: 'gangwon-taebaek', name: '태백시' },
    { code: 'gangwon-sokcho', name: '속초시' },
    { code: 'gangwon-samcheok', name: '삼척시' },
    { code: 'gangwon-hongcheon', name: '홍천군' },
    { code: 'gangwon-hoengseong', name: '횡성군' },
    { code: 'gangwon-yeongwol', name: '영월군' },
    { code: 'gangwon-pyeongchang', name: '평창군' },
    { code: 'gangwon-jeongseon', name: '정선군' },
    { code: 'gangwon-cheorwon', name: '철원군' },
    { code: 'gangwon-hwacheon', name: '화천군' },
    { code: 'gangwon-yanggu', name: '양구군' },
    { code: 'gangwon-inje', name: '인제군' },
    { code: 'gangwon-goseong', name: '고성군' },
    { code: 'gangwon-yangyang', name: '양양군' },
  ],
  chungbuk: [
    { code: 'chungbuk-cheongju', name: '청주시' },
    { code: 'chungbuk-chungju', name: '충주시' },
    { code: 'chungbuk-jecheon', name: '제천시' },
    { code: 'chungbuk-boeun', name: '보은군' },
    { code: 'chungbuk-okcheon', name: '옥천군' },
    { code: 'chungbuk-yeongdong', name: '영동군' },
    { code: 'chungbuk-jeungpyeong', name: '증평군' },
    { code: 'chungbuk-jincheon', name: '진천군' },
    { code: 'chungbuk-goesan', name: '괴산군' },
    { code: 'chungbuk-eumseong', name: '음성군' },
    { code: 'chungbuk-danyang', name: '단양군' },
  ],
  chungnam: [
    { code: 'chungnam-cheonan', name: '천안시' },
    { code: 'chungnam-gongju', name: '공주시' },
    { code: 'chungnam-boryeong', name: '보령시' },
    { code: 'chungnam-asan', name: '아산시' },
    { code: 'chungnam-seosan', name: '서산시' },
    { code: 'chungnam-nonsan', name: '논산시' },
    { code: 'chungnam-gyeryong', name: '계룡시' },
    { code: 'chungnam-dangjin', name: '당진시' },
    { code: 'chungnam-geumsan', name: '금산군' },
    { code: 'chungnam-buyeo', name: '부여군' },
    { code: 'chungnam-seocheon', name: '서천군' },
    { code: 'chungnam-cheongyang', name: '청양군' },
    { code: 'chungnam-hongseong', name: '홍성군' },
    { code: 'chungnam-yesan', name: '예산군' },
    { code: 'chungnam-taean', name: '태안군' },
  ],
  jeonbuk: [
    { code: 'jeonbuk-jeonju', name: '전주시' },
    { code: 'jeonbuk-gunsan', name: '군산시' },
    { code: 'jeonbuk-iksan', name: '익산시' },
    { code: 'jeonbuk-jeongeup', name: '정읍시' },
    { code: 'jeonbuk-namwon', name: '남원시' },
    { code: 'jeonbuk-gimje', name: '김제시' },
    { code: 'jeonbuk-wanju', name: '완주군' },
    { code: 'jeonbuk-jinan', name: '진안군' },
    { code: 'jeonbuk-muju', name: '무주군' },
    { code: 'jeonbuk-jangsu', name: '장수군' },
    { code: 'jeonbuk-imsil', name: '임실군' },
    { code: 'jeonbuk-sunchang', name: '순창군' },
    { code: 'jeonbuk-gochang', name: '고창군' },
    { code: 'jeonbuk-buan', name: '부안군' },
  ],
  jeonnam: [
    { code: 'jeonnam-mokpo', name: '목포시' },
    { code: 'jeonnam-yeosu', name: '여수시' },
    { code: 'jeonnam-suncheon', name: '순천시' },
    { code: 'jeonnam-naju', name: '나주시' },
    { code: 'jeonnam-gwangyang', name: '광양시' },
    { code: 'jeonnam-damyang', name: '담양군' },
    { code: 'jeonnam-gokseong', name: '곡성군' },
    { code: 'jeonnam-gurye', name: '구례군' },
    { code: 'jeonnam-goheung', name: '고흥군' },
    { code: 'jeonnam-boseong', name: '보성군' },
    { code: 'jeonnam-hwasun', name: '화순군' },
    { code: 'jeonnam-jangheung', name: '장흥군' },
    { code: 'jeonnam-gangjin', name: '강진군' },
    { code: 'jeonnam-haenam', name: '해남군' },
    { code: 'jeonnam-yeongam', name: '영암군' },
    { code: 'jeonnam-muan', name: '무안군' },
    { code: 'jeonnam-hampyeong', name: '함평군' },
    { code: 'jeonnam-yeonggwang', name: '영광군' },
    { code: 'jeonnam-jangseong', name: '장성군' },
    { code: 'jeonnam-wando', name: '완도군' },
    { code: 'jeonnam-jindo', name: '진도군' },
    { code: 'jeonnam-sinan', name: '신안군' },
  ],
  gyeongbuk: [
    { code: 'gyeongbuk-pohang', name: '포항시' },
    { code: 'gyeongbuk-gyeongju', name: '경주시' },
    { code: 'gyeongbuk-gimcheon', name: '김천시' },
    { code: 'gyeongbuk-andong', name: '안동시' },
    { code: 'gyeongbuk-gumi', name: '구미시' },
    { code: 'gyeongbuk-yeongju', name: '영주시' },
    { code: 'gyeongbuk-yeongcheon', name: '영천시' },
    { code: 'gyeongbuk-sangju', name: '상주시' },
    { code: 'gyeongbuk-mungyeong', name: '문경시' },
    { code: 'gyeongbuk-gyeongsan', name: '경산시' },
    { code: 'gyeongbuk-uiseong', name: '의성군' },
    { code: 'gyeongbuk-cheongsong', name: '청송군' },
    { code: 'gyeongbuk-yeongyang', name: '영양군' },
    { code: 'gyeongbuk-yeongdeok', name: '영덕군' },
    { code: 'gyeongbuk-cheongdo', name: '청도군' },
    { code: 'gyeongbuk-goryeong', name: '고령군' },
    { code: 'gyeongbuk-seongju', name: '성주군' },
    { code: 'gyeongbuk-chilgok', name: '칠곡군' },
    { code: 'gyeongbuk-yecheon', name: '예천군' },
    { code: 'gyeongbuk-bonghwa', name: '봉화군' },
    { code: 'gyeongbuk-uljin', name: '울진군' },
    { code: 'gyeongbuk-ulleung', name: '울릉군' },
  ],
  gyeongnam: [
    { code: 'gyeongnam-changwon', name: '창원시' },
    { code: 'gyeongnam-jinju', name: '진주시' },
    { code: 'gyeongnam-tongyeong', name: '통영시' },
    { code: 'gyeongnam-sacheon', name: '사천시' },
    { code: 'gyeongnam-gimhae', name: '김해시' },
    { code: 'gyeongnam-miryang', name: '밀양시' },
    { code: 'gyeongnam-geoje', name: '거제시' },
    { code: 'gyeongnam-yangsan', name: '양산시' },
    { code: 'gyeongnam-uiryeong', name: '의령군' },
    { code: 'gyeongnam-haman', name: '함안군' },
    { code: 'gyeongnam-changnyeong', name: '창녕군' },
    { code: 'gyeongnam-goseong', name: '고성군' },
    { code: 'gyeongnam-namhae', name: '남해군' },
    { code: 'gyeongnam-hadong', name: '하동군' },
    { code: 'gyeongnam-sancheong', name: '산청군' },
    { code: 'gyeongnam-hamyang', name: '함양군' },
    { code: 'gyeongnam-geochang', name: '거창군' },
    { code: 'gyeongnam-hapcheon', name: '합천군' },
  ],
  jeju: [
    { code: 'jeju-jeju', name: '제주시' },
    { code: 'jeju-seogwipo', name: '서귀포시' },
  ],
};

// 서비스 가능 지역 (하위 호환성 유지 - 서울 기준)
export const SERVICE_AREAS = DISTRICTS.seoul;

// 자격증 종류
export const CERTIFICATION_TYPES = [
  { code: 'nurse', name: '간호사' },
  { code: 'careWorker', name: '요양보호사' },
  { code: 'socialWorker', name: '사회복지사' },
  { code: 'nurseAide', name: '간호조무사' },
  { code: 'other', name: '기타' },
] as const;

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 10;

// 예약 관련 상수
export const RESERVATION_MIN_HOURS = 1;
export const RESERVATION_MAX_HOURS = 12;

// 예약 취소 정책
export const CANCELLATION_POLICY = {
  FREE_CANCELLATION_HOURS: 24, // 24시간 전까지 무료 취소
  CANCELLATION_FEE_RATE: 0.5, // 당일 취소 시 50% 수수료
} as const;

// 서비스 운영 시간
export const SERVICE_HOURS = {
  START: '07:00',
  END: '22:00',
} as const;

// 고객센터
export const CUSTOMER_SERVICE = {
  PHONE: '1588-0000',
  HOURS: '평일 09:00-18:00',
  KAKAO_HOURS: '09:00-21:00',
} as const;
