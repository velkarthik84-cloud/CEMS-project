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
  const [loginType, setLoginType] = useState('admin');
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

      sessionStorage.setItem('departmentSession', JSON.stringify({
        departmentId: foundDepartment.id,
        departmentName: foundDepartment.name,
        departmentCode: foundDepartment.code,
        username: foundDepartment.username,
        loginTime: new Date().toISOString(),
      }));

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

  const getRightSideContent = () => {
    switch (loginType) {
      case 'judge':
        return {
          icon: <UserCheck className="right-icon-svg" />,
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
          icon: <Building2 className="right-icon-svg" />,
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
          icon: <Calendar className="right-icon-svg" />,
          title: 'SARCED HEART COLLEGE',
          description: 'Create, manage, and track your events with our powerful event management platform. QR-based check-ins, real-time analytics, and seamless registration.',
          stats: [
            { value: '20+', label: 'Events' },
            { value: '100+', label: 'Registrations' },
            { value: '99%', label: 'Satisfaction' },
          ],
        };
    }
  };

  const rightContent = getRightSideContent();

  return (
    <>
      <style>{`
        .login-container {
           height: 100vh;
            
          background-color: #F5F7FA;
          display: flex;
          flex-direction: column;
        }

       .login-left {
  width: 50%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}


        .login-form-container {
          width: 100%;
  max-width: 450px;
        }

.login-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.login-logo-img {
  width: 55px;
  height: 55px;
  object-fit: contain;
  border-radius: 10px;
  margin-top: 8px; 
}

.login-logo-text {
  font-weight: bold;
  font-size: 1.5rem;
  color: #1E3A5F;
}


        .login-tabs {
          display: flex;
          background-color: #F1F5F9;
          border-radius: 0.75rem;
          padding: 0.25rem;
          margin-bottom: 1.5rem;
        }

        .login-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          padding: 0.625rem 0.25rem;
          border-radius: 0.5rem;
          border: none;
          background-color: transparent;
          color: #64748B;
          font-weight: 500;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .login-tab.active {
          background-color: #FFFFFF;
          color: #1E293B;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .login-tab svg {
          width: 1rem;
          height: 1rem;
        }

        .login-tab-text {
          display: none;
        }

        .login-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #1E3A5F;
          margin: 0 0 0.5rem 0;
        }

        .login-subtitle {
          color: #64748B;
          margin: 0 0 1.25rem 0;
          font-size: 0.875rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-input-group {
          width: 100%;
        }

        .login-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #1E293B;
        }

        .login-input-wrapper {
          position: relative;
        }

        .login-input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.125rem;
          height: 1.125rem;
          color: #94A3B8;
        }

        .login-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border-radius: 0.5rem;
          border: 1px solid #E2E8F0;
          background-color: #FFFFFF;
          font-size: 0.875rem;
          color: #1E293B;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .login-input:focus {
          border-color: #1E3A5F;
        }

        .login-input-with-toggle {
          padding-right: 2.75rem;
        }

        .login-toggle-password {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-toggle-password svg {
          width: 1.125rem;
          height: 1.125rem;
          color: #94A3B8;
        }

        .login-checkbox-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .login-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.8125rem;
          color: #64748B;
        }

        .login-checkbox {
          width: 1rem;
          height: 1rem;
          border-radius: 0.25rem;
          border: 1px solid #D1D5DB;
          accent-color: #1E3A5F;
        }

        .login-forgot-link {
          font-size: 0.8125rem;
          color: #1E3A5F;
          text-decoration: none;
          font-weight: 500;
        }

        .login-submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #1E3A5F;
          color: #FFFFFF;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .login-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-divider {
          position: relative;
          margin: 1.25rem 0;
        }

        .login-divider-line {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
        }

        .login-divider-line div {
          width: 100%;
          border-top: 1px solid #E5E7EB;
        }

        .login-divider-text {
          position: relative;
          display: flex;
          justify-content: center;
          font-size: 0.8125rem;
        }

        .login-divider-text span {
          padding: 0 0.75rem;
          background-color: #F5F7FA;
          color: #64748B;
        }

        .login-info-box {
          margin-top: 1.25rem;
          padding: 0.875rem;
          border-radius: 0.5rem;
        }

        .login-info-box.blue {
          background-color: #EFF6FF;
          border: 1px solid #BFDBFE;
        }

        .login-info-box.green {
          background-color: #F0FDF4;
          border: 1px solid #BBF7D0;
        }

        .login-info-title {
          font-size: 0.75rem;
          font-weight: 600;
          margin: 0 0 0.375rem 0;
        }

        .login-info-box.blue .login-info-title,
        .login-info-box.blue .login-info-text {
          color: #1E40AF;
        }

        .login-info-box.green .login-info-text {
          color: #166534;
        }

        .login-info-text {
          font-size: 0.75rem;
          margin: 0;
        }

        .login-info-text code {
          font-family: monospace;
          font-weight: 600;
        }

        .login-signup-text {
          margin-top: 1.5rem;
          text-align: center;
          color: #64748B;
          font-size: 0.875rem;
        }

        .login-signup-link {
          color: #1E3A5F;
          font-weight: 500;
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }
.login-right {
  width: 50%;
  height: 100vh;
  background-color: #1E3A5F;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  overflow: hidden;
}
  .login-right div{
  width:100%;
  height:90vh;

  }

// .login-right-img {
//   width: 100%;
//   height: 100%;
//   object-fit: contain;
//   object-position: center;
// }
  .login-right div img{
  width:100%;
  // height:90vh;
  object-fit: cover;
  
  }


@media (min-width: 1024px) {
  .login-right {
    display: block;
  }
}





        .login-right-content {
          max-width: 28rem;
          color: #FFFFFF;
          text-align: center;
        }

        .login-right-icon {
          width: 5rem;
          height: 5rem;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .right-icon-svg {
          width: 2.5rem;
          height: 2.5rem;
        }

        .login-right-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0 0 0.75rem 0;
        }

        .login-right-desc {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1rem;
          margin: 0;
          line-height: 1.6;
        }

        .login-right-stats {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .login-stat-box {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          padding: 0.5rem 0.875rem;
        }

        .login-stat-value {
          font-size: 1.25rem;
          font-weight: bold;
        }

        .login-stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Tablet and above */
        @media (min-width: 640px) {
          .login-left {
            padding: 2rem;
          }

          .login-logo-icon {
            width: 3rem;
            height: 3rem;
          }

          .login-logo-icon svg {
            width: 1.5rem;
            height: 1.5rem;
          }

          .login-logo-text {
            font-size: 1.5rem;
          }

          .login-tab {
            font-size: 0.8125rem;
            padding: 0.625rem 0.5rem;
          }

          .login-tab-text {
            display: inline;
          }

          .login-title {
            font-size: 1.5rem;
          }

          .login-subtitle {
            font-size: 0.9375rem;
            margin-bottom: 1.5rem;
          }

          .login-form {
            gap: 1.25rem;
          }

          .login-input {
            padding: 0.875rem 1rem 0.875rem 2.75rem;
            font-size: 0.9375rem;
          }

          .login-input-icon {
            width: 1.25rem;
            height: 1.25rem;
          }

          .login-submit-btn {
            padding: 0.875rem;
            font-size: 0.9375rem;
          }

          .login-info-title {
            font-size: 0.8125rem;
          }

          .login-info-text {
            font-size: 0.8125rem;
          }
        }

        /* Desktop */
        @media (min-width: 1024px) {
          .login-container {
            flex-direction: row;
          }

          .login-left {
            padding: 3rem;
          }

          .login-right {
            display: flex;
          }

          .login-logo {
            margin-bottom: 2rem;
          }

          .login-right-icon {
            width: 6rem;
            height: 6rem;
          }

          .right-icon-svg {
            width: 3rem;
            height: 3rem;
          }

          .login-right-title {
            font-size: 1.875rem;
          }

          .login-right-desc {
            font-size: 1.125rem;
          }
        }
      `}</style>

      <div className="login-container">
        {/* Left Side - Form */}
        <div className="login-left">
          <div className="login-form-container">
            {/* Logo */}
           <div className="login-logo">
            <img
      src="\logo_main.png"
     alt="SHC Logo"
    className="login-logo-img"
    />
  <span className="login-logo-text">HEARTBEAT</span>
</div>

            {/* Login Type Tabs */}
            <div className="login-tabs">
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`login-tab ${loginType === 'admin' ? 'active' : ''}`}
              >
                <User />
                <span className="login-tab-text">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginType('department')}
                className={`login-tab ${loginType === 'department' ? 'active' : ''}`}
              >
                <Building2 />
                <span className="login-tab-text">Department</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginType('judge')}
                className={`login-tab ${loginType === 'judge' ? 'active' : ''}`}
              >
                <UserCheck />
                <span className="login-tab-text">Judge</span>
              </button>
            </div>

            {loginType === 'admin' ? (
              <>
                <h1 className="login-title">Welcome back!</h1>
                <p className="login-subtitle">Please enter your credentials to access your account.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="login-form">
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

                  <div className="login-checkbox-row">
                    <label className="login-checkbox-label">
                      <input type="checkbox" className="login-checkbox" />
                      <span>Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="login-forgot-link">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" fullWidth size="lg" loading={loading}>
                    Sign In
                  </Button>
                </form>

                <div className="login-divider">
                  <div className="login-divider-line">
                    <div />
                  </div>
                  <div className="login-divider-text">
                    <span>Or continue with</span>
                  </div>
                </div>

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

                <p className="login-signup-text">
                  Don't have an account?{' '}
                  <Link to="/register" className="login-signup-link">
                    Sign up
                  </Link>
                </p>
              </>
            ) : loginType === 'department' ? (
              <>
                <h1 className="login-title">Department Login</h1>
                <p className="login-subtitle">Enter your credentials to access the department portal.</p>

                <form onSubmit={handleDepartmentLogin} className="login-form">
                  <div className="login-input-group">
                    <label className="login-label">Username</label>
                    <div className="login-input-wrapper">
                      <Building2 className="login-input-icon" />
                      <input
                        type="text"
                        placeholder="Enter your username"
                        value={departmentForm.username}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, username: e.target.value })}
                        className="login-input"
                      />
                    </div>
                  </div>

                  <div className="login-input-group">
                    <label className="login-label">Password</label>
                    <div className="login-input-wrapper">
                      <Lock className="login-input-icon" />
                      <input
                        type={showDepartmentPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={departmentForm.password}
                        onChange={(e) => setDepartmentForm({ ...departmentForm, password: e.target.value })}
                        className="login-input login-input-with-toggle"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDepartmentPassword(!showDepartmentPassword)}
                        className="login-toggle-password"
                      >
                        {showDepartmentPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="login-submit-btn">
                    {loading ? 'Signing in...' : 'Sign In as Department'}
                  </button>
                </form>

                <div className="login-info-box blue">
                  <p className="login-info-title">Demo Credentials:</p>
                  <p className="login-info-text">
                    Username: <code>dept_cse</code> | Password: <code>Cse@1234</code>
                  </p>
                </div>

                <p className="login-signup-text">
                  Are you an admin?{' '}
                  <button
                    type="button"
                    onClick={() => setLoginType('admin')}
                    className="login-signup-link"
                  >
                    Login as Admin
                  </button>
                </p>
              </>
            ) : (
              <>
                <h1 className="login-title">Judge Login</h1>
                <p className="login-subtitle">Enter your credentials to access the scoring dashboard.</p>

                <form onSubmit={handleJudgeLogin} className="login-form">
                  <div className="login-input-group">
                    <label className="login-label">Username or Email</label>
                    <div className="login-input-wrapper">
                      <User className="login-input-icon" />
                      <input
                        type="text"
                        placeholder="Enter username or email"
                        value={judgeForm.usernameOrEmail}
                        onChange={(e) => setJudgeForm({ ...judgeForm, usernameOrEmail: e.target.value })}
                        className="login-input"
                      />
                    </div>
                  </div>

                  <div className="login-input-group">
                    <label className="login-label">Password</label>
                    <div className="login-input-wrapper">
                      <Lock className="login-input-icon" />
                      <input
                        type={showJudgePassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={judgeForm.password}
                        onChange={(e) => setJudgeForm({ ...judgeForm, password: e.target.value })}
                        className="login-input login-input-with-toggle"
                      />
                      <button
                        type="button"
                        onClick={() => setShowJudgePassword(!showJudgePassword)}
                        className="login-toggle-password"
                      >
                        {showJudgePassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="login-submit-btn">
                    {loading ? 'Signing in...' : 'Sign In as Judge'}
                  </button>
                </form>

                <div className="login-info-box green">
                  <p className="login-info-text">
                    <strong>Note:</strong> Judge credentials are provided by the event organizer. Contact them if you don't have your login details.
                  </p>
                </div>

                <p className="login-signup-text">
                  Are you an admin?{' '}
                  <button
                    type="button"
                    onClick={() => setLoginType('admin')}
                    className="login-signup-link"
                  >
                    Login as Admin
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
{/* Right Side - Image */}
<div className="login-right">
  <div>
  <img
    src="/login_banner (2).png"
    alt="Login Banner"
    className="login-right-img"
  />
  </div>
</div>





      </div>
    </>
  );
};

export default Login;
