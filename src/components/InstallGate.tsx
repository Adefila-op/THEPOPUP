// In Base Mini App context, there's no install gate needed.
// The app is launched directly inside the Base App.
// This component is kept for backwards compatibility but simply renders children.
const InstallGate = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default InstallGate;
