import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
// You'll need to set these in your .env file
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'demo_service';
const TEMPLATE_ID_REGISTRATION = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'demo_template';
const TEMPLATE_ID_REMINDER = import.meta.env.VITE_EMAILJS_REMINDER_TEMPLATE || 'demo_template';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'demo_key';

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

// Send registration confirmation email
export const sendRegistrationConfirmation = async ({
  toEmail,
  toName,
  eventTitle,
  eventDate,
  eventTime,
  eventVenue,
  registrationId,
  qrCodeUrl,
}) => {
  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_REGISTRATION, {
      to_email: toEmail,
      to_name: toName,
      event_title: eventTitle,
      event_date: eventDate,
      event_time: eventTime,
      event_venue: eventVenue,
      registration_id: registrationId,
      qr_code_url: qrCodeUrl,
    });
    return response;
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw error;
  }
};

// Send payment confirmation email
export const sendPaymentConfirmation = async ({
  toEmail,
  toName,
  eventTitle,
  amount,
  paymentId,
  registrationId,
}) => {
  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_REGISTRATION, {
      to_email: toEmail,
      to_name: toName,
      event_title: eventTitle,
      amount: amount,
      payment_id: paymentId,
      registration_id: registrationId,
      subject: 'Payment Confirmation',
    });
    return response;
  } catch (error) {
    console.error('Error sending payment email:', error);
    throw error;
  }
};

// Send event reminder email
export const sendEventReminder = async ({
  toEmail,
  toName,
  eventTitle,
  eventDate,
  eventTime,
  eventVenue,
  registrationId,
}) => {
  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_REMINDER, {
      to_email: toEmail,
      to_name: toName,
      event_title: eventTitle,
      event_date: eventDate,
      event_time: eventTime,
      event_venue: eventVenue,
      registration_id: registrationId,
    });
    return response;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

// Send meeting link for online events
export const sendMeetingLink = async ({
  toEmail,
  toName,
  eventTitle,
  eventDate,
  eventTime,
  meetingLink,
}) => {
  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_REGISTRATION, {
      to_email: toEmail,
      to_name: toName,
      event_title: eventTitle,
      event_date: eventDate,
      event_time: eventTime,
      meeting_link: meetingLink,
      subject: 'Meeting Link for ' + eventTitle,
    });
    return response;
  } catch (error) {
    console.error('Error sending meeting link email:', error);
    throw error;
  }
};

// Bulk send emails to multiple recipients
export const sendBulkEmails = async (recipients, templateParams, templateId = TEMPLATE_ID_REGISTRATION) => {
  const results = [];
  for (const recipient of recipients) {
    try {
      const response = await emailjs.send(SERVICE_ID, templateId, {
        ...templateParams,
        to_email: recipient.email,
        to_name: recipient.name,
      });
      results.push({ success: true, email: recipient.email, response });
    } catch (error) {
      results.push({ success: false, email: recipient.email, error });
    }
  }
  return results;
};

export default {
  sendRegistrationConfirmation,
  sendPaymentConfirmation,
  sendEventReminder,
  sendMeetingLink,
  sendBulkEmails,
};
