@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

/* :root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
} */


:root {
  --background: oklch(0.984 0.003 247.858);   /* slate-50 */
  --foreground: oklch(0.208 0.042 265.755);   /* slate-900 */
  --card: oklch(1 0 0);                        /* white */
  --card-foreground: oklch(0.208 0.042 265.755);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.208 0.042 265.755);
  --primary: oklch(0.511 0.262 276.966);       /* indigo-600 */
  --primary-foreground: oklch(0.985 0 0);      /* white */
  --secondary: oklch(0.968 0.003 247.858);     /* slate-100 */
  --secondary-foreground: oklch(0.208 0.042 265.755);
  --muted: oklch(0.968 0.003 247.858);         /* slate-100 */
  --muted-foreground: oklch(0.554 0.046 257.417); /* slate-500 */
  --accent: oklch(0.93 0.034 272.788);         /* indigo-100 */
  --accent-foreground: oklch(0.457 0.24 277.023); /* indigo-700 */
  --destructive: oklch(0.577 0.245 27.325);    /* red-500 */
  --border: oklch(0.929 0.006 255.508);        /* slate-200 */
  --input: oklch(0.929 0.006 255.508);
  --ring: oklch(0.511 0.262 276.966);          /* indigo-600 */
--chart-1: oklch(0.60 0.22 276.9);  /* bright indigo */
--chart-2: oklch(0.75 0.18 200);    /* bright cyan */
--chart-3: oklch(0.72 0.19 155);    /* bright emerald */
--chart-4: oklch(0.80 0.20 70);     /* bright amber */
--chart-5: oklch(0.70 0.24 355);    /* bright pink */
  --radius: 0.625rem;
  --sidebar: oklch(1 0 0);                     /* white */
  --sidebar-foreground: oklch(0.208 0.042 265.755);
  --sidebar-primary: oklch(0.511 0.262 276.966); /* indigo-600 */
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.93 0.034 272.788);   /* indigo-100 */
  --sidebar-accent-foreground: oklch(0.457 0.24 277.023);
  --sidebar-border: oklch(0.929 0.006 255.508);
  --sidebar-ring: oklch(0.511 0.262 276.966);
}
/* 
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
} */


.dark {
  --background: oklch(0.208 0.042 265.755);     /* slate-900 */
  --foreground: oklch(0.984 0.003 247.858);     /* slate-50 */
  --card: oklch(0.279 0.041 260.031);           /* slate-800 */
  --card-foreground: oklch(0.984 0.003 247.858);
  --popover: oklch(0.279 0.041 260.031);
  --popover-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.585 0.233 277.117);        /* indigo-500 */
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.279 0.041 260.031);      /* slate-800 */
  --secondary-foreground: oklch(0.984 0.003 247.858);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788); /* slate-400 */
  --accent: oklch(0.359 0.144 278.697);         /* indigo-900 */
  --accent-foreground: oklch(0.93 0.034 272.788);
  --destructive: oklch(0.704 0.191 22.216);      /* red-400 */
  --border: oklch(0.372 0.044 257.287);         /* slate-700 */
  --input: oklch(0.372 0.044 257.287);
  --ring: oklch(0.585 0.233 277.117);           /* indigo-500 */
  --chart-1: oklch(0.585 0.233 277.117);
  --chart-2: oklch(0.715 0.143 215.221);
  --chart-3: oklch(0.696 0.17 162.48);
  --chart-4: oklch(0.769 0.188 70.08);
  --chart-5: oklch(0.656 0.241 354.308);
  --sidebar: oklch(0.279 0.041 260.031);        /* slate-800 */
  --sidebar-foreground: oklch(0.984 0.003 247.858);
  --sidebar-primary: oklch(0.585 0.233 277.117); /* indigo-500 */
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.359 0.144 278.697);  /* indigo-900 */
  --sidebar-accent-foreground: oklch(0.93 0.034 272.788);
  --sidebar-border: oklch(0.372 0.044 257.287);
  --sidebar-ring: oklch(55.436% 0.16927 145.769);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}




/* ===== Premium Sidebar & UI Enhancements ===== */

/* Sidebar Gradient */
[data-slot="sidebar"] {
  background: linear-gradient(180deg, var(--sidebar) 0%, color-mix(in oklch, var(--sidebar-accent) 40%, transparent) 100%);
  border-right: 1px solid var(--sidebar-border);
}

/* Sidebar Menu Buttons */
[data-slot="sidebar-menu-button"] {
  border-radius: 0.75rem;
  margin-inline: 0.5rem;
  transition: all 0.2s ease;
}

[data-slot="sidebar-menu-button"]:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  transform: translateX(2px);
}

[data-slot="sidebar-menu-button"][data-active] {
  background: var(--sidebar-primary);
  color: var(--sidebar-primary-foreground);
  box-shadow: 0 8px 20px -6px color-mix(in oklch, var(--sidebar-primary) 60%, transparent);
}

/* Sidebar Group Labels */
[data-slot="sidebar-group-label"] {
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.7rem;
  color: var(--muted-foreground);
}

/* Cards Hover */
[data-slot="card"] {
  transition: all 0.2s ease;
}

[data-slot="card"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -8px color-mix(in oklch, var(--primary) 20%, transparent);
}




/* ===== Enhanced Professional UI ===== */

/* Sidebar Active Item - Gradient + Glow */
[data-slot="sidebar-menu-button"][data-active] {
  background: linear-gradient(135deg, var(--sidebar-primary) 0%, color-mix(in oklch, var(--sidebar-primary) 80%, black) 100%) !important;
  color: white !important;
  box-shadow: 0 8px 24px -4px color-mix(in oklch, var(--sidebar-primary) 70%, transparent);
  border: 1px solid color-mix(in oklch, var(--sidebar-primary) 90%, transparent);
}

/* Sidebar Hover - Soft background */
[data-slot="sidebar-menu-button"]:hover {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  transform: translateX(3px);
  box-shadow: 0 4px 12px -2px rgba(0,0,0,0.1);
}

/* Main Content Background - subtle gradient */
[data-slot="sidebar-inset"] {
  background: linear-gradient(135deg, color-mix(in oklch, var(--primary) 3%, var(--background)) 0%, var(--background) 50%, color-mix(in oklch, var(--accent) 5%, var(--background)) 100%);
}

/* Cards - improved border and shadow */
[data-slot="card"] {
  border: 1px solid color-mix(in oklch, var(--border) 80%, transparent);
  box-shadow: 0 1px 2px rgba(0,0,0,0.03), 0 4px 12px -2px rgba(0,0,0,0.05);
  transition: all 0.25s ease;
}

[data-slot="card"]:hover {
  box-shadow: 0 12px 32px -8px color-mix(in oklch, var(--primary) 25%, transparent);
  border-color: color-mix(in oklch, var(--primary) 30%, var(--border));
  transform: translateY(-3px);
}

/* Table header & rows */
[data-slot="table"] th {
  font-weight: 600;
  color: var(--muted-foreground);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

[data-slot="table"] tbody tr {
  transition: background-color 0.15s ease;
}

[data-slot="table"] tbody tr:hover {
  background: color-mix(in oklch, var(--primary) 5%, transparent);
}

/* Chart container */
[data-slot="card"] .recharts-cartesian-grid line {
  stroke: var(--border);
  stroke-dasharray: 3 3;
}