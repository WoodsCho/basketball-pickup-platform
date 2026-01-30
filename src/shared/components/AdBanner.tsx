import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BannerItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  backgroundColor: string;
}

interface AdBannerProps {
  banners?: BannerItem[];
  autoSlide?: boolean;
  interval?: number;
}

const defaultBanners: BannerItem[] = [
  {
    id: '1',
    title: '🏀 농구 용품 특가 세일!',
    description: '프리미엄 농구화부터 유니폼까지 최대 50% 할인',
    linkUrl: 'https://example.com',
    backgroundColor: 'bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-600'
  },
  {
    id: '2',
    title: '⭐ 신규 회원 혜택',
    description: '지금 가입하고 첫 달 무료 이용권 받아가세요',
    linkUrl: 'https://example.com',
    backgroundColor: 'bg-gradient-to-r from-black to-gray-800 dark:from-gray-700 dark:to-gray-500'
  },
  {
    id: '3',
    title: '🎯 팀 매칭 이벤트',
    description: '이번 주 매칭 성사 시 기프티콘 증정',
    linkUrl: 'https://example.com',
    backgroundColor: 'bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-600 dark:to-gray-400'
  }
];

export default function AdBanner({
  banners = defaultBanners,
  autoSlide = true,
  interval = 5000
}: AdBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoSlide) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoSlide, interval, banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative group">
      {/* 배너 컨텐츠 */}
      <a
        href={currentBanner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className={`relative ${currentBanner.backgroundColor} rounded-lg overflow-hidden shadow-lg transition-all duration-500`}>
          <div className="flex items-center justify-between p-4 md:p-6">
            <div className="flex items-center gap-4 flex-1">
              {currentBanner.imageUrl && (
                <img
                  src={currentBanner.imageUrl}
                  alt="광고"
                  className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg md:text-xl mb-1">
                  {currentBanner.title}
                </h3>
                <p className="text-gray-200 text-sm md:text-base">
                  {currentBanner.description}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 ml-4">
              <span className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition">
                자세히 보기 →
              </span>
            </div>
          </div>
        </div>
      </a>

      {/* 이전/다음 버튼 */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToPrevious();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition opacity-0 group-hover:opacity-100"
            aria-label="이전 배너"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition opacity-0 group-hover:opacity-100"
            aria-label="다음 배너"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`${index + 1}번 배너로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
