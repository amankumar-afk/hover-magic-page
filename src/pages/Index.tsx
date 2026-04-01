import ParticleMesh from "@/components/ParticleMesh";
import LoginForm from "@/components/LoginForm";
import dotpeLogo from "@/assets/dotpe-horizon-logo.svg";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <ParticleMesh />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-between px-8 md:px-16 lg:px-24 py-12 pointer-events-none">
        {/* Left branding */}
        <div className="flex-1 max-w-xl space-y-8 pointer-events-auto">
          <img src={dotpeLogo} alt="DotPe Horizon" className="h-12 md:h-16" />

          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight text-foreground">
              See what needs attention in your restaurant
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md">
              Act on the issues that matter first, with a clear view of performance changes, unusual business activity, and the priorities that need your attention.
            </p>
          </div>
        </div>

        {/* Right login form */}
        <div className="mt-12 lg:mt-0 pointer-events-auto">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
