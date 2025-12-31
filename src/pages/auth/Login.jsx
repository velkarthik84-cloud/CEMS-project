import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../../components/common';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

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
      navigate(from, { replace: true });
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin();
      toast.success('Login successful!');
      navigate(from, { replace: true });
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

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    color: '#64748B',
    marginBottom: '2rem',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
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

          {/* Welcome Text */}
          <h1 style={titleStyle}>Welcome back!</h1>
          <p style={subtitleStyle}>Please enter your credentials to access your account.</p>

          {/* Login Form */}
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
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div style={rightSideStyle} className="hidden lg:flex">
        <div style={rightContentStyle}>
          <div style={rightIconStyle}>
            <Calendar style={{ width: '3rem', height: '3rem' }} />
          </div>
          <h2 style={rightTitleStyle}>Manage Events Effortlessly</h2>
          <p style={rightDescStyle}>
            Create, manage, and track your events with our powerful event management platform.
            QR-based check-ins, real-time analytics, and seamless registration.
          </p>
          <div style={statsContainerStyle}>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>500+</div>
              <div style={statLabelStyle}>Events</div>
            </div>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>10K+</div>
              <div style={statLabelStyle}>Registrations</div>
            </div>
            <div style={statBoxStyle}>
              <div style={statValueStyle}>99%</div>
              <div style={statLabelStyle}>Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
