# 🎵 GROOVE — Real-time Group Music Sharing Platform

Welcome to **GROOVE**, a synchronized music listening platform that lets users create and join rooms to share and experience music together in real-time with friends.

---

## ✨ Features

- 🔐 **Room System**  
  Create and join music rooms using a unique 6-character room code.

- 🧑‍🤝‍🧑 **Participants Management**  
  Realtime display of all room members (host + listeners) using Supabase Realtime.

- 💬 **Personalized Identity**  
  Each user joins a room with their chosen display name — no authentication required.

- 💽 **Music Sync Engine** *(Coming Soon)*  
  Sync music playback across all users in a room.

---

## 🛠 Tech Stack

- **Frontend**: React + Vite  
- **Backend**: Supabase (Database + Realtime)  
- **Styling**: Tailwind CSS + Radix UI  
- **Icons**: Lucide  
- **State Management**: React Hooks  
- **Routing**: React Router

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/krisha-pisat/Groove.git
cd groove
```

### 2. Install Dependencies

```bash
npm install
# or
yarn
```

### 3. Set up `.env` file

Create a `.env` file in the root with the following keys:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ Make sure to enable Realtime on your Supabase tables and configure RLS policies properly (or disable RLS for development).

---

## 🧾 Supabase Database Schema

### Table: `rooms`

| Column     | Type | Notes                      |
|------------|------|----------------------------|
| `code`     | text | Primary key (room code)    |
| `room_name`| text | Name of the room           |
| `host_name`| text | Name of the room creator   |

### Table: `participants`

| Column       | Type | Notes                       |
|--------------|------|-----------------------------|
| `room_code`  | text | Foreign key to `rooms.code` |
| `user_name`  | text | Name of participant         |

---

## 🧪 Run Locally

```bash
npm run dev
# or
yarn dev
```

Open `http://localhost:5173` in your browser.

---

## 📦 Build for Production

```bash
npm run build
```

---

## 🚀 Planned Features

- 🎧 Spotify/YouTube music integration  
- ⏱ Music sync engine  
- 💬 Room chat  
- 🎤 Mic or karaoke mode  
- 🧠 Music recommendations  

---

## 👨‍💻 Team

Built with ❤️ by:
- Jash Patel
- Krisha Pisat
- Manasa Ganti

---
## PPT Link:
https://docs.google.com/presentation/d/1mPnOVRoa1eDIlXq7S_Kfo_NMsncRM6dJ/edit?usp=sharing&ouid=103024375208167753150&rtpof=true&sd=true
