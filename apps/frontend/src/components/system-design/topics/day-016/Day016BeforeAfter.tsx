import { BeforeAfter } from "@/components/shared/diagram";
import { Day016Before, Day016Main } from "./Day016Diagrams";

export function Day016BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: client সরাসরি প্রতিটা service ডাকে"
      afterTitle="পরে: একটাই API Gateway"
      before={<Day016Before />}
      after={<Day016Main />}
      beforeNote="Auth, rate limit, CORS, log পাঁচ জায়গায় পাঁচ রকম; একজন ভুলে গেলে ফাঁক। Service ভাঙলে client-ও বদলাতে হয়।"
      afterNote="নিয়ম এক জায়গায়, একবার; client শুধু api.khabarbari.com চেনে। দাম: আরেকটা hop, আর gateway-কে redundant রাখতে হয়।"
    />
  );
}
