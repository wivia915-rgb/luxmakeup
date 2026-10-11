"use client";

import { adminMessages, deskError, type AdminCopy } from "@/lib/admin-copy";
import { createContext, useContext, type ReactNode } from "react";

const AdminCopyContext = createContext<AdminCopy>(adminMessages.en);

export function AdminCopyProvider({ copy, children }: { copy: AdminCopy; children: ReactNode }) {
  return <AdminCopyContext.Provider value={copy}>{children}</AdminCopyContext.Provider>;
}

export function useAdminCopy() {
  return useContext(AdminCopyContext);
}

export function useDeskError() {
  const copy = useAdminCopy();
  return (message: string) => deskError(copy.locale, message);
}
