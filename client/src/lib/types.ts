export type Shape = "bottle" | "jar" | "tube" | "box" | "pouch";

export type Product = {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  category: string;
  categoryName: string;
  categoryNameEn: string;
  price: number;
  compareAt?: number;
  size: string;
  rating: number;
  reviews: number;
  badge?: string;
  short: string;
  description: string;
  howToUse: string;
  benefits: string[];
  ingredients: string[];
  shape: Shape;
  tone: [string, string];
  stock: number;
  isActive: boolean;
};

export type Category = {
  slug: string;
  name: string;
  nameEn: string;
  blurb: string;
  tone: string;
  productCount: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "admin";
};

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  nameEn: string;
  unitPrice: number;
  size: string;
  stock: number;
  shape: Shape;
  tone: [string, string];
  qty: number;
  lineTotal: number;
};

export type CartSummary = {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  count: number;
};

export type PaymentStatus =
  | "unpaid" | "processing" | "paid" | "failed" | "refunded";

export type PaymentConfig = {
  enabled: boolean;
  publishableKey: string | null;
  currency: string;
};

export type OrderStatus =
  | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: number;
  reference: string;
  userId: number | null;
  customer: { name: string; email: string; phone: string };
  shipping: { emirate: string; area: string; address: string; notes: string };
  paymentMethod: "cod" | "card";
  paymentStatus: PaymentStatus;
  paymentBrand: string | null;
  paymentWallet: string | null;
  paidAt: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: {
    productId: number | null;
    slug: string;
    name: string;
    unitPrice: number;
    qty: number;
    lineTotal: number;
  }[];
};

export type AdminStats = {
  totals: {
    products: number;
    orders: number;
    customers: number;
    revenue: number;
    awaiting_payment: number;
  };
  byStatus: Partial<Record<OrderStatus, number>>;
  recentOrders: Order[];
  lowStock: Product[];
};
