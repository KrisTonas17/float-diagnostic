// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runDiagnostic } from "@/lib/calculations";
import { saveDiagnosticSubmission } from "@/lib/db";
import { FormInputs, LeadInfo, DiagnosticSubmission } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { inputs, lead } = body as { inputs: FormInputs; lead: LeadInfo };

    if (!inputs || !lead) {
      return NextResponse.json({ error: "Missing inputs or lead data" }, { status: 400 });
    }

    const results = runDiagnostic(inputs);

    const submission: DiagnosticSubmission = {
      lead,
      inputs,
      results,
      submittedAt: new Date().toISOString(),
    };

    const id = await saveDiagnosticSubmission(submission);

    return NextResponse.json({ results, id });
  } catch (e: unknown) {
    console.error("Submit error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
