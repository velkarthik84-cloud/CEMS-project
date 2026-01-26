import { useState, useEffect } from "react";
import { Calendar, Users, Building2, Plus } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalDepartments: 0,
    todayRegistrations: 0,
    todayAddedEvents: 0,
  });

  const [todayEvents, setTodayEvents] = useState([]);
  const [todayUsers, setTodayUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ---------------- DATE HELPERS ---------------- */

  const toDate = (value) => {
    if (!value) return null;
    return value.toDate ? value.toDate() : new Date(value);
  };

  const isToday = (value) => {
    const date = toDate(value);
    if (!date) return false;

    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatDate = (value) => {
    const date = toDate(value);
    if (!date) return "-";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ---------------- MAIN FETCH ---------------- */

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [eventsSnap, deptSnap, regSnap] = await Promise.all([
        getDocs(collection(db, "events")),
        getDocs(collection(db, "departments")),
        getDocs(collection(db, "registrations")),
      ]);

      /* -------- DEPARTMENTS MAP -------- */
      const departmentMap = {};
      deptSnap.docs.forEach(doc => {
        departmentMap[doc.id] = doc.data().name; // department name field
      });

      /* -------- EVENTS -------- */
      const events = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const todayCreatedEvents = events.filter(e =>
        isToday(e.createdAt)
      );

      setTodayEvents(todayCreatedEvents);

      /* -------- REGISTRATIONS -------- */
      let todayStudentCount = 0;
      let todayStudents = [];

      regSnap.docs.forEach(doc => {
        const data = doc.data();

        if (isToday(data.createdAt) && Array.isArray(data.students)) {
          todayStudentCount += data.students.length;

          data.students.forEach(student => {
            todayStudents.push({
              id: `${doc.id}-${student.registerNumber}`,
              name: student.name,
              registerNumber: student.registerNumber,
              departmentName:
                departmentMap[student.departmentId] ||
                student.departmentName ||
                "-",
              title: data.eventTitle || "-",
            });
          });
        }
      });

      setTodayUsers(todayStudents);

      /* -------- STATS -------- */
      setStats({
        totalEvents: eventsSnap.size,
        totalDepartments: deptSnap.size,
        todayRegistrations: todayStudentCount,
        todayAddedEvents: todayCreatedEvents.length,
      });

    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI STYLES ---------------- */

  const card = {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,.1)",
    display: "flex",
    gap: 16,
    alignItems: "center",
  };

  const iconBox = (bg) => ({
    width: 56,
    height: 56,
    borderRadius: 16,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const tableUI = {
    card: {
      background: "#fff",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,.1)",
      marginTop: 32,
    },
    header: {
      display: "flex",
      gap: 10,
      fontSize: 20,
      fontWeight: 600,
      marginBottom: 20,
      alignItems: "center",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0 12px",
    },
    th: {
      textAlign: "left",
      fontSize: 13,
      color: "#64748B",
    },
    row: {
      background: "#F8FAFC",
    },
    td: {
      padding: 16,
      fontSize: 14,
    },
    empty: {
      padding: 20,
      textAlign: "center",
      color: "#64748B",
    },
  };

  if (loading) {
    return (
      <div style={{ minHeight: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
      <p style={{ color: "#64748B", marginBottom: 24 }}>
        Welcome back! Here's today's overview.
      </p>

      {/* STATS */}
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        <div style={card}>
          <div style={iconBox("rgba(139,92,246,.1)")}>
            <Calendar color="#8B5CF6" />
          </div>
          <div>
            <div>Total Events</div>
            <strong>{stats.totalEvents}</strong>
          </div>
        </div>

        <div style={card}>
          <div style={iconBox("rgba(233,30,99,.1)")}>
            <Building2 color="#E91E63" />
          </div>
          <div>
            <div>Total Departments</div>
            <strong>{stats.totalDepartments}</strong>
          </div>
        </div>

        <div style={card}>
          <div style={iconBox("rgba(16,185,129,.1)")}>
            <Users color="#10B981" />
          </div>
          <div>
            <div>Today's Registrations</div>
            <strong>{stats.todayRegistrations}</strong>
          </div>
        </div>

        <div style={card}>
          <div style={iconBox("rgba(245,158,11,.1)")}>
            <Plus color="#F59E0B" />
          </div>
          <div>
            <div>Today's Added Events</div>
            <strong>{stats.todayAddedEvents}</strong>
          </div>
        </div>
      </div>

      {/* TODAY EVENTS */}
      <div style={tableUI.card}>
        <div style={tableUI.header}>
          <Calendar /> Today Created Events
        </div>
        <table style={tableUI.table}>
          <thead>
            <tr>
              <th style={tableUI.th}>S No</th>
              <th style={tableUI.th}>Event</th>
              <th style={tableUI.th}>Date</th>
              <th style={tableUI.th}>Category</th>
              <th style={tableUI.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {todayEvents.length === 0 ? (
              <tr>
                <td colSpan="5" style={tableUI.empty}>No events today</td>
              </tr>
            ) : (
              todayEvents.map((e, i) => (
                <tr key={e.id} style={tableUI.row}>
                  <td style={tableUI.td}>{i + 1}</td>
                  <td style={tableUI.td}>{e.title}</td>
                  <td style={tableUI.td}>{formatDate(e.eventDate || e.createdAt)}</td>
                  <td style={tableUI.td}>{e.category}</td>
                  <td style={tableUI.td}>{e.status || "Active"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TODAY STUDENTS */}
      <div style={tableUI.card}>
        <div style={tableUI.header}>
          <Users /> Today Registered Students
        </div>
        <table style={tableUI.table}>
          <thead>
            <tr>
              <th style={tableUI.th}>S No</th>
              <th style={tableUI.th}>Name</th>
              <th style={tableUI.th}>Department</th>
              <th style={tableUI.th}>Event</th>
              <th style={tableUI.th}>Register No</th>
            </tr>
          </thead>
          <tbody>
            {todayUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={tableUI.empty}>No registrations today</td>
              </tr>
            ) : (
              todayUsers.map((u, i) => (
                <tr key={u.id} style={tableUI.row}>
                  <td style={tableUI.td}>{i + 1}</td>
                  <td style={tableUI.td}>{u.name}</td>
                  <td style={tableUI.td}>{u.departmentName}</td>
                  <td style={tableUI.td}>{u.title}</td>
                  <td style={tableUI.td}>{u.registerNumber}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
