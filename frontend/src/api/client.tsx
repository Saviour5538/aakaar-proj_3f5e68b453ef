import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const login = (data: LoginRequest) => api.post<LoginResponse>('/login', data);

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
}

export const register = (data: RegisterRequest) => api.post<RegisterResponse>('/register', data);

export interface MeResponse {
  id: string;
  username: string;
  email: string;
}

export const getMe = () => api.get<MeResponse>('/me');

export interface UserResponse {
  id: string;
  username: string;
  email: string;
}

export const getUsers = () => api.get<UserResponse[]>('/users');

export const getUserById = (userId: string) => api.get<UserResponse>(`/users/${userId}`);

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export const createUser = (data: CreateUserRequest) => api.post<UserResponse>('/users', data);

export const deleteUser = (userId: string) => api.delete(`/users/${userId}`);

export interface DocumentResponse {
  id: string;
  title: string;
  description: string;
  metadata: Record<string, any>;
}

export const getDocumentById = (documentId: string) => api.get<DocumentResponse>(`/${documentId}`);

export const deleteDocument = (documentId: string) => api.delete(`/${documentId}`);

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export const updateDocument = (documentId: string, data: UpdateDocumentRequest) =>
  api.put<DocumentResponse>(`/${documentId}`, data);

export interface UploadDocumentRequest {
  file: File;
  title: string;
  description: string;
  metadata: Record<string, any>;
}

export const uploadDocument = (data: UploadDocumentRequest) => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('title', data.title);
  formData.append('description', data.description);
  Object.keys(data.metadata).forEach((key) => {
    formData.append(`metadata[${key}]`, data.metadata[key]);
  });
  return api.post<DocumentResponse>('/', formData);
};

export interface ConversationResponse {
  id: string;
  title: string;
  created_at: string;
}

export const getConversations = () => api.get<ConversationResponse[]>('/conversations');

export interface CreateConversationRequest {
  title: string;
}

export const createConversation = (data: CreateConversationRequest) =>
  api.post<ConversationResponse>('/conversations', data);

export const deleteConversation = (conversationId: string) =>
  api.delete(`/conversations/${conversationId}`);

export interface MessageResponse {
  id: string;
  conversation_id: string;
  content: string;
  created_at: string;
}

export const getMessages = () => api.get<MessageResponse[]>('/messages');

export interface CreateMessageRequest {
  conversation_id: string;
  content: string;
}

export const createMessage = (data: CreateMessageRequest) =>
  api.post<MessageResponse>('/messages', data);

export const deleteMessage = (messageId: string) => api.delete(`/messages/${messageId}`);