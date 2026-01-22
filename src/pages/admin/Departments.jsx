import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Power,
  Copy,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Departments = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    username: '',
    password: '',
    email: '',
    hodName: '',
    phone: '',
  });

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Generate username from department code
  const generateUsername = (code) => {
    return `dept_${code.toLowerCase().replace(/\s+/g, '_')}`;
  };

  useEffect(() => {
    // Set up real-time listener for departments
    const departmentsRef = collection(db, 'departments');
    const unsubscribe = onSnapshot(departmentsRef, (snapshot) => {
      const deptData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      deptData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date();
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date();
        return dateB - dateA;
      });
      setDepartments(deptData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter departments
  useEffect(() => {
    let filtered = [...departments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.name?.toLowerCase().includes(term) ||
        d.code?.toLowerCase().includes(term) ||
        d.username?.toLowerCase().includes(term)
      );
    }

    setFilteredDepartments(filtered);
  }, [departments, searchTerm]);

  const openCreateModal = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      code: '',
      username: '',
      password: generatePassword(),
      email: '',
      hodName: '',
      phone: '',
    });
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name || '',
      code: dept.code || '',
      username: dept.username || '',
      password: dept.password || '',
      email: dept.email || '',
      hodName: dept.hodName || '',
      phone: dept.phone || '',
    });
    setShowModal(true);
  };

  const handleCodeChange = (code) => {
    setFormData({
      ...formData,
      code: code.toUpperCase(),
      username: generateUsername(code),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.code.trim() || !formData.username.trim() || !formData.password.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const departmentData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        email: formData.email.trim() || null,
        hodName: formData.hodName.trim() || null,
        phone: formData.phone.trim() || null,
        isActive: true,
        updatedAt: serverTimestamp(),
      };

      if (editingDepartment) {
        await updateDoc(doc(db, 'departments', editingDepartment.id), departmentData);
        toast.success('Department updated successfully');
      } else {
        await addDoc(collection(db, 'departments'), {
          ...departmentData,
          createdAt: serverTimestamp(),
        });
        toast.success('Department created successfully');
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDepartmentStatus = async (dept) => {
    try {
      await updateDoc(doc(db, 'departments', dept.id), {
        isActive: !dept.isActive,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Department ${dept.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update department status');
    }
  };

  const deleteDepartment = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete "${dept.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'departments', dept.id));
      toast.success('Department deleted successfully');
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };

  const copyCredentials = (dept) => {
    const credentials = `Department: ${dept.name}\nUsername: ${dept.username}\nPassword: ${dept.password}`;
    navigator.clipboard.writeText(credentials);
    toast.success('Credentials copied to clipboard');
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '0.875rem',
    color: '#1E293B',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1E293B',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '3px solid #E2E8F0',
          borderTopColor: '#E91E63',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem 0' }}>
              Department Management
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              Create and manage department accounts
            </p>
          </div>
          <button
            onClick={openCreateModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              backgroundColor: '#E91E63',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
            Add Department
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ ...cardStyle, borderLeft: '4px solid #3B82F6' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Total Departments</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>{departments.length}</p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #10B981' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Active</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {departments.filter(d => d.isActive).length}
          </p>
        </div>
        <div style={{ ...cardStyle, borderLeft: '4px solid #EF4444' }}>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Inactive</p>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            {departments.filter(d => !d.isActive).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '1.25rem',
            height: '1.25rem',
            color: '#64748B',
          }} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...inputStyle,
              paddingLeft: '2.75rem',
            }}
          />
        </div>
      </div>

      {/* Departments List */}
      {filteredDepartments.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '3rem' }}>
          <Building2 style={{ width: '3rem', height: '3rem', color: '#94A3B8', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', color: '#64748B', margin: 0 }}>No departments found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              style={{
                ...cardStyle,
                opacity: dept.isActive ? 1 : 0.7,
                border: dept.isActive ? '1px solid #E2E8F0' : '1px solid #FCA5A5',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: '0.75rem',
                      backgroundColor: dept.isActive ? '#1E3A5F' : '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: '700',
                      fontSize: '0.875rem',
                    }}>
                      {dept.code?.slice(0, 3)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>
                        {dept.name}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                        Code: {dept.code}
                      </p>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.625rem',
                      backgroundColor: dept.isActive ? '#D1FAE5' : '#FEE2E2',
                      color: dept.isActive ? '#059669' : '#DC2626',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: '500',
                    }}>
                      {dept.isActive ? (
                        <><CheckCircle style={{ width: '0.75rem', height: '0.75rem' }} /> Active</>
                      ) : (
                        <><AlertCircle style={{ width: '0.75rem', height: '0.75rem' }} /> Inactive</>
                      )}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '0.5rem',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Username</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0, fontFamily: 'monospace' }}>
                        {dept.username}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Password</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0, fontFamily: 'monospace' }}>
                          {showPassword[dept.id] ? dept.password : '••••••••'}
                        </p>
                        <button
                          onClick={() => setShowPassword({ ...showPassword, [dept.id]: !showPassword[dept.id] })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {showPassword[dept.id] ? (
                            <EyeOff style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                          ) : (
                            <Eye style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                          )}
                        </button>
                      </div>
                    </div>
                    {dept.hodName && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>HOD</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                          {dept.hodName}
                        </p>
                      </div>
                    )}
                    {dept.email && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', color: '#64748B', margin: 0, textTransform: 'uppercase' }}>Email</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>
                          {dept.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => copyCredentials(dept)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      color: '#1E293B',
                    }}
                    title="Copy Credentials"
                  >
                    <Copy style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                  <button
                    onClick={() => openEditModal(dept)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      color: '#1E293B',
                    }}
                    title="Edit"
                  >
                    <Edit2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                  <button
                    onClick={() => toggleDepartmentStatus(dept)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: dept.isActive ? '#FEF3C7' : '#D1FAE5',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      color: dept.isActive ? '#D97706' : '#059669',
                    }}
                    title={dept.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                  <button
                    onClick={() => deleteDepartment(dept)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#FEE2E2',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      color: '#DC2626',
                    }}
                    title="Delete"
                  >
                    <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X style={{ width: '1.5rem', height: '1.5rem', color: '#64748B' }} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Department Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science Engineering"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Department Code *</label>
                  <input
                    type="text"
                    placeholder="e.g., CSE"
                    value={formData.code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Password *</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type={showPassword['new'] ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ ...inputStyle, paddingRight: '2.5rem', fontFamily: 'monospace' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword['new'] })}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {showPassword['new'] ? (
                          <EyeOff style={{ width: '1.125rem', height: '1.125rem', color: '#64748B' }} />
                        ) : (
                          <Eye style={{ width: '1.125rem', height: '1.125rem', color: '#64748B' }} />
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, password: generatePassword() })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 0.75rem',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                      }}
                      title="Generate new password"
                    >
                      <RefreshCw style={{ width: '1rem', height: '1rem', color: '#64748B' }} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>HOD Name</label>
                  <input
                    type="text"
                    placeholder="Head of Department name"
                    value={formData.hodName}
                    onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    placeholder="department@college.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    type="tel"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: '#F8FAFC',
                    color: '#64748B',
                    border: '1px solid #E2E8F0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    backgroundColor: submitting ? '#94A3B8' : '#E91E63',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                  }}
                >
                  {submitting ? 'Saving...' : editingDepartment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
