import { BeforeAfter } from "@/components/shared/diagram";
import {
  Day017Before,
  Day017Main,
  Day017StampedeAfter,
  Day017StampedeBefore,
} from "./Day017Diagrams";

export function Day017BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: প্রতিটা request database-এ"
      afterTitle="পরে: cache-aside"
      before={<Day017Before />}
      after={<Day017Main />}
      beforeNote="প্রতিটা page-এ ~৩০০ms-এর query; ১,০০০ req/s মানে database-এ ১,০০০ query/s।"
      afterNote="Hit হলে ~১-৩ms; ৯৫% hit ratio-তে database-এ যায় মাত্র ৫০ query/s। (সংখ্যাগুলো উদাহরণ)"
    />
  );
}

export function Day017Stampede() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="Protection ছাড়া: cache stampede"
      afterTitle="Per-key lock (single flight) দিয়ে"
      before={<Day017StampedeBefore />}
      after={<Day017StampedeAfter />}
      beforeNote="জনপ্রিয় key-র মেয়াদ শেষ হওয়ার মুহূর্তে ২০টা request, ২০টাই miss, database-এ ২০টা একই ভারী query।"
      afterNote="প্রথমজন lock নিয়ে database থেকে আনে আর cache ভরে; বাকিরা একটু অপেক্ষা করে cache থেকেই পায়। Database-এ ১টা query।"
    />
  );
}
