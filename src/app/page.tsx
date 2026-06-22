import { ConnectButton } from "@/components/wallet/ConnectButton";

export default function Home() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center sm:p-20">
      <div className="flex flex-col items-center max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
          ANIMA
        </h1>
        <p className="text-xl text-muted-foreground">
          Your AI companion's memories belong to you — cryptographically, forever.
        </p>
        <div className="pt-8">
          <ConnectButton />
        </div>
      </div>
    </main>
  );
}
