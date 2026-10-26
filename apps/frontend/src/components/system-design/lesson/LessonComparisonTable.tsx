import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/shadcn";
import type { LessonComparisonTable as ComparisonTable } from "@/lib/system-design/lesson.types";

export default function LessonComparisonTable({
  table,
}: {
  table: ComparisonTable;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {table.headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.rows.map((row) => (
            <TableRow key={row.join("|")}>
              {row.map((cell, index) => (
                <TableCell key={index} className="whitespace-normal">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
