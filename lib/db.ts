// lib/db.ts
// Supports both Supabase (production) and local JSON file (development fallback)

import { DiagnosticSubmission } from "@/types";
import fs from "fs";
import path from "path";

const USE_SUPABASE = !!process.env.SUPABASE_URL;

// ── SUPABASE ──────────────────────────────────────────────────────────────────
async function saveToSupabase(submission: DiagnosticSubmission): Promise<string> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("diagnostic_submissions")
    .insert([
      {
        name: submission.lead.name,
        email: submission.lead.email,
        company: submission.lead.company,
        role: submission.lead.role,
        inputs: submission.inputs,
        results: submission.results,
        submitted_at: submission.submittedAt,
      },
    ])
    .select("id")
    .single();

  if (error) throw new Error(`Supabase error: ${error.message}`);
  return data.id;
}

// ── LOCAL JSON FALLBACK ───────────────────────────────────────────────────────
function saveToLocal(submission: DiagnosticSubmission): string {
  const dir = path.join(process.cwd(), "data");
  const filePath = path.join(dir, "submissions.json");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let existing: (DiagnosticSubmission & { id: string })[] = [];
  if (fs.existsSync(filePath)) {
    existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  existing.push({ ...submission, id });
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  return id;
}

export async function saveDiagnosticSubmission(submission: DiagnosticSubmission): Promise<string> {
  if (USE_SUPABASE) {
    return saveToSupabase(submission);
  }
  return saveToLocal(submission);
}
