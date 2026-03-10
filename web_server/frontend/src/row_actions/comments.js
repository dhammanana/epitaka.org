/**
 * comments.js
 * ───────────────────────────────────────────────────────────
 * Thin API client for the Flask comment endpoints.
 * All data lives in SQLite on the server.
 */

import { authFetch } from '../auth/auth.js';

const { baseUrl, bookId } = window.BOOK_CONFIG;

/**
 * Load all comments for one section (para_id).
 * Returns Map<`${para_id}-${line_id}`, Comment[]>
 */
export async function loadCommentsForSection(paraId) {
  const res = await fetch(
    `${baseUrl}/api/book/${bookId}/comments?para_id=${paraId}`
  );
  if (!res.ok) return new Map();
  const { comments } = await res.json();

  const map = new Map();
  for (const c of comments) {
    const key = `${c.para_id}-${c.line_id}`;
    (map.get(key) || map.set(key, []).get(key)).push(c);
  }
  return map;
}

/** Post a new comment. Returns the created comment object. */
export async function addComment({ paraId, lineId, text }) {
  const res = await authFetch(`${baseUrl}/api/book/${bookId}/comments`, {
    method: 'POST',
    body:   JSON.stringify({ para_id: paraId, line_id: lineId, text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Edit an existing comment. Returns updated comment object. */
export async function editComment(commentId, text) {
  const res = await authFetch(`${baseUrl}/api/comments/${commentId}`, {
    method: 'PATCH',
    body:   JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/** Delete a comment. */
export async function deleteComment(commentId) {
  const res = await authFetch(`${baseUrl}/api/comments/${commentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}