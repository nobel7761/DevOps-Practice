import { BeforeAfter } from "@/components/shared/diagram";
import { Day013Before } from "./Day013Before";
import { Day013Main } from "./Day013Diagrams";

export function Day013BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: সব এক বিশাল VM-এ, শুধু scale up"
      afterTitle="পরে: tier অনুযায়ী scale"
      before={<Day013Before />}
      after={<Day013Main />}
      beforeNote="৩২ core-এর একটাই কাজে লাগে; resize-এ ৬ মিনিট site বন্ধ; VM পড়লে পরীক্ষা বন্ধ।"
      afterNote="App server সংখ্যায় বাড়ে, একটা পড়লে শুধু তার ভাগ যায়; database নিজের বড় machine-এ, read যায় replica-তে।"
    />
  );
}
