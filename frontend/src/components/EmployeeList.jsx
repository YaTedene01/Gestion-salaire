import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Edit, Trash2, DollarSign, Briefcase, FileText } from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import { employeeAPI } from '../utils/api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await employeeAPI.getAll();
        setEmployees(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des employés:', err);
        setError('Erreur lors du chargement des employés');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAdd = (newEmp) => {
    setEmployees([newEmp, ...employees]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;
    try {
      await employeeAPI.delete(id);
      setEmployees(employees.filter(e => e.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de l\'employé');
    }
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('fr-FR').format(salary);
  };

  return (
  <div className="max-w-3xl mx-auto py-8 px-4">
      <EmployeeForm onAdd={handleAdd} />

  <div className="bg-[#e6faef] rounded-xl shadow-lg border border-[#22c55e] overflow-hidden">
  <div className="bg-[#22c55e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Users size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-black">Liste des employés</h2>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">Chargement des employés...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#22c55e]/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-black">Employé</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Poste</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contrat</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Salaire</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22c55e]">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-[#22c55e]/20 transition">
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
                        <DollarSign size={16} className="text-green-500" />
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
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
    </div>
  );
};

export default EmployeeList;
