import { NextResponse } from "next/server";
import { fetchPredictions } from "@/lib/predictions";

export async function GET() {
  const predictions = await fetchPredictions();
  return NextResponse.json({ predictions });
}
