import { BeforeAfter } from "@/components/shared/diagram";
import { Day011Before, Day011Main } from "./Day011Diagrams";

export function Day011BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: সবকিছু দূরের origin থেকে"
      afterTitle="পরে: কাছের edge থেকে, CDN দিয়ে"
      before={<Day011Before />}
      after={<Day011Main />}
      beforeNote="প্রতিটা file-এ ~২৫০ms RTT; নতুন HTTPS connection-এ ~৭৫০ms। দিনে ১ কোটি request-এর সবটাই origin-এ।"
      afterNote="HIT-এ ~১০ms RTT; নতুন connection ~৩০ms। ৯৯% hit ratio-তে origin পায় দিনে ~১ লাখ, shield থাকলে আরও কম।"
    />
  );
}
