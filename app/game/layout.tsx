import DashboardLayout from "../dashboard/layout";

export default function GameLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
