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

// Critical events that trigger Telegram notifications
// Only extremely important business events are included
const CRITICAL_EVENTS = new Set([
  'scan_completed', // Track user engagement and animation discovery
  'license_activation_success', // User successfully activated Pro license
  'export_blocked_free_limit', // User hit free tier limit (conversion opportunity)
  'export_blocked_pro_feature', // User tried Pro feature (conversion opportunity)
  'purchase_button_clicked', // User clicked purchase button (conversion funnel)
  'license_activation_failed', // User had trouble activating (support needed)
]);

// Helper to check if an event should trigger Telegram notification
export function isCriticalEvent(event: string): boolean {
  return CRITICAL_EVENTS.has(event);
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
  figmaUserId: string;
  isFirstActivation: boolean;
}): void {
  const message = `
🔓 *License ${data.isFirstActivation ? 'Activated' : 'Re-validated'}*

📧 Email: \`${escapeMarkdown(data.email)}\`
👤 Figma User: \`${escapeMarkdown(data.figmaUserId.slice(0, 8))}\\.\\.\\.\`
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

// Scan completed notification (track engagement and drop-off)
export function sendScanCompletedNotification(data: {
  figmaUserId?: string;
  sessionId?: string;
  animationsCount?: number;
  animationTypes?: string[];
  scanDuration?: number;
  hasAnimations?: boolean;
  isFirstScan?: boolean;
}): void {
  const userId = data.figmaUserId || 'anonymous';
  const count = data.animationsCount || 0;
  const types = data.animationTypes?.join(', ') || 'none';
  const duration = data.scanDuration
    ? `${(data.scanDuration / 1000).toFixed(1)}s`
    : 'N/A';
  const firstScan = data.isFirstScan ? '✨ FIRST SCAN' : 'Repeat scan';

  const message = `
📊 *Scan Completed*

👤 User: \`${escapeMarkdown(userId)}\`
${data.isFirstScan ? '✨ *First scan \\- new user\\!*\n' : ''}🎬 Animations found: *${count}*
${count > 0 ? `🎨 Types: ${escapeMarkdown(types)}\n` : ''}⏱ Duration: ${escapeMarkdown(duration)}
${data.sessionId ? `📊 Session: \`${escapeMarkdown(data.sessionId)}\`\n` : ''}🕐 Time: ${escapeMarkdown(getTimestamp())}

${count === 0 ? '⚠️ No animations found \\- user may leave\\!' : count > 5 ? '💡 Many animations \\- good conversion potential\\!' : ''}
  `.trim();

  sendNotification(message);
}

// License activation success notification (CRITICAL - upgrade user to Pro)
export function sendLicenseActivationSuccessNotification(data: {
  figmaUserId?: string;
  sessionId?: string;
  activationMethod?: string;
  timeToActivate?: number;
}): void {
  const userId = data.figmaUserId || 'anonymous';
  const method = data.activationMethod || 'unknown';
  const time = data.timeToActivate
    ? `${(data.timeToActivate / 1000).toFixed(1)}s`
    : 'N/A';

  const message = `
🎉 *LICENSE ACTIVATED \\- UPGRADE USER TO PRO\\!*

👤 User: \`${escapeMarkdown(userId)}\`
🔑 Method: ${escapeMarkdown(method)}
⏱ Time to activate: ${escapeMarkdown(time)}
${data.sessionId ? `📊 Session: \`${escapeMarkdown(data.sessionId)}\`\n` : ''}🕐 Time: ${escapeMarkdown(getTimestamp())}

⚠️ *ACTION REQUIRED: Upgrade this user to Pro in database*
  `.trim();

  sendNotification(message);
}

// Export blocked by free limit (conversion opportunity)
export function sendExportBlockedFreeLimitNotification(data: {
  figmaUserId?: string;
  lifetimeUsageCount?: number;
  lifetimeLimit?: number;
  attemptedFramework?: string;
}): void {
  const userId = data.figmaUserId || 'anonymous';
  const usage = data.lifetimeUsageCount || 0;
  const limit = data.lifetimeLimit || 0;
  const framework = data.attemptedFramework || 'unknown';

  const message = `
🚫 *Free Limit Reached \\- Conversion Opportunity\\!*

👤 User: \`${escapeMarkdown(userId)}\`
📊 Usage: ${usage}/${limit}
🛠 Framework: ${escapeMarkdown(framework)}
🕐 Time: ${escapeMarkdown(getTimestamp())}

💡 User is likely to upgrade\\!
  `.trim();

  sendNotification(message);
}

// Export blocked by Pro feature (conversion opportunity)
export function sendExportBlockedProFeatureNotification(data: {
  figmaUserId?: string;
  featureName?: string;
  animationsCount?: number;
}): void {
  const userId = data.figmaUserId || 'anonymous';
  const feature = data.featureName || 'unknown';
  const count = data.animationsCount || 0;

  const message = `
💎 *Pro Feature Attempted \\- Conversion Opportunity\\!*

👤 User: \`${escapeMarkdown(userId)}\`
✨ Feature: ${escapeMarkdown(feature)}
📊 Animations: ${count}
🕐 Time: ${escapeMarkdown(getTimestamp())}

💡 User wants Pro features\\!
  `.trim();

  sendNotification(message);
}

// Purchase button clicked (conversion funnel tracking)
export function sendPurchaseButtonClickedNotification(data: {
  figmaUserId?: string;
  currentPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  triggerSource?: string;
}): void {
  const userId = data.figmaUserId || 'anonymous';
  const current = data.currentPrice
    ? `$${data.currentPrice.toFixed(2)}`
    : 'N/A';
  const original = data.originalPrice
    ? `$${data.originalPrice.toFixed(2)}`
    : 'N/A';
  const discount = data.discountPercentage || 0;
  const source = data.triggerSource || 'unknown';

  const message = `
💳 *Purchase Button Clicked\\!*

👤 User: \`${escapeMarkdown(userId)}\`
💰 Price: ${escapeMarkdown(current)} ${discount > 0 ? `\\(was ${escapeMarkdown(original)}, ${discount}% off\\)` : ''}
📍 Source: ${escapeMarkdown(source)}
🕐 Time: ${escapeMarkdown(getTimestamp())}

🎯 User is in conversion funnel\\!
  `.trim();

  sendNotification(message);
}

// License activation failed (support opportunity)
export function sendLicenseActivationFailedNotification(data: {
  figmaUserId?: string;
  errorType?: string;
  keyFormatValid?: boolean;
}): void {
  const userId = data.figmaUserId || 'anonymous';
  const error = data.errorType || 'unknown';
  const formatValid = data.keyFormatValid ? 'Yes' : 'No';

  const message = `
❌ *License Activation Failed \\- Support Needed\\!*

👤 User: \`${escapeMarkdown(userId)}\`
⚠️ Error: ${escapeMarkdown(error)}
🔍 Valid format: ${escapeMarkdown(formatValid)}
🕐 Time: ${escapeMarkdown(getTimestamp())}

🆘 User may need support\\!
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
