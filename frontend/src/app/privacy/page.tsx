'use client';

import { Box, Container, Typography, Paper, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function PrivacyPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Breadcrumb
          items={[{ label: '개인정보처리방침' }]}
          showBackButton={true}
        />

        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          개인정보처리방침
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          최종 수정일: 2025년 1월 1일
        </Typography>

        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          {/* 서문 */}
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            스카이동행(이하 &quot;회사&quot;)은 이용자의 개인정보를 중요시하며,
            「개인정보 보호법」 등 관련 법령을 준수합니다. 본 개인정보처리방침을
            통해 이용자의 개인정보가 어떻게 수집, 이용, 보관, 파기되는지
            안내드립니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제1조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제1조 (수집하는 개인정보 항목)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
          </Typography>

          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>구분</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>수집 항목</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>수집 목적</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>필수 (공통)</TableCell>
                  <TableCell>이름, 휴대폰 번호, 이메일</TableCell>
                  <TableCell>회원 식별, 서비스 이용, 알림 발송</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>필수 (고객)</TableCell>
                  <TableCell>주소, 생년월일, 건강 관련 특이사항</TableCell>
                  <TableCell>서비스 예약 및 맞춤 서비스 제공</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>필수 (동행매니저)</TableCell>
                  <TableCell>실명, 생년월일, 계좌정보</TableCell>
                  <TableCell>본인 확인, 정산 처리</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>선택 (동행매니저)</TableCell>
                  <TableCell>자격증 사본, 경력 증빙 서류</TableCell>
                  <TableCell>자격 검증, 프로필 표시</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>자동 수집</TableCell>
                  <TableCell>IP 주소, 접속 기록, 기기 정보</TableCell>
                  <TableCell>서비스 개선, 부정 이용 방지</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          {/* 제2조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제2조 (개인정보의 수집 방법)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            회사는 다음과 같은 방법으로 개인정보를 수집합니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 회원가입, 서비스 예약 시 이용자의 직접 입력
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 동행매니저 등록 시 서류 제출
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 고객센터 상담 과정에서 수집
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 이용 과정에서 자동 생성 및 수집
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제3조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제3조 (개인정보의 이용 목적)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            수집된 개인정보는 다음 목적으로만 이용됩니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 회원 관리: 본인 확인, 가입 의사 확인, 연령 확인
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 제공: 예약 처리, 동행매니저 매칭, 결제 및 정산
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 고객 지원: 문의 응대, 불만 처리, 분쟁 해결
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 개선: 이용 통계 분석, 신규 서비스 개발
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 안전 관리: 부정 이용 방지, 보험 처리
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제4조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제4조 (개인정보의 보유 및 이용 기간)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이
            파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 아래와 같이
            보관합니다:
          </Typography>

          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>보존 항목</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>보존 기간</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>근거 법령</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>계약 또는 청약철회 기록</TableCell>
                  <TableCell>5년</TableCell>
                  <TableCell>전자상거래법</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>대금 결제 및 재화 공급 기록</TableCell>
                  <TableCell>5년</TableCell>
                  <TableCell>전자상거래법</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>소비자 불만 또는 분쟁처리 기록</TableCell>
                  <TableCell>3년</TableCell>
                  <TableCell>전자상거래법</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>서비스 이용 기록, 접속 로그</TableCell>
                  <TableCell>3개월</TableCell>
                  <TableCell>통신비밀보호법</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          {/* 제5조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제5조 (개인정보의 제3자 제공)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 이용자가 사전에 동의한 경우
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 제공을 위해 동행매니저에게 고객 정보 제공 (예약 정보,
              연락처)
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 법령에 따라 수사기관의 요청이 있는 경우
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 보험 사고 처리를 위해 보험사에 필요 정보 제공
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제6조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제6조 (개인정보 처리의 위탁)
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
            회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를
            위탁합니다:
          </Typography>

          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>수탁업체</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>위탁 업무</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>토스페이먼츠</TableCell>
                  <TableCell>결제 처리</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Amazon Web Services</TableCell>
                  <TableCell>데이터 저장 및 서버 운영</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>카카오</TableCell>
                  <TableCell>소셜 로그인, 알림톡 발송</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          {/* 제7조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제7조 (이용자의 권리 및 행사 방법)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            이용자는 다음과 같은 권리를 행사할 수 있습니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 개인정보 열람 요청
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 개인정보 정정·삭제 요청
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 개인정보 처리 정지 요청
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 동의 철회 및 회원 탈퇴
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            위 권리 행사는 마이페이지 또는 고객센터(help@skydonghang.kr)를 통해
            요청할 수 있으며, 회사는 지체 없이 조치합니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제8조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제8조 (개인정보의 파기)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 파기 절차: 개인정보는 목적 달성 후 별도 DB로 옮겨져 일정 기간 보관
            후 파기됩니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 파기 방법:
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 전자적 파일: 복구 불가능한 방법으로 영구 삭제
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 종이 문서: 분쇄 또는 소각
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제9조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제9조 (민감정보 및 고유식별정보의 처리)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 회사는 원칙적으로 민감정보(건강정보 등)를 수집하지 않습니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 다만, 서비스 특성상 고객이 자발적으로 제공하는 건강 관련 정보(증상,
            병력 등)는 서비스 제공 목적으로만 사용되며, 동행매니저에게 필요
            범위 내에서만 공유됩니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            3. 동행매니저의 자격증 사본은 본인 동의 하에 수집되며, 자격 검증
            목적으로만 사용됩니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제10조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제10조 (개인정보 보호책임자)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            회사는 개인정보 처리에 관한 업무를 총괄하는 개인정보 보호책임자를
            지정하고 있습니다:
          </Typography>
          <Box
            sx={{
              bgcolor: 'grey.50',
              p: 2,
              borderRadius: 1,
              mb: 3,
            }}
          >
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>개인정보 보호책임자</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              이메일: privacy@skydonghang.kr
            </Typography>
            <Typography variant="body2">전화: 1588-0000</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제11조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제11조 (개인정보의 안전성 확보 조치)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취합니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 개인정보 취급 직원의 최소화 및 교육
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 개인정보 암호화 (비밀번호, 주민번호 등)
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 해킹 등에 대비한 보안 시스템 운영
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 접근 권한 관리 및 접근 기록 보관
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제12조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제12조 (개인정보처리방침의 변경)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 본 개인정보처리방침은 법령, 정책 또는 보안 기술의 변경에 따라
            수정될 수 있습니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 변경 시 시행일 7일 전부터 서비스 내 공지하며, 중요한 변경의 경우
            이메일 등으로 개별 통지합니다.
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            3. 본 방침은 2025년 1월 1일부터 시행됩니다.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
