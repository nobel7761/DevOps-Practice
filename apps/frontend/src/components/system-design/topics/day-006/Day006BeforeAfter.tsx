import { BeforeAfter } from "@/components/shared/diagram";
import {
  Day006Before,
  Day006Main,
  Day006OneZone,
  Day006TwoZones,
} from "./Day006Diagrams";

/** Single server vs redundant multi-AZ design (core concept). */
export function Day006BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: সব কিছু একটা server-এ"
      afterTitle="পরে: দুই zone-এ redundancy"
      before={<Day006Before />}
      after={<Day006Main />}
      beforeNote="Server পড়লেই পুরো site বন্ধ; downtime = সমস্যা ধরা + সারানোর পুরো সময়।"
      afterNote="একটা app server, এমনকি একটা পুরো zone পড়লেও load balancer অন্যটায় পাঠায়; downtime = শুধু detection আর switch-এর কয়েক সেকেন্ড।"
    />
  );
}

/** Correlated failure: copies in one AZ vs copies spread over two AZs (deep dive). */
export function Day006Correlated() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="দুই কপি, একই zone"
      afterTitle="দুই কপি, আলাদা zone"
      before={<Day006OneZone />}
      after={<Day006TwoZones />}
      beforeNote="কাগজে redundancy আছে, কিন্তু zone পড়লে দুটোই যায়: failure স্বাধীন না।"
      afterNote="Zone A-র সমস্যা Zone B-তে ছড়ায় না, তাই একটা কপি সেবা দিতে থাকে।"
    />
  );
}
