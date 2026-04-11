import { SessionReport as IReport } from '@/lib/types'
import { formatDate, formatDuration, topicLabel } from '@/lib/utils'

interface Props {
  report: IReport
}

export default function SessionReport({ report }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80">{formatDate(report.date)}</p>
        <h2 className="text-xl font-bold mt-1">{topicLabel(report.topic)} Session</h2>
        {report.duration_minutes && (
          <p className="text-sm opacity-80 mt-1">
            {formatDuration(report.duration_minutes)} • {report.child_name}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-2">📋 Session Summary</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{report.summary}</p>
      </div>

      {/* Highlight */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h3 className="font-semibold text-yellow-800 mb-1">⭐ Highlight</h3>
        <p className="text-yellow-700 text-sm">{report.highlight}</p>
      </div>

      {/* Vocabulary */}
      {report.vocabulary?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">📚 New Words</h3>
          <div className="flex flex-col gap-2">
            {report.vocabulary.map(v => (
              <div key={v.word} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-600">{v.word}</span>
                  <span className="text-xs text-gray-400">—</span>
                  <span className="text-sm text-gray-600">{v.definition}</span>
                </div>
                <p className="text-xs text-gray-400 italic ml-0 mt-0.5">"{v.example}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">✏️ Grammar Notes</h3>
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Did Well</span>
            <p className="text-sm text-gray-600 mt-0.5">{report.grammar_observations?.did_well}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-orange-500 uppercase tracking-wide">Practice More</span>
            <p className="text-sm text-gray-600 mt-0.5">{report.grammar_observations?.needs_practice}</p>
          </div>
        </div>
      </div>

      {/* Quiz results */}
      {report.quiz_results && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">🎯 Quiz Results</h3>
            <span className="font-bold text-lg text-blue-600">{report.quiz_results.score}</span>
          </div>
          <div className="flex flex-col gap-2">
            {report.quiz_results.details?.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={q.correct ? 'text-green-500' : 'text-red-400'}>
                  {q.correct ? '✓' : '✗'}
                </span>
                <div>
                  <p className="text-sm text-gray-700">{q.question}</p>
                  {!q.correct && q.correct_answer && (
                    <p className="text-xs text-gray-400">Answer: {q.correct_answer}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Home practice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-1">🏠 Home Practice</h3>
        <p className="text-blue-700 text-sm">{report.home_practice}</p>
      </div>
    </div>
  )
}
