import { BeforeAfter } from "@/components/shared/diagram";
import { Day022Before, Day022Main } from "./Day022Diagrams";

export function Day022BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: Index নেই, Seq Scan"
      afterTitle="পরে: roll-এর উপর B-tree index"
      before={<Day022Before />}
      after={<Day022Main />}
      beforeNote="প্রতি query-তে ২০ লাখ row পড়া; ১০০০ query/s মানে সেকেন্ডে ২০০ কোটি row মেলানো।"
      afterNote="প্রতি query-তে ৩-৪টা index page + ১টা table page; Lab-এর ১০ লাখ row-এ একটা laptop-এ ~১৬ms থেকে ~০.০৪ms।"
    />
  );
}
