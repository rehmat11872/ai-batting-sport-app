"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type Section = "predictions" | "nba" | "nfl" | "soccer" | "weather";

interface DashboardNavProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
}

const sectionLabels: Record<Section, string> = {
  predictions: "Today's Predictions",
  nba: "NBA",
  nfl: "NFL",
  soccer: "Soccer",
  weather: "Weather",
};

export function DashboardNav({ currentSection, onSectionChange }: DashboardNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {sectionLabels[currentSection]}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>Navigate</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onSectionChange("predictions")}>
          Today&apos;s Predictions
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>ESPN</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSectionChange("nba")}>
          NBA
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSectionChange("nfl")}>
          NFL
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSectionChange("soccer")}>
          Soccer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onSectionChange("weather")}>
          Weather
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

