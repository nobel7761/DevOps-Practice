import { BeforeAfter } from "@/components/shared/diagram";
import { Day005Before, Day005Main } from "./Day005Diagrams";

export function Day005BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: সব কিছু একটা machine-এ"
      afterTitle="পরে: প্রতিটা চাপের জন্য আলাদা হাতিয়ার"
      before={<Day005Before />}
      after={<Day005Main />}
      beforeNote="Sale-এর দিন CPU 100%, request লাইনে দাঁড়িয়ে timeout; machine মরলে পুরো site বন্ধ।"
      afterNote="App server যোগ করলেই বেশি request; ছবি CDN থেকে, read cache/replica থেকে, ধীর কাজ queue-তে। Write এখনো একটা primary-তে, সেটাই পরের সীমা।"
    />
  );
}
