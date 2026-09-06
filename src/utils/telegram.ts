import { HotelSettings } from '../types';

interface CheckInNotificationData {
  guestName: string;
  staffName: string;
  roomNumbers: string; // e.g. "02" or "02, 03, 07" for multi-room
  checkInDate: string; // display-formatted, e.g. "29/08/2026"
  checkOutDate: string; // display-formatted
  paidAmount: string; // e.g. "$25.00" or "80,000 KHR"
  paymentMethod: string; // e.g. "ACLEDA (Bank)" or "Cash"
  idCardImage?: string; // data URL or public URL, optional
}

export interface TelegramSendResult {
  messageId?: string;
  hasPhoto: boolean;
}

/**
 * Sends a check-in notification to the hotel's configured Telegram chat.
 * Silently does nothing if Telegram isn't enabled/configured — this must
 * never block or fail the actual check-in flow. Returns the sent message's
 * ID so it can be edited later if staff need to correct a detail.
 */
export async function sendTelegramCheckInNotification(
  settings: HotelSettings,
  data: CheckInNotificationData
): Promise<TelegramSendResult> {
  if (!settings.telegramEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
    return { hasPhoto: false };
  }

  const caption =
    `🏨 *New Walk-In Check-In*\n\n` +
    `👤 Guest: ${data.guestName}\n` +
    `🧑‍💼 By Staff: ${data.staffName}\n` +
    `🚪 Room: ${data.roomNumbers}\n` +
    `📅 Check-in: ${data.checkInDate}\n` +
    `📅 Check-out: ${data.checkOutDate}\n` +
    `💰 Paid: ${data.paidAmount} (${data.paymentMethod})`;

  const botBase = `https://api.telegram.org/bot${settings.telegramBotToken}`;

  try {
    if (data.idCardImage) {
      const formData = new FormData();
      formData.append('chat_id', settings.telegramChatId);
      formData.append('caption', caption);
      formData.append('parse_mode', 'Markdown');

      if (data.idCardImage.startsWith('data:')) {
        const res = await fetch(data.idCardImage);
        const blob = await res.blob();
        formData.append('photo', blob, 'id-card.jpg');
      } else {
        formData.append('photo', data.idCardImage);
      }

      const response = await fetch(`${botBase}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        console.error('Telegram sendPhoto failed:', await response.text());
        return { hasPhoto: false };
      }
      const result = await response.json();
      return { messageId: result?.result?.message_id ? String(result.result.message_id) : undefined, hasPhoto: true };
    } else {
      const response = await fetch(`${botBase}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: caption,
          parse_mode: 'Markdown',
        }),
      });
      if (!response.ok) {
        console.error('Telegram sendMessage failed:', await response.text());
        return { hasPhoto: false };
      }
      const result = await response.json();
      return { messageId: result?.result?.message_id ? String(result.result.message_id) : undefined, hasPhoto: false };
    }
  } catch (err) {
    console.error('Telegram notification error:', err);
    return { hasPhoto: false };
  }
}

/**
 * Sends the ID photo as a fresh Telegram message (used when the original
 * check-in message had no photo to begin with — Telegram's API cannot
 * convert a text message into a photo message via edit, only a brand new
 * message can carry one). Returns the new message's ID so future edits
 * target this message instead of the old text-only one.
 */
export async function sendTelegramPhotoAsNewMessage(
  settings: HotelSettings,
  image: string,
  data: CheckInNotificationData
): Promise<TelegramSendResult> {
  return sendTelegramCheckInNotification(settings, { ...data, idCardImage: image });
}

/** Deletes a previously-sent bot message — used to clean up the old
 * text-only message once its replacement photo message has sent successfully. */
export async function deleteTelegramMessage(
  settings: HotelSettings,
  messageId: string
): Promise<void> {
  if (!settings.telegramBotToken || !settings.telegramChatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        message_id: Number(messageId),
      }),
    });
  } catch (err) {
    console.error('Failed to delete old Telegram message:', err);
  }
}

/**
 * Edits an already-sent check-in notification in place — corrects the
 * caption/text (date, price, room number, etc.) without deleting and
 * resending. Works whether the original message had a photo or not.
 */
export async function editTelegramCheckInMessage(
  settings: HotelSettings,
  messageId: string,
  hasPhoto: boolean,
  data: CheckInNotificationData
): Promise<{ ok: boolean; error?: string }> {
  if (!settings.telegramBotToken || !settings.telegramChatId) {
    return { ok: false, error: 'Telegram is not configured.' };
  }

  const caption =
    `🏨 *Walk-In Check-In* _(edited)_\n\n` +
    `👤 Guest: ${data.guestName}\n` +
    `🧑‍💼 By Staff: ${data.staffName}\n` +
    `🚪 Room: ${data.roomNumbers}\n` +
    `📅 Check-in: ${data.checkInDate}\n` +
    `📅 Check-out: ${data.checkOutDate}\n` +
    `💰 Paid: ${data.paidAmount} (${data.paymentMethod})`;

  const botBase = `https://api.telegram.org/bot${settings.telegramBotToken}`;
  const endpoint = hasPhoto ? 'editMessageCaption' : 'editMessageText';
  const body: Record<string, any> = {
    chat_id: settings.telegramChatId,
    message_id: Number(messageId),
    parse_mode: 'Markdown',
  };
  if (hasPhoto) {
    body.caption = caption;
  } else {
    body.text = caption;
  }

  try {
    const response = await fetch(`${botBase}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errText = await response.text();
      return { ok: false, error: errText };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}

/**
 * Replaces the ID photo on an already-sent check-in message (in addition
 * to updating its caption). Use when staff need to swap out a wrong or
 * blurry ID capture after the fact.
 */
export async function editTelegramCheckInPhoto(
  settings: HotelSettings,
  messageId: string,
  newImage: string, // data URL or public URL
  data: CheckInNotificationData
): Promise<{ ok: boolean; error?: string }> {
  if (!settings.telegramBotToken || !settings.telegramChatId) {
    return { ok: false, error: 'Telegram is not configured.' };
  }

  const caption =
    `🏨 *Walk-In Check-In* _(edited)_\n\n` +
    `👤 Guest: ${data.guestName}\n` +
    `🧑‍💼 By Staff: ${data.staffName}\n` +
    `🚪 Room: ${data.roomNumbers}\n` +
    `📅 Check-in: ${data.checkInDate}\n` +
    `📅 Check-out: ${data.checkOutDate}\n` +
    `💰 Paid: ${data.paidAmount} (${data.paymentMethod})`;

  const botBase = `https://api.telegram.org/bot${settings.telegramBotToken}`;
  const media = { type: 'photo', media: 'attach://photo', caption, parse_mode: 'Markdown' };

  try {
    const formData = new FormData();
    formData.append('chat_id', settings.telegramChatId);
    formData.append('message_id', messageId);
    formData.append('media', JSON.stringify(media));

    if (newImage.startsWith('data:')) {
      const res = await fetch(newImage);
      const blob = await res.blob();
      formData.append('photo', blob, 'id-card.jpg');
    } else {
      // Telegram's editMessageMedia needs an actual upload or a URL inside the JSON,
      // not a form field, when it's not a local file — so pass the URL directly.
      media.media = newImage;
      formData.set('media', JSON.stringify(media));
    }

    const response = await fetch(`${botBase}/editMessageMedia`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const errText = await response.text();
      return { ok: false, error: errText };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}

/** Sends a simple test message to verify the bot token + chat ID are correct. */
export async function sendTelegramTestMessage(botToken: string, chatId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ Galaxy Star Angkor Hotel — Telegram connection successful! You will now receive check-in notifications here.',
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      return { ok: false, error: errText };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}