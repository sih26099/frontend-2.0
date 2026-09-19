import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, X } from 'lucide-react'
import { uploadMaterials } from '../services/api'
import Button from '../components/common/Button'

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls']

export default function Upload() {
  const [cpseName, setCpseName] = useState('')
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  function validateAndSetFile(candidate) {
    if (!candidate) return
    const name = candidate.name.toLowerCase()
    const isValidExt = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
    if (!isValidExt) {
      setErrorMessage('Unsupported file type. Use .csv, .xlsx, or .xls.')
      setStatus('error')
      return
    }
    setFile(candidate)
    setStatus('idle')
    setErrorMessage(null)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    validateAndSetFile(dropped)
  }, [])

  function handleSubmit() {
    if (!cpseName.trim() || !file) return

    setStatus('uploading')
    setProgress(0)
    setErrorMessage(null)

    uploadMaterials({
      file,
      cpseName: cpseName.trim(),
      onUploadProgress: (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
      },
    })
      .then((res) => {
        setResult(res.data)
        setStatus('success')
      })
      .catch((err) => {
        setErrorMessage(err.message)
        setStatus('error')
      })
  }

  function reset() {
    setFile(null)
    setStatus('idle')
    setResult(null)
    setErrorMessage(null)
    setProgress(0)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-900">Upload Material Dataset</h1>
        <p className="text-sm text-ink-500">
          Ingest a CSV or Excel material master for a CPSE. Each row is standardized and checked against the
          existing master for duplicates.
        </p>
      </div>

      <div className="card-surface bg-white border border-ink-200 rounded-md p-5 space-y-4">
        <div>
          <label htmlFor="cpse-name" className="block text-sm font-medium text-ink-900 mb-1.5">
            CPSE name
          </label>
          <input
            id="cpse-name"
            value={cpseName}
            onChange={(e) => setCpseName(e.target.value)}
            placeholder="e.g. CPSE-A"
            disabled={status === 'uploading'}
            className="w-full text-sm border border-ink-200 rounded px-3 py-2 placeholder:text-ink-300"
          />
        </div>

        {status !== 'success' && (
          <div>
            <span className="block text-sm font-medium text-ink-900 mb-1.5">Dataset file</span>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-signal-info bg-signal-infoBg' : 'border-ink-200 hover:border-ink-300'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => validateAndSetFile(e.target.files?.[0])}
              />
              {file ? (
                <>
                  <FileSpreadsheet size={22} className="text-signal-info" />
                  <div className="text-sm text-ink-900 font-medium">{file.name}</div>
                  <div className="text-xs text-ink-500">{(file.size / 1024).toFixed(1)} KB</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="text-xs text-signal-bad hover:underline mt-1"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <UploadCloud size={22} className="text-ink-400" />
                  <div className="text-sm text-ink-700">
                    Drag and drop a CSV or Excel file, or click to browse
                  </div>
                  <div className="text-xs text-ink-400">.csv, .xlsx, .xls</div>
                </>
              )}
            </div>
          </div>
        )}

        {status === 'uploading' && (
          <div>
            <div className="h-1.5 bg-ink-100 rounded-sm overflow-hidden">
              <div
                className="h-full bg-signal-info rounded-sm transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-ink-500 mt-1.5">Uploading and processing… {progress}%</div>
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div className="flex items-start gap-2 bg-signal-badBg border border-signal-bad/30 rounded px-3 py-2.5 text-sm text-signal-bad">
            <XCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {status === 'success' && result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-signal-good">
              <CheckCircle2 size={18} />
              <span className="text-sm font-medium">Upload complete</span>
            </div>
            <ul className="text-sm text-ink-700 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-signal-good shrink-0" />
                File uploaded and parsed for {result.cpse}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-signal-good shrink-0" />
                {result.created} new material{result.created === 1 ? '' : 's'} created, {result.updated} updated
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-signal-good shrink-0" />
                Checked against existing master — {result.duplicate_candidates_found} duplicate candidate
                {result.duplicate_candidates_found === 1 ? '' : 's'} found
              </li>
            </ul>
            <div className="flex gap-2 pt-2">
              <Button variant="primary" size="sm" onClick={() => navigate('/materials')}>
                View materials
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/matches')}>
                View match candidates
              </Button>
              <Button variant="ghost" size="sm" icon={X} onClick={reset}>
                Upload another
              </Button>
            </div>
          </div>
        )}

        {status !== 'success' && (
          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!cpseName.trim() || !file || status === 'uploading'}
            >
              {status === 'uploading' ? 'Uploading…' : 'Upload and process'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
