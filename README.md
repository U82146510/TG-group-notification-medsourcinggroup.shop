
🚀 Telegram Scheduler Bot (Node.js + TypeScript)

📁 Folder Structure Example

✅ Setup

1. Clone the project
   git clone https://github.com/your-username/telegram-scheduler-bot.git
   cd telegram-scheduler-bot

2. Install dependencies
   npm install

3. Create a `.env` file with your bot token and group ID:
   bot_token=your_telegram_bot_token
   group = your_group_id

4. Start the bot with ts-node
   cd src/bot
   ts-node bot.ts



🧠 Bot Flow Overview

📍 Step-by-step sequence:

VERY VERY IMPORTANT: Add all messages before pressing start.

1. Start the bot in Telegram by typing /start or opening the main menu.
2. Use buttons to define your scheduled message:

   - 📝 Set Message – Type the message content
   - ⏰ Set Time – Select hour + minutes using buttons (e.g., 08:00)
   - 📅 Set Days – Send a number or range to define days of the week
   - ➕ Add Schedule – Save the schedule
   - ▶️ Start All – Activate all saved schedules
   - ⏸️ Stop All – Stop all schedules
   - 📋 View Schedules – List all added schedules
   - 🗑️ Delete All – Clear all saved schedules

---

📅 How to Set Days

To define on which days your scheduled message should run, the bot expects a number or a range between 1 and 7, where:

| Day       | Number |
|-----------|--------|
| Monday    | 1      |
| Tuesday   | 2      |
| Wednesday | 3      |
| Thursday  | 4      |
| Friday    | 5      |
| Saturday  | 6      |
| Sunday    | 7      |

✅ Valid Inputs:
- 3 → Wednesday only
- 1-5 → Monday to Friday
- 6-7 → Saturday and Sunday

🛑 Notes

- This bot stores all schedules in memory — if restarted, they are lost unless persisted
- For persistent usage, MongoDB or file-based DB can be added easily
