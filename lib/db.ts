// lib/db.ts
// Temporary storage-disabled version for Vercel testing
// This prevents server crashes while still letting the app run fully.

import { DiagnosticSubmission } from "@/types";

export async function saveDiagnosticSubmission(
  submission: DiagnosticSubmission
): Promise<string> {

  console.log("Diagnostic submission received:", {
    name: submission.lead.name,
    email: submission.lead.email,
    company: submission.lead.company,
  });

  // return fake id so frontend continues normally
  return "temp_" + Date.now();
}
