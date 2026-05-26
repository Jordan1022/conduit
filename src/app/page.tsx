import { ConduitApp } from "@/components/ConduitApp";
import { getDemoData } from "@/lib/supabase";

export default async function Home() {
  const data = await getDemoData();

  return <ConduitApp initialData={data} />;
}
