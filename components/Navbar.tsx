import { useAuth, UserButton } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = () => {
  const { isSignedIn } = useAuth();

  return (
    <nav className="w-full bg-white/50 backdrop-blur-md border-b border-zinc-100">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          <div className="flex items-center gap-4">
            <SidebarTrigger className="text-zinc-700 hover:text-zinc-900" />
            <span className="text-zinc-900 font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Urban Flow
            </span>
          </div>

          <div className="flex items-center">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <div className="h-8 w-8 rounded-full bg-zinc-100 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;