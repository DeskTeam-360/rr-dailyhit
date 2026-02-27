import { NextResponse } from "next/server";
import { runDailyHit } from "../../../lib/dailyhit";

export async function GET() {
  try {
    const result = await runDailyHit();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Daily hit error:", error);
    return NextResponse.json(
      { status: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
