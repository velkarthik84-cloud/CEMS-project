🎓 College Event Management System

A web-based application designed to automate and simplify the process of managing college events. The system provides a centralized platform for organizing events, handling registrations, evaluating participants, and generating results efficiently.

🚀 Features
Event creation and management
Student registration for events
Department-wise participation tracking
Judge-based evaluation and scoring
Automatic winner generation
Certificate generation
Secure login with role-based access

👥 User Roles

🟦 Admin
Create and manage events
Manage departments and judges
Approve registrations
Generate winners and certificates

🟩 Department
View events
Register students
Track registration status
View results and download certificates

🟥 Judge
View assigned events
Evaluate participants
Submit scores
View results

🛠️ Tech Stack
Frontend: React.js
Backend: Firebase (Backend-as-a-Service)
Authentication: Firebase Authentication
Database: Firebase Firestore
Development Tool: Visual Studio Code

🗄️ Database Overview

The system uses Firebase Firestore to store and manage data.

Main Collections:
Admin
Departments
Events
Registrations
Winners
Relationships:
Events are created by Admin
Departments register for Events
Registrations link Events and Departments
Winners are generated from Registrations

⚙️ System Workflow
Admin creates and publishes events
Departments register students for events
Registrations are approved by Admin
Judges evaluate participants and submit scores
System generates winners automatically
Results and certificates are published

💻 Installation & Setup
# Clone the repository
git clone https://github.com/your-username/project-name.git

# Navigate to project folder
cd project-name

# Install dependencies
npm install

# Run the project
npm run dev
🌐 Browser Support
Google Chrome
Microsoft Edge
Mozilla Firefox
Brave

📌 Conclusion

This system reduces manual workload and provides a structured, transparent, and efficient way to manage college events using modern web technologies.
