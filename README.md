# Ultimate Swing Trader – Trade Planning Calculator

A risk-first, structure-based trade planning calculator for swing traders.

This application is designed to be deployed on **Vercel** and run entirely client-side.
It does NOT generate trade signals or predictions.

---

## 🎯 Purpose

The Ultimate Swing Trader Calculator exists to enforce discipline.

It helps traders:
- Define risk before entering a trade
- Size positions correctly based on account risk
- Evaluate reward-to-risk objectively (R-multiples)
- Plan exits and trailing stops without emotion
- Follow a repeatable, process-driven swing trading workflow

---

## ❌ What This Tool Is NOT

- ❌ Not a trading bot
- ❌ Not a signal service
- ❌ Not an indicator engine
- ❌ Not a predictive model
- ❌ Not an auto-execution system

All prices (entry, stop, target) are **manually entered by the trader** based on chart structure.

---

## 🧠 Trading Philosophy (Hard Constraints)

This calculator is built on these non-negotiables:

- Risk is defined before entry
- Structure defines stops and targets
- Position size adapts to risk — not conviction
- Most trades are skipped
- Consistency > excitement
- Process > outcome

If risk cannot be clearly defined, the trade is invalid.

---

## 🧩 Core Features

### Inputs
- Account size
- Max risk per trade (% or $)
- Trade direction (long / short)
- Planned entry price
- Invalidation level (stop)
- Optional target price

### Outputs
- Risk per share / unit
- Position size (shares or contracts)
- Dollar risk
- % of account at risk
- Reward-to-risk (R multiple)
- Breakeven price
- Trailing stop reference levels

---

## 🔁 Trailing Stop Planning (NOT Automation)

Supported planning frameworks:
- Structure-based trailing (manual updates)
- R-based milestones (1R, 2R, etc.)
- Hybrid: R-based early → structure-based later

The calculator **never moves stops automatically**.
It only shows consequences and scenarios.

---

## 🛠 Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- UI: React
- Styling: Tailwind CSS (or minimal CSS)
- State: Client-side only (no backend required)
- Deployment: Vercel
- Tooling: VS Code + GitHub Copilot + Claude Sonnet 4.5

---

## 🚀 Local Development

```bash
npm install
npm run dev

☁️ Deployment

This project is designed for zero-config deployment on Vercel.

vercel deploy


No environment variables or backend services are required for the MVP.

📌 Design Principles

Clarity over complexity

Fewer inputs > more indicators

No hidden calculations

No optimization logic

No “best trade” suggestions

This is a decision-validation tool, not a decision-maker.

📄 License

MIT License – for educational and personal trading use.