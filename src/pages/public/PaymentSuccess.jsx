import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Download, Home } from 'lucide-react';
import { Button, Card } from '../../components/common';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get('registration_id');

  useEffect(() => {
    // Optionally verify payment status here
  }, [registrationId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Payment Successful!
        </h1>
        <p className="text-text-secondary mb-8">
          Your registration has been confirmed. A confirmation email has been sent to your registered email address.
        </p>

        {registrationId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-text-secondary mb-1">Registration ID</p>
            <p className="font-mono font-semibold text-text-primary">{registrationId}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg text-left">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Entry Pass</p>
              <p className="text-sm text-text-secondary">
                Your QR code entry pass is ready
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link to="/events" className="flex-1">
            <Button variant="outline" fullWidth icon={Calendar}>
              Browse Events
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button fullWidth icon={Home}>
              Go Home
            </Button>
          </Link>
        </div>

        <p className="text-xs text-text-secondary mt-6">
          Need help? Contact us at support@CEMS.com
        </p>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
