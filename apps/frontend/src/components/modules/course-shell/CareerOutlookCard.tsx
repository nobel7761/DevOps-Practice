import { Briefcase, Rocket, TrendingUp } from "lucide-react";
import type { CareerOutlook } from "@/components/modules/course-shell/course-layout";

function OutlookPoint({
  icon: Icon,
  heading,
  children,
}: {
  icon: typeof Rocket;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-semibold">{heading}</p>
        <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Right side of the course hero: what level the course gets you to and how the market looks. */
export default function CareerOutlookCard({
  outlook,
}: {
  outlook: CareerOutlook;
}) {
  return (
    <aside className="flex w-full flex-col gap-3.5 rounded-2xl border border-border bg-background/70 p-5 backdrop-blur lg:max-w-md">
      <h2 className="text-sm font-bold">{outlook.title}</h2>
      <OutlookPoint icon={Rocket} heading="কোন পর্যায়ে পৌঁছাবেন">
        {outlook.level}
      </OutlookPoint>
      <OutlookPoint icon={Briefcase} heading="যে role-গুলোর জন্য তৈরি হবেন">
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {outlook.roles.map((role) => (
            <li
              key={role}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              {role}
            </li>
          ))}
        </ul>
      </OutlookPoint>
      <OutlookPoint icon={TrendingUp} heading="Industry-তে চাহিদা">
        {outlook.demand}
      </OutlookPoint>
      <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">পরের ধাপ: </span>
        {outlook.nextSteps}
      </p>
    </aside>
  );
}
