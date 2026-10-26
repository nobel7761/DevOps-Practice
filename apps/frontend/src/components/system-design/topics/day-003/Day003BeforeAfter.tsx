import { BeforeAfter } from "@/components/shared/diagram";
import { Day003After, Day003Before } from "./Day003Diagrams";

export function Day003BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: ক্রেতার হাতে সরাসরি IP"
      afterTitle="পরে: ক্রেতার হাতে নাম, মাঝে DNS"
      before={<Day003Before />}
      after={<Day003After />}
      beforeNote="Server সরালে flyer, SMS, post সব ঠিকানা অচল; ক্রেতাদের হাতের নম্বর আপনি বদলাতে পারেন না।"
      afterNote="Server সরালে শুধু একটা A record বদলান; TTL শেষ হলেই সবাই নতুন server-এ যায়।"
    />
  );
}
