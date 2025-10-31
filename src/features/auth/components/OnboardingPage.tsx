import { useState } from 'react';
import { Button, Input, Card } from '@/shared/components';
import { authService } from '../services/authService';

interface OnboardingPageProps {
  cognitoUser: any;
  onComplete: (profile: any) => void;
}

export default function OnboardingPage({ cognitoUser, onComplete }: OnboardingPageProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    position: 'ALL_ROUND' as const,
    level: 1500,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // User 테이블에 프로필 생성
      const newProfile = await authService.createUserProfile({
        id: cognitoUser.userId,
        email: cognitoUser.signInDetails?.loginId || '',
        name: formData.name,
        phone: formData.phone,
        position: formData.position,
        level: formData.level,
        totalMatches: 0,
        totalRating: 0,
        attendanceRate: 100,
        noShowCount: 0,
      });

      if (newProfile) {
        onComplete(newProfile);
      } else {
        throw new Error('프로필 생성 실패');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('프로필 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <span className="text-6xl mb-4 block">🏀</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            환영합니다!
          </h1>
          <p className="text-gray-600">
            농구 프로필을 설정해주세요
          </p>
        </div>

        {/* Step 표시 */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
            step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
            step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
            step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            3
          </div>
        </div>

        {/* Step 1: 기본 정보 */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="이름"
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="전화번호"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Button
              fullWidth
              onClick={() => setStep(2)}
              disabled={!formData.name || !formData.phone}
            >
              다음
            </Button>
          </div>
        )}

        {/* Step 2: 포지션 선택 */}
        {step === 2 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              주 포지션
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'GUARD', label: '가드', emoji: '🎯' },
                { value: 'FORWARD', label: '포워드', emoji: '⚡' },
                { value: 'CENTER', label: '센터', emoji: '🏔️' },
                { value: 'ALL_ROUND', label: '올라운드', emoji: '🌟' },
              ].map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setFormData({ ...formData, position: pos.value as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.position === pos.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{pos.emoji}</div>
                  <div className="font-medium">{pos.label}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(1)} fullWidth>
                이전
              </Button>
              <Button onClick={() => setStep(3)} fullWidth>
                다음
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: 레벨 선택 */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              실력 레벨
            </label>
            
            {/* 레벨 슬라이더 */}
            <div className="px-2">
              <input
                type="range"
                min="1000"
                max="3000"
                step="100"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>초급</span>
                <span>중급</span>
                <span>상급</span>
                <span>프로</span>
              </div>
            </div>

            {/* 현재 레벨 표시 */}
            <div className="text-center p-6 bg-primary-50 rounded-lg">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {formData.level}
              </div>
              <div className="text-sm text-gray-600">
                {formData.level < 1500 && '초급 - 농구를 시작한 단계'}
                {formData.level >= 1500 && formData.level < 2000 && '중급 - 기본기가 탄탄한 단계'}
                {formData.level >= 2000 && formData.level < 2500 && '상급 - 실력이 뛰어난 단계'}
                {formData.level >= 2500 && '프로 - 최상위 실력'}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(2)} fullWidth>
                이전
              </Button>
              <Button
                onClick={handleSubmit}
                fullWidth
                isLoading={loading}
              >
                완료
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
