import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Briefcase, FileText, DollarSign, CreditCard, Calendar, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/employees/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setEmployee(data))
      .catch(() => setError('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, [id]);

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
