import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Briefcase, FileText, DollarSign, CreditCard, Calendar, ArrowLeft, CheckCircle, XCircle, QrCode, Download } from 'lucide-react';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, [id]);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      // Load employee data
      const employeeRes = await fetch(`http://localhost:5000/api/employees/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const employeeData = await employeeRes.json();
      setEmployee(employeeData);

      // Load QR code if it exists
      if (employeeData) {
        loadQRCode();
      }
    } catch (error) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadQRCode = async () => {
    try {
      const qrRes = await fetch(`http://localhost:5000/api/attendance/employee/${id}/qr-code`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        setQrCode(qrData.qrCode);
      }
    } catch (error) {
      console.log('QR code not available');
    }
  };

  const generateQRCode = async () => {
    setGeneratingQR(true);
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/employee/${id}/qr-code`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setQrCode(data.qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setGeneratingQR(false);
    }
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('fr-FR').format(salary);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <span className="ml-3 text-slate-600">Chargement des détails...</span>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
      {error}
    </div>
  );

  if (!employee) return (
    <div className="text-center py-12">
      <User size={48} className="mx-auto text-slate-300 mb-4" />
      <p className="text-slate-500">Aucun employé trouvé</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition mb-4"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">Détails de l'employé</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <User size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Informations personnelles</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar and Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{employee.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {employee.isActive ? (
                      <>
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Actif
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="text-red-500" />
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Inactif
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Poste</label>
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-slate-400" />
                      <span className="text-slate-800">{employee.position}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Type de contrat</label>
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" />
                      <span className="text-slate-800">{employee.contractType}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Salaire</label>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-500" />
                      <span className="text-2xl font-bold text-green-600">{formatSalary(employee.salary)} FCFA</span>
                    </div>
                  </div>

                  {employee.bankDetails && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Coordonnées bancaires</label>
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-slate-400" />
                        <span className="text-slate-800">{employee.bankDetails}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          {/* Dates Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Informations temporelles</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Créé le</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(employee.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Dernière modification</p>
                  <p className="text-sm font-medium text-slate-800">
                    {new Date(employee.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Code QR de présence</h3>
            <div className="text-center">
              {qrCode ? (
                <div className="space-y-4">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="mx-auto border-2 border-gray-200 rounded-lg"
                    style={{ maxWidth: '200px', width: '100%' }}
                  />
                  <p className="text-sm text-gray-600">
                    Ce code QR permet à l'employé de marquer sa présence chaque matin
                  </p>
                  <button
                    onClick={() => window.open(qrCode, '_blank')}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    <Download size={16} />
                    Télécharger
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode size={48} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Aucun code QR généré pour cet employé
                  </p>
                  <button
                    onClick={generateQRCode}
                    disabled={generatingQR}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingQR ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <QrCode size={16} />
                        Générer QR Code
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition">
                Modifier l'employé
              </button>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition">
                Voir les paiements
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
