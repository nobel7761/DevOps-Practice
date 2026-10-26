import { BeforeAfter } from "@/components/shared/diagram";
import {
  Day018Before,
  Day018LocalCounters,
  Day018Main,
  Day018SharedCounter,
} from "./Day018Diagrams";

export function Day018BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: কোনো সীমা নেই"
      afterTitle="পরে: Gateway-তে Rate Limiter"
      before={<Day018Before />}
      after={<Day018Main />}
      beforeNote="কয়েকটা bot আর scraper পুরো server আর database দখল করে; সাধারণ user timeout পায়।"
      afterNote="প্রতিটা client-এর নিজের সীমা; বাড়তি request gateway-তেই 429 পায়, server পর্যন্ত পৌঁছায় না।"
    />
  );
}

/** Distributed rate limiting: local counters vs one shared counter. */
export function Day018Distributed() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="ভুল: প্রতিটা server নিজে নিজে গোনে"
      afterTitle="ঠিক: সবাই একটা shared counter-এ গোনে"
      before={<Day018LocalCounters />}
      after={<Day018SharedCounter />}
      beforeNote="Limit 100/min, কিন্তু load balancer request তিন ভাগ করায় প্রতিটা server ১০০ পর্যন্ত ছেড়ে দেয়: user আসলে পায় 300/min।"
      afterNote="সব server একই Redis key (যেমন rl:user42) বাড়ায়, তাই মোট হিসাব একটাই: 101তম request যে server-এই যাক, 429।"
    />
  );
}
