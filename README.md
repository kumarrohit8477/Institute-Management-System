# Institute Management System

A robust, enterprise-grade, multi-tenant Institute Management System designed for coaching centers, academies, colleges, and training institutes.

---

## 📁 Independent Applications Structure

This project contains three **independent standalone applications**:

```
institute-management-system/
├── backend/                  # Standalone Node.js + Express REST API (institute-backend)
│   ├── src/                  # Controllers, Services, Middlewares, Routes, Types, Common
│   ├── package.json
│   └── tsconfig.json
├── web/                      # Standalone React Admin & Student Web Portal (institute-web)
│   ├── src/                  # Views, Components, Hooks, API client, Types, Common
│   ├── package.json
│   └── tsconfig.json
├── mobile/                   # Standalone React Native / Expo Student Mobile App (institute-mobile)
│   ├── src/                  # Screens, Navigation, Components, Types, Common
│   ├── package.json
│   └── tsconfig.json
├── architecture/             # Architectural Blueprint & Specifications
└── .gitignore                # Universal Git ignore rules
```

---

## 🚀 Quick Start

Each application is completely independent and can be installed and executed from its respective directory.

### 1. Backend API (`backend/`)
```bash
cd backend
npm install
npm run dev
```

### 2. Web Portal (`web/`)
```bash
cd web
npm install
npm run dev
```

### 3. Mobile Application (`mobile/`)
```bash
cd mobile
npm install
npm run start
```
