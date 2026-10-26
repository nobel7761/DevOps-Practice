import { BeforeAfter } from "@/components/shared/diagram";
import { Day012Before, Day012Main } from "./Day012Diagrams";

export function Day012BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: সব কাজ request-এর ভেতরে"
      afterTitle="পরে: Queue দিয়ে"
      before={<Day012Before />}
      after={<Day012Main />}
      beforeNote="User অপেক্ষা করে ~৩.২s; SMS Gateway down হলে পুরো order fail।"
      afterNote="User উত্তর পায় ~১২০ms-এ; SMS Gateway down হলে message-টা queue-তে অপেক্ষা করে।"
    />
  );
}
