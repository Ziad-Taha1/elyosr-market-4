
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export enum AppView {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export const CATEGORIES = [
  "الكل",
  "تسالي",
  "ألبان وأجبان",
  "لحوم ودواجن",
  "مخبوزات",
  "منظفات",
  "أخرى"
];
