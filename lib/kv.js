import { kv } from '@vercel/kv';

/**
 * KV Storage Adapter for game rooms
 * Automatically falls back to in-memory storage for local development without KV
 */

// In-memory fallback for local development
const memoryStore = {};
const USE_KV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

export async function getRoom(roomId) {
  if (USE_KV) {
    try {
      return await kv.get(`room:${roomId}`);
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }
  return memoryStore[roomId] || null;
}

export async function setRoom(roomId, roomData) {
  if (USE_KV) {
    try {
      // Store in KV with 24-hour expiration
      await kv.set(`room:${roomId}`, roomData, { ex: 86400 });
    } catch (error) {
      console.error('KV set error:', error);
    }
  } else {
    memoryStore[roomId] = roomData;
  }
}

export async function deleteRoom(roomId) {
  if (USE_KV) {
    try {
      await kv.del(`room:${roomId}`);
    } catch (error) {
      console.error('KV delete error:', error);
    }
  } else {
    delete memoryStore[roomId];
  }
}

export async function getAllRoomIds() {
  if (USE_KV) {
    try {
      const keys = await kv.keys('room:*');
      return keys.map(key => key.replace('room:', ''));
    } catch (error) {
      console.error('KV keys error:', error);
      return [];
    }
  }
  return Object.keys(memoryStore);
}
