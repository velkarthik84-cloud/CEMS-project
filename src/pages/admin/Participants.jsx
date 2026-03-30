import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Building2,
  ChevronRight,
  ArrowLeft,
  Download
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Participants = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('events'); // 'events' | 'departments' | 'participants'

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsRef = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsRef);
      const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const regsRef = collection(db, 'registrations');
      const regsSnapshot = await getDocs(regsRef);
      const registrations = regsSnapshot.docs.map(doc => doc.data());

      const eventsWithCounts = eventsList.map(event => ({
        ...event,
        registrationCount: registrations.filter(r => r.eventId === event.id).length,
      }));

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentsForEvent = async (event) => {
    try {
      setLoading(true);
      setSelectedEvent(event);

      const regsRef = collection(db, 'registrations');
      const q = query(regsRef, where('eventId', '==', event.id));
      const regsSnapshot = await getDocs(q);

      const deptMap = new Map();
      regsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const deptId = data.departmentId || 'unknown';

        if (!deptMap.has(deptId)) {
          deptMap.set(deptId, {
            departmentId: deptId,
            departmentName: data.departmentName || 'Unknown Department',
            departmentCode: data.departmentCode || '-',
            count: 0,
          });
        }
        deptMap.get(deptId).count++;
      });

      setDepartments(Array.from(deptMap.values()));
      setView('departments');
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (department) => {
    try {
      setLoading(true);
      setSelectedDepartment(department);

      const regsRef = collection(db, 'registrations');
      const q = query(
        regsRef,
        where('eventId', '==', selectedEvent.id),
        where('departmentId', '==', department.departmentId)
      );

      const snapshot = await getDocs(q);
      setParticipants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      setView('participants');
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  // ✅ EXPORT ALL EVENT PARTICIPANTS (ALL DEPARTMENTS)
  const exportEventParticipantsCSV = async () => {
    if (!selectedEvent) {
      toast.error("Please select event first");
      return;
    }

    try {
      toast.loading("Preparing CSV...", { id: "csv" });

      const regsRef = collection(db, 'registrations');
      const q = query(regsRef, where('eventId', '==', selectedEvent.id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        toast.error("No participants found for this event", { id: "csv" });
        return;
      }

      const rows = [];
      let sno = 1;

      snapshot.docs.forEach(doc => {
        const data = doc.data();

        const eventName = selectedEvent.title || "-";
        const departmentName = data.departmentName || "-";

        if (data.students && Array.isArray(data.students) && data.students.length > 0) {
          data.students.forEach(student => {
            rows.push({
              "S.No": sno++,
              "Event Name": eventName,
              "Department": departmentName,
              "Student Name": student.name || "-",
              "Register No": student.registerNumber || "-",
              "Registration ID": data.registrationId || "-",
              "Status": data.status || "pending",
              "Date": data.createdAt ? format(data.createdAt.toDate(), "MMM dd, yyyy") : "-"
            });
          });
        } else {
          rows.push({
            "S.No": sno++,
            "Event Name": eventName,
            "Department": departmentName,
            "Student Name": data.fullName || "-",
            "Register No": data.registerNumber || "-",
            "Registration ID": data.registrationId || "-",
            "Status": data.status || "pending",
            "Date": data.createdAt ? format(data.createdAt.toDate(), "MMM dd, yyyy") : "-"
          });
        }
      });

      const headers = Object.keys(rows[0]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row =>
          headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const safeEventName = selectedEvent.title.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `${safeEventName}_participants.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV Downloaded Successfully!", { id: "csv" });
    } catch (error) {
      console.error("Export CSV Error:", error);
      toast.error("Failed to export CSV", { id: "csv" });
    }
  };

  const goBackToEvents = () => {
    setSelectedEvent(null);
    setSelectedDepartment(null);
    setDepartments([]);
    setParticipants([]);
    setView('events');
  };

  const goBackToDepartments = () => {
    setSelectedDepartment(null);
    setParticipants([]);
    setView('departments');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy');
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
          Participants
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
          View participants by event and department
        </p>
      </div>

      {/* Breadcrumb Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: "space-between",
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#F8FAFC',
        borderRadius: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={goBackToEvents}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: view === 'events' ? '#1E293B' : '#E91E63',
              fontWeight: view === 'events' ? '600' : '500',
              fontSize: '0.875rem',
              padding: 0,
            }}
          >
            Events
          </button>

          {selectedEvent && (
            <>
              <ChevronRight style={{ width: '1rem', height: '1rem', color: '#94A3B8' }} />
              <button
                onClick={goBackToDepartments}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: view === 'departments' ? '#1E293B' : '#E91E63',
                  fontWeight: view === 'departments' ? '600' : '500',
                  fontSize: '0.875rem',
                  padding: 0,
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedEvent.title}
              </button>
            </>
          )}

          {selectedDepartment && (
            <>
              <ChevronRight style={{ width: '1rem', height: '1rem', color: '#94A3B8' }} />
              <span style={{ color: '#1E293B', fontWeight: '600', fontSize: '0.875rem' }}>
                {selectedDepartment.departmentName}
              </span>
            </>
          )}
        </div>

        {/* Export Button */}
        {selectedEvent && (
          <button
            onClick={exportEventParticipantsCSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.55rem 1rem",
              backgroundColor: "#1E3A5F",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.875rem"
            }}
          >
            <Download style={{ width: "1rem", height: "1rem" }} />
            Export CSV
          </button>
        )}
      </nav>

      {/* Events View */}
      {view === 'events' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: '1.5rem' }}>
          {events.map(event => (
            <div
              key={event.id}
              onClick={() => fetchDepartmentsForEvent(event)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '1rem',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{
                width: '100%',
                height: '140px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Calendar style={{ width: '3rem', height: '3rem', color: '#FFFFFF' }} />
              </div>

              <div style={{ padding: '1rem' }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1E293B',
                  margin: '0 0 0.5rem 0',
                }}>
                  {event.title}
                </h3>

                <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem' }}>
                  {event.registrationCount} Registrations
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Departments View */}
      {view === 'departments' && (
        <div>
          <button
            onClick={goBackToEvents}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#64748B',
              cursor: 'pointer',
              marginBottom: '1.5rem',
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back to Events
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {departments.map(dept => (
              <div
                key={dept.departmentId}
                onClick={() => fetchParticipants(dept)}
                style={{
                  ...cardStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '1.25rem',
                }}
              >
             <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
  <div style={{
    width: "3rem",
    height: "3rem",
    borderRadius: "0.75rem",
    backgroundColor: "rgba(233, 30, 99, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}>
    <Building2 style={{ width: "1.5rem", height: "1.5rem", color: "#E91E63" }} />
  </div>

  <div>
    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "#1E293B" }}>
      {dept.departmentName}
    </h3>
    <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748B" }}>
      Code: {dept.departmentCode}
    </p>
  </div>
</div>


                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: '600', color: '#8B5CF6' }}>{dept.count}</span>
                  <ChevronRight />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ PARTICIPANTS VIEW (THIS WAS MISSING IN YOUR CODE) */}
      {view === 'participants' && (
        <div>
          <button
            onClick={goBackToDepartments}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#64748B',
              cursor: 'pointer',
              marginBottom: '1.5rem',
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back to Departments
          </button>

          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>
                      STUDENT NAME
                    </th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>
                      REGISTER NO
                    </th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>
                      REGISTRATION ID
                    </th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>
                      STATUS
                    </th>
                    <th style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#64748B' }}>
                      DATE
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {participants.map((p, index) => {
                    const studentName =
                      p.students?.[0]?.name || p.fullName || "-";
                    const regNo =
                      p.students?.[0]?.registerNumber || p.registerNumber || "-";

                    return (
                      <tr key={p.id} style={{ borderBottom: index < participants.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '500' }}>
                          {studentName}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>
                          {regNo}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>
                          {p.registrationId || "-"}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          {p.status || "pending"}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748B' }}>
                          {formatDate(p.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
