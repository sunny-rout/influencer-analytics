export function InfluencerCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-full bg-muted flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-32 mb-2" />
          <div className="h-3 bg-muted rounded w-20" />
        </div>
        <div className="h-5 bg-muted rounded-full w-16" />
      </div>
      <div className="border-t border-border mb-3" />
      <div className="grid grid-cols-3 gap-2">
        {[0,1,2].map((i) => (
          <div key={i}>
            <div className="h-3 bg-muted rounded w-12 mb-1" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}