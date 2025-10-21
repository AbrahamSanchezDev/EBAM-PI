"use client";
import React from "react";
import { RequestsProvider } from "@/app/lib/requestsClient";
import RequestsIcon from "@/app/ui/requests/requests-icon";
import { useCurrentUserProfile } from "@/app/lib/userState";

export default function RequestsMount() {
  const profile = useCurrentUserProfile();
  if (!profile || profile.role !== "admin") return null;
  return (
    <RequestsProvider>
      <RequestsIcon />
    </RequestsProvider>
  );
}
