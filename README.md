# Lumos  

**Lumos – the spell your wallet’s been waiting for.**

---

## Repository  
🔗 [https://github.com/aranisarora/Lumos](https://github.com/aranisarora/Lumos)

---

## Problem Statement  
In an era of apps and automation, many people still struggle with managing money, understanding financial tools, or building long-term discipline.  

**Challenge:**  
How can technology make money management intuitive, educational, and empowering for everyone — regardless of age or background?  

Most existing tools stop at tracking expenses. What’s missing is a system that understands human behavior, helps users act smarter with their money, and creates genuine motivation to build better financial habits.

---

## Tech Stack  

| Layer | Technology |
|--------|-------------|
| **Frontend** | React, Tailwind CSS |
| **Backend** | Next.js |
| **Database** | Supabase |
| **Automation & Alerts** | n8n Workflow Automation |
| **AI Layer** | Gemini, OpenAI, Cursor |
| **Investment APIs (Future Integration)** | Zerodha / Groww Mutual Fund APIs |

---

## Overview  
**Lumos** is an AI-powered financial advisor designed to make money management simple, personal, and growth-oriented.  

It acts as a smart companion that not only tracks and analyzes your spending but also **guides your financial decisions** — from budgeting to investing — in a way that’s automated, educational, and rewarding.  

Unlike traditional expense trackers that simply record data, Lumos **adapts its steps** to each user’s goals, **gamifies** the process, and takes meaningful action to improve financial outcomes.

---

### How It Works  
Lumos continuously monitors **daily spending patterns** and **income inflows** using secure email screening (through authorized access to transaction updates — implemented in broader-scale deployment).  

It categorizes spending automatically, helping users understand where their money goes and when they are nearing preset limits through **email notifications**.  

Users can define **spending categories** and **monthly budgets**. When they reach **95% of a category’s limit**, Lumos sends a real-time alert via email, encouraging mindful spending before overshooting.

---

### Automated Investment and Goal Curation  
Any surplus balance remaining at the end of a cycle is not left idle. Lumos automatically channels these funds into **mutual fund portfolios** curated through APIs like Zerodha or Groww.  

Investments are selected based on:  
- The user’s **financial goals** (e.g., “₹2L for a car in 8 months” → higher equity proportion)  
- **Risk tolerance** (conservative, moderate, aggressive)  
- **Investment horizon**  

The system uses AI to allocate funds between **equity and debt mutual funds**, ensuring the right balance between **liquidity and growth**.

---

### The Dave Ramsey Model: Gamified Financial Growth  
Lumos is built on the behavioral framework of **Dave Ramsey’s 7 Baby Steps** — a proven model that has helped millions build wealth through structured discipline.  

Each user’s financial journey is personalized according to these seven steps, but **gamified** through **levels of progress** rather than static milestones.  

As users complete levels, they unlock new levels of financial stability, making disciplined finance an engaging and rewarding experience.

---

### Automation and Integration  
Behind the scenes, Lumos uses **n8n workflows** to automate tracking, updates, and notifications.  

When spending or investment data crosses thresholds, n8n triggers workflow actions that:  
- Send real-time alerts  
- Update user dashboards  
- Sync with AI recommendation modules  

This automation ensures **seamless financial tracking** without user intervention — reducing friction and increasing engagement.  

---

## Key Features  
- **AI Financial Assistant:** Tracks and analyzes spending behavior in real time.  
- **Category-Based Budgeting:** Users set category limits; Lumos alerts at 95% spend.  
- **Automated Investment:** Surplus funds intelligently invested based on goals and timelines.  
- **Goal Customization:** Portfolios curated via personalized questionnaires.  
- **Gamified Leaderboard:** Ranks users by progress and investment consistency.  
- **AI Chat Support:** Chatbot explains spending patterns and investment logic.  

---

## Market Size and Target Audience  
**Target Audience:**  
- Young professionals new to budgeting  
- College students building financial independence  
- Low- and middle-income individuals seeking simple investment tools  
- Anyone overwhelmed by financial jargon or complex apps  

India’s **personal finance app market** is projected to grow at **25–30% CAGR** over the next five years.  
With **700M+ UPI users** and rising mutual fund participation, there’s a massive opportunity for tools that combine **automation, literacy, and behavioral motivation.**

---

## Niche / Uniqueness  
- Focuses on **behavioral improvement**, not rigid control.  
- Adapts dynamically to user habits and financial goals.  
- Turns saving into a **game** — rewarding consistency, not guilt.  
- Integrates **education through conversation**, not static lessons.  
- Future potential: Gmail-based transaction tracking + advanced investment models.  

Lumos stands out as a **living assistant**, not just a passive tracker — combining **learning, prediction, automation, and gamification** to build lasting financial growth.

---

## Plausibility  

- **Revenue Model:** Subscription for premium insights + small AUM fee on invested surplus (via broker APIs).  
- **Technical Feasibility:** Built with low-cost, scalable tools (Next.js, Supabase, n8n). MVP deployable under ₹15k/month.  
- **Market Fit:** 700M+ UPI users = vast base for transaction-to-investment conversion.  
- **Behavioral Stickiness:** Gamified version of Dave Ramsey’s 7 Baby Steps encourages progress through levels.  
- **Regulatory Readiness:** OAuth-based Gmail parsing, consent-first investment flow, SEBI-aligned compliance.  
- **Growth Path:** Partner-first scaling via brokers, campuses, payroll apps — monetization from year one with low CAC.  

---

## Contributors  
- [@aranisarora](https://github.com/aranisarora)  
- [@TNInjas](https://github.com/TNInjas)  
- [@kiahsinha](https://github.com/nokia199)
