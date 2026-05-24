export type CurrentUser = {
  id: string;
  username: string;
  email: string;
  activeProjectId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthenticatedContext = {
  currentUser: CurrentUser;
  userId: string;
};

export type AuthContext = {
  currentUser: CurrentUser | null;
  userId: string | null;
};
