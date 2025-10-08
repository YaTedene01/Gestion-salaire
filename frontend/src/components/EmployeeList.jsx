import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Edit, Trash2, DollarSign, Briefcase, FileText, Upload, QrCode, Eye } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import { employeeAPI } from '../utils/api';
import { useToast } from '../utils/useToast';
import ToastContainer from './ToastContainer';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [qrModal, setQrModal] = useState({ show: false, employee: null, qrCode: null });
  const [generatingQR, setGeneratingQR] = useState(false);
  const { toasts, success, error, removeToast } = useToast();
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeAPI.getAll();
        setEmployees(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des employés:', err);
        error('Erreur lors du chargement des employés');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAdd = (newEmp) => {
    console.log('Adding new employee to list:', newEmp);
    console.log('Current employees count:', employees.length);
    setEmployees([newEmp, ...employees]);
    console.log('New employees count after add:', employees.length + 1);
  };

  const handleImport = async () => {
    if (!importFile) return;
    try {
      setImportLoading(true);
      setImportMessage('');
      const response = await employeeAPI.import(importFile);
      setImportMessage(response.data.message);
      // Refresh the list
      const employeesResponse = await employeeAPI.getAll();
      setEmployees(employeesResponse.data);
      setImportFile(null);
    } catch (err) {
      console.error('Erreur lors de l\'import:', err);
      showError('Erreur lors de l\'import des employés');
    } finally {
      setImportLoading(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await employeeAPI.setActive(id, isActive);
      setEmployees(employees.map(e => e.id === id ? { ...e, isActive } : e));
    } catch (err) {
      console.error('Erreur lors de la modification du statut:', err);
      showError('Erreur lors de la modification du statut de l\'employé');
    }
  };

  const handleDelete = async (id) => {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    try {
      await employeeAPI.delete(id);
      setEmployees(employees.filter(e => e.id !== id));
      success(`Employé "${employee.fullName}" supprimé avec succès`);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      showError('Erreur lors de la suppression de l\'employé');
    }
  };

  const handleGenerateQR = async (employee) => {
    try {
      setGeneratingQR(true);
      const response = await employeeAPI.generateQRCode(employee.id);
      setQrModal({ show: true, employee, qrCode: response.data.qrCode });
    } catch (err) {
      console.error('Erreur lors de la génération du QR code:', err);
      showError('Erreur lors de la génération du QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleViewQR = async (employee) => {
    try {
      const response = await employeeAPI.getQRCode(employee.id);
      setQrModal({ show: true, employee, qrCode: response.data.qrCode });
    } catch (err) {
      console.error('Erreur lors de la récupération du QR code:', err);
      showError('Erreur lors de la récupération du QR code');
    }
  };

  const handleGenerateAllQRCodes = async () => {
    try {
      setGeneratingQR(true);
      const response = await employeeAPI.generateAllQRCodes();
      setImportMessage(response.data.message);
      // Refresh the list to show updated QR codes
      const employeesResponse = await employeeAPI.getAll();
      setEmployees(employeesResponse.data);
    } catch (err) {
      console.error('Erreur lors de la génération des QR codes:', err);
      showError('Erreur lors de la génération des QR codes');
    } finally {
      setGeneratingQR(false);
    }
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('fr-FR').format(salary);
  };

  return (
  <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Formulaire d'ajout et import seulement pour admin */}
      {userRole !== 'CASHIER' && (
        <>
          <EmployeeForm onAdd={handleAdd} />

          {/* Section d'import CSV */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden mb-8 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Importer des employés depuis un fichier CSV</h3>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={e => setImportFile(e.target.files[0])}
            className="flex-1 pl-4 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800"
          />
          <button
            onClick={handleImport}
            disabled={!importFile || importLoading}
            className="bg-gradient-to-r from-[var(--company-color)] to-[var(--company-color-dark)] text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Import...
              </>
            ) : (
              <>
                <Upload size={16} />
                Importer
              </>
            )}
          </button>
        </div>
        {importMessage && (
          <p className="mt-2 text-sm text-[var(--company-color)]">{importMessage}</p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Le fichier CSV doit contenir les colonnes: fullName, position, contractType (optionnel), salary, bankDetails (optionnel)
        </p>
      </div>

      {/* Section génération QR codes */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden mb-8 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Génération des QR Codes</h3>
        <p className="text-sm text-slate-600 mb-4">
          Générer des QR codes pour tous les employés actifs qui n'en ont pas encore.
        </p>
        <button
          onClick={handleGenerateAllQRCodes}
          disabled={generatingQR}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generatingQR ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Génération...
            </>
          ) : (
            <>
              <QrCode size={16} />
              Générer tous les QR codes
            </>
          )}
        </button>
      </div>
        </>
      )}

  <div className="bg-[var(--company-color-bg)] rounded-xl shadow-lg border border-[var(--company-color)] overflow-hidden">
  <div className="bg-[var(--company-color)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Users size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-black">Liste des employés</h2>
          </div>
        </div>


        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Chargement des employés...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--company-color-light)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">Employé</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Matricule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Poste</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contrat</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Salaire</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  {userRole !== 'CASHIER' && (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">QR Code</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--company-color)]">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-[var(--company-color-light)] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {emp.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{emp.fullName}</div>
                          {emp.bankDetails && (
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <DollarSign size={12} />
                              {emp.bankDetails}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-600">{emp.matricule || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-slate-400" />
                        <span className="text-slate-700">{emp.position}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="text-slate-700">{emp.contractType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-[var(--company-color)]" />
                        <span className="font-semibold text-slate-800">{formatSalary(emp.salary)} FCFA</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {emp.isActive ? (
                          <>
                            <UserCheck size={16} className="text-green-500" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Actif
                            </span>
                          </>
                        ) : (
                          <>
                            <UserX size={16} className="text-red-500" />
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Inactif
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    {userRole !== 'CASHIER' && (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {emp.qrCode ? (
                              <button
                                onClick={() => handleViewQR(emp)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Voir QR Code"
                              >
                                <Eye size={16} />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGenerateQR(emp)}
                                disabled={generatingQR}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                title="Générer QR Code"
                              >
                                <QrCode size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className={`p-2 rounded-lg transition ${
                                emp.isActive
                                  ? 'text-yellow-500 hover:bg-yellow-50'
                                  : 'text-green-500 hover:bg-green-50'
                              }`}
                              onClick={() => handleToggleActive(emp.id, !emp.isActive)}
                              title={emp.isActive ? 'Mettre en congé' : 'Réactiver'}
                            >
                              {emp.isActive ? (
                                <UserX size={16} />
                              ) : (
                                <UserCheck size={16} />
                              )}
                            </button>
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              onClick={() => alert('Modification à implémenter')}
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              onClick={() => handleDelete(emp.id)}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {employees.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Aucun employé trouvé</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-[var(--company-color)] px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">QR Code - {qrModal.employee?.fullName}</h3>
              <button
                onClick={() => setQrModal({ show: false, employee: null, qrCode: null })}
                className="text-white hover:bg-white/20 rounded-full p-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6 text-center">
              {qrModal.qrCode && (
                <div className="mb-4">
                  <img
                    src={qrModal.qrCode}
                    alt={`QR Code pour ${qrModal.employee?.fullName}`}
                    className="mx-auto border-2 border-gray-200 rounded-lg"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                </div>
              )}

              <div className="text-sm text-gray-600 mb-4">
                <p><strong>Employé:</strong> {qrModal.employee?.fullName}</p>
                <p><strong>Poste:</strong> {qrModal.employee?.position}</p>
                <p><strong>Matricule:</strong> {qrModal.employee?.id}</p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setQrModal({ show: false, employee: null, qrCode: null })}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrModal.qrCode;
                    link.download = `qr-code-${qrModal.employee?.fullName.replace(' ', '-')}.png`;
                    link.click();
                  }}
                  className="px-4 py-2 bg-[var(--company-color)] text-white rounded-lg hover:bg-[var(--company-color-dark)] transition"
                >
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default EmployeeList;
