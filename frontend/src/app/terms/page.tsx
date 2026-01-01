'use client';

import { Box, Container, Typography, Paper, Divider } from '@mui/material';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function TermsPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Breadcrumb
          items={[{ label: '이용약관' }]}
          showBackButton={true}
        />

        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          이용약관
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          최종 수정일: 2025년 1월 1일
        </Typography>

        <Paper sx={{ p: { xs: 3, md: 4 } }}>
          {/* 제1조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제1조 (목적)
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            본 약관은 스카이동행(이하 &quot;회사&quot;)이 운영하는 병원동행 서비스 플랫폼(이하
            &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항,
            기타 필요한 사항을 규정함을 목적으로 합니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제2조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제2조 (정의)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. &quot;서비스&quot;란 회사가 제공하는 병원동행 매칭 플랫폼을 의미합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. &quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 고객 및 동행매니저를
            의미합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            3. &quot;고객&quot;이란 병원동행 서비스를 예약하고 이용하는 자를 의미합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            4. &quot;동행매니저&quot;란 고객에게 병원동행 서비스를 제공하는 자를 의미합니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제3조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제3조 (서비스의 내용 및 범위)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 회사가 제공하는 서비스는 다음과 같습니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 풀케어: 자택 픽업 → 병원 동행 → 진료/검사 → 약국 → 귀가
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 병원케어: 병원 내 만남 → 진료 동행 → 수납/약 수령
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 특화케어: 건강검진, 항암치료, 수술/입퇴원, 응급실 등
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 본 서비스는 &quot;의료행위&quot;가 아니며, 동행매니저는 의료인이 아닙니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            3. 동행매니저는 다음 행위를 수행하지 않습니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 의료 진단, 처방, 치료 행위
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 주사, 투약 등 의료 보조 행위
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 간병, 요양 서비스 (별도 계약 필요)
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 의료적 판단이 필요한 응급 상황 대응 (119 신고 제외)
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제4조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제4조 (이용계약의 성립)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 이용계약은 이용자가 본 약관에 동의하고 회원가입을 완료한 시점에 성립됩니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            2. 회사는 다음 각 호에 해당하는 경우 가입을 거절할 수 있습니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 타인의 명의를 도용한 경우
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 허위 정보를 기재한 경우
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 기타 회사가 정한 가입 요건을 충족하지 않은 경우
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제5조 - 고객 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제5조 (고객의 의무)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 고객은 예약 시 정확한 정보(건강 상태, 이동 가능 여부, 특이사항 등)를
            제공해야 합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 고객은 서비스 이용 중 동행매니저에게 의료행위를 요구해서는 안 됩니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            3. 고객은 예약 취소 시 회사가 정한 취소 정책을 준수해야 합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            4. 고객은 서비스 이용 중 발생하는 본인의 의료비, 교통비, 식비 등을 부담합니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제6조 - 동행매니저 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제6조 (동행매니저의 의무)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 동행매니저는 회사가 정한 서비스 가이드라인을 준수해야 합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 동행매니저는 고객의 개인정보 및 건강정보를 보호해야 하며, 서비스 목적
            외 사용을 금지합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            3. 동행매니저는 의료행위를 수행해서는 안 됩니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            4. 동행매니저는 서비스 중 고객에게 물품 판매, 종교 권유, 정치 활동 등을
            해서는 안 됩니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            5. 동행매니저는 회사를 통하지 않은 직접 거래를 해서는 안 됩니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제7조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제7조 (책임의 제한)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 회사는 고객과 동행매니저 간의 매칭 플랫폼을 제공하며, 서비스 수행
            과정에서 발생하는 문제에 대해 중재 역할을 수행합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 회사는 다음 사항에 대해 책임을 지지 않습니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 고객의 기저질환 또는 건강 상태로 인한 문제
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 고객이 정확한 정보를 제공하지 않아 발생한 문제
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 병원, 의료진의 진료 결과 또는 의료 사고
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 천재지변, 교통사고 등 불가항력적 상황
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            3. 회사는 플랫폼 운영자로서 일반 배상책임보험에 가입하여 서비스 중 발생할
            수 있는 사고에 대비합니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제8조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제8조 (결제 및 환불)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 서비스 요금은 예약 확정 시 결제되며, 결제 방법은 회사가 정한 바에
            따릅니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 취소 및 환불 정책:
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 24시간 전 취소: 전액 환불
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 12시간 전 취소: 50% 환불
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 당일 취소 또는 노쇼: 환불 불가
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제9조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제9조 (보험 및 안전)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 회사는 서비스 이용 중 발생할 수 있는 사고에 대비하여 플랫폼
            배상책임보험에 가입합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 보험 보장 범위:
          </Typography>
          <Box sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 수행 중 고객에게 발생한 신체적 상해
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 수행 중 고객 재산의 손실 또는 파손
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            3. 보험 적용을 위해 고객은 서비스 예약 시 정확한 정보를 제공해야 하며,
            허위 정보 제공 시 보험 적용이 제한될 수 있습니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제10조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제10조 (서비스 이용 제한)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            회사는 다음 각 호에 해당하는 경우 서비스 이용을 제한할 수 있습니다:
          </Typography>
          <Box sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 타인의 명의를 도용하거나 허위 정보를 제공한 경우
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 동행매니저 또는 고객에게 폭언, 폭행, 성희롱 등을 한 경우
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 서비스 운영을 방해하거나 회사의 명예를 훼손한 경우
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.8 }}>
              • 기타 본 약관을 위반한 경우
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* 제11조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제11조 (분쟁 해결)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 이용자는 원만한
            해결을 위해 성실히 협의합니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 협의가 이루어지지 않을 경우, 관련 법령에 따른 분쟁 조정 절차를 이용할
            수 있습니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
            3. 본 약관에 관한 소송은 회사의 본사 소재지를 관할하는 법원을
            전속관할로 합니다.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* 제12조 */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            제12조 (약관의 변경)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            1. 회사는 필요한 경우 관련 법령을 위반하지 않는 범위 내에서 본 약관을
            변경할 수 있습니다.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.8 }}>
            2. 약관 변경 시 시행일 7일 전부터 서비스 내 공지하며, 이용자에게 불리한
            변경의 경우 30일 전에 공지합니다.
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            3. 이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고
            탈퇴할 수 있습니다.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  );
}
