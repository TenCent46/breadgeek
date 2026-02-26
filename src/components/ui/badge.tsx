const variants: Record<string, string> = {
  published: "bg-success/10 text-success",
  draft: "bg-text-tertiary/10 text-text-tertiary",
  archived: "bg-text-placeholder/10 text-text-placeholder",
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-error/10 text-error",
  completed: "bg-info/10 text-info",
  sent: "bg-success/10 text-success",
  scheduled: "bg-info/10 text-info",
  refunded: "bg-error/10 text-error",
  // Customer tiers
  repeater: "bg-accent/10 text-accent",
  regular: "bg-info/10 text-info",
  trial: "bg-purple-100 text-purple-600",
  dormant: "bg-text-tertiary/10 text-text-tertiary",
  // Message channels
  email: "bg-info/10 text-info",
  line: "bg-green-100 text-green-700",
  // Service types
  "group-lesson": "bg-blue-100 text-blue-600",
  "master-course": "bg-purple-100 text-purple-600",
  "trial-lesson": "bg-green-100 text-green-600",
  // Skill levels
  beginner: "bg-green-100 text-green-600",
  intermediate: "bg-blue-100 text-blue-600",
  advanced: "bg-purple-100 text-purple-600",
};

const labels: Record<string, string> = {
  published: "公開中",
  draft: "下書き",
  archived: "アーカイブ",
  confirmed: "確定",
  pending: "保留",
  cancelled: "キャンセル",
  completed: "完了",
  sent: "送信済み",
  scheduled: "予約配信",
  refunded: "返金済み",
  // Customer tiers
  repeater: "リピーター",
  regular: "レギュラー",
  trial: "体験生",
  dormant: "休眠",
  // Message channels
  email: "Email",
  line: "LINE",
  // Service types
  "group-lesson": "グループレッスン",
  "master-course": "マスターコース",
  "trial-lesson": "体験レッスン",
  // Skill levels
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
};

export function Badge({ status, className = "" }: { status: string; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[status] || "bg-bg-secondary text-text-secondary"} ${className}`}>
      {labels[status] || status}
    </span>
  );
}
