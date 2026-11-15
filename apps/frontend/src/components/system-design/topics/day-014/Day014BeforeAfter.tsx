import { BeforeAfter } from "@/components/shared/diagram";
import { Day014Before, Day014Main } from "./Day014Diagrams";

export function Day014BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: Stateful server, state প্রতিটা server-এর memory-তে"
      afterTitle="পরে: Stateless server, state shared store-এ"
      before={<Day014Before />}
      after={<Day014Main />}
      beforeNote="Request কোন server-এ গেল তার উপর নির্ভর করে cart আছে কি নেই। Server crash বা deploy মানে ওই server-এর সব user-এর session শেষ।"
      afterNote="যেকোনো server যেকোনো request নিতে পারে। Server মরলে শুধু capacity কমে, কারও data হারায় না; deploy আর autoscale নির্ভয়ে।"
    />
  );
}
