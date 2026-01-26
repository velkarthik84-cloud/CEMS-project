// import { useEffect, useState } from "react";
// import {
//   Users,
//   Search,
//   Grid,
//   List,
//   Mail,
//   Calendar,
//   Eye,
//   EyeOff,
//   Copy,
//   Edit,
//   Power,
//   Trash2,
// } from "lucide-react";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "../../services/firebase";

// const Judges = () => {
//   const [judges, setJudges] = useState([]);
//   const [filteredJudges, setFilteredJudges] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [viewMode, setViewMode] = useState("list");

//   useEffect(() => {
//     fetchJudgesFromEvents();
//   }, []);

//   useEffect(() => {
//     filterJudges();
//   }, [searchTerm, judges]);

//   // 🔥 FETCH JUDGES
//   const fetchJudgesFromEvents = async () => {
//     try {
//       const ref = collection(db, "events");
//       const q = query(ref, where("status", "==", "published"));
//       const snapshot = await getDocs(q);

//       let allJudges = [];

//       snapshot.docs.forEach(doc => {
//         const event = doc.data();
//         const eventJudges = event.judges || [];

//         eventJudges.forEach(judge => {
//           allJudges.push({
//             ...judge,
//             eventId: doc.id,
//             eventTitle: event.title,
//           });
//         });
//       });

//       // ✅ REMOVE DUPLICATES (EMAIL)
//       const uniqueJudges = Object.values(
//         allJudges.reduce((acc, j) => {
//           acc[j.email] = j;
//           return acc;
//         }, {})
//       );

//       setJudges(uniqueJudges);
//       setFilteredJudges(uniqueJudges);
//     } catch (error) {
//       console.error("Error fetching judges:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterJudges = () => {
//     if (!searchTerm) {
//       setFilteredJudges(judges);
//       return;
//     }

//     const filtered = judges.filter(j =>
//       j.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       j.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       j.username?.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     setFilteredJudges(filtered);
//   };

//   return (
//     <div style={container}>
//       <div style={content}>
//         <h1 style={title}>Judges</h1>
//         <p style={subtitle}>Judges assigned across all events</p>

//         {/* SEARCH + VIEW */}
//         <div style={toolbar}>
//           <div style={searchBox}>
//             <Search size={18} />
//             <input
//               placeholder="Search judges..."
//               value={searchTerm}
//               onChange={e => setSearchTerm(e.target.value)}
//               style={{ border: "none", outline: "none", width: "100%" }}
//             />
//           </div>

//           <div style={toggle}>
//             <button onClick={() => setViewMode("grid")} style={viewBtn(viewMode === "grid")}>
//               <Grid size={16} />
//             </button>
//             <button onClick={() => setViewMode("list")} style={viewBtn(viewMode === "list")}>
//               <List size={16} />
//             </button>
//           </div>
//         </div>

//         {/* CONTENT */}
//         {loading ? (
//           <p>Loading judges...</p>
//         ) : filteredJudges.length === 0 ? (
//           <EmptyState />
//         ) : viewMode === "grid" ? (
//           <div style={grid}>
//             {filteredJudges.map((judge, i) => (
//               <JudgeGridCard key={i} judge={judge} />
//             ))}
//           </div>
//         ) : (
//           <div style={list}>
//             {filteredJudges.map((judge, i) => (
//               <JudgeListCard key={i} judge={judge} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ---------------- COMPONENTS ---------------- */

// const JudgeGridCard = ({ judge }) => (
//   <div style={card}>
//     <Users size={32} color="#1E3A5F" />
//     <h3>{judge.name}</h3>
//     <p>@{judge.username}</p>
//     <p style={meta}><Mail size={14} /> {judge.email}</p>
//     <p style={meta}><Calendar size={14} /> {judge.eventTitle}</p>
//   </div>
// );

// const JudgeListCard = ({ judge }) => {
//   const [showPassword, setShowPassword] = useState(false);

//   return (
//     <div style={judgeCard}>
//       {/* CODE */}
//       <div style={codeBadge}>{judge.code || "20"}</div>

//       {/* DETAILS */}
//       <div style={{ flex: 1 }}>
//         <div style={cardHeader}>
//           <h3 style={cardTitle}>{judge.name}</h3>
//           <span style={statusBadge}>✔ Active</span>
//         </div>

//         <p style={subText}>Code: {judge.code || "20"}</p>

//         <div style={credentials}>
//           <div>
//             <p style={label}>USERNAME</p>
//             <p style={value}>{judge.username}</p>
//           </div>

//           <div>
//             <p style={label}>PASSWORD</p>
//             <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
//               <p style={value}>
//                 {showPassword ? judge.password : "••••••••"}
//               </p>
//               <button onClick={() => setShowPassword(!showPassword)} style={iconBtn}>
//                 {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ACTIONS */}
//       <div style={actions}>
//         <button style={actionBtn}><Copy size={16} /></button>
//         <button style={actionBtn}><Edit size={16} /></button>
//         <button style={{ ...actionBtn, background: "#FEF3C7" }}>
//           <Power size={16} color="#D97706" />
//         </button>
//         <button style={{ ...actionBtn, background: "#FEE2E2" }}>
//           <Trash2 size={16} color="#DC2626" />
//         </button>
//       </div>
//     </div>
//   );
// };

// const EmptyState = () => (
//   <div style={{ textAlign: "center", padding: "3rem" }}>
//     <Users size={48} color="#CBD5E1" />
//     <p>No judges found</p>
//   </div>
// );

// /* ---------------- STYLES ---------------- */

// const container = { minHeight: "100vh", background: "#F5F7FA", padding: "2rem" };
// const content = { maxWidth: "80rem", margin: "0 auto" };
// const title = { fontSize: "1.875rem", fontWeight: "bold", color: "#1E3A5F" };
// const subtitle = { color: "#64748B", marginBottom: "1.5rem" };

// const toolbar = { display: "flex", gap: "1rem", marginBottom: "1.5rem" };
// const searchBox = {
//   display: "flex",
//   gap: "0.5rem",
//   alignItems: "center",
//   background: "#fff",
//   padding: "0.75rem",
//   borderRadius: "8px",
//   flex: 1,
// };

// const toggle = { display: "flex", border: "1px solid #E2E8F0", borderRadius: "8px" };
// const viewBtn = active => ({
//   padding: "0.5rem",
//   background: active ? "#1E3A5F" : "transparent",
//   color: active ? "#fff" : "#64748B",
//   border: "none",
//   cursor: "pointer",
// });

// const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "1.5rem" };
// const list = { display: "flex", flexDirection: "column", gap: "1rem" };

// const card = {
//   background: "#fff",
//   padding: "1.5rem",
//   borderRadius: "12px",
//   boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
// };

// const meta = { fontSize: "0.875rem", color: "#64748B", display: "flex", gap: "0.25rem" };

// /* IMAGE STYLE CARD */
// const judgeCard = {
//   background: "#fff",
//   borderRadius: "16px",
//   padding: "1.25rem",
//   display: "flex",
//   gap: "1.5rem",
//   alignItems: "center",
//   boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
// };

// const codeBadge = {
//   width: "56px",
//   height: "56px",
//   borderRadius: "14px",
//   background: "#1E3A5F",
//   color: "#fff",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   fontSize: "18px",
//   fontWeight: "bold",
// };

// const cardHeader = { display: "flex", gap: "12px", alignItems: "center" };
// const cardTitle = { fontSize: "18px", fontWeight: "600" };

// const statusBadge = {
//   background: "#DCFCE7",
//   color: "#16A34A",
//   padding: "4px 10px",
//   borderRadius: "999px",
//   fontSize: "12px",
// };

// const subText = { fontSize: "13px", color: "#64748B" };

// const credentials = {
//   display: "grid",
//   gridTemplateColumns: "1fr 1fr",
//   gap: "2rem",
//   marginTop: "12px",
// };

// const label = { fontSize: "12px", color: "#94A3B8" };
// const value = { fontSize: "14px", fontWeight: "500" };

// const actions = { display: "flex", gap: "10px" };
// const actionBtn = {
//   width: "36px",
//   height: "36px",
//   borderRadius: "10px",
//   border: "none",
//   background: "#F1F5F9",
//   cursor: "pointer",
// };

// const iconBtn = { border: "none", background: "transparent", cursor: "pointer" };

// export default Judges;


import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Grid,
  List,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Power,
  Trash2,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

const Judges = () => {
  const [judges, setJudges] = useState([]);
  const [filteredJudges, setFilteredJudges] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    fetchJudgesFromEvents();
  }, []);

  useEffect(() => {
    filterJudges();
  }, [searchTerm, judges]);

  // 🔥 FETCH JUDGES
  const fetchJudgesFromEvents = async () => {
    try {
      const q = query(
        collection(db, "events"),
        where("status", "==", "published")
      );
      const snapshot = await getDocs(q);

      let allJudges = [];

      snapshot.forEach(d => {
        const event = d.data();
        (event.judges || []).forEach(judge => {
          allJudges.push({
            ...judge,
            eventId: d.id,
            eventTitle: event.title,
          });
        });
      });

      const uniqueJudges = Object.values(
        allJudges.reduce((acc, j) => {
          acc[j.email] = j;
          return acc;
        }, {})
      );

      setJudges(uniqueJudges);
      setFilteredJudges(uniqueJudges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterJudges = () => {
    if (!searchTerm) return setFilteredJudges(judges);

    setFilteredJudges(
      judges.filter(j =>
        [j.name, j.email, j.username]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  };

  return (
    <div style={container}>
      <div style={content}>
        <h1 style={title}>Judges</h1>
        <p style={subtitle}>Judges assigned across all events</p>

        {/* SEARCH + VIEW */}
        <div style={toolbar}>
          <div style={searchBox}>
            <Search size={18} />
            <input
              placeholder="Search judges..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: "none", outline: "none", width: "100%" }}
            />
          </div>

          <div style={toggle}>
            <button onClick={() => setViewMode("grid")} style={viewBtn(viewMode === "grid")}>
              <Grid size={16} />
            </button>
            <button onClick={() => setViewMode("list")} style={viewBtn(viewMode === "list")}>
              <List size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading judges...</p>
        ) : viewMode === "grid" ? (
          <div style={grid}>
            {filteredJudges.map((j, i) => (
              <JudgeGridCard key={i} judge={j} />
            ))}
          </div>
        ) : (
          <div style={list}>
            {filteredJudges.map((j, i) => (
              <JudgeListCard
                key={i}
                judge={j}
                refresh={fetchJudgesFromEvents}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- CARDS ---------------- */

const JudgeGridCard = ({ judge }) => (
  <div style={card}>
    <Users size={32} color="#1E3A5F" />
    <h3>{judge.name}</h3>
    <p>@{judge.username}</p>
    <p style={meta}><Mail size={14} /> {judge.email}</p>
    <p style={meta}><Calendar size={14} /> {judge.eventTitle}</p>
  </div>
);

const JudgeListCard = ({ judge, refresh }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [active, setActive] = useState(judge.active ?? true);

  // 📋 COPY
  const copyCredentials = () => {
    navigator.clipboard.writeText(
      `Username: ${judge.username}\nPassword: ${judge.password}`
    );
    alert("Credentials copied");
  };

  // ✏️ EDIT (HOOK READY)
  const editJudge = () => {
    alert("Open edit modal / route");
  };

  // 🔌 TOGGLE ACTIVE
  const toggleActive = async () => {
    try {
      const ref = doc(db, "events", judge.eventId);
      const snap = await getDocs(query(collection(db, "events"), where("__name__", "==", judge.eventId)));

      snap.forEach(async d => {
        const event = d.data();
        const updated = event.judges.map(j =>
          j.email === judge.email ? { ...j, active: !active } : j
        );
        await updateDoc(d.ref, { judges: updated });
      });

      setActive(!active);
    } catch (e) {
      console.error(e);
    }
  };

  // 🗑 DELETE
  const deleteJudge = async () => {
    if (!window.confirm("Delete this judge?")) return;

    try {
      const ref = doc(db, "events", judge.eventId);
      const snap = await getDocs(query(collection(db, "events"), where("__name__", "==", judge.eventId)));

      snap.forEach(async d => {
        const event = d.data();
        const updated = event.judges.filter(j => j.email !== judge.email);
        await updateDoc(d.ref, { judges: updated });
      });

      refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={judgeCard}>
      <div style={codeBadge}>
  {judge?.name ? judge.name.charAt(0).toUpperCase() : "?"}
</div>

      <div style={{ flex: 1 }}>
        <div style={cardHeader}>
          <h3 style={cardTitle}>{judge.name}</h3>
          <span
            style={{
              ...statusBadge,
              background: active ? "#DCFCE7" : "#FEE2E2",
              color: active ? "#16A34A" : "#DC2626",
            }}
          >
            {active ? "✔ Active" : "✖ Inactive"}
          </span>
        </div>

        <div style={credentials}>
          <div>
            <p style={label}>USERNAME</p>
            <p style={value}>{judge.username}</p>
          </div>

          <div>
            <p style={label}>PASSWORD</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <p style={value}>
                {showPassword ? judge.password : "••••••••"}
              </p>
              <button onClick={() => setShowPassword(!showPassword)} style={iconBtn}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={actions}>
        <button style={actionBtn} onClick={copyCredentials}><Copy size={16} /></button>
        {/* <button style={actionBtn} onClick={editJudge}><Edit size={16} /></button> */}
        <button style={actionBtn} onClick={toggleActive}><Power size={16} /></button>
        <button style={{ ...actionBtn, background: "#FEE2E2" }} onClick={deleteJudge}>
          <Trash2 size={16} color="#DC2626" />
        </button>
      </div>
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const container = { minHeight: "100vh", background: "#F5F7FA", padding: "2rem" };
const content = { maxWidth: "80rem", margin: "0 auto" };
const title = { fontSize: "1.875rem", fontWeight: "bold" };
const subtitle = { color: "#64748B", marginBottom: "1.5rem" };

const toolbar = { display: "flex", gap: "1rem", marginBottom: "1.5rem" };
const searchBox = { display: "flex", gap: "0.5rem", background: "#fff", padding: "0.75rem", borderRadius: "8px", flex: 1 };
const toggle = { display: "flex", border: "1px solid #E2E8F0", borderRadius: "8px" };
const viewBtn = active => ({ padding: "0.5rem", background: active ? "#1E3A5F" : "transparent", color: active ? "#fff" : "#64748B", border: "none" });

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "1.5rem" };
const list = { display: "flex", flexDirection: "column", gap: "1rem" };

const card = { background: "#fff", padding: "1.5rem", borderRadius: "12px" };
const meta = { fontSize: "0.875rem", color: "#64748B" };

const judgeCard = { background: "#fff", borderRadius: "16px", padding: "1.25rem", display: "flex", gap: "1.5rem", alignItems: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.06)" };
const codeBadge = { width: 56, height: 56, borderRadius: 14, background: "#1E3A5F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" };
const cardHeader = { display: "flex", gap: "12px", alignItems: "center" };
const cardTitle = { fontSize: "18px", fontWeight: "600" };
const statusBadge = { padding: "4px 10px", borderRadius: "999px", fontSize: "12px" };

const credentials = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" };
const label = { fontSize: "12px", color: "#94A3B8" };
const value = { fontSize: "14px", fontWeight: "500" };

const actions = {
  display: "flex",
  gap: "10px",
};

const actionBtn = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "none",
  background: "#F1F5F9",
  cursor: "pointer",

  /* 🔥 CENTER ICON */
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const iconBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",

  /* 🔥 CENTER ICON */
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


export default Judges;
