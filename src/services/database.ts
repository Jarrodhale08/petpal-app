/**
 * Database Service - Multi-Tenant CRUD Operations
 *
 * Generic CRUD operations for Supabase database with automatic
 * multi-tenant filtering via APP_ID.
 */

import { supabase, APP_ID, getCurrentUser } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface QueryOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  filters?: Array<{
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'contains';
    value: any;
  }>;
  skipAppFilter?: boolean; // For shared tables like profiles
}

export interface DatabaseResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface DatabaseListResult<T> {
  data: T[] | null;
  error: PostgrestError | null;
  count: number | null;
}

// Tables that don't use app_id (shared across all apps)
const SHARED_TABLES = ['profiles', 'app_registry', 'user_app_context'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isSharedTable(table: string): boolean {
  return SHARED_TABLES.includes(table);
}

function applyFilter(query: any, filter: NonNullable<QueryOptions['filters']>[0]) {
  switch (filter.operator) {
    case 'eq':
      return query.eq(filter.column, filter.value);
    case 'neq':
      return query.neq(filter.column, filter.value);
    case 'gt':
      return query.gt(filter.column, filter.value);
    case 'gte':
      return query.gte(filter.column, filter.value);
    case 'lt':
      return query.lt(filter.column, filter.value);
    case 'lte':
      return query.lte(filter.column, filter.value);
    case 'like':
      return query.like(filter.column, filter.value);
    case 'ilike':
      return query.ilike(filter.column, filter.value);
    case 'in':
      return query.in(filter.column, filter.value);
    case 'contains':
      return query.contains(filter.column, filter.value);
    default:
      return query;
  }
}

// ============================================================================
// GENERIC CRUD OPERATIONS WITH MULTI-TENANT SUPPORT
// ============================================================================

/**
 * Fetch all records from a table with automatic app_id filtering
 */
export async function fetchAll<T>(
  table: string,
  options: QueryOptions = {}
): Promise<DatabaseListResult<T>> {
  let query = supabase
    .from(table)
    .select(options.select || '*', { count: 'exact' });

  // Auto-add app_id filter for multi-tenant tables
  if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
    query = query.eq('app_id', APP_ID);
  }

  // Apply custom filters
  if (options.filters) {
    for (const filter of options.filters) {
      query = applyFilter(query, filter);
    }
  }

  // Apply ordering
  if (options.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true
    });
  }

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  return { data: data as T[] | null, error, count };
}

/**
 * Fetch a single record by ID with automatic app_id filtering
 */
export async function fetchById<T>(
  table: string,
  id: string | number,
  options: { select?: string; idColumn?: string; skipAppFilter?: boolean } = {}
): Promise<DatabaseResult<T>> {
  let query = supabase
    .from(table)
    .select(options.select || '*')
    .eq(options.idColumn || 'id', id);

  // Auto-add app_id filter for multi-tenant tables
  if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
    query = query.eq('app_id', APP_ID);
  }

  const { data, error } = await query.single();
  return { data: data as T | null, error };
}

/**
 * Create a new record with automatic app_id and user_id
 */
export async function create<T>(
  table: string,
  record: Partial<T>,
  options: { select?: string; skipAppFilter?: boolean } = {}
): Promise<DatabaseResult<T>> {
  let recordWithIds = { ...record };

  // Auto-add app_id for multi-tenant tables
  if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
    recordWithIds = { ...recordWithIds, app_id: APP_ID };
  }

  // Auto-add user_id if not provided
  if (!('user_id' in recordWithIds)) {
    const user = await getCurrentUser();
    if (user) {
      recordWithIds = { ...recordWithIds, user_id: user.id };
    }
  }

  const { data, error } = await supabase
    .from(table)
    .insert(recordWithIds)
    .select(options.select || '*')
    .single();

  return { data: data as T | null, error };
}

/**
 * Create multiple records with automatic app_id and user_id
 */
export async function createMany<T>(
  table: string,
  records: Partial<T>[],
  options: { select?: string; skipAppFilter?: boolean } = {}
): Promise<DatabaseListResult<T>> {
  const user = await getCurrentUser();

  const recordsWithIds = records.map(record => {
    let recordWithIds = { ...record };

    if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
      recordWithIds = { ...recordWithIds, app_id: APP_ID };
    }

    if (!('user_id' in recordWithIds) && user) {
      recordWithIds = { ...recordWithIds, user_id: user.id };
    }

    return recordWithIds;
  });

  const { data, error } = await supabase
    .from(table)
    .insert(recordsWithIds)
    .select(options.select || '*');

  return { data: data as T[] | null, error, count: data?.length ?? null };
}

/**
 * Update a record by ID with automatic app_id filtering
 */
export async function update<T>(
  table: string,
  id: string | number,
  updates: Partial<T>,
  options: { select?: string; idColumn?: string; skipAppFilter?: boolean } = {}
): Promise<DatabaseResult<T>> {
  let query = supabase
    .from(table)
    .update(updates)
    .eq(options.idColumn || 'id', id);

  // Auto-add app_id filter for multi-tenant tables
  if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
    query = query.eq('app_id', APP_ID);
  }

  const { data, error } = await query.select(options.select || '*').single();
  return { data: data as T | null, error };
}

/**
 * Update multiple records matching a filter
 */
export async function updateWhere<T>(
  table: string,
  updates: Partial<T>,
  filters: QueryOptions['filters'],
  options: { select?: string; skipAppFilter?: boolean } = {}
): Promise<DatabaseListResult<T>> {
  let query = supabase.from(table).update(updates);

  // Auto-add app_id filter for multi-tenant tables
  if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
    query = query.eq('app_id', APP_ID);
  }

  if (filters) {
    for (const filter of filters) {
      query = applyFilter(query, filter);
    }
  }

  const { data, error } = await query.select(options.select || '*');
  return { data: data as T[] | null, error, count: data?.length ?? null };
}

/**
 * Delete a record by ID with automatic app_id filtering
 */
export async function remove(
  table: string,
  id: string | number,
  options: { idColumn?: string; skipAppFilter?: boolean } = {}
): Promise<{ error: PostgrestError | null }> {
  let query = supabase
    .from(table)
    .delete()
    .eq(options.idColumn || 'id', id);

  // Auto-add app_id filter for multi-tenant tables
  if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
    query = query.eq('app_id', APP_ID);
  }

  const { error } = await query;
  return { error };
}

/**
 * Delete multiple records matching a filter
 */
export async function removeWhere(
  table: string,
  filters: QueryOptions['filters'],
  options: { skipAppFilter?: boolean } = {}
): Promise<{ error: PostgrestError | null }> {
  let query = supabase.from(table).delete();

  // Auto-add app_id filter for multi-tenant tables
  if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
    query = query.eq('app_id', APP_ID);
  }

  if (filters) {
    for (const filter of filters) {
      query = applyFilter(query, filter);
    }
  }

  const { error } = await query;
  return { error };
}

/**
 * Upsert (insert or update) a record with automatic app_id
 */
export async function upsert<T>(
  table: string,
  record: Partial<T>,
  options: { select?: string; onConflict?: string; skipAppFilter?: boolean } = {}
): Promise<DatabaseResult<T>> {
  let recordWithIds = { ...record };

  // Auto-add app_id for multi-tenant tables
  if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
    recordWithIds = { ...recordWithIds, app_id: APP_ID };
  }

  // Auto-add user_id if not provided
  if (!('user_id' in recordWithIds)) {
    const user = await getCurrentUser();
    if (user) {
      recordWithIds = { ...recordWithIds, user_id: user.id };
    }
  }

  const { data, error } = await supabase
    .from(table)
    .upsert(recordWithIds, { onConflict: options.onConflict })
    .select(options.select || '*')
    .single();

  return { data: data as T | null, error };
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to table changes with automatic app_id filtering
 */
export function subscribeToTable<T>(
  table: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T | null;
    old: T | null;
  }) => void,
  options: { event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'; filter?: string; skipAppFilter?: boolean } = {}
) {
  // Build filter string with app_id
  let filterString = options.filter;
  if (!options.skipAppFilter && !isSharedTable(table) && APP_ID) {
    const appFilter = `app_id=eq.${APP_ID}`;
    filterString = filterString ? `${filterString},${appFilter}` : appFilter;
  }

  const channel = supabase
    .channel(`${table}_changes_${APP_ID}`)
    .on(
      'postgres_changes',
      {
        event: options.event || '*',
        schema: 'public',
        table,
        filter: filterString,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as T | null,
          old: payload.old as T | null,
        });
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob | ArrayBuffer,
  options: { contentType?: string; upsert?: boolean } = {}
): Promise<{ path: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options.contentType,
      upsert: options.upsert ?? false,
    });

  return { path: data?.path ?? null, error };
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: string,
  paths: string[]
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage.from(bucket).remove(paths);
  return { error };
}

export default {
  fetchAll,
  fetchById,
  create,
  createMany,
  update,
  updateWhere,
  remove,
  removeWhere,
  upsert,
  subscribeToTable,
  uploadFile,
  getPublicUrl,
  deleteFile,
};
