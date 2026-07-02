import { DepartmentPicker } from "@/components/department/department-picker";

export function HomeDepartmentSection() {
  return (
    <section className="mt-20 w-full max-w-5xl">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lime">
          Choose your path
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          CrossFit or Hyrox — pick your mode
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          ASCEND has dedicated modes for CrossFit and Hyrox — each with tailored focus areas,
          coaching, and tracking.
        </p>
      </div>
      <DepartmentPicker variant="home" />
    </section>
  );
}
