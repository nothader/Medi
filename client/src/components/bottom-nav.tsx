import { Link, useLocation } from "wouter";
import { Icons, type IconKey } from "./icons";
import { cn } from "@/lib/utils";

const navItems: { icon: IconKey; label: string; href: string }[] = [
  { icon: "home", label: "Home", href: "/" },
  { icon: "medications", label: "Medications", href: "/medications" },
  { icon: "mood", label: "Mood", href: "/mood" },
  { icon: "analytics", label: "Analytics", href: "/analytics" },
  { icon: "profile", label: "Profile", href: "/profile" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = Icons[item.icon];
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex flex-col items-center gap-1 p-2",
                  location === item.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}