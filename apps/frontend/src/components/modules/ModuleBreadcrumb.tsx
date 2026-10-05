import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/shared/shadcn";

export interface BreadcrumbTrailItem {
  label: string;
  href?: string;
}

export default function ModuleBreadcrumb({
  items,
}: {
  items: BreadcrumbTrailItem[];
}) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
