<div align="center">

# 🪷 U D Y A M A · उद्यम

### **The discipline to rise. The clarity to see. The craft to become.**

<p>
  <img src="https://img.shields.io/badge/Shiva%20S%C5%ABtra-1.5-241A2F?style=for-the-badge" alt="Shiva Sutra 1.5"/>
  <img src="https://img.shields.io/badge/React-19.3-2E5B66?style=for-the-badge&logo=react&logoColor=white" alt="React 19.3"/>
  <img src="https://img.shields.io/badge/TypeScript-7.0-253238?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 7.0"/>
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-9A6A1F?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase"/>
</p>

</div>

---

<div align="center">

<a href="https://giphy.com/explore/maa-saraswati">
<img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXVncHVvZ3g4YXVwamZjczF5bzZiaDB5bDA0NnN4czczbjVqc2FkMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/DhYm5P7QS0VFe/200w.gif" alt="Animated Saraswati devotional art" width="680"/>
</a>

### 🪷 सरस्वती · The Veena · Knowledge in Motion

<em>Let the veena tune the mind before the work begins.</em>

<br/>

## **उद्यमो भैरवः ॥ १.५ ॥**
### *udyamo bhairavaḥ*

> **The upward surge of awareness is Bhairava.**

<a href="https://giphy.com/gifs/ExtremeImprov-flame-flames-flamed-slu282qyK4KdwDGQJc">
<img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGttMjdsZWdnZm0xMm90bjRmZ2ZpYTExam1tbjBnZmI1b3I1MnN0YSZlcD12MV9pbnRlcm5uYWxfZ2lmX2J5X2lkJmN0PVo/slu282qyK4KdwDGQJc/giphy.gif" alt="Animated rising flame representing the upward surge of awareness" width="520"/>
</a>

<sub>🔥 A rising flame — attention gathering, awareness ascending, Bhairava revealed.</sub>

</div>

In the first awakening of the **Śiva Sūtras**, *udyama* is more than ordinary effort. It points toward a **sudden rising, flash, or upsurge of consciousness**—the living movement by which awareness recognizes its own depth.

The visual language here is deliberate: **Saraswati with the veena** evokes knowledge, music, speech, and refinement; the **rising flame** evokes the living upward surge of awareness described by *udyama*.

[Read the Sanskrit text of the Śiva Sūtras](https://sa.wikisource.org/wiki/शिवसूत्र) · [Saraswati GIF source](https://giphy.com/explore/maa-saraswati) · [Flame GIF source](https://giphy.com/gifs/ExtremeImprov-flame-flames-flamed-slu282qyK4KdwDGQJc)

---

## 🌌 What Udyama Is

**Udyama** is a learning and mastery environment built around a simple loop:

**Attend → Practice → Reflect → Rise**

It brings together deliberate study, SQL practice, spaced repetition, AI-assisted interview preparation, and cross-device progress tracking without turning learning into a noisy productivity game.

### 🪷 Saraswati — Knowledge in rhythm

The project takes its visual cue from Saraswati's veena: learning is not accumulation alone; it is **tuning**. The product therefore treats tasks, concepts, mistakes, and review cycles as parts of one continuous rhythm.

### 🔥 Udyama — The surge

The Sanskrit **उद्यमो भैरवः** is the spiritual center of the project. The goal is not frantic effort. It is the moment when attention becomes clear enough that effort, understanding, and action begin to move together.

---

## ✨ Core Features

### 01 · Seamless Cross-Device Sync
- Real-time Firestore `onSnapshot` listeners
- Optimistic local state with cloud reconciliation
- Active device/session presence

### 02 · The Flame of Action
- Weekly streak and consistency tracking
- Milestones from **3 days** through **30 days**
- Rest-day and streak-shield support

### 03 · SQL Arena
- PostgreSQL practice with realistic analytical problems
- Schema inspection beside the editor
- Execution timing and structured output
- Root-cause tagging for spaced repetition

### 04 · AI Interview Lab
- Technical, behavioral, and metric-diagnostic rounds
- Voice-to-text practice
- Gemini-powered scoring for depth, clarity, structure, and communication

### 05 · River of Wisdom
- Bite-sized engineering knowledge
- Fresh technical facts
- Source-attributed industry briefings

### 06 · Curated Masterclasses
- Carefully selected learning videos
- One-click dispatch from content into tasks

---

## 🕉️ Architecture

```text
                         ┌──────────────────────────┐
                         │      U D Y A M A         │
                         │  Knowledge / Practice    │
                         │  Reflection / Mastery    │
                         └────────────┬─────────────┘
                                      │
                  ┌───────────────────┴───────────────────┐
                  ▼                                       ▼
        ┌────────────────────┐                 ┌────────────────────┐
        │  RESONANT SYNC     │                 │  COGNITIVE ENGINE  │
        │  Firebase          │                 │  Gemini             │
        │  Auth + Firestore  │                 │  Tutor + Interview  │
        └──────────┬─────────┘                 └──────────┬─────────┘
                   │                                      │
          ┌────────┴────────┐                    ┌────────┴────────┐
          ▼                 ▼                    ▼                 ▼
       Mobile            Desktop             SQL Lab          AI Practice
```

---

## 🛠️ Technology

| Layer | Stack |
| :--- | :--- |
| Frontend | React 19.3 · TypeScript · Vite |
| Styling | Tailwind CSS v4 · Design Tokens |
| Persistence | Firebase Auth · Cloud Firestore |
| Backend | Node.js · Express |
| AI | Google Gemini via server-side proxy |
| Validation | Zod · Strict TypeScript |
| Typography | Newsreader · IBM Plex Sans |

---

## 🚀 Quickstart

### Prerequisites

- Node.js **20+**
- `npm` or `pnpm`
- Gemini API access for AI features

### Install

```bash
git clone https://github.com/Riteshji108/udyama.git
cd udyama
npm install
```

### Configure

```bash
cp .env.example .env
```

Add the required Firebase and Gemini configuration described by the project.

### Run

```bash
npm run dev
```

Open **http://localhost:3000**.

### Build

```bash
npm run build
npm start
```

---

## 🔒 Security Principles

Udyama follows a default-deny posture for Firestore access:

- authenticated ownership checks
- immutable identity/timestamp fields
- bounded inputs and enum validation
- no client-side exposure of privileged AI credentials

---

## 🧘 Dedication

> **उद्यमो भैरवः ॥**
>
> *The upward surge of awareness is Bhairava.*

May knowledge become practice,  
may practice become clarity,  
and may clarity rise into action.

**ॐ सरस्वत्यै नमः ।**

Crafted with devotion by **[Riteshji108](https://github.com/Riteshji108)**.

<div align="center">

### **Rise. Learn. Refine. Repeat.**

<sub>Udyama · knowledge in motion · awareness in ascent</sub>

</div>
