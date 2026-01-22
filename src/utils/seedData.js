import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

// Sample Department Data
export const sampleDepartments = [
  {
    name: 'Computer Science Engineering',
    code: 'CSE',
    username: 'dept_cse',
    password: 'Cse@1234',
    hodName: 'Dr. Rajesh Kumar',
    email: 'cse@college.edu',
    phone: '9876543210',
    isActive: true,
  },
  {
    name: 'Electronics & Communication',
    code: 'ECE',
    username: 'dept_ece',
    password: 'Ece@1234',
    hodName: 'Dr. Priya Sharma',
    email: 'ece@college.edu',
    phone: '9876543211',
    isActive: true,
  },
  {
    name: 'Mechanical Engineering',
    code: 'MECH',
    username: 'dept_mech',
    password: 'Mech@1234',
    hodName: 'Dr. Suresh Reddy',
    email: 'mech@college.edu',
    phone: '9876543212',
    isActive: true,
  },
  {
    name: 'Electrical Engineering',
    code: 'EEE',
    username: 'dept_eee',
    password: 'Eee@1234',
    hodName: 'Dr. Anita Verma',
    email: 'eee@college.edu',
    phone: '9876543213',
    isActive: true,
  },
  {
    name: 'Civil Engineering',
    code: 'CIVIL',
    username: 'dept_civil',
    password: 'Civil@1234',
    hodName: 'Dr. Mohan Das',
    email: 'civil@college.edu',
    phone: '9876543214',
    isActive: true,
  },
];

// Function to seed departments
export const seedDepartments = async () => {
  const departmentsRef = collection(db, 'departments');
  const results = [];

  for (const dept of sampleDepartments) {
    try {
      // Check if department already exists
      const existingQuery = query(departmentsRef, where('username', '==', dept.username));
      const existingSnapshot = await getDocs(existingQuery);

      if (existingSnapshot.empty) {
        // Create new department
        const docRef = await addDoc(departmentsRef, {
          ...dept,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        results.push({ success: true, department: dept.name, id: docRef.id });
        console.log(`✅ Created department: ${dept.name} (${dept.username})`);
      } else {
        results.push({ success: false, department: dept.name, reason: 'Already exists' });
        console.log(`⚠️ Department already exists: ${dept.name}`);
      }
    } catch (error) {
      results.push({ success: false, department: dept.name, reason: error.message });
      console.error(`❌ Error creating ${dept.name}:`, error);
    }
  }

  return results;
};

// Function to get all departments (for testing)
export const getAllDepartments = async () => {
  const departmentsRef = collection(db, 'departments');
  const snapshot = await getDocs(departmentsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export default seedDepartments;
