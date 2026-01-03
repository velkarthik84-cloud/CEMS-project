import { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Users,
  Search,
  RefreshCw
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Button, Card, Select } from '../../components/common';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [checkedIn, setCheckedIn] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchRegistrations();
    }
  }, [selectedEvent]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('status', 'in', ['published', 'closed']));
      const snapshot = await getDocs(q);
      const eventsList = snapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().title,
        ...doc.data()
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const regsRef = collection(db, 'registrations');
      const q = query(regsRef, where('eventId', '==', selectedEvent));
      const snapshot = await getDocs(q);
      const regsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrations(regsList);
      setCheckedIn(regsList.filter(r => r.attendanceStatus === 'checked_in'));
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const startScanner = () => {
    setScanning(true);
    setLastScanned(null);

    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    try {
      // Parse QR code: VENTIXE:eventId:registrationId
      const parts = decodedText.split(':');
      if (parts[0] !== 'VENTIXE') {
        toast.error('Invalid QR code');
        return;
      }

      const [, eventId, registrationId] = parts;

      if (eventId !== selectedEvent) {
        toast.error('QR code is for a different event');
        return;
      }

      // Find registration
      const registration = registrations.find(
        r => r.registrationId === registrationId || r.id === registrationId
      );

      if (!registration) {
        toast.error('Registration not found');
        setLastScanned({ success: false, message: 'Registration not found' });
        return;
      }

      if (registration.attendanceStatus === 'checked_in') {
        toast.error('Already checked in!');
        setLastScanned({
          success: false,
          message: 'Already checked in',
          participant: registration
        });
        return;
      }

      // Mark as checked in
      await updateDoc(doc(db, 'registrations', registration.id), {
        attendanceStatus: 'checked_in',
        checkedInAt: serverTimestamp(),
      });

      // Update local state
      const updatedReg = { ...registration, attendanceStatus: 'checked_in', checkedInAt: new Date() };
      setRegistrations(registrations.map(r =>
        r.id === registration.id ? updatedReg : r
      ));
      setCheckedIn([...checkedIn, updatedReg]);

      toast.success(`${registration.fullName} checked in!`);
      setLastScanned({
        success: true,
        message: 'Check-in successful!',
        participant: updatedReg
      });

      // Play success sound
      const audio = new Audio('/success.mp3');
      audio.play().catch(() => {});

    } catch (error) {
      console.error('Error processing scan:', error);
      toast.error('Failed to process check-in');
      setLastScanned({ success: false, message: 'Failed to process' });
    }
  };

  const onScanError = (error) => {
    // Ignore permission errors during scanning
  };

  const manualCheckIn = async (registration) => {
    try {
      await updateDoc(doc(db, 'registrations', registration.id), {
        attendanceStatus: 'checked_in',
        checkedInAt: serverTimestamp(),
      });

      const updatedReg = { ...registration, attendanceStatus: 'checked_in', checkedInAt: new Date() };
      setRegistrations(registrations.map(r =>
        r.id === registration.id ? updatedReg : r
      ));
      setCheckedIn([...checkedIn, updatedReg]);

      toast.success(`${registration.fullName} checked in!`);
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  return (
    <div className="space-y-6" style={{ width: '100%' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Attendance</h1>
          <p className="text-text-secondary">Scan QR codes to mark attendance</p>
        </div>
        <Select
          options={events}
          value={selectedEvent}
          onChange={(e) => {
            setSelectedEvent(e.target.value);
            if (scanning) stopScanner();
          }}
          placeholder="Select Event"
          className="w-full sm:w-64"
        />
      </div>

      {selectedEvent ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {registrations.length}
                  </p>
                  <p className="text-sm text-text-secondary">Total Registered</p>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {checkedIn.length}
                  </p>
                  <p className="text-sm text-text-secondary">Checked In</p>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <XCircle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {registrations.length - checkedIn.length}
                  </p>
                  <p className="text-sm text-text-secondary">Pending</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">QR Scanner</h2>
                {scanning ? (
                  <Button variant="outline" size="sm" onClick={stopScanner}>
                    Stop Scanner
                  </Button>
                ) : (
                  <Button size="sm" icon={Camera} onClick={startScanner}>
                    Start Scanner
                  </Button>
                )}
              </div>

              {scanning ? (
                <div className="space-y-4">
                  <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />

                  {lastScanned && (
                    <div className={`p-4 rounded-lg ${
                      lastScanned.success
                        ? 'bg-success-light'
                        : 'bg-error-light'
                    }`}>
                      <div className="flex items-center gap-3">
                        {lastScanned.success ? (
                          <CheckCircle className="w-6 h-6 text-success" />
                        ) : (
                          <XCircle className="w-6 h-6 text-error" />
                        )}
                        <div>
                          <p className={`font-medium ${
                            lastScanned.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {lastScanned.message}
                          </p>
                          {lastScanned.participant && (
                            <p className="text-sm">
                              {lastScanned.participant.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <QrCode className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-text-secondary mb-4">
                    Click "Start Scanner" to scan participant QR codes
                  </p>
                  <Button icon={Camera} onClick={startScanner}>
                    Start Scanner
                  </Button>
                </div>
              )}
            </Card>

            {/* Recent Check-ins */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  Recent Check-ins
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  onClick={fetchRegistrations}
                >
                  Refresh
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {checkedIn.length > 0 ? (
                  checkedIn
                    .sort((a, b) => (b.checkedInAt?.toDate?.() || 0) - (a.checkedInAt?.toDate?.() || 0))
                    .slice(0, 10)
                    .map((reg) => (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">
                              {reg.fullName}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {reg.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-text-secondary">
                          {formatTime(reg.checkedInAt)}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-text-secondary py-8">
                    No check-ins yet
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* All Participants */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              All Participants
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-text-secondary uppercase">
                    <th className="pb-3">Participant</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Check-in Time</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            reg.attendanceStatus === 'checked_in'
                              ? 'bg-success/10'
                              : 'bg-gray-100'
                          }`}>
                            <span className={`text-sm font-medium ${
                              reg.attendanceStatus === 'checked_in'
                                ? 'text-success'
                                : 'text-gray-500'
                            }`}>
                              {reg.fullName?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-text-primary">
                            {reg.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-text-secondary">
                        {reg.mobile}
                      </td>
                      <td className="py-3">
                        {reg.attendanceStatus === 'checked_in' ? (
                          <span className="inline-flex items-center gap-1 text-sm text-success">
                            <CheckCircle className="w-4 h-4" />
                            Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                            <XCircle className="w-4 h-4" />
                            Absent
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-sm text-text-secondary">
                        {formatTime(reg.checkedInAt)}
                      </td>
                      <td className="py-3">
                        {reg.attendanceStatus !== 'checked_in' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => manualCheckIn(reg)}
                          >
                            Check In
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <Card className="text-center py-12">
          <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Select an Event
          </h3>
          <p className="text-text-secondary">
            Choose an event from the dropdown to start taking attendance
          </p>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
