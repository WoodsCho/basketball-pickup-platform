import { useState } from 'react';
import { MapPin, Search, X, ExternalLink } from 'lucide-react';
import { Button, Input, Card } from '@/shared/components';

interface Place {
  id: string;
  name: string;
  address: string;
  roadAddress?: string;
  lat: number;
  lng: number;
  link?: string; // 네이버 장소 상세 페이지 URL
  category?: string; // 카테고리 정보
}

interface NaverMapPickerProps {
  onSelect: (place: Place) => void;
  onClose?: () => void;
  selectedPlace?: Place;
}

export default function NaverMapPicker({ onSelect, onClose, selectedPlace }: NaverMapPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  // 네이버 검색 API를 사용한 장소 검색
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Lambda를 통해 네이버 검색 API (Local) 호출
      const apiUrl = import.meta.env.VITE_LAMBDA_API_URL;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'searchPlace',
          query: searchQuery
        })
      });

      const data = await response.json();
      
      if (data.places && data.places.length > 0) {
        setSearchResults(data.places);
      } else {
        setSearchResults([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-black dark:text-white" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">체육관 위치 선택</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="체육관 이름이나 주소를 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>
          {selectedPlace && (
            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">선택됨: {selectedPlace.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedPlace.address}</p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">검색 중...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? '검색 결과가 없습니다' : '체육관을 검색해보세요'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchResults.map((place) => (
                <div
                  key={place.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-black dark:text-white flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">{place.name}</h3>
                      {place.category && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          {place.category}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {place.roadAddress || place.address}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onSelect(place)}
                          className="flex-1 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition text-sm font-medium"
                        >
                          이 장소 선택
                        </button>
                        <a
                          href={`https://map.naver.com/v5/search/${encodeURIComponent(place.name + ' ' + (place.roadAddress || place.address))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                          지도보기
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 정확한 위치를 검색하면 팀원들이 쉽게 찾을 수 있어요
          </p>
        </div>
      </Card>
    </div>
  );
}
