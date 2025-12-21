import { Header, Footer } from "@/components";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-paper">
        {/* Page Header Skeleton */}
        <section className="bg-white border-b border-gray-200 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-10 bg-gray-200 rounded w-64 animate-pulse mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
        </section>

        {/* Content Skeleton */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card">
                  <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
