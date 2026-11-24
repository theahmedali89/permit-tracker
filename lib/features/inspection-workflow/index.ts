// Inspection fail → correction workflow.
//
// The implementation moved into the `inspections` core feature folder
// (`lib/features/inspections/fail-workflow.ts`, pass 2 modularity) so the
// inspections CRUD module can use it without a cross-feature import —
// features never import each other. This file is a thin re-export shim;
// the registry entry, README and tests for this feature are unchanged.
export * from "@/lib/features/inspections/fail-workflow";
