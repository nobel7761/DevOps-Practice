import ModulesScreen from "@/components/modules/ModulesScreen";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ milestone?: string; module?: string }>;
}) {
  const { milestone, module } = await searchParams;

  return (
    <ModulesScreen defaultMilestoneId={milestone} defaultModuleId={module} />
  );
}
