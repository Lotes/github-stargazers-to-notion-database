export type Entity = {id: string};

export interface Database<R extends Entity, K extends keyof R> {
  readonly id: string;
  create(row: Omit<R, 'id'>): Promise<string>;
  update(id: string, newRow: R): Promise<(keyof R)[]>;
  all(): R[];
  keyOf(row: R): R[K];
  get(key: R[K]): R;
  getById(id: string): R;
  has(key: R[K]): boolean;
}

export interface Changer<R> {
  readonly key: keyof R;
  changed(oldRow: R, newRow: R): boolean;  
  fromPage(page: any, row: R): Promise<void>;
  toPage(row: R, page: any): void;
}