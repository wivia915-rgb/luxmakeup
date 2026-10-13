import { AgentDesk } from "@/components/admin/agent-desk";
import { deskIsOpen } from "@/lib/admin-gate";
import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Agent",
  description: "The prompt that guides the Lux Makeup advisor.",
};

export default async function AdminAgentPage() {
  if (!(await deskIsOpen())) return null;
  const settings = await getStoreSettings();

  return (
    <main id="main">
      <AgentDesk prompt={settings.agentPrompt} enabled={settings.agentEnabled} connected={settings.connected} />
    </main>
  );
}
