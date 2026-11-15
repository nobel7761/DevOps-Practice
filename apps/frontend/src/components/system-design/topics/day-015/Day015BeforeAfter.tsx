import { BeforeAfter } from "@/components/shared/diagram";
import { Day015Before, Day015Main } from "./Day015Diagrams";

export function Day015BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: সবাই সরাসরি"
      afterTitle="পরে: দুই দিকে দুটো proxy"
      before={<Day015Before />}
      after={<Day015Main />}
      beforeNote="১ GB update ২০০ বার নামে, কে কোথায় যায় কেউ জানে না; app server-এর IP খোলা, ধীর upload worker আটকে রাখে।"
      afterNote="Update একবার নামে, domain block আর log সম্ভব; app server লুকানো, ধীর upload সামলায় NGINX, response compress হয়।"
    />
  );
}
