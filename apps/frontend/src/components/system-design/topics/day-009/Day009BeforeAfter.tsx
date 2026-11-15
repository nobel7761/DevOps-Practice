import { BeforeAfter } from "@/components/shared/diagram";
import { Day009Before, Day009Main } from "./Day009Diagrams";

export function Day009BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: সবাই একটা server-এ"
      afterTitle="পরে: Load Balancer-এর পেছনে কয়েকটা server"
      before={<Day009Before />}
      after={<Day009Main />}
      beforeNote="Capacity একটা machine-এর সমান; সেটা পড়লে পুরো site বন্ধ।"
      afterNote="Capacity server সংখ্যার সাথে বাড়ে; একটা পড়লে health check তাকে বাদ দেয়, বাকিরা চালায়।"
    />
  );
}
