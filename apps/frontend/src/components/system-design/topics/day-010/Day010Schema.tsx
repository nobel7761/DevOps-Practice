import { DiagramEdge } from "@/components/shared/diagram";

// Internal structure: the shop's four tables, joined by primary and foreign keys.

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const W = 210;
const HEAD = 28;
const ROW = 22;

interface Column {
  name: string;
  badge?: string;
}

interface Table {
  name: string;
  x: number;
  y: number;
  columns: Column[];
}

const CUSTOMERS: Table = {
  name: "customers",
  x: 10,
  y: 20,
  columns: [
    { name: "id", badge: "PK" },
    { name: "name" },
    { name: "phone", badge: "UNIQUE" },
    { name: "city" },
  ],
};

const ORDERS: Table = {
  name: "orders",
  x: 290,
  y: 20,
  columns: [
    { name: "id", badge: "PK" },
    { name: "customer_id", badge: "FK" },
    { name: "status" },
    { name: "created_at" },
  ],
};

const ORDER_ITEMS: Table = {
  name: "order_items",
  x: 290,
  y: 196,
  columns: [
    { name: "order_id", badge: "PK·FK" },
    { name: "product_id", badge: "PK·FK" },
    { name: "quantity", badge: "CHECK > 0" },
    { name: "unit_price" },
  ],
};

const PRODUCTS: Table = {
  name: "products",
  x: 570,
  y: 196,
  columns: [
    { name: "id", badge: "PK" },
    { name: "name" },
    { name: "price", badge: "CHECK > 0" },
    { name: "stock", badge: "CHECK ≥ 0" },
  ],
};

const rowMid = (table: Table, i: number) => table.y + HEAD + i * ROW + ROW / 2;

function TableBox({ table }: { table: Table }) {
  const height = HEAD + table.columns.length * ROW + 6;
  return (
    <g>
      <rect
        x={table.x}
        y={table.y}
        width={W}
        height={height}
        rx={8}
        fill="var(--sd-canvas)"
        stroke="var(--sd-database)"
        strokeWidth={2}
      />
      <rect
        x={table.x}
        y={table.y}
        width={W}
        height={HEAD}
        rx={8}
        fill="var(--sd-database-soft)"
        stroke="var(--sd-database)"
        strokeWidth={2}
      />
      <text
        x={table.x + 12}
        y={table.y + 19}
        fontSize={13}
        fontWeight={700}
        fontFamily={MONO}
        fill="var(--sd-label)"
      >
        {table.name}
      </text>
      {table.columns.map((col, i) => (
        <ColumnRow key={col.name} table={table} col={col} index={i} />
      ))}
    </g>
  );
}

function ColumnRow({
  table,
  col,
  index,
}: {
  table: Table;
  col: Column;
  index: number;
}) {
  const y = rowMid(table, index);
  const isKey = col.badge?.includes("PK") || col.badge?.includes("FK");
  return (
    <g>
      <text
        x={table.x + 12}
        y={y}
        dominantBaseline="central"
        fontSize={12}
        fontFamily={MONO}
        fontWeight={isKey ? 700 : 400}
        fill="var(--sd-label)"
      >
        {col.name}
      </text>
      {col.badge && (
        <text
          x={table.x + W - 10}
          y={y}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={10.5}
          fontWeight={700}
          fill={isKey ? "var(--primary)" : "var(--sd-edge)"}
        >
          {col.badge}
        </text>
      )}
    </g>
  );
}

function Relations() {
  return (
    <g>
      <DiagramEdge
        segment={{
          x1: ORDERS.x - 2,
          y1: rowMid(ORDERS, 1),
          x2: CUSTOMERS.x + W + 2,
          y2: rowMid(CUSTOMERS, 0),
        }}
        label="N → 1"
        tone="active"
      />
      <DiagramEdge
        segment={{
          x1: ORDER_ITEMS.x + W / 2,
          y1: ORDER_ITEMS.y - 2,
          x2: ORDERS.x + W / 2,
          y2: ORDERS.y + HEAD + 4 * ROW + 8,
        }}
        label="অনেক item → ১ order"
        tone="active"
      />
      <DiagramEdge
        segment={{
          x1: ORDER_ITEMS.x + W + 2,
          y1: rowMid(ORDER_ITEMS, 1),
          x2: PRODUCTS.x - 2,
          y2: rowMid(PRODUCTS, 0),
        }}
        label="N → 1"
        tone="active"
      />
    </g>
  );
}

function Legend() {
  return (
    <g>
      <text x={10} y={230} fontSize={11.5} fill="var(--sd-label)">
        PK = প্রতিটা row-এর অনন্য পরিচয়
      </text>
      <text x={10} y={250} fontSize={11.5} fill="var(--sd-label)">
        FK = অন্য table-এর PK-র দিকে ইশারা;
      </text>
      <text x={10} y={268} fontSize={11.5} fill="var(--sd-label)">
        database নিশ্চিত করে সেটা আছে
      </text>
      <text x={10} y={292} fontSize={11.5} fill="var(--sd-edge)">
        তীর: FK → যে PK-কে দেখায়
      </text>
    </g>
  );
}

/** Relational schema: tables, primary keys, foreign keys and constraints. */
export function Day010Schema() {
  return (
    <svg viewBox="0 0 790 330" width="100%">
      <Relations />
      <TableBox table={CUSTOMERS} />
      <TableBox table={ORDERS} />
      <TableBox table={ORDER_ITEMS} />
      <TableBox table={PRODUCTS} />
      <Legend />
    </svg>
  );
}
