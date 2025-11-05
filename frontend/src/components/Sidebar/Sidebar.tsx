import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  DollarSign,
  ClipboardList,
  HardHat,
  // FileCheck,
  // FolderOpen,
  // Settings,
} from "lucide-react";
import Heading from "../Heading/Heading";

type NavItem = {
  name: string;
  icon: React.ElementType;
  to: string;
};

const navigationItems: NavItem[] = [
  { name: "Home", icon: Home, to: "/" },
  { name: "Financing", icon: DollarSign, to: "/financing" },
  { name: "Planning the Work", icon: ClipboardList, to: "/planning" },
  { name: "Contractors", icon: HardHat, to: "/contractors" },
  // { name: "Approvals", icon: FileCheck, to: "/approvals" },
  // { name: "Documentation", icon: FolderOpen, to: "/documentation" },
  // { name: "Settings", icon: Settings, to: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6">
        <Heading level={1} className="text-emerald-600">RenovAlteGermany</Heading>
      </div>
      <nav className="px-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
              end={item.to === "/"}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
