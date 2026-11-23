export const Skeleton = ({ className = "" }: { className?: string }) => <div className={`skeleton ${className}`} />;

export const ListSkeleton = ({ rows = 4 }: { rows?: number }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="card flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-8 w-1 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-20" />
            </div>
        ))}
    </div>
);

export default Skeleton;
