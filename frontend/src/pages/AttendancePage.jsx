import React, { useState, useEffect } from 'react';
import { Camera, Users, Calendar, Clock, CheckCircle, AlertCircle, UserCheck, X } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import api from '../utils/api';
import { useToast } from '../utils/useToast';

const AttendancePage = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeStats, setEmployeeStats] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  // Load attendance data
  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      // Load today's attendance
      const attendanceResponse = await api.get(`/attendance/company?date=${selectedDate}`);

      // Ensure we have an array
      const attendanceData = Array.isArray(attendanceResponse.data) ? attendanceResponse.data : [];
      setAttendanceRecords(attendanceData);

      // Calculate stats
      const present = attendanceData.filter(a => a.status === 'PRESENT').length;
      const late = attendanceData.filter(a => a.status === 'LATE').length;
      const totalEmployees = await getTotalEmployees();

      setStats({
        totalEmployees,
        presentToday: present,
        lateToday: late,
        absentToday: totalEmployees - present - late
      });
    } catch (error) {
      console.error('Error loading attendance data:', error);
      showErrorToast('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getTotalEmployees = async () => {
    try {
      const response = await api.get('/employees');
      const employees = response.data || [];
      return Array.isArray(employees) ? employees.filter(emp => emp.isActive).length : 0;
    } catch (error) {
      console.error('Error getting employee count:', error);
      return 0;
    }
  };

  const handleQRScan = async (qrData) => {
    try {
      const response = await api.post('/attendance/scan', { qrData });

      if (response.data && response.data.success) {
        showSuccessToast(response.data.message || 'Présence enregistrée avec succès');
        loadAttendanceData(); // Refresh data
        return { success: true };
      } else {
        showErrorToast((response.data && response.data.error) || 'Erreur lors de l\'enregistrement');
        return { success: false, error: (response.data && response.data.error) || 'Erreur inconnue' };
      }
    } catch (error) {
      console.error('Scan error:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors du scan';
      showErrorToast(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleEmployeeClick = async (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);

    try {
      // Get current month date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];

      // Get employee's attendance summary for the current month
      const response = await api.get(`/attendance/employee/${employee.id}?startDate=${startDate}&endDate=${endDate}`);
      const attendanceRecords = response.data || [];

      // Calculate statistics
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT').length;
      const lateDays = attendanceRecords.filter(a => a.status === 'LATE').length;
      const absentDays = attendanceRecords.filter(a => a.status === 'ABSENT').length;

      setEmployeeStats({
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        attendanceRate: totalDays > 0 ? ((presentDays + lateDays) / totalDays * 100).toFixed(1) : 0,
        records: attendanceRecords.slice(-10) // Last 10 records
      });
    } catch (error) {
      console.error('Error loading employee stats:', error);
      showErrorToast('Erreur lors du chargement des statistiques');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'LATE':
        return <Clock size={16} className="text-yellow-500" />;
      case 'ABSENT':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl bg-[var(--company-color-bg)] rounded-xl shadow-lg border border-[var(--company-color)] overflow-hidden mb-8 mx-auto">
        <div className="bg-[var(--company-color)] px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <UserCheck size={24} className="text-white" />
              <h1 className="text-2xl font-bold text-white">Gestion des Présences</h1>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowScanner(true)}
              className="bg-white text-[var(--company-color)] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
            >
              <Camera size={20} />
              Scanner QR
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 flex flex-col items-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full max-w-4xl">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Total Employés</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-sm font-medium text-gray-600">Présents</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.presentToday}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-yellow-500" />
                <span className="text-sm font-medium text-gray-600">En Retard</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.lateToday}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                <span className="text-sm font-medium text-gray-600">Absents</span>
              </div>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.absentToday}</p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center justify-center gap-4 w-full">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-[var(--company-color)] focus:ring-1 focus:ring-[var(--company-color)]"
            />
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mx-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-center">
          <h2 className="text-lg font-semibold text-gray-900 text-center">Registres du {new Date(selectedDate).toLocaleDateString('fr-FR')}</h2>
        </div>

        <div className="overflow-x-auto flex justify-center">
          {loading ? (
            <div className="text-center py-12 w-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--company-color)] mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement...</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-12 w-full">
              <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucune présence enregistrée pour cette date</p>
            </div>
          ) : (
            <table className="w-full max-w-6xl">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heure d'arrivée
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEmployeeClick(record.employee)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {record.employee?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.employee?.fullName || 'Employé inconnu'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Matricule: {record.employee?.id || 'N/A'} • {record.employee?.position || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status === 'PRESENT' ? 'Présent' :
                         record.status === 'LATE' ? 'En retard' :
                         record.status === 'ABSENT' ? 'Absent' : record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {record.checkInTime ? formatTime(record.checkInTime) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Employee Statistics Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[var(--company-color)] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <span className="text-lg font-bold text-[var(--company-color)]">
                    {selectedEmployee.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedEmployee.fullName}</h2>
                  <p className="text-white/80 text-sm">Matricule: {selectedEmployee.id} • {selectedEmployee.position}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEmployeeModal(false);
                  setSelectedEmployee(null);
                  setEmployeeStats(null);
                }}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {employeeStats ? (
                <>
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">Total Jours</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{employeeStats.totalDays}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-500" />
                        <span className="text-sm font-medium text-green-700">Présences</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900 mt-1">{employeeStats.presentDays}</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <Clock size={20} className="text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700">Retards</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-900 mt-1">{employeeStats.lateDays}</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-500" />
                        <span className="text-sm font-medium text-red-700">Absences</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900 mt-1">{employeeStats.absentDays}</p>
                    </div>
                  </div>

                  {/* Attendance Rate */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">Taux de présence</span>
                      <span className="text-2xl font-bold text-[var(--company-color)]">{employeeStats.attendanceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-[var(--company-color)] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${employeeStats.attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Recent Records */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Derniers enregistrements</h3>
                    {employeeStats.records.length > 0 ? (
                      <div className="space-y-2">
                        {employeeStats.records.map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(record.status)}
                              <span className="text-sm font-medium text-gray-900">
                                {new Date(record.date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {record.checkInTime && (
                                <span className="text-sm text-gray-600">
                                  {formatTime(record.checkInTime)}
                                </span>
                              )}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                                {record.status === 'PRESENT' ? 'Présent' :
                                 record.status === 'LATE' ? 'Retard' :
                                 record.status === 'ABSENT' ? 'Absent' : record.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucun enregistrement récent</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--company-color)] mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des statistiques...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default AttendancePage;