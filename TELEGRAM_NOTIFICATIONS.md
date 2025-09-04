# Telegram Notifications Setup

This system sends real-time notifications to Telegram for monitoring purchases, usage, and important events.

## Setup Steps

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat and send `/newbot`
3. Follow the prompts to name your bot
4. Save the bot token (looks like: `123456789:AbCdefGhIJKlmNoPQRsTUVwxyZ`)

### 2. Get Your Chat ID

1. Start a conversation with your new bot
2. Send any message to the bot
3. Open this URL in your browser:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
4. Find your chat ID in the JSON response (look for `"chat":{"id":123456789}`)

### 3. Configure Environment Variables

Add these to your `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=your_chat_id
TELEGRAM_NOTIFICATIONS_ENABLED=true
```

### 4. Test the Connection

```bash
curl "http://localhost:3000/api/test-telegram?key=YOUR_ADMIN_PASSWORD"
```

## Events Tracked

The system sends notifications for:

- **💰 Purchases** - New license purchases with email and amount
- **📊 Plugin Opens** - When users open the Figma plugin
- **✅ Export Completions** - Successful exports with framework and animation count
- **🔓 License Activations** - New device activations for Pro licenses
- **⚠️ Refunds** - Processed refunds with license details
- **🚨 Disputes** - Payment disputes (created, won, or lost)

## Message Format

All notifications include:
- Event type with emoji indicator
- Relevant user/transaction details
- Timestamp in ET timezone
- Masked sensitive data (only last 4 chars of license keys)

## Architecture

- **Non-blocking**: All notifications use fire-and-forget pattern
- **Fault-tolerant**: Main application continues if Telegram fails
- **Fallback**: Attempts plain text if markdown formatting fails
- **Logging**: Errors logged to console for debugging

## Disable Notifications

To temporarily disable without removing configuration:

```env
TELEGRAM_NOTIFICATIONS_ENABLED=false
```

## Troubleshooting

- **Bot not responding**: Ensure you've started a conversation with the bot
- **Invalid chat ID**: Re-fetch your chat ID using the getUpdates endpoint
- **Rate limits**: Bot respects Telegram's 30 msg/sec limit per chat
- **Check logs**: All Telegram errors are logged to console