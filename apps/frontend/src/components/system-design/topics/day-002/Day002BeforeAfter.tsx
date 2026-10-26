import { BeforeAfter } from "@/components/shared/diagram";
import { Day002Before, Day002Main } from "./Day002Diagrams";

export function Day002BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: সবার phone-এ আলাদা data"
      afterTitle="পরে: এক server, অনেক client"
      before={<Day002Before />}
      after={<Day002Main />}
      beforeNote="দুজনেই শেষ কপি কিনল, দাম বদলালে কেউ জানে না, আর localhost বাইরে থেকে পৌঁছায় না।"
      afterNote="Stock আর দাম শুধু server-এর database-এ; সবাই একই ঠিকানায় যায়, server নিজে যাচাই করে।"
    />
  );
}
