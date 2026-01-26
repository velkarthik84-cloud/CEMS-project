// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Calendar, Users, MapPin, Clock, ArrowRight, Search, Star, TrendingUp } from 'lucide-react';
// import { collection, query, where, getDocs } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import { Button, Card } from '../../components/common';
// import { format } from 'date-fns';
// import { EVENT_CATEGORIES } from '../../utils/constants';

// const Home = () => {
//   const [featuredEvents, setFeaturedEvents] = useState([]);
//   const [upcomingEvents, setUpcomingEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState('all');

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       const eventsRef = collection(db, 'events');
//       const q = query(
//         eventsRef,
//         where('status', '==', 'published')
//       );
//       const snapshot = await getDocs(q);
//       const events = snapshot.docs
//         .map(doc => ({ id: doc.id, ...doc.data() }))
//         .sort((a, b) => {
//           const dateA = a.eventDate?.toDate ? a.eventDate.toDate() : new Date(a.eventDate);
//           const dateB = b.eventDate?.toDate ? b.eventDate.toDate() : new Date(b.eventDate);
//           return dateA - dateB;
//         })
//         .slice(0, 8);

//       setFeaturedEvents(events.slice(0, 3));
//       setUpcomingEvents(events);
//     } catch (error) {
//       console.error('Error fetching events:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (timestamp) => {
//     if (!timestamp) return '';
//     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//     return format(date, 'MMM dd, yyyy');
//   };

//   const heroStyle = {
//     position: 'relative',
//     background: 'linear-gradient(135deg, #1E3A5F 0%, #152C4A 50%, #1E3A5F 100%)',
//     overflow: 'hidden',
//   };

//   const heroContentStyle = {
//     maxWidth: '80rem',
//     margin: '0 auto',
//     padding: '5rem 1rem',
//     position: 'relative',
//   };

//   const heroTitleStyle = {
//     fontSize: '2.5rem',
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: '1.5rem',
//     textAlign: 'center',
//   };

//   const heroSubtitleStyle = {
//     fontSize: '1.125rem',
//     color: 'rgba(255, 255, 255, 0.8)',
//     maxWidth: '42rem',
//     margin: '0 auto 2.5rem',
//     textAlign: 'center',
//   };

//   const searchContainerStyle = {
//     maxWidth: '42rem',
//     margin: '0 auto',
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '1rem',
//   };

//   const searchInputContainerStyle = {
//     flex: 1,
//     position: 'relative',
//   };

//   const searchInputStyle = {
//     width: '100%',
//     padding: '1rem 1rem 1rem 3rem',
//     borderRadius: '0.75rem',
//     fontSize: '1rem',
//     border: 'none',
//     outline: 'none',
//     boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
//   };

//   const statsContainerStyle = {
//     display: 'flex',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     gap: '2rem',
//     marginTop: '3rem',
//   };

//   const statItemStyle = {
//     textAlign: 'center',
//   };

//   const statValueStyle = {
//     fontSize: '1.875rem',
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   };

//   const statLabelStyle = {
//     color: 'rgba(255, 255, 255, 0.7)',
//   };

//   const sectionStyle = {
//     padding: '4rem 1rem',
//     maxWidth: '80rem',
//     margin: '0 auto',
//   };

//   const sectionHeaderStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: '2rem',
//   };

//   const sectionTitleStyle = {
//     fontSize: '1.5rem',
//     fontWeight: 'bold',
//     color: '#1E3A5F',
//   };

//   const sectionSubtitleStyle = {
//     color: '#64748B',
//     marginTop: '0.25rem',
//   };

//   const gridStyle = {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
//     gap: '1.5rem',
//   };

//   const categorySectionStyle = {
//     padding: '3rem 1rem',
//     backgroundColor: '#FFFFFF',
//     borderBottom: '1px solid #F1F5F9',
//   };

//   const categoryContainerStyle = {
//     maxWidth: '80rem',
//     margin: '0 auto',
//     display: 'flex',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     gap: '0.75rem',
//   };

//   const categoryButtonStyle = (isActive) => ({
//     padding: '0.5rem 1rem',
//     borderRadius: '9999px',
//     fontSize: '0.875rem',
//     fontWeight: '500',
//     border: 'none',
//     cursor: 'pointer',
//     transition: 'all 0.2s ease',
//     backgroundColor: isActive ? '#1E3A5F' : '#F1F5F9',
//     color: isActive ? '#FFFFFF' : '#64748B',
//   });

//   const howItWorksSectionStyle = {
//     padding: '4rem 1rem',
//     maxWidth: '80rem',
//     margin: '0 auto',
//   };

//   const howItWorksGridStyle = {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
//     gap: '2rem',
//     marginTop: '3rem',
//   };

//   const howItWorksCardStyle = {
//     textAlign: 'center',
//   };

//   const howItWorksIconStyle = (color) => ({
//     width: '4rem',
//     height: '4rem',
//     borderRadius: '1rem',
//     backgroundColor: color,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     margin: '0 auto 1rem',
//   });

//   const ctaSectionStyle = {
//     padding: '4rem 1rem',
//     backgroundColor: '#1E3A5F',
//     textAlign: 'center',
//   };

//   const ctaContentStyle = {
//     maxWidth: '48rem',
//     margin: '0 auto',
//   };

//   const ctaTitleStyle = {
//     fontSize: '1.875rem',
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: '1rem',
//   };

//   const ctaDescStyle = {
//     color: 'rgba(255, 255, 255, 0.8)',
//     marginBottom: '2rem',
//   };

//   const ctaButtonsStyle = {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '1rem',
//     justifyContent: 'center',
//     alignItems: 'center',
//   };

//   return (
//     <div style={{ backgroundColor: '#F5F7FA' }}>
//       {/* Hero Section */}
//       <section style={heroStyle}>
//         <div style={heroContentStyle}>
//           <h1 style={heroTitleStyle}>
//             Discover & Join
//             <span style={{ color: '#E91E63' }}> Amazing Events</span>
//           </h1>
//           <p style={heroSubtitleStyle}>
//             Find workshops, seminars, conferences, and more. Register instantly with
//             QR-based entry and seamless payment.
//           </p>

//           {/* Search Bar */}
//           <div style={searchContainerStyle}>
//             <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
//               <div style={searchInputContainerStyle}>
//                 <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: '#9CA3AF' }} />
//                 <input
//                   type="text"
//                   placeholder="Search events, workshops, seminars..."
//                   style={searchInputStyle}
//                 />
//               </div>
//               <Button size="lg" variant="accent">
//                 Search Events
//               </Button>
//             </div>
//           </div>

//           {/* Stats */}
//           <div style={statsContainerStyle}>
//             <div style={statItemStyle}>
//               <div style={statValueStyle}>500+</div>
//               <div style={statLabelStyle}>Events Hosted</div>
//             </div>
//             <div style={statItemStyle}>
//               <div style={statValueStyle}>10K+</div>
//               <div style={statLabelStyle}>Participants</div>
//             </div>
//             <div style={statItemStyle}>
//               <div style={statValueStyle}>50+</div>
//               <div style={statLabelStyle}>Organizations</div>
//             </div>
//             <div style={statItemStyle}>
//               <div style={statValueStyle}>4.9</div>
//               <div style={{ ...statLabelStyle, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
//                 <Star style={{ width: '1rem', height: '1rem', fill: 'currentColor' }} /> Rating
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Categories */}
//       <section style={categorySectionStyle}>
//         <div style={categoryContainerStyle}>
//           <button
//             onClick={() => setSelectedCategory('all')}
//             style={categoryButtonStyle(selectedCategory === 'all')}
//           >
//             All Events
//           </button>
//           {EVENT_CATEGORIES.map((category) => (
//             <button
//               key={category.value}
//               onClick={() => setSelectedCategory(category.value)}
//               style={categoryButtonStyle(selectedCategory === category.value)}
//             >
//               {category.label}
//             </button>
//           ))}
//         </div>
//       </section>

//       {/* Featured Events */}
//       <section style={sectionStyle}>
//         <div style={sectionHeaderStyle}>
//           <div>
//             <h2 style={sectionTitleStyle}>Featured Events</h2>
//             <p style={sectionSubtitleStyle}>Hand-picked events you don't want to miss</p>
//           </div>
//           <Link to="/events">
//             <Button variant="ghost" icon={ArrowRight} iconPosition="right">
//               View All
//             </Button>
//           </Link>
//         </div>

//         {loading ? (
//           <div style={gridStyle}>
//             {[1, 2, 3].map((i) => (
//               <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
//                 <div style={{ height: '12rem', backgroundColor: '#E5E7EB', borderRadius: '0.75rem 0.75rem 0 0' }} />
//                 <div style={{ padding: '1.5rem' }}>
//                   <div style={{ height: '1rem', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', width: '25%', marginBottom: '0.75rem' }} />
//                   <div style={{ height: '1.5rem', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', width: '75%', marginBottom: '0.75rem' }} />
//                   <div style={{ height: '1rem', backgroundColor: '#E5E7EB', borderRadius: '0.25rem', width: '50%' }} />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : featuredEvents.length > 0 ? (
//           <div style={gridStyle}>
//             {featuredEvents.map((event) => (
//               <EventCard key={event.id} event={event} formatDate={formatDate} />
//             ))}
//           </div>
//         ) : (
//           <div style={{ textAlign: 'center', padding: '3rem 0' }}>
//             <Calendar style={{ width: '4rem', height: '4rem', color: '#D1D5DB', margin: '0 auto 1rem' }} />
//             <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#1E3A5F', marginBottom: '0.5rem' }}>
//               No events yet
//             </h3>
//             <p style={{ color: '#64748B' }}>Check back later for upcoming events</p>
//           </div>
//         )}
//       </section>

//       {/* Upcoming Events */}
//       <section style={{ ...sectionStyle, backgroundColor: '#F8FAFC', padding: '4rem 1rem' }}>
//         <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
//           <div style={sectionHeaderStyle}>
//             <div>
//               <h2 style={sectionTitleStyle}>Upcoming Events</h2>
//               <p style={sectionSubtitleStyle}>Don't miss out on these amazing opportunities</p>
//             </div>
//             <Link to="/events">
//               <Button variant="ghost" icon={ArrowRight} iconPosition="right">
//                 View All
//               </Button>
//             </Link>
//           </div>

//           {upcomingEvents.length > 0 ? (
//             <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
//               {upcomingEvents.map((event) => (
//                 <EventCard key={event.id} event={event} formatDate={formatDate} compact />
//               ))}
//             </div>
//           ) : (
//             <div style={{ textAlign: 'center', padding: '3rem 0' }}>
//               <p style={{ color: '#64748B' }}>No upcoming events available</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* How It Works */}
//       <section style={howItWorksSectionStyle}>
//         <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
//           <h2 style={sectionTitleStyle}>How It Works</h2>
//           <p style={sectionSubtitleStyle}>Get started in just 3 simple steps</p>
//         </div>

//         <div style={howItWorksGridStyle}>
//           <div style={howItWorksCardStyle}>
//             <div style={howItWorksIconStyle('rgba(233, 30, 99, 0.1)')}>
//               <Search style={{ width: '2rem', height: '2rem', color: '#E91E63' }} />
//             </div>
//             <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E3A5F', marginBottom: '0.5rem' }}>
//               Browse Events
//             </h3>
//             <p style={{ color: '#64748B' }}>
//               Explore a wide range of events from workshops to conferences
//             </p>
//           </div>
//           <div style={howItWorksCardStyle}>
//             <div style={howItWorksIconStyle('rgba(30, 58, 95, 0.1)')}>
//               <Users style={{ width: '2rem', height: '2rem', color: '#1E3A5F' }} />
//             </div>
//             <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E3A5F', marginBottom: '0.5rem' }}>
//               Register & Pay
//             </h3>
//             <p style={{ color: '#64748B' }}>
//               Fill in your details and complete payment securely
//             </p>
//           </div>
//           <div style={howItWorksCardStyle}>
//             <div style={howItWorksIconStyle('rgba(16, 185, 129, 0.1)')}>
//               <TrendingUp style={{ width: '2rem', height: '2rem', color: '#10B981' }} />
//             </div>
//             <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E3A5F', marginBottom: '0.5rem' }}>
//               Attend & Learn
//             </h3>
//             <p style={{ color: '#64748B' }}>
//               Use your QR code for entry and enjoy the event
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section style={ctaSectionStyle}>
//         <div style={ctaContentStyle}>
//           <h2 style={ctaTitleStyle}>Ready to Host Your Own Event?</h2>
//           <p style={ctaDescStyle}>
//             Create and manage events with our powerful dashboard. QR-based entry,
//             payment processing, and real-time analytics included.
//           </p>
//           <div style={ctaButtonsStyle}>
//             <Link to="/register">
//               <Button size="lg" variant="accent">
//                 Get Started Free
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// // Event Card Component
// const EventCard = ({ event, formatDate, compact = false }) => {
//   const [isHovered, setIsHovered] = useState(false);

//   const cardStyle = {
//     backgroundColor: '#FFFFFF',
//     borderRadius: '0.75rem',
//     overflow: 'hidden',
//     boxShadow: isHovered ? '0 20px 25px -5px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
//     transition: 'all 0.3s ease',
//     transform: isHovered ? 'translateY(-4px)' : 'none',
//     cursor: 'pointer',
//   };

//   const imageContainerStyle = {
//     position: 'relative',
//     height: compact ? '9rem' : '12rem',
//     overflow: 'hidden',
//   };

//   const imageStyle = {
//     width: '100%',
//     height: '100%',
//     objectFit: 'cover',
//     transition: 'transform 0.3s ease',
//     transform: isHovered ? 'scale(1.05)' : 'scale(1)',
//   };

//   const placeholderStyle = {
//     width: '100%',
//     height: '100%',
//     background: 'linear-gradient(135deg, #1E3A5F 0%, #152C4A 100%)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   };

//   const categoryBadgeStyle = {
//     position: 'absolute',
//     top: '0.75rem',
//     left: '0.75rem',
//     padding: '0.25rem 0.75rem',
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: '9999px',
//     fontSize: '0.75rem',
//     fontWeight: '500',
//     color: '#1E3A5F',
//   };

//   const priceBadgeStyle = {
//     position: 'absolute',
//     top: '0.75rem',
//     right: '0.75rem',
//     padding: '0.25rem 0.75rem',
//     backgroundColor: '#E91E63',
//     borderRadius: '9999px',
//     fontSize: '0.75rem',
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   };

//   const contentStyle = {
//     padding: compact ? '1rem' : '1.5rem',
//   };

//   const titleStyle = {
//     fontWeight: '600',
//     color: '#1E3A5F',
//     marginBottom: '0.5rem',
//     fontSize: compact ? '0.875rem' : '1.125rem',
//     overflow: 'hidden',
//     display: '-webkit-box',
//     WebkitLineClamp: 2,
//     WebkitBoxOrient: 'vertical',
//   };

//   const metaStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',
//     fontSize: '0.875rem',
//     color: '#64748B',
//     marginBottom: '0.375rem',
//   };

//   const footerStyle = {
//     marginTop: '1rem',
//     paddingTop: '1rem',
//     borderTop: '1px solid #F1F5F9',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   };

//   return (
//     <Link to={`/events/${event.id}`}>
//       <div
//         style={cardStyle}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         <div style={imageContainerStyle}>
//           {event.bannerUrl ? (
//             <img src={event.bannerUrl} alt={event.title} style={imageStyle} />
//           ) : (
//             <div style={placeholderStyle}>
//               <Calendar style={{ width: '3rem', height: '3rem', color: 'rgba(255,255,255,0.5)' }} />
//             </div>
//           )}
//           <div style={categoryBadgeStyle}>{event.category}</div>
//           {event.fee > 0 && (
//             <div style={priceBadgeStyle}>₹{event.fee}</div>
//           )}
//         </div>
//         <div style={contentStyle}>
//           <h3 style={titleStyle}>{event.title}</h3>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
//             <div style={metaStyle}>
//               <Calendar style={{ width: '1rem', height: '1rem' }} />
//               {formatDate(event.eventDate)}
//             </div>
//             {!compact && (
//               <>
//                 <div style={metaStyle}>
//                   <Clock style={{ width: '1rem', height: '1rem' }} />
//                   {event.startTime} - {event.endTime}
//                 </div>
//                 <div style={metaStyle}>
//                   <MapPin style={{ width: '1rem', height: '1rem' }} />
//                   {event.type === 'online' ? 'Online Event' : event.venue || 'TBA'}
//                 </div>
//               </>
//             )}
//           </div>
//           {!compact && (
//             <div style={footerStyle}>
//               <div style={{ ...metaStyle, marginBottom: 0 }}>
//                 <Users style={{ width: '1rem', height: '1rem' }} />
//                 {event.currentCount || 0}/{event.maxParticipants} registered
//               </div>
//               <span style={{ color: '#1E3A5F', fontWeight: '500', fontSize: '0.875rem' }}>
//                 View Details →
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default Home;


import Login from '../auth/Login';

const Home = () => {
  return <Login />;
};

export default Home;
