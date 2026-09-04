/**
 * Rootixa QR Code Generator — Modular Payload Builder
 * Adheres to ISO/IEC 18004 and RFC standards for QR encoding.
 */

// Helper: Escape characters for vCard 3.0 (RFC 2426)
function escapeVCard(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .trim();
}

// Helper: Escape characters for iCalendar 2.0 (RFC 5545)
function escapeICal(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .trim();
}

// Helper: Format date/time to iCalendar format (YYYYMMDDTHHMMSS)
function formatICalDateTime(dateStr, timeStr) {
  if (!dateStr) return '';
  const cleanDate = dateStr.replace(/-/g, '');
  if (!timeStr) return cleanDate;
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

// Helper: Clean phone number (keeps optional leading + and digits)
export function sanitizePhoneNumber(phone) {
  if (!phone) return '';
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

// Helper: Clean digits only for WhatsApp (wa.me requires no + or symbols)
export function sanitizeWhatsAppNumber(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

// URL Normalizer
export function normalizeUrl(url) {
  if (!url || url.trim() === '') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// Field Validators
export function isValidUrl(url) {
  if (!url || url.trim() === '') return true;
  try {
    const test = normalizeUrl(url);
    const parsed = new URL(test);
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

export function isValidEmail(email) {
  if (!email || email.trim() === '') return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone) {
  if (!phone || phone.trim() === '') return true;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 16;
}

export function isValidCoordinate(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (isNaN(latitude) || isNaN(longitude)) return false;
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

/**
 * Build the exact QR payload string for any of the 12 supported content types.
 */
export function buildQRPayload(type, data = {}) {
  switch (type) {
    case 'url': {
      const url = normalizeUrl(data.url);
      return url || 'https://rootixa.com';
    }

    case 'text': {
      return data.text || ' ';
    }

    case 'wifi': {
      const enc = data.wifiEncryption || 'WPA';
      const ssid = data.wifiSsid || '';
      const pass = data.wifiPassword || '';
      const hidden = data.wifiHidden ? 'H:true;' : '';
      return `WIFI:T:${enc};S:${ssid};P:${pass};${hidden};`;
    }

    case 'email': {
      const email = (data.email || '').trim();
      let mailto = `mailto:${email}`;
      const params = [];
      if (data.emailSubject) params.push(`subject=${encodeURIComponent(data.emailSubject)}`);
      if (data.emailBody) params.push(`body=${encodeURIComponent(data.emailBody)}`);
      if (params.length > 0) mailto += `?${params.join('&')}`;
      return mailto;
    }

    case 'phone': {
      const cleanPhone = sanitizePhoneNumber(data.phone);
      return cleanPhone ? `tel:${cleanPhone}` : 'tel:+10000000000';
    }

    case 'sms': {
      const cleanPhone = sanitizePhoneNumber(data.smsPhone);
      const message = data.smsMessage || '';
      return cleanPhone ? `SMSTO:${cleanPhone}:${message}` : 'SMSTO:;';
    }

    case 'whatsapp': {
      const cleanDigits = sanitizeWhatsAppNumber(data.whatsappPhone);
      if (!cleanDigits) return 'https://wa.me/';
      const message = data.whatsappMessage ? `?text=${encodeURIComponent(data.whatsappMessage)}` : '';
      return `https://wa.me/${cleanDigits}${message}`;
    }

    case 'vcard': {
      const fullName = (data.vcardFullName || '').trim();
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const org = (data.vcardOrg || '').trim();
      const title = (data.vcardTitle || '').trim();
      const phone = sanitizePhoneNumber(data.vcardPhone);
      const email = (data.vcardEmail || '').trim();
      const website = normalizeUrl(data.vcardWebsite);
      const address = (data.vcardAddress || '').trim();

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${escapeVCard(fullName || 'Contact')}`,
        `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
      ];

      if (org) lines.push(`ORG:${escapeVCard(org)}`);
      if (title) lines.push(`TITLE:${escapeVCard(title)}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      if (website) lines.push(`URL:${website}`);
      if (address) lines.push(`ADR;TYPE=WORK:;;${escapeVCard(address)};;;;`);

      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'location': {
      const lat = parseFloat(data.geoLat);
      const lng = parseFloat(data.geoLng);
      if (isNaN(lat) || isNaN(lng)) return 'geo:0,0';
      const name = (data.geoName || '').trim();
      if (name) {
        return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
      }
      return `geo:${lat},${lng}`;
    }

    case 'event': {
      const title = (data.eventTitle || 'Calendar Event').trim();
      const startDT = formatICalDateTime(data.eventStartDate, data.eventStartTime);
      const endDT = formatICalDateTime(data.eventEndDate, data.eventEndTime);
      const location = (data.eventLocation || '').trim();
      const desc = (data.eventDescription || '').trim();

      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Rootixa//QR Generator//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${escapeICal(title)}`,
      ];

      if (startDT) lines.push(`DTSTART:${startDT}`);
      if (endDT) lines.push(`DTEND:${endDT}`);
      if (location) lines.push(`LOCATION:${escapeICal(location)}`);
      if (desc) lines.push(`DESCRIPTION:${escapeICal(desc)}`);

      lines.push('END:VEVENT');
      lines.push('END:VCALENDAR');
      return lines.join('\n');
    }

    case 'social': {
      const platform = data.socialPlatform || 'instagram';
      const handleOrUrl = (data.socialUrl || '').trim();
      if (!handleOrUrl) {
        return 'https://instagram.com';
      }
      if (handleOrUrl.startsWith('http://') || handleOrUrl.startsWith('https://')) {
        return handleOrUrl;
      }
      const cleanHandle = handleOrUrl.replace(/^@/, '');
      switch (platform) {
        case 'facebook': return `https://facebook.com/${cleanHandle}`;
        case 'instagram': return `https://instagram.com/${cleanHandle}`;
        case 'youtube': return cleanHandle.startsWith('channel/') || cleanHandle.startsWith('@') ? `https://youtube.com/${cleanHandle}` : `https://youtube.com/@${cleanHandle}`;
        case 'tiktok': return `https://tiktok.com/@${cleanHandle}`;
        case 'linkedin': return `https://linkedin.com/in/${cleanHandle}`;
        case 'x': return `https://x.com/${cleanHandle}`;
        default: return `https://${cleanHandle}`;
      }
    }

    case 'app': {
      const android = normalizeUrl(data.appAndroidUrl);
      const ios = normalizeUrl(data.appIosUrl);
      const target = data.appTarget || 'auto';

      if (target === 'android' && android) return android;
      if (target === 'ios' && ios) return ios;
      if (android && !ios) return android;
      if (ios && !android) return ios;
      if (android) return android;
      if (ios) return ios;
      return 'https://rootixa.com';
    }

    default:
      return 'https://rootixa.com';
  }
}

/**
 * Check if the payload is getting too dense for reliable quick-scanning.
 * Standard QR codes with 30% (High) error correction become very dense beyond 900 chars.
 */
export function checkPayloadCapacity(payload, errorCorrection = 'H') {
  const length = (payload || '').length;
  const limits = {
    L: 2000,
    M: 1500,
    Q: 1100,
    H: 900,
  };
  const maxSafe = limits[errorCorrection] || 900;
  return {
    length,
    isLarge: length > maxSafe,
    maxSafe,
  };
}
