import {
  BrickWall,
  CarFront,
  ClipboardCheck,
  Facebook,
  Fence,
  Grid3X3,
  Hammer,
  Instagram,
  Layers,
  LayoutGrid,
  Leaf,
  Linkedin,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles
} from "lucide-react";

const icons = {
  BrickWall,
  CarFront,
  ClipboardCheck,
  Facebook,
  Fence,
  Grid3X3,
  Hammer,
  Instagram,
  Layers,
  LayoutGrid,
  Leaf,
  Linkedin,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles
};

export default function Icon({ name = "Leaf", className = "h-5 w-5", strokeWidth = 1.8 }) {
  const LucideIcon = icons[name] || Leaf;
  return <LucideIcon aria-hidden="true" className={className} strokeWidth={strokeWidth} />;
}
