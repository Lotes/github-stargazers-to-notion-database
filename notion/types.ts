export type Entity = {id: string};

export interface Database<R extends Entity, K extends keyof R> {
  readonly id: string;
  create(row: Omit<R, 'id'>): Promise<string>;
  all(): Promise<R[]>;
  keyOf(row: R): R[K];
  get(key: R[K]): Promise<R>;
  getById(id: string): Promise<R>;
  has(key: R[K]): Promise<boolean>;
  update(id: string, newRow: R): Promise<(keyof R)[]>;
}

export interface Changer<R> {
  readonly key: keyof R;
  changed(oldRow: R, newRow: R): boolean;  
  fromPage(page: any, row: R): Promise<void>;
  toPage(row: R, page: any): void;
}