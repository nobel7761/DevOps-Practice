import { BookOpenText } from "lucide-react";
import LabComingSoonPanel from "@/components/modules/lab/LabComingSoonPanel";

export default function HermesLessonComingSoon() {
  return (
    <LabComingSoonPanel
      icon={BookOpenText}
      title="বাংলা Golpo Lesson"
      description="এই page-এর গল্প, diagram, simulator আর quiz এখনো লেখা হচ্ছে।"
    />
  );
}
