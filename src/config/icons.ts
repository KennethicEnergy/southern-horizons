import {
  Add01Icon,
  AlertCircleIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Call02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Download01Icon,
  Facebook01Icon,
  FavouriteIcon,
  FloppyDiskIcon,
  HandHelpingIcon,
  Home01Icon,
  InformationCircleIcon,
  Invoice01Icon,
  Login03Icon,
  Logout01Icon,
  Mail01Icon,
  MailReply01Icon,
  Menu01Icon,
  News01Icon,
  PencilEdit02Icon,
  SentIcon,
  Tick02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { ToastTone } from "@/types/toast";

/**
 * One icon per action, everywhere. On a phone the icon is often what people read first,
 * so "donate" always shows the heart and "delete" always shows the bin.
 */
export const actionIcons = {
  donate: FavouriteIcon,
  volunteer: HandHelpingIcon,
  read: News01Icon,
  ledger: Invoice01Icon,
  send: SentIcon,
  reply: MailReply01Icon,
  join: UserAdd01Icon,
  signIn: Login03Icon,
  signOut: Logout01Icon,
  next: ArrowRight01Icon,
  back: ArrowLeft01Icon,
  external: ArrowUpRight01Icon,
  approve: Tick02Icon,
  reject: Cancel01Icon,
  close: Cancel01Icon,
  delete: Delete02Icon,
  edit: PencilEdit02Icon,
  save: FloppyDiskIcon,
  add: Add01Icon,
  menu: Menu01Icon,
  email: Mail01Icon,
  call: Call02Icon,
  facebook: Facebook01Icon,
  download: Download01Icon,
  home: Home01Icon,
} satisfies Record<string, IconSvgElement>;

export type ActionIconName = keyof typeof actionIcons;

export const toastIcons: Record<ToastTone, IconSvgElement> = {
  success: CheckmarkCircle02Icon,
  error: AlertCircleIcon,
  info: InformationCircleIcon,
};
