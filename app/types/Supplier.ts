export interface Supplier {
  id: string;
  name: string;
  leadTimeDays: number;
  _count?: {
    product: number;
  };
}
