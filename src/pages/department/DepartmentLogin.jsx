import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Building2, Eye, EyeOff, LogIn, Home, User, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const DepartmentLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const departmentsRef = collection(db, 'departments');
      const snapshot = await getDocs(departmentsRef);

      if (snapshot.empty) {
        toast.error('No departments found. Please contact admin.');
        setLoading(false);
        return;
      }

      const inputUsername = formData.username.toLowerCase().trim();
      let foundDepartment = null;

      snapshot.docs.forEach((doc) => {
        const dept = { id: doc.id, ...doc.data() };
        if (dept.username?.toLowerCase() === inputUsername) {
          foundDepartment = dept;
        }
      });

      if (!foundDepartment) {
        toast.error('Invalid username or password');
        setLoading(false);
        return;
      }

      if (foundDepartment.password !== formData.password) {
        toast.error('Invalid username or password');
        setLoading(false);
        return;
      }

      if (foundDepartment.isActive === false) {
        toast.error('Your department account has been deactivated. Please contact admin.');
        setLoading(false);
        return;
      }

      const sessionData = {
        departmentId: foundDepartment.id,
        departmentName: foundDepartment.name,
        departmentCode: foundDepartment.code,
        username: foundDepartment.username,
        loginTime: new Date().toISOString(),
      };

      sessionStorage.setItem('departmentSession', JSON.stringify(sessionData));

      toast.success(`Welcome, ${foundDepartment.name}!`);
      navigate('/department/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#0F172A',
    }}>
      {/* Left Side - Branding */}
      <div style={{
        flex: 1,
        display: 'none',
        background: 'linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%)',
        padding: '3rem',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-left-panel">
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(233, 30, 99, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            border: '1px solid rgba(233, 30, 99, 0.2)',
          }}>
            <Building2 style={{ width: '50px', height: '50px', color: '#E91E63' }} />
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            Department Portal
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: '#94A3B8',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}>
            Register students for events, track registrations, view live scores, and download certificates.
          </p>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              'Register students for cultural events',
              'Track registration status in real-time',
              'View live scores during events',
              'Download certificates for winners',
            ].map((feature, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(233, 30, 99, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <ArrowRight style={{ width: '14px', height: '14px', color: '#E91E63' }} />
                </div>
                <span style={{ color: '#CBD5E1', fontSize: '0.9375rem' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: '#F8FAFC',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
        }}>
          {/* Mobile Logo */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }} className="mobile-logo">
            <div style={{
              width: '70px',
              height: '70px',
              backgroundColor: 'rgba(30, 58, 95, 0.1)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Building2 style={{ width: '35px', height: '35px', color: '#1E3A5F' }} />
            </div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1E293B',
              margin: 0,
            }}>
              Department Login
            </h1>
            <p style={{
              fontSize: '0.9375rem',
              color: '#64748B',
              marginTop: '0.5rem',
            }}>
              Access your department portal
            </p>
          </div>

          {/* Login Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '1.25rem',
            padding: '2rem',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E2E8F0',
          }}>
            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1E293B',
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}>
                    <User style={{ width: '1.125rem', height: '1.125rem', color: '#94A3B8' }} />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 2.75rem',
                      borderRadius: '0.75rem',
                      border: '2px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      fontSize: '0.9375rem',
                      color: '#1E293B',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#E91E63';
                      e.target.style.backgroundColor = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.backgroundColor = '#F8FAFC';
                    }}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1E293B',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}>
                    <Lock style={{ width: '1.125rem', height: '1.125rem', color: '#94A3B8' }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 3rem 0.875rem 2.75rem',
                      borderRadius: '0.75rem',
                      border: '2px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      fontSize: '0.9375rem',
                      color: '#1E293B',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#E91E63';
                      e.target.style.backgroundColor = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.backgroundColor = '#F8FAFC';
                    }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: '1.125rem', height: '1.125rem', color: '#64748B' }} />
                    ) : (
                      <Eye style={{ width: '1.125rem', height: '1.125rem', color: '#64748B' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: loading ? '#94A3B8' : 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(233, 30, 99, 0.3)',
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn style={{ width: '1.25rem', height: '1.25rem' }} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Help Text */}
            <p style={{
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: '#94A3B8',
              marginTop: '1.5rem',
              marginBottom: 0,
            }}>
              Contact your admin if you forgot your credentials
            </p>
          </div>

          {/* Demo Credentials */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '1rem',
            border: '1px solid #E2E8F0',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
              }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1E293B' }}>
                Demo Credentials
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              fontSize: '0.8125rem',
            }}>
              <div style={{
                padding: '0.625rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '0.5rem',
              }}>
                <span style={{ color: '#64748B' }}>Username</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#1E293B', fontFamily: 'monospace' }}>
                  dept_cse
                </p>
              </div>
              <div style={{
                padding: '0.625rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '0.5rem',
              }}>
                <span style={{ color: '#64748B' }}>Password</span>
                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '600', color: '#1E293B', fontFamily: 'monospace' }}>
                  Cse@1234
                </p>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#64748B',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              <Home style={{ width: '1rem', height: '1rem' }} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* CSS for responsive layout and animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (min-width: 1024px) {
          .login-left-panel {
            display: flex !important;
          }
          .mobile-logo {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DepartmentLogin;
