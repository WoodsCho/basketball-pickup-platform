/**
 * Admin Dashboard Page
 * 관리자 대시보드
 */
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, Activity } from 'lucide-react';
import { Card, AdminModeToggle, ThemeToggle } from '@/shared/components';
import { useAdminStatistics, useAllUsers } from '../hooks/useAdmin';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { statistics, loading: statsLoading } = useAdminStatistics();
  const { users, loading: usersLoading } = useAllUsers();

  const stats = [
    {
      icon: Users,
      label: '전체 사용자',
      value: statistics.totalUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Calendar,
      label: '전체 매치',
      value: statistics.totalMatches,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Activity,
      label: '진행 중인 매치',
      value: statistics.activeMatches,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: MapPin,
      label: '등록된 코트',
      value: statistics.totalCourts,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  // 최근 가입 사용자
  const recentUsers = users
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">관리자 대시보드</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">플랫폼 전체 현황을 관리합니다</p>
            </div>
            <div className="flex items-center gap-2">
              <AdminModeToggle />
              <ThemeToggle />
              <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-sm font-medium">
                관리자 모드
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">통계 개요</h2>
          
          {statsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recent Users */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">최근 가입 사용자</h2>
            <button className="text-primary-600 text-sm hover:underline">
              전체보기
            </button>
          </div>

          {usersLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이름
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이메일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        레벨
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        포지션
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        역할
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가입일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.level}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.position}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'ADMIN'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role || 'USER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover className="p-6 cursor-pointer">
              <div className="text-center">
                <Users className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">사용자 관리</h3>
                <p className="text-sm text-gray-600">사용자 목록 및 권한 관리</p>
              </div>
            </Card>
            
            <Card hover className="p-6 cursor-pointer">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">매치 관리</h3>
                <p className="text-sm text-gray-600">진행 중인 매치 관리</p>
              </div>
            </Card>
            
            <Card hover className="p-6 cursor-pointer" onClick={() => navigate('/admin/courts')}>
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">코트 관리</h3>
                <p className="text-sm text-gray-600">농구장 정보 관리</p>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
