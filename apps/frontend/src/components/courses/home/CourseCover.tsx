import { courseCover } from "./course-theme";

/** Gradient banner with a big soft icon — the "thumbnail" of a course card. */
export default function CourseCover({ index }: { index: number }) {
  const { gradient, icon: Icon } = courseCover(index);
  return (
    <div
      className={`relative flex h-28 items-end overflow-hidden bg-linear-to-br ${gradient}`}
    >
      <Icon className="absolute -top-3 -right-3 size-28 rotate-12 text-white/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(255,255,255,0.25),transparent_55%)]" />
      <Icon className="relative m-4 size-9 rounded-xl bg-white/20 p-2 text-white backdrop-blur-sm" />
    </div>
  );
}
