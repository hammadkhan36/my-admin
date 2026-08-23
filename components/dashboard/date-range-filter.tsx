"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";

export function DateRangeFilter() {
  const ranges = ["7d", "30d", "90d", "12m"];
  const [selected, setSelected] = React.useState("30d");

  return (
    <div className="flex items-center gap-2">
      {ranges.map((range) => (
        <Button
          key={range}
          variant={selected === range ? "default" : "outline"}
          size="sm"
          onClick={() => setSelected(range)}
          className="h-8 px-3 text-xs font-medium"
        >
          {range}
        </Button>
      ))}
    </div>
  );
}