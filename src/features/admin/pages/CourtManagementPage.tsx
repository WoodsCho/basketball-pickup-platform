/**
 * 코트 관리 페이지 (관리자 전용)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, MapPin, DollarSign } from 'lucide-react';
import { useAllCourts } from '../hooks/useAdmin';
import { adminService } from '../services/adminService';
import Button from '@/shared/components/Button';
import type { Court, CourtType, CourtSize } from '@/shared/types';

export default function CourtManagementPage() {
  const navigate = useNavigate();
  const { courts, loading, refetch } = useAllCourts();
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 37.5665,
    lng: 126.9780,
    courtType: 'INDOOR' as CourtType,
    courtSize: 'BOTH' as CourtSize,
    floor: '우레탄',
    facilities: [] as string[],
    isPartner: false,
    hasAICamera: false,
    pricePerHour: 50000,
  });

  const facilityOptions = [
    '샤워실',
    '주차장',
    '탈의실',
    '음수대',
    '매점',
    '에어컨',
    '와이파이',
  ];

  const handleOpenModal = (court?: Court) => {
    if (court) {
      setEditingCourt(court);
      setFormData({
        name: court.name,
        address: court.address,
        lat: court.lat,
        lng: court.lng,
        courtType: court.courtType || 'INDOOR',
        courtSize: court.courtSize || 'BOTH',
        floor: court.floor || '우레탄',
        facilities: court.facilities || [],
        isPartner: court.isPartner || false,
        hasAICamera: court.hasAICamera || false,
        pricePerHour: court.pricePerHour,
      });
    } else {
      setEditingCourt(null);
      setFormData({
        name: '',
        address: '',
        lat: 37.5665,
        lng: 126.9780,
        courtType: 'INDOOR',
        courtSize: 'BOTH',
        floor: '우레탄',
        facilities: [],
        isPartner: false,
        hasAICamera: false,
        pricePerHour: 50000,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourt(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCourt) {
        // 수정
        await adminService.updateCourt(editingCourt.id, formData);
        alert('코트 정보가 수정되었습니다.');
      } else {
        // 추가
        await adminService.createCourt(formData);
        alert('새 코트가 추가되었습니다.');
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Failed to save court:', error);
      alert('코트 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (courtId: string, courtName: string) => {
    if (!confirm(`"${courtName}" 코트를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const success = await adminService.deleteCourt(courtId);
      if (success) {
        alert('코트가 삭제되었습니다.');
        refetch();
      } else {
        alert('코트 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete court:', error);
      alert('코트 삭제 중 오류가 발생했습니다.');
    }
  };

  const toggleFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">코트 관리</h1>
            </div>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4 mr-1" />
              코트 추가
            </Button>
          </div>
        </div>
      </div>

      {/* Court List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {courts.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">등록된 코트가 없습니다.</p>
            <Button onClick={() => handleOpenModal()} className="mt-4">
              첫 번째 코트 추가하기
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courts.map((court: Court) => (
              <div key={court.id} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{court.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{court.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(court)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(court.id, court.name)}
                      className="p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">타입:</span>
                    <span className="font-medium">
                      {court.courtType === 'INDOOR' ? '🏠 실내' : '🌳 실외'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">크기:</span>
                    <span className="font-medium">
                      {court.courtSize === 'THREE_V_THREE' && '3v3'}
                      {court.courtSize === 'FIVE_V_FIVE' && '5v5'}
                      {court.courtSize === 'BOTH' && '3v3 & 5v5'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">
                      {court.pricePerHour.toLocaleString()}원/시간
                    </span>
                  </div>
                  {court.facilities && court.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {court.facilities.map((facility) => (
                        <span
                          key={facility}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  )}
                  {court.isPartner && (
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                      🤝 파트너 코트
                    </span>
                  )}
                  {court.hasAICamera && (
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium ml-1">
                      📹 AI 카메라
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h2 className="text-xl font-bold">
                {editingCourt ? '코트 수정' : '코트 추가'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div>
                <h3 className="font-bold mb-3">기본 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      코트 이름
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="예: 강남 스포츠센터"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주소
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="서울시 강남구..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        위도
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        경도
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 코트 정보 */}
              <div>
                <h3 className="font-bold mb-3">코트 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      코트 타입
                    </label>
                    <select
                      value={formData.courtType}
                      onChange={(e) => setFormData({ ...formData, courtType: e.target.value as CourtType })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="INDOOR">실내</option>
                      <option value="OUTDOOR">실외</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      코트 크기
                    </label>
                    <select
                      value={formData.courtSize}
                      onChange={(e) => setFormData({ ...formData, courtSize: e.target.value as CourtSize })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="THREE_V_THREE">3v3</option>
                      <option value="FIVE_V_FIVE">5v5</option>
                      <option value="BOTH">3v3 & 5v5</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      바닥 재질
                    </label>
                    <input
                      type="text"
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                      placeholder="우레탄, 마루 등"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시간당 대관료 (원)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({ ...formData, pricePerHour: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 시설 */}
              <div>
                <h3 className="font-bold mb-3">시설</h3>
                <div className="flex flex-wrap gap-2">
                  {facilityOptions.map((facility) => (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleFacility(facility)}
                      className={`px-4 py-2 rounded-lg border-2 transition ${
                        formData.facilities.includes(facility)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {facility}
                    </button>
                  ))}
                </div>
              </div>

              {/* 특수 옵션 */}
              <div>
                <h3 className="font-bold mb-3">특수 옵션</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPartner}
                      onChange={(e) => setFormData({ ...formData, isPartner: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">파트너 코트</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasAICamera}
                      onChange={(e) => setFormData({ ...formData, hasAICamera: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">AI 카메라 구장</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  취소
                </Button>
                <Button type="submit" className="flex-1">
                  {editingCourt ? '수정하기' : '추가하기'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
