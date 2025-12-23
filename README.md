# 🎓 CertiVerify ->  Digital Certificate Management System (MERN)

A **secure, role-based, production-ready Digital Certificate Platform** built with the **MERN stack**, designed to issue, manage, and verify certificates seamlessly.

This project is not just CRUD — it reflects **real-world system design**, **RBAC security**, and **scalable architecture** similar to platforms used by universities, ed-tech companies, and government initiatives.

---

## 🚀 Why This Project Stands Out

✅ **Real-world use case** (Education, Internships, Skill Verification)
✅ **Role-Based Access Control (RBAC)**
✅ **Secure Certificate Verification (Public)**
✅ **Admin-controlled issuance**
✅ **Production-grade architecture**

> Anyone can **verify a certificate**, but **only admins can issue** — just like real institutions.

---

## 🧩 Tech Stack

### Frontend

* ⚛️ React (Vite)
* 🎨 Tailwind CSS
* 🔐 JWT Authentication
* 🌐 Axios

### Backend

* 🟢 Node.js
* 🚂 Express.js
* 🍃 MongoDB + Mongoose
* 🔐 JWT + Role Guards
* 📄 PDF Certificate Generation

---

## 👥 User Roles & Permissions

| Role            | Capabilities                                    |
| --------------- | ----------------------------------------------- |
| **Admin**       | Issue certificates, view stats, manage students |
| **Student**     | Login & view own certificates                   |
| **Public User** | Verify certificate via ID                       |

RBAC is strictly enforced at **API level**.

---

## 🖥️ Core Features

### 🔐 Authentication & Authorization

* JWT-based login
* Role-based protected routes

### 📜 Certificate Issuance

* Admin selects student & course
* Auto-generated unique Certificate ID
* Secure PDF creation

### 🔎 Certificate Verification

* Public verification using Certificate ID
* No login required

### 📊 Admin Dashboard

* Total certificates issued
* Active certificates
* Students count
* Monthly statistics

### 📁 Certificate Management

* View all certificates
* Search & filter
* Download/View certificate PDFs

---

## 🏗️ Project Architecture

```
root/
│── frontend/   # React + Vite
│── backend/    # Node + Express
│── README.md
```

Backend follows **MVC pattern**:

* Controllers
* Models
* Routes
* Middlewares

---

## 🔒 Security Highlights

* JWT Authentication
* Role-based route protection
* Public verification without exposing private data
* Secure API structure

---

## 🌍 Real-World Applications

* 🎓 Universities & Colleges
* 🏫 Training Institutes
* 🧑‍💻 Internship Platforms
* 🏛 Government Skill Programs

This system can **replace manual certificate handling** and prevent fraud.

---

## 🛠️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <repo-url>
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create `.env`:

```
MONGO_URI=
JWT_SECRET=
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌱 Future Enhancements

* QR Code based verification
* Email certificate delivery
* Admin analytics dashboard
* Blockchain-based certificate hash

---

## 🧠 What This Project Demonstrates

✔ Full-stack MERN proficiency
✔ Secure backend design
✔ RBAC implementation
✔ Clean UI/UX
✔ Real-world problem solving

---

## 🤝 Conclusion

This project is built with **industry practices in mind** — scalable, secure, and practical.

If you're looking for a **real MERN project** beyond tutorials, this is it.

---

⭐ *If you like this project, feel free to star the repository!*
