import { BeforeAfter } from "@/components/shared/diagram";
import { Day001Before, Day001Main } from "./Day001Diagrams";

export function Day001BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: একটা server-এ সব"
      afterTitle="পরে: building block দিয়ে সাজানো"
      before={<Day001Before />}
      after={<Day001Main />}
      beforeNote="সস্তা আর সহজ, কিন্তু ভিড়ে CPU, database connection আর bandwidth একসাথে শেষ; server মরলে পুরো site বন্ধ।"
      afterNote="ছবি CDN থেকে, request দুটো server-এ ভাগ, বারবার পড়া data cache-এ, ধীর কাজ queue-তে; একটা app server মরলেও site চলে। দাম: বেশি খরচ আর বেশি জটিলতা।"
    />
  );
}
