import {
  Calendar,
  Users,
  Shield,
  Zap,
  Award,
  Target,
  CheckCircle,
  Star,
  Globe,
  TrendingUp
} from 'lucide-react';

const About = () => {
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#F5F7FA',
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%)',
    padding: '5rem 1rem',
    textAlign: 'center',
    color: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  };

  const heroOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 50%, rgba(233, 30, 99, 0.1) 0%, transparent 50%)',
  };

  const heroContentStyle = {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto',
  };

  const heroTitleStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: 1.2,
  };

  const heroSubtitleStyle = {
    fontSize: '1.25rem',
    opacity: 0.9,
    lineHeight: 1.6,
  };

  const sectionStyle = {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '4rem 1rem',
  };

  const sectionTitleStyle = {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#1E3A5F',
    textAlign: 'center',
    marginBottom: '1rem',
  };

  const sectionSubtitleStyle = {
    fontSize: '1rem',
    color: '#64748B',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto 3rem',
  };

  const missionGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  };

  const missionCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const missionIconStyle = {
    width: '3.5rem',
    height: '3.5rem',
    backgroundColor: 'rgba(30, 58, 95, 0.1)',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  };

  const missionTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '0.75rem',
  };

  const missionDescStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
    lineHeight: 1.6,
  };

  const statsStyle = {
    background: 'linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%)',
    padding: '4rem 1rem',
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    maxWidth: '80rem',
    margin: '0 auto',
  };

  const statItemStyle = {
    textAlign: 'center',
    color: '#FFFFFF',
  };

  const statNumberStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#E91E63',
  };

  const statLabelStyle = {
    fontSize: '1rem',
    opacity: 0.8,
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  };

  const featureCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    display: 'flex',
    gap: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease',
  };

  const featureIconStyle = {
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: '#E91E63',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const featureTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '0.25rem',
  };

  const featureDescStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
  };

  const teamGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  };

  const teamCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
  };

  const teamImageStyle = {
    width: '100%',
    height: '200px',
    backgroundColor: '#1E3A5F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const teamAvatarStyle = {
    width: '80px',
    height: '80px',
    backgroundColor: '#E91E63',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#FFFFFF',
  };

  const teamInfoStyle = {
    padding: '1.5rem',
  };

  const teamNameStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '0.25rem',
  };

  const teamRoleStyle = {
    fontSize: '0.875rem',
    color: '#E91E63',
    marginBottom: '0.5rem',
  };

  const teamBioStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
  };

  const valuesStyle = {
    backgroundColor: '#FFFFFF',
    padding: '4rem 1rem',
  };

  const valuesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2rem',
    maxWidth: '80rem',
    margin: '0 auto',
  };

  const valueCardStyle = {
    textAlign: 'center',
    padding: '1.5rem',
  };

  const valueIconStyle = {
    width: '4rem',
    height: '4rem',
    background: 'linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%)',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  };

  const valueTitleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '0.5rem',
  };

  const valueDescStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
    lineHeight: 1.5,
  };

  const ctaStyle = {
    background: 'linear-gradient(135deg, #E91E63 0%, #FF4081 100%)',
    padding: '4rem 1rem',
    textAlign: 'center',
    color: '#FFFFFF',
  };

  const ctaTitleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  const ctaDescStyle = {
    fontSize: '1.125rem',
    opacity: 0.9,
    marginBottom: '2rem',
    maxWidth: '500px',
    margin: '0 auto 2rem',
  };

  const ctaButtonStyle = {
    display: 'inline-block',
    padding: '1rem 2rem',
    backgroundColor: '#FFFFFF',
    color: '#E91E63',
    fontWeight: '600',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const features = [
    { icon: Calendar, title: 'Event Creation', desc: 'Create and manage events with ease' },
    { icon: Users, title: 'Registration', desc: 'Seamless participant registration' },
    { icon: Shield, title: 'Secure Payments', desc: 'Safe and reliable transactions' },
    { icon: Zap, title: 'QR Check-in', desc: 'Fast entry with QR codes' },
    { icon: TrendingUp, title: 'Analytics', desc: 'Detailed insights and reports' },
    { icon: Globe, title: 'Online Events', desc: 'Host virtual events seamlessly' },
  ];

  const team = [
    { name: 'Rahul Kumar', role: 'Founder & CEO', initials: 'RK', bio: 'Passionate about transforming event management' },
    { name: 'Priya Sharma', role: 'Head of Product', initials: 'PS', bio: 'Building products that users love' },
    { name: 'Amit Patel', role: 'Lead Developer', initials: 'AP', bio: 'Crafting elegant technical solutions' },
    { name: 'Sneha Reddy', role: 'Design Lead', initials: 'SR', bio: 'Creating beautiful user experiences' },
  ];

  const values = [
    { icon: Target, title: 'Innovation', desc: 'Constantly pushing boundaries' },
    { icon: Shield, title: 'Trust', desc: 'Building reliable relationships' },
    { icon: Star, title: 'Excellence', desc: 'Striving for the best' },
    { icon: Users, title: 'Community', desc: 'Growing together' },
  ];

  return (
    <div style={containerStyle}>
      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={heroOverlayStyle} />
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>
            Transforming Events,<br />
            <span style={{ color: '#E91E63' }}>Creating Experiences</span>
          </h1>
          <p style={heroSubtitleStyle}>
            Ventixe is a modern event management platform designed to help colleges,
            corporates, and organizations create memorable experiences. We simplify
            the entire event lifecycle from creation to completion.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Our Mission</h2>
        <p style={sectionSubtitleStyle}>
          We're on a mission to make event management accessible, efficient, and delightful for everyone.
        </p>
        <div style={missionGridStyle}>
          <div style={missionCardStyle}>
            <div style={missionIconStyle}>
              <Target style={{ width: '1.75rem', height: '1.75rem', color: '#1E3A5F' }} />
            </div>
            <h3 style={missionTitleStyle}>Simplify Event Management</h3>
            <p style={missionDescStyle}>
              We eliminate the complexity of organizing events by providing intuitive tools
              that anyone can use. No technical expertise required.
            </p>
          </div>
          <div style={missionCardStyle}>
            <div style={missionIconStyle}>
              <Users style={{ width: '1.75rem', height: '1.75rem', color: '#1E3A5F' }} />
            </div>
            <h3 style={missionTitleStyle}>Connect Communities</h3>
            <p style={missionDescStyle}>
              Events bring people together. We help organizations create meaningful connections
              and build stronger communities through memorable experiences.
            </p>
          </div>
          <div style={missionCardStyle}>
            <div style={missionIconStyle}>
              <Award style={{ width: '1.75rem', height: '1.75rem', color: '#1E3A5F' }} />
            </div>
            <h3 style={missionTitleStyle}>Deliver Excellence</h3>
            <p style={missionDescStyle}>
              From the first registration to the final check-out, we ensure every touchpoint
              of your event delivers an exceptional experience.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={statsStyle}>
        <div style={statsGridStyle}>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>500+</div>
            <div style={statLabelStyle}>Events Hosted</div>
          </div>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>50K+</div>
            <div style={statLabelStyle}>Participants</div>
          </div>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>100+</div>
            <div style={statLabelStyle}>Organizations</div>
          </div>
          <div style={statItemStyle}>
            <div style={statNumberStyle}>99%</div>
            <div style={statLabelStyle}>Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>What We Offer</h2>
        <p style={sectionSubtitleStyle}>
          A comprehensive suite of tools to manage your events from start to finish.
        </p>
        <div style={featuresGridStyle}>
          {features.map((feature, index) => (
            <div key={index} style={featureCardStyle}>
              <div style={featureIconStyle}>
                <feature.icon style={{ width: '1.25rem', height: '1.25rem', color: '#FFFFFF' }} />
              </div>
              <div>
                <h3 style={featureTitleStyle}>{feature.title}</h3>
                <p style={featureDescStyle}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section style={valuesStyle}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h2 style={sectionTitleStyle}>Our Values</h2>
          <p style={sectionSubtitleStyle}>
            The principles that guide everything we do.
          </p>
          <div style={valuesGridStyle}>
            {values.map((value, index) => (
              <div key={index} style={valueCardStyle}>
                <div style={valueIconStyle}>
                  <value.icon style={{ width: '1.75rem', height: '1.75rem', color: '#FFFFFF' }} />
                </div>
                <h3 style={valueTitleStyle}>{value.title}</h3>
                <p style={valueDescStyle}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Meet Our Team</h2>
        <p style={sectionSubtitleStyle}>
          The passionate people behind Ventixe.
        </p>
        <div style={teamGridStyle}>
          {team.map((member, index) => (
            <div key={index} style={teamCardStyle}>
              <div style={teamImageStyle}>
                <div style={teamAvatarStyle}>{member.initials}</div>
              </div>
              <div style={teamInfoStyle}>
                <h3 style={teamNameStyle}>{member.name}</h3>
                <p style={teamRoleStyle}>{member.role}</p>
                <p style={teamBioStyle}>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ ...sectionStyle, backgroundColor: '#FFFFFF', padding: '4rem 1rem' }}>
        <h2 style={sectionTitleStyle}>Why Choose Ventixe?</h2>
        <p style={sectionSubtitleStyle}>
          Here's what sets us apart from the rest.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {[
            'Easy-to-use event creation wizard',
            'Secure payment processing with Razorpay',
            'Instant QR code generation for entry',
            'Real-time attendance tracking',
            'Comprehensive analytics dashboard',
            'Email notifications and reminders',
            'PDF entry pass generation',
            'Responsive design for all devices'
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', color: '#1E3A5F' }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={ctaStyle}>
        <h2 style={ctaTitleStyle}>Ready to Get Started?</h2>
        <p style={ctaDescStyle}>
          Join hundreds of organizations already using Ventixe to create amazing events.
        </p>
        <a href="/register" style={ctaButtonStyle}>
          Create Your First Event
        </a>
      </section>
    </div>
  );
};

export default About;
