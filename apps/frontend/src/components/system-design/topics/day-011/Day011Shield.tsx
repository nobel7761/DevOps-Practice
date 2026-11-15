import { BeforeAfter } from "@/components/shared/diagram";
import { Day011ShieldAfter, Day011ShieldBefore } from "./Day011Diagrams";

export function Day011Shield() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="Shield ছাড়া"
      afterTitle="Origin Shield সহ"
      before={<Day011ShieldBefore />}
      after={<Day011ShieldAfter />}
      beforeNote="৪টা PoP-এ মেয়াদ শেষ = origin-এ ৪টা fetch। ৫০টা PoP আর ১,০০০টা file-এ মিনিটে ৫০,০০০।"
      afterNote="সব miss shield-এ মেলে; shield-এর কপি তাজা থাকলে origin কিছুই পায় না, নইলে ১টা।"
    />
  );
}
