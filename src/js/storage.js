
// -----footer-----
import { STORAGE_KEYS } from './constants.js';

export function saveEmailToLocal(email) {
  const emails = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMAILS)) || [];
  if (!emails.includes(email)) {
    emails.push(email);
    localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(emails));
  }
}

export function getEmailsFromLocal() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.EMAILS)) || [];
}
// -----footer-end-----