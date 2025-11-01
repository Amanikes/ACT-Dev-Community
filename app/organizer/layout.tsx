import DashboardLayout from "../dashboard/layout";

export default function OrganizerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
