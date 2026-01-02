import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#F5F7FA',
  };

  const heroStyle = {
    background: 'linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%)',
    padding: '4rem 1rem',
    textAlign: 'center',
    color: '#FFFFFF',
  };

  const heroTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  const heroSubtitleStyle = {
    fontSize: '1.125rem',
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0 auto',
  };

  const mainContentStyle = {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '3rem 1rem',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  };

  const formTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '0.5rem',
  };

  const formSubtitleStyle = {
    color: '#64748B',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
  };

  const textareaStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    fontSize: '0.875rem',
    minHeight: '120px',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1E3A5F',
  };

  const contactInfoStyle = {
    backgroundColor: '#1E3A5F',
    borderRadius: '1rem',
    padding: '2rem',
    color: '#FFFFFF',
  };

  const contactTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  };

  const contactItemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
  };

  const contactIconStyle = {
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: 'rgba(233, 30, 99, 0.2)',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const contactLabelStyle = {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '0.25rem',
  };

  const contactValueStyle = {
    fontSize: '1rem',
    fontWeight: '500',
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginTop: '3rem',
  };

  const featureCardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  };

  const featureIconStyle = {
    width: '3rem',
    height: '3rem',
    backgroundColor: 'rgba(30, 58, 95, 0.1)',
    borderRadius: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  };

  const featureTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '0.5rem',
  };

  const featureDescStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
  };

  const successCardStyle = {
    backgroundColor: '#D1FAE5',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
  };

  const faqSectionStyle = {
    marginTop: '3rem',
  };

  const faqTitleStyle = {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#1E3A5F',
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const faqGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
  };

  const faqItemStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  };

  const faqQuestionStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: '0.5rem',
  };

  const faqAnswerStyle = {
    fontSize: '0.875rem',
    color: '#64748B',
    lineHeight: 1.6,
  };

  const faqs = [
    {
      question: 'How do I create an event?',
      answer: 'Login to your admin account, navigate to the dashboard, and click on "Create Event". Fill in all the required details and publish your event.',
    },
    {
      question: 'What payment methods are supported?',
      answer: 'We support multiple payment methods including UPI, credit/debit cards, net banking, and popular wallets through Razorpay.',
    },
    {
      question: 'How does the QR check-in work?',
      answer: 'Each registered participant receives a unique QR code. At the event, scan this code using our admin app to mark attendance instantly.',
    },
    {
      question: 'Can I get a refund for cancelled events?',
      answer: 'Yes, if an event is cancelled by the organizer, registered participants are eligible for a full refund as per our refund policy.',
    },
  ];

  return (
    <div style={containerStyle}>
      {/* Hero Section */}
      <section style={heroStyle}>
        <h1 style={heroTitleStyle}>Get in Touch</h1>
        <p style={heroSubtitleStyle}>
          Have questions about our platform? We're here to help. Reach out to us and we'll respond as soon as possible.
        </p>
      </section>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <div style={gridStyle}>
          {/* Contact Form */}
          <div style={cardStyle}>
            {submitted ? (
              <div style={successCardStyle}>
                <div style={{ ...featureIconStyle, backgroundColor: '#10B981', margin: '0 auto 1rem' }}>
                  <Send style={{ width: '1.5rem', height: '1.5rem', color: '#FFFFFF' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#065F46', marginBottom: '0.5rem' }}>
                  Message Sent!
                </h3>
                <p style={{ color: '#047857', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <Button variant="primary" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <>
                <h2 style={formTitleStyle}>Send us a Message</h2>
                <p style={formSubtitleStyle}>
                  Fill out the form below and we'll get back to you shortly.
                </p>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <Input
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <Input
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={labelStyle}>Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      style={textareaStyle}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1E3A5F';
                        e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 95, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    icon={Send}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </>
            )}
          </div>

          {/* Contact Information */}
          <div style={contactInfoStyle}>
            <h2 style={contactTitleStyle}>Contact Information</h2>

            <div style={contactItemStyle}>
              <div style={contactIconStyle}>
                <Mail style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
              </div>
              <div>
                <p style={contactLabelStyle}>Email Us</p>
                <p style={contactValueStyle}>support@ventixe.com</p>
                <p style={{ ...contactValueStyle, opacity: 0.8 }}>info@ventixe.com</p>
              </div>
            </div>

            <div style={contactItemStyle}>
              <div style={contactIconStyle}>
                <Phone style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
              </div>
              <div>
                <p style={contactLabelStyle}>Call Us</p>
                <p style={contactValueStyle}>+91 9876543210</p>
                <p style={{ ...contactValueStyle, opacity: 0.8 }}>+91 9876543211</p>
              </div>
            </div>

            <div style={contactItemStyle}>
              <div style={contactIconStyle}>
                <MapPin style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
              </div>
              <div>
                <p style={contactLabelStyle}>Visit Us</p>
                <p style={contactValueStyle}>123 Tech Park, Anna Salai</p>
                <p style={{ ...contactValueStyle, opacity: 0.8 }}>Chennai, Tamil Nadu 600001</p>
              </div>
            </div>

            <div style={contactItemStyle}>
              <div style={contactIconStyle}>
                <Clock style={{ width: '1.25rem', height: '1.25rem', color: '#E91E63' }} />
              </div>
              <div>
                <p style={contactLabelStyle}>Working Hours</p>
                <p style={contactValueStyle}>Monday - Friday: 9AM - 6PM</p>
                <p style={{ ...contactValueStyle, opacity: 0.8 }}>Saturday: 10AM - 2PM</p>
              </div>
            </div>

            {/* Map Placeholder */}
            <div style={{
              marginTop: '1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center' }}>
                <MapPin style={{ width: '2rem', height: '2rem', color: '#E91E63', margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>View on Google Maps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={featuresGridStyle}>
          <div style={featureCardStyle}>
            <div style={featureIconStyle}>
              <MessageSquare style={{ width: '1.5rem', height: '1.5rem', color: '#1E3A5F' }} />
            </div>
            <h3 style={featureTitleStyle}>24/7 Support</h3>
            <p style={featureDescStyle}>
              Our support team is always available to help you with any questions.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={featureIconStyle}>
              <Users style={{ width: '1.5rem', height: '1.5rem', color: '#1E3A5F' }} />
            </div>
            <h3 style={featureTitleStyle}>Dedicated Team</h3>
            <p style={featureDescStyle}>
              Get personalized assistance from our experienced event specialists.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={featureIconStyle}>
              <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#1E3A5F' }} />
            </div>
            <h3 style={featureTitleStyle}>Quick Response</h3>
            <p style={featureDescStyle}>
              We respond to all inquiries within 24 hours on business days.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={faqSectionStyle}>
          <h2 style={faqTitleStyle}>Frequently Asked Questions</h2>
          <div style={faqGridStyle}>
            {faqs.map((faq, index) => (
              <div key={index} style={faqItemStyle}>
                <h3 style={faqQuestionStyle}>{faq.question}</h3>
                <p style={faqAnswerStyle}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
