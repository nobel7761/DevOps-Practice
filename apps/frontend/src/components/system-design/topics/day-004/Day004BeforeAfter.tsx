import { BeforeAfter } from "@/components/shared/diagram";
import { Day004Before, Day004Main } from "./Day004Diagrams";

export function Day004BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: যার যেমন খুশি endpoint, partner সরাসরি database-এ"
      afterTitle="পরে: সবার জন্য একটা REST API contract"
      before={<Day004Before />}
      after={<Day004Main />}
      beforeNote="একটা column-এর নাম বদলালেই courier partner-এর code ভাঙে; কে কী পড়ছে-লিখছে কেউ জানে না।"
      afterNote="Database-এ শুধু API হাত দেয়; ভেতরের table বদলালেও URL, method আর JSON-এর চুক্তি একই থাকে।"
    />
  );
}
