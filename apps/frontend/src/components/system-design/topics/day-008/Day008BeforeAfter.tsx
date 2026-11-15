import { BeforeAfter } from "@/components/shared/diagram";
import { Day008ApTransfer, Day008CpTransfer } from "./Day008Diagrams";

/** Same partition, same transfer request: AP behaviour vs CP behaviour. */
export function Day008BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="AP আচরণ: টাকা পাঠানোর জন্য ভুল পছন্দ"
      afterTitle="CP আচরণ: টাকা পাঠানোর জন্য সঠিক পছন্দ"
      before={<Day008ApTransfer />}
      after={<Day008CpTransfer />}
      beforeNote="Balance ৳৫,০০০, অথচ দুই পাশ মিলে ৳৮,০০০ চলে গেল; heal-এর পরে −৳৩,০০০। Like counter হলে এই আচরণই ঠিক হতো।"
      afterNote="Majority পাশে রহিমের transfer সফল; বিচ্ছিন্ন Node 3 করিমকে error দেয়। হিসাব ঠিক থাকে, শুধু করিম পরে চেষ্টা করবেন।"
    />
  );
}
