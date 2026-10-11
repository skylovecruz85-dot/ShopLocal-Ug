export type ApiResponse<T> = { data: T };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const payload = (await response.json().catch(() => ({}))) as { data?: T; error?: string };
  if (!response.ok) throw new Error(payload.error ?? 'Request failed.');
  return payload.data as T;
}

export type ApiListing = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  district: string;
  images: string[];
  status: string;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
};

export const marketplaceApi = {
  listListings: (params?: { q?: string; page?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.q) search.set('q', params.q);
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    return request<ApiListing[]>(`/api/marketplace/listings?${search.toString()}`);
  },
  getProfile: () => request<unknown>('/api/marketplace/profile'),
  saveProfile: (profile: Record<string, unknown>) => request<unknown>('/api/marketplace/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  listFavorites: () => request<unknown[]>('/api/marketplace/favorites'),
  addFavorite: (listingId: string) => request<unknown>('/api/marketplace/favorites', { method: 'POST', body: JSON.stringify({ listingId }) }),
  removeFavorite: (listingId: string) => request<null>(`/api/marketplace/favorites?listingId=${encodeURIComponent(listingId)}`, { method: 'DELETE' }),
  listNotifications: () => request<unknown[]>('/api/marketplace/notifications'),
  listOrders: () => request<unknown[]>('/api/marketplace/orders'),
  createListing: (input: Record<string, unknown>) => request<ApiListing>('/api/marketplace/listings', { method: 'POST', body: JSON.stringify(input) }),
  updateListing: (listingId: string, input: Record<string, unknown>) => request<ApiListing>(`/api/marketplace/listings/${encodeURIComponent(listingId)}`, { method: 'PUT', body: JSON.stringify(input) }),
  deleteListing: (listingId: string) => request<{ id: string }>(`/api/marketplace/listings/${encodeURIComponent(listingId)}`, { method: 'DELETE' }),
  listConversations: () => request<unknown[]>('/api/marketplace/conversations'),
  listMessages: (conversationId: string) => request<unknown[]>(`/api/marketplace/messages?conversationId=${encodeURIComponent(conversationId)}`),
  sendMessage: (conversationId: string, message: string) => request<unknown>('/api/marketplace/messages', { method: 'POST', body: JSON.stringify({ conversationId, body: message }) }),
  createOrder: (listingId: string, quantity = 1) => request<unknown>('/api/marketplace/orders', { method: 'POST', body: JSON.stringify({ listingId, quantity }) }),
  reportListing: (listingId: string, reason: string, details?: string) => request<unknown>('/api/marketplace/reports', { method: 'POST', body: JSON.stringify({ listingId, reason, details }) }),
};
