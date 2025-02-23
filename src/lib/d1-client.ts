interface QueryCondition {
  column: string;
  value: any;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=';
}

interface QueryOrder {
  column: string;
  ascending?: boolean;
}

interface QueryState {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'COUNT';
  columns?: string;
  conditions: QueryCondition[];
  order?: QueryOrder;
  single?: boolean;
  limit?: number;
}

// Add type for realtime channel
interface RealtimeChannel {
  on: (event: string, callback: (payload: any) => void) => RealtimeChannel;
  subscribe: (callback: (payload: any) => void) => RealtimeChannel;
  unsubscribe: () => void;
}

interface QueryBuilder<T = any> {
  select: (columns?: string, options?: any) => QueryBuilder<T>;
  where: (column: string, operator: string | any, value?: any) => QueryBuilder<T>;
  orderBy: (column: string, ascending?: boolean) => QueryBuilder<T>;
  limit: (count: number) => QueryBuilder<T>;
  first: () => Promise<D1Response<T>>;
  get: () => Promise<D1Response<T[]>>;
  insert: (data: Partial<T>) => Promise<D1Response<T>>;
  update: (data: Partial<T>) => Promise<D1Response<T>>;
  delete: () => Promise<D1Response<T>>;
  count: () => Promise<D1Response<{ count: number }>>;
}

interface AuthClient {
  getSession: () => Promise<{ data: { session: any } }>;
  onAuthStateChange: (callback: (event: string, session: any) => void) => { data: { subscription: any } };
  signUp: (credentials: any) => Promise<{ data: any; error: any }>;
  signInWithPassword: (credentials: any) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateUser: (data: any) => Promise<{ error: any }>;
  resetPasswordForEmail: (email: string, options?: any) => Promise<{ error: any }>;
}

interface StorageClient {
  from: (bucket: string) => {
    upload: (path: string, file: any) => Promise<{ data: any; error: any }>;
    getPublicUrl: (path: string) => { data: { publicUrl: string } };
  };
}

interface RPCClient {
  rpc: (procedure: string, params?: any) => Promise<D1Response<any>>;
}

export interface D1Response<T> {
  data: T | null;
  error: Error | null;
}

export class D1Client implements RPCClient {
  private endpoint: string;
  private currentTable: string = '';
  private currentQuery: QueryState = {
    type: 'SELECT',
    conditions: []
  };

  public auth: AuthClient;
  public storage: StorageClient;

  constructor() {
    this.endpoint = import.meta.env.D1_API_URL || 'https://quanlythoigian-d1.vuquangminhseo.workers.dev';
    
    this.auth = {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
      signUp: async () => ({ data: null, error: new Error('Not implemented') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Not implemented') }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null })
    };

    this.storage = {
      from: (bucket: string) => ({
        upload: async () => ({ data: null, error: new Error('Not implemented') }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: '' } })
      })
    };
  }

  channel(topic: string): RealtimeChannel {
    return {
      on: (event, callback) => {
        callback({});
        return this.channel(topic);
      },
      subscribe: (callback) => {
        callback({});
        return this.channel(topic);
      },
      unsubscribe: () => {}
    };
  }

  rpc(procedure: string, params?: any): Promise<D1Response<any>> {
    return this.query(`SELECT * FROM rpc_${procedure}($1)`, [params]);
  }

  private buildQueryBuilder<T>(): QueryBuilder<T> {
    const builder = {
      select: (columns = '*') => {
        this.currentQuery.columns = columns;
        return builder;
      },
      where: (column: string, operator: string | any, value?: any) => {
        // Handle both 2 and 3 argument versions
        if (value === undefined) {
          value = operator;
          operator = '=';
        }
        this.currentQuery.conditions.push({ column, value, operator });
        return builder;
      },
      orderBy: (column: string, ascending = true) => {
        this.currentQuery.order = { column, ascending };
        return builder;
      },
      limit: (count: number) => {
        this.currentQuery.limit = count;
        return builder;
      },
      first: async () => {
        this.currentQuery.single = true;
        const result = await this.executeQuery<T>();
        return {
          data: result.data?.[0] || null,
          error: result.error
        };
      },
      get: () => {
        return this.executeQuery<T>();
      },
      insert: async (data: Partial<T>) => {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = Array(values.length).fill('?').join(', ');

        const sql = `INSERT INTO ${this.currentTable} (${columns.join(', ')}) VALUES (${placeholders})`;
        return this.query<T>(sql, values);
      },
      update: async (data: Partial<T>) => {
        if (this.currentQuery.conditions.length === 0) {
          return { data: null, error: new Error('No conditions specified for update') };
        }

        const columns = Object.keys(data);
        const values = Object.values(data);
        const setClause = columns.map(col => `${col} = ?`).join(', ');
        const whereClause = this.currentQuery.conditions
          .map(cond => `${cond.column} ${cond.operator} ?`)
          .join(' AND ');

        const sql = `UPDATE ${this.currentTable} SET ${setClause} WHERE ${whereClause}`;
        return this.query<T>(sql, [...values, ...this.currentQuery.conditions.map(cond => cond.value)]);
      },
      delete: async () => {
        if (this.currentQuery.conditions.length === 0) {
          return { data: null, error: new Error('No conditions specified for delete') };
        }

        const whereClause = this.currentQuery.conditions
          .map(cond => `${cond.column} ${cond.operator} ?`)
          .join(' AND ');

        const sql = `DELETE FROM ${this.currentTable} WHERE ${whereClause}`;
        return this.query<T>(sql, this.currentQuery.conditions.map(cond => cond.value));
      },
      count: async () => {
        const whereClause = this.currentQuery.conditions.length > 0
          ? 'WHERE ' + this.currentQuery.conditions
              .map(cond => `${cond.column} ${cond.operator} ?`)
              .join(' AND ')
          : '';

        const sql = `SELECT COUNT(*) as count FROM ${this.currentTable} ${whereClause}`;
        return this.query<{ count: number }>(sql, this.currentQuery.conditions.map(cond => cond.value));
      }
    };

    return builder;
  }

  from<T = any>(table: string): QueryBuilder<T> {
    this.currentTable = table;
    this.currentQuery = {
      type: 'SELECT',
      conditions: []
    };
    return this.buildQueryBuilder<T>();
  }

  private async executeQuery<T>(): Promise<D1Response<T[]>> {
    let sql = `SELECT ${this.currentQuery.columns || '*'} FROM ${this.currentTable}`;
    const params: any[] = [];

    if (this.currentQuery.conditions.length > 0) {
      sql += ' WHERE ' + this.currentQuery.conditions
        .map(cond => `${cond.column} ${cond.operator} ?`)
        .join(' AND ');
      params.push(...this.currentQuery.conditions.map(cond => cond.value));
    }

    if (this.currentQuery.order) {
      sql += ` ORDER BY ${this.currentQuery.order.column} ${this.currentQuery.order.ascending ? 'ASC' : 'DESC'}`;
    }

    if (this.currentQuery.limit) {
      sql += ` LIMIT ${this.currentQuery.limit}`;
    } else if (this.currentQuery.single) {
      sql += ' LIMIT 1';
    }

    return this.query<T[]>(sql, params);
  }

  async query<T>(sql: string, params: any[] = []): Promise<D1Response<T>> {
    try {
      const response = await fetch(`${this.endpoint}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { data: result as T, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const d1 = new D1Client();
