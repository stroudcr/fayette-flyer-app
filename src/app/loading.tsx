export default function Loading() {
  return (
    <main className="flex-1 flex items-center justify-center bg-paper">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-navy border-r-transparent mb-4"></div>
        <p className="text-slate font-medium">Loading...</p>
      </div>
    </main>
  );
}
