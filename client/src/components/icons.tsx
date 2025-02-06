import { Pill, Home, User, SmilePlus, Plus, Trash, Edit, BarChart2 } from "lucide-react";

export const Icons = {
  home: Home,
  medications: Pill,
  mood: SmilePlus,
  profile: User,
  add: Plus,
  delete: Trash,
  edit: Edit,
  analytics: BarChart2,
};

export type IconKey = keyof typeof Icons;