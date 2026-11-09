import { RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@/components/shared/shadcn";

/** Clears every typed answer, verdict and "remembered" mark of this chapter's deck (asks first). */
export default function ResetDeckButton({
  disabled,
  onReset,
}: {
  disabled: boolean;
  onReset: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={disabled}>
          <RotateCcw className="size-4" /> Reset
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>সব card reset করবে?</AlertDialogTitle>
          <AlertDialogDescription>
            এই chapter-এর সব লেখা উত্তর, ✅/❌ ফলাফল আর ‘মনে আছে’ চিহ্ন মুছে
            যাবে, তুমি আবার প্রথম থেকে উত্তর দিতে পারবে।
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>বাতিল</AlertDialogCancel>
          <AlertDialogAction onClick={onReset}>
            হ্যাঁ, reset করো
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
