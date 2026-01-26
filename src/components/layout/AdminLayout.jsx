// import { useState, useEffect } from 'react';
// import { Outlet } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import Header from './Header';

// const AdminLayout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsLargeScreen(window.innerWidth >= 1024);
//       if (window.innerWidth >= 1024) {
//         setSidebarOpen(false);
//       }
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const sidebarWidth = sidebarCollapsed ? '5rem' : '16rem';

//   return (
//     <>
//       <style>{`
//         .admin-layout {
//           display: flex;
//           min-height: 100vh;
//           background-color: #F8FAFC;
//         }

//         .admin-main {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           min-height: 100vh;
//           min-width: 0;
//           transition: margin-left 0.3s ease;
//           margin-left: 0;
//         }

//         .admin-content {
//           flex: 1;
//           padding: 1rem;
//           overflow-x: hidden;
//           overflow-y: auto;
//           width: 100%;
//           max-width: 100%;
//         }

//         @media (min-width: 640px) {
//           .admin-content {
//             padding: 1.25rem;
//           }
//         }

//         @media (min-width: 1024px) {
//           .admin-main {
//             margin-left: ${sidebarWidth};
//           }

//           .admin-content {
//             padding: 1.5rem;
//           }
//         }
//       `}</style>

//       <div className="admin-layout">
//         <Sidebar
//           isOpen={sidebarOpen}
//           onClose={() => setSidebarOpen(false)}
//           collapsed={sidebarCollapsed}
//           onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
//         />

//         <div className="admin-main" style={{ marginLeft: isLargeScreen ? sidebarWidth : 0 }}>
//           <Header onMenuClick={() => setSidebarOpen(true)} />
//           <main className="admin-content">
//             <Outlet />
//           </main>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AdminLayout;


import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = sidebarCollapsed ? '5rem' : '16rem';

  return (
    <>
      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #F8FAFC;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          min-width: 0;
          transition: margin-left 0.3s ease;
          margin-left: 0;
        }

        .admin-content {
          flex: 1;
          padding: 1rem;
          overflow-x: hidden;
          overflow-y: auto;
          width: 100%;
          max-width: 100%;
        }

        .admin-footer {
          padding: 0.75rem 1.25rem;
          background: #ffffff;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          font-size: 0.875rem;
          color: #6B7280;
        }

        @media (min-width: 640px) {
          .admin-content {
            padding: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .admin-main {
            margin-left: ${sidebarWidth};
          }

          .admin-content {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="admin-layout">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div
          className="admin-main"
          style={{ marginLeft: isLargeScreen ? sidebarWidth : 0 }}
        >
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="admin-content">
            <Outlet />
          </main>

          {/* ✅ Footer */}
          <footer className="admin-footer">
            © {new Date().getFullYear()} Your Company Name. All rights reserved.
          </footer>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
