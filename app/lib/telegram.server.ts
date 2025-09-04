import { Telegraf } from 'telegraf';

// Initialize bot only if credentials are provided
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const NOTIFICATIONS_ENABLED =
  process.env.TELEGRAM_NOTIFICATIONS_ENABLED === 'true';

let bot: Telegraf | null = null;

if (BOT_TOKEN && CHAT_ID && NOTIFICATIONS_ENABLED) {
  try {
    bot = new Telegraf(BOT_TOKEN);
    console.log('Telegram bot initialized');
  } catch (error) {
    console.error('Failed to initialize Telegram bot:', error);
  }
}

// Helper function to format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

// Helper function to get current timestamp
function getTimestamp(): string {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Helper function to escape special characters for Telegram MarkdownV2
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}

// Fire-and-forget notification sender
async function sendNotification(message: string): Promise<void> {
  if (!bot || !CHAT_ID || !NOTIFICATIONS_ENABLED) {
    return;
  }

  // Fire and forget - don't await, just catch errors
  bot.telegram
    .sendMessage(CHAT_ID, message, { parse_mode: 'MarkdownV2' })
    .catch((error) => {
      console.error('Telegram notification failed:', error);
      // Try sending without markdown if formatting fails
      bot?.telegram
        .sendMessage(CHAT_ID, message.replace(/\\/g, ''), {
          parse_mode: undefined,
        })
        .catch((fallbackError) => {
          console.error(
            'Telegram fallback notification failed:',
            fallbackError,
          );
        });
    });
}

// Purchase notification
export function sendPurchaseNotification(data: {
  email: string;
  amount: number;
  currency: string;
  licenseKey: string;
}): void {
  const message = `
🎉 *New Purchase\\!*

📧 Email: \`${escapeMarkdown(data.email)}\`
💰 Amount: ${escapeMarkdown(formatCurrency(data.amount, data.currency))}
🔑 License: \\*\\*\\*\\*\\-${escapeMarkdown(data.licenseKey.slice(-4))}
🕐 Time: ${escapeMarkdown(getTimestamp())}
  `.trim();

  sendNotification(message);
}

// Plugin opened notification
export function sendPluginOpenedNotification(data: {
  figmaUserId?: string;
  pluginVersion?: string;
}): void {
  const userId = data.figmaUserId || 'anonymous';
  const version = data.pluginVersion || 'unknown';

  const message = `
📊 *Plugin Opened*

👤 User: \`${escapeMarkdown(userId)}\`
📦 Version: ${escapeMarkdown(version)}
🕐 Time: ${escapeMarkdown(getTimestamp())}
  `.trim();

  sendNotification(message);
}

// Export completed notification
export function sendExportCompletedNotification(data: {
  figmaUserId?: string;
  framework?: string;
  animationCount?: number;
  isPro?: boolean;
}): void {
  const userId = data.figmaUserId || 'anonymous';
  const framework = data.framework || 'unknown';
  const count = data.animationCount || 0;
  const tier = data.isPro ? 'PRO' : 'FREE';

  const message = `
✅ *Export Completed*

👤 User: \`${escapeMarkdown(userId)}\`
🛠 Framework: ${escapeMarkdown(framework)}
📊 Animations: ${count}
💎 Tier: ${escapeMarkdown(tier)}
🕐 Time: ${escapeMarkdown(getTimestamp())}
  `.trim();

  sendNotification(message);
}

// License activated notification
export function sendLicenseActivatedNotification(data: {
  email: string;
  deviceId: string;
  activationCount: number;
}): void {
  const message = `
🔓 *License Activated*

📧 Email: \`${escapeMarkdown(data.email)}\`
🖥 Device: \`${escapeMarkdown(data.deviceId.slice(0, 8))}\\.\\.\\.\`
📊 Total Activations: ${data.activationCount}/5
🕐 Time: ${escapeMarkdown(getTimestamp())}
  `.trim();

  sendNotification(message);
}

// Refund notification
export function sendRefundNotification(data: {
  licenseKey: string;
  email: string;
  amount: number;
  currency: string;
}): void {
  const message = `
⚠️ *Refund Processed*

📧 Email: \`${escapeMarkdown(data.email)}\`
💸 Amount: ${escapeMarkdown(formatCurrency(data.amount, data.currency))}
🔑 License: \\*\\*\\*\\*\\-${escapeMarkdown(data.licenseKey.slice(-4))}
🕐 Time: ${escapeMarkdown(getTimestamp())}
  `.trim();

  sendNotification(message);
}

// Dispute notification
export function sendDisputeNotification(data: {
  type: 'created' | 'won' | 'lost';
  licenseKey: string;
  email: string;
  disputeId?: string;
}): void {
  const emoji =
    data.type === 'created' ? '🚨' : data.type === 'won' ? '✅' : '❌';
  const title =
    data.type === 'created'
      ? 'Dispute Created'
      : data.type === 'won'
        ? 'Dispute Won'
        : 'Dispute Lost';

  const message = `
${emoji} *${escapeMarkdown(title)}*

📧 Email: \`${escapeMarkdown(data.email)}\`
🔑 License: \\*\\*\\*\\*\\-${escapeMarkdown(data.licenseKey.slice(-4))}
${data.disputeId ? `📝 Dispute ID: \`${escapeMarkdown(data.disputeId)}\`\n` : ''}🕐 Time: ${escapeMarkdown(getTimestamp())}
  `.trim();

  sendNotification(message);
}

// Test connection
export async function testTelegramConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!BOT_TOKEN || !CHAT_ID) {
    return { success: false, error: 'Telegram credentials not configured' };
  }

  if (!NOTIFICATIONS_ENABLED) {
    return { success: false, error: 'Telegram notifications are disabled' };
  }

  if (!bot) {
    return { success: false, error: 'Bot not initialized' };
  }

  try {
    await bot.telegram.sendMessage(
      CHAT_ID,
      `🧪 *Test Message*\n\nTelegram notifications are working\\!\n\n🕐 ${escapeMarkdown(getTimestamp())}`,
      { parse_mode: 'MarkdownV2' },
    );
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
