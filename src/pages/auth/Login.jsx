import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Calendar, UserCheck, User, Eye, EyeOff, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Button, Input } from '../../components/common';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin'); // 'admin', 'judge', or 'department'
  const [showJudgePassword, setShowJudgePassword] = useState(false);
  const [showDepartmentPassword, setShowDepartmentPassword] = useState(false);
  const [judgeForm, setJudgeForm] = useState({ usernameOrEmail: '', password: '' });
  const [departmentForm, setDepartmentForm] = useState({ username: '', password: '' });
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleJudgeLogin = async (e) => {
    e.preventDefault();

    if (!judgeForm.usernameOrEmail || !judgeForm.password) {
      toast.error('Please enter username/email and password');
      return;
    }

    setLoading(true);
    try {
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);

      let foundJudge = null;
      let foundEvent = null;
      const inputValue = judgeForm.usernameOrEmail.toLowerCase().trim();

      for (const doc of snapshot.docs) {
        const event = { id: doc.id, ...doc.data() };
        const judges = event.judges || [];

        const judge = judges.find(
          j => (j.username?.toLowerCase() === inputValue || j.email?.toLowerCase() === inputValue)
               && j.password === judgeForm.password
        );

        if (judge) {
          foundJudge = judge;
          foundEvent = event;
          break;
        }
      }

      if (foundJudge && foundEvent) {
        sessionStorage.setItem('judgeSession', JSON.stringify({
          judgeId: foundJudge.id,
          judgeName: foundJudge.name,
          eventId: foundEvent.id,
          eventTitle: foundEvent.title,
        }));

        toast.success(`Welcome, ${foundJudge.name}!`);
        navigate('/judge/dashboard');
      } else {
        toast.error('Invalid username/email or password');
      }
    } catch (error) {
      console.error('Judge login error:', error);
      toast.error('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentLogin = async (e) => {
    e.preventDefault();

    if (!departmentForm.username || !departmentForm.password) {
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

      const inputUsername = departmentForm.username.toLowerCase().trim();
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

      if (foundDepartment.password !== departmentForm.password) {
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
      console.error('Department login error:', error);
      toast.error('Failed to login. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin();
      toast.success('Login successful!');
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#F5F7FA',
    display: 'flex',
  };

  const leftSideStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  };

  const formContainerStyle = {
    width: '100%',
    maxWidth: '28rem',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
  };

  const logoIconStyle = {
    width: '3rem',
    height: '3rem',
    backgroundColor: '#1E3A5F',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const tabContainerStyle = {
    display: 'flex',
    backgroundColor: '#F1F5F9',
    borderRadius: '0.75rem',
    padding: '0.25rem',
    marginBottom: '1.5rem',
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.625rem 0.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
    color: isActive ? '#1E293B' : '#64748B',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  });

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    color: '#64748B',
    marginBottom: '1.5rem',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    paddingLeft: '2.75rem',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    fontSize: '0.9375rem',
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

  const inputWrapperStyle = {
    position: 'relative',
  };

  const iconStyle = {
    position: 'absolute',
    left: '0.875rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '1.25rem',
    height: '1.25rem',
    color: '#94A3B8',
  };

  const checkboxRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  };

  const checkboxStyle = {
    width: '1rem',
    height: '1rem',
    borderRadius: '0.25rem',
    border: '1px solid #D1D5DB',
    accentColor: '#1E3A5F',
  };

  const forgotLinkStyle = {
    fontSize: '0.875rem',
    color: '#1E3A5F',
    textDecoration: 'none',
  };

  const dividerStyle = {
    position: 'relative',
    margin: '1.5rem 0',
  };

  const dividerLineStyle = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
  };

  const dividerTextStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    fontSize: '0.875rem',
  };

  const signupTextStyle = {
    marginTop: '2rem',
    textAlign: 'center',
    color: '#64748B',
  };

  const signupLinkStyle = {
    color: '#1E3A5F',
    fontWeight: '500',
    textDecoration: 'none',
  };

  const rightSideStyle = {
    flex: 1,
    backgroundColor: '#1E3A5F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
  };

  const rightContentStyle = {
    maxWidth: '32rem',
    color: '#FFFFFF',
    textAlign: 'center',
  };

  const rightIconStyle = {
    width: '6rem',
    height: '6rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 2rem',
  };

  const rightTitleStyle = {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  const rightDescStyle = {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.125rem',
  };

  const statsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '2rem',
  };

  const statBoxStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
  };

  const statValueStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  };

  const statLabelStyle = {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
  };

  const buttonStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.875rem',
    backgroundColor: '#1E3A5F',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const getRightSideContent = () => {
    switch (loginType) {
      case 'judge':
        return {
          icon: <UserCheck style={{ width: '3rem', height: '3rem' }} />,
          title: 'Score Participants Easily',
          description: 'Access your judging dashboard to score participants. View event details, participant list, and submit scores in real-time.',
          stats: [
            { value: 'Fast', label: 'Scoring' },
            { value: 'Real-time', label: 'Updates' },
            { value: 'Easy', label: 'Interface' },
          ],
        };
      case 'department':
        return {
          icon: <Building2 style={{ width: '3rem', height: '3rem' }} />,
          title: 'Department Portal',
          description: 'Register students for cultural events, track registration status, view live scores, and download certificates for winners.',
          stats: [
            { value: 'Register', label: 'Students' },
            { value: 'Track', label: 'Status' },
            { value: 'View', label: 'Scores' },
          ],
        };
      default:
        return {
          icon: <Calendar style={{ width: '3rem', height: '3rem' }} />,
          title: 'Manage Events Effortlessly',
          description: 'Create, manage, and track your events with our powerful event management platform. QR-based check-ins, real-time analytics, and seamless registration.',
          stats: [
            { value: '500+', label: 'Events' },
            { value: '10K+', label: 'Registrations' },
            { value: '99%', label: 'Satisfaction' },
          ],
        };
    }
  };

  const rightContent = getRightSideContent();

  return (
    <div style={containerStyle}>
      {/* Left Side - Form */}
      <div style={leftSideStyle}>
        <div style={formContainerStyle}>
          {/* Logo */}
          <div style={logoContainerStyle}>
            <div style={logoIconStyle}>
              <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#FFFFFF' }} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#1E3A5F' }}>Ventixe</span>
          </div>

          {/* Login Type Tabs */}
          <div style={tabContainerStyle}>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              style={tabStyle(loginType === 'admin')}
            >
              <User style={{ width: '1rem', height: '1rem' }} />
              Admin
            </button>
            <button
              type="button"
              onClick={() => setLoginType('department')}
              style={tabStyle(loginType === 'department')}
            >
              <Building2 style={{ width: '1rem', height: '1rem' }} />
              Department
            </button>
            <button
              type="button"
              onClick={() => setLoginType('judge')}
              style={tabStyle(loginType === 'judge')}
            >
              <UserCheck style={{ width: '1rem', height: '1rem' }} />
              Judge
            </button>
          </div>

          {loginType === 'admin' ? (
            <>
              {/* Admin Login */}
              <h1 style={titleStyle}>Welcome back!</h1>
              <p style={subtitleStyle}>Please enter your credentials to access your account.</p>

              <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  icon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  icon={Lock}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div style={checkboxRowStyle}>
                  <label style={checkboxLabelStyle}>
                    <input type="checkbox" style={checkboxStyle} />
                    <span style={{ fontSize: '0.875rem', color: '#64748B' }}>Remember me</span>
                  </label>
                  <Link to="/forgot-password" style={forgotLinkStyle}>
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Sign In
                </Button>
              </form>

              {/* Divider */}
              <div style={dividerStyle}>
                <div style={dividerLineStyle}>
                  <div style={{ width: '100%', borderTop: '1px solid #E5E7EB' }} />
                </div>
                <div style={dividerTextStyle}>
                  <span style={{ padding: '0 1rem', backgroundColor: '#F5F7FA', color: '#64748B' }}>
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                fullWidth
                size="lg"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              {/* Register Link */}
              <p style={signupTextStyle}>
                Don't have an account?{' '}
                <Link to="/register" style={signupLinkStyle}>
                  Sign up
                </Link>
              </p>
            </>
          ) : loginType === 'department' ? (
            <>
              {/* Department Login */}
              <h1 style={titleStyle}>Department Login</h1>
              <p style={subtitleStyle}>Enter your credentials to access the department portal.</p>

              <form onSubmit={handleDepartmentLogin} style={formStyle}>
                <div>
                  <label style={labelStyle}>Username</label>
                  <div style={inputWrapperStyle}>
                    <Building2 style={iconStyle} />
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={departmentForm.username}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, username: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={inputWrapperStyle}>
                    <Lock style={iconStyle} />
                    <input
                      type={showDepartmentPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={departmentForm.password}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, password: e.target.value })}
                      style={{ ...inputStyle, paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDepartmentPassword(!showDepartmentPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.875rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showDepartmentPassword ? (
                        <EyeOff style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
                      ) : (
                        <Eye style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Signing in...' : 'Sign In as Department'}
                </button>
              </form>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#EFF6FF',
                borderRadius: '0.5rem',
                border: '1px solid #BFDBFE',
              }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1E40AF', margin: '0 0 0.5rem 0' }}>
                  Demo Credentials:
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#1E40AF', margin: 0, fontFamily: 'monospace' }}>
                  Username: <strong>dept_cse</strong> | Password: <strong>Cse@1234</strong>
                </p>
              </div>

              <p style={signupTextStyle}>
                Are you an admin?{' '}
                <button
                  type="button"
                  onClick={() => setLoginType('admin')}
                  style={{ ...signupLinkStyle, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Login as Admin
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Judge Login */}
              <h1 style={titleStyle}>Judge Login</h1>
              <p style={subtitleStyle}>Enter your credentials to access the scoring dashboard.</p>

              <form onSubmit={handleJudgeLogin} style={formStyle}>
                <div>
                  <label style={labelStyle}>Username or Email</label>
                  <div style={inputWrapperStyle}>
                    <User style={iconStyle} />
                    <input
                      type="text"
                      placeholder="Enter username or email"
                      value={judgeForm.usernameOrEmail}
                      onChange={(e) => setJudgeForm({ ...judgeForm, usernameOrEmail: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={inputWrapperStyle}>
                    <Lock style={iconStyle} />
                    <input
                      type={showJudgePassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={judgeForm.password}
                      onChange={(e) => setJudgeForm({ ...judgeForm, password: e.target.value })}
                      style={{ ...inputStyle, paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowJudgePassword(!showJudgePassword)}
                      style={{
                        position: 'absolute',
                        right: '0.875rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showJudgePassword ? (
                        <EyeOff style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
                      ) : (
                        <Eye style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Signing in...' : 'Sign In as Judge'}
                </button>
              </form>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#F0FDF4',
                borderRadius: '0.5rem',
                border: '1px solid #BBF7D0',
              }}>
                <p style={{ fontSize: '0.8125rem', color: '#166534', margin: 0 }}>
                  <strong>Note:</strong> Judge credentials are provided by the event organizer. Contact them if you don't have your login details.
                </p>
              </div>

              <p style={signupTextStyle}>
                Are you an admin?{' '}
                <button
                  type="button"
                  onClick={() => setLoginType('admin')}
                  style={{ ...signupLinkStyle, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Login as Admin
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div style={rightSideStyle} className="hidden lg:flex">
        <div style={rightContentStyle}>
          <div style={rightIconStyle}>
            {rightContent.icon}
          </div>
          <h2 style={rightTitleStyle}>
            {rightContent.title}
          </h2>
          <p style={rightDescStyle}>
            {rightContent.description}
          </p>
          <div style={statsContainerStyle}>
            {rightContent.stats.map((stat, index) => (
              <div key={index} style={statBoxStyle}>
                <div style={statValueStyle}>{stat.value}</div>
                <div style={statLabelStyle}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
