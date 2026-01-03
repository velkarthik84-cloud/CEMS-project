import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserCheck, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const JudgeLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.usernameOrEmail || !formData.password) {
      toast.error('Please enter username/email and password');
      return;
    }

    setLoading(true);
    try {
      // Query events to find matching judge credentials
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);

      let foundJudge = null;
      const assignedEvents = [];
      const inputValue = formData.usernameOrEmail.toLowerCase().trim();

      for (const doc of snapshot.docs) {
        const event = { id: doc.id, ...doc.data() };
        const judges = event.judges || [];

        // Check if input matches username OR email
        const judge = judges.find(
          j => (j.username?.toLowerCase() === inputValue || j.email?.toLowerCase() === inputValue)
               && j.password === formData.password
        );

        if (judge) {
          if (!foundJudge) {
            foundJudge = judge;
          }
          // Collect all events where this judge is assigned
          assignedEvents.push({
            id: event.id,
            title: event.title,
            category: event.category,
            eventDate: event.eventDate,
            venue: event.venue,
            type: event.type,
            bannerUrl: event.bannerUrl,
            status: event.status,
            scoringCriteria: event.categoryDetails?.scoringCriteria || null,
          });
        }
      }

      if (foundJudge && assignedEvents.length > 0) {
        // Store judge session with all assigned events
        sessionStorage.setItem('judgeSession', JSON.stringify({
          judgeId: foundJudge.id,
          judgeName: foundJudge.name,
          judgeEmail: foundJudge.email || '',
          assignedEvents: assignedEvents,
        }));

        toast.success(`Welcome, ${foundJudge.name}!`);
        navigate('/judge/dashboard');
      } else {
        toast.error('Invalid username/email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '0.9375rem',
    color: '#1E293B',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1E293B',
  };

  const buttonStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.875rem',
    backgroundColor: '#E91E63',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
      padding: '1rem',
    }}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <UserCheck style={{ width: '2rem', height: '2rem', color: '#E91E63' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            Judge Login
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.5rem' }}>
            Enter your credentials to access the judge dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Username or Email</label>
            <input
              type="text"
              placeholder="Enter username or email"
              value={formData.usernameOrEmail}
              onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ ...inputStyle, paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                {showPassword ? (
                  <EyeOff style={{ width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
                ) : (
                  <Eye style={{ width: '1.25rem', height: '1.25rem', color: '#64748B' }} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}>
            <LogIn style={{ width: '1.125rem', height: '1.125rem' }} />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: '#94A3B8', marginTop: '1.5rem' }}>
          Contact event organizer if you forgot your credentials
        </p>
      </div>
    </div>
  );
};

export default JudgeLogin;
