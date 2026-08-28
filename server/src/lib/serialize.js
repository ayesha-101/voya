/** يحوّل صف المنتج من قاعدة البيانات إلى الشكل الذي تتوقّعه الواجهة. */
export function toProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameEn: row.name_en,
    category: row.category_slug,
    categoryName: row.category_name,
    price: row.price,
    compareAt: row.compare_at ?? undefined,
    size: row.size,
    rating: row.rating,
    reviews: row.reviews,
    badge: row.badge ?? undefined,
    short: row.short,
    description: row.description,
    benefits: row.benefits,
    ingredients: row.ingredients,
    shape: row.shape,
    tone: [row.tone_from, row.tone_to],
    stock: row.stock,
    isActive: row.is_active,
  };
}

export function toOrder(row, items = []) {
  return {
    id: row.id,
    reference: row.reference,
    userId: row.user_id ?? null,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
    },
    shipping: {
      emirate: row.emirate,
      area: row.area,
      address: row.address,
      notes: row.notes,
    },
    paymentMethod: row.payment_method,
    status: row.status,
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    total: row.total,
    createdAt: row.created_at,
    items: items.map((i) => ({
      productId: i.product_id,
      slug: i.product_slug,
      name: i.product_name,
      unitPrice: i.unit_price,
      qty: i.qty,
      lineTotal: i.line_total,
    })),
  };
}
