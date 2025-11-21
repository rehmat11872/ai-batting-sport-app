import { NextRequest, NextResponse } from "next/server";
import { fetchGameWeather } from "@/lib/weather";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get("location");
  const dateTime = searchParams.get("dateTime");

  if (!location || !dateTime) {
    return NextResponse.json(
      { error: "Location and dateTime are required" },
      { status: 400 }
    );
  }

  try {
    const weather = await fetchGameWeather(location, dateTime);
    return NextResponse.json({ weather });
  } catch (error) {
    console.error("Error fetching game weather:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}

