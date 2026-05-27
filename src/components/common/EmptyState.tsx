interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-bg-subtle flex items-center justify-center text-4xl mb-4">
          {icon}
        </div>
      )}
      <p className="text-base font-bold text-text-basic mb-1">{title}</p>
      {description && (
        <p className="text-sm text-text-subtle leading-relaxed mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
