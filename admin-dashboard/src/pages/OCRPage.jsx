import { useState } from 'react';
import { ocr } from '../services/api';
import { 
  Camera, RefreshCw, CheckCircle2, AlertTriangle, XCircle, 
  BrainCircuit, Globe, FileImage, ClipboardList, Rocket, Eye,
  Stethoscope, Utensils, Home, Droplets, Siren, BookOpen, Shirt, Trash2,
  FileText, MapPin, Map as MapIcon, Handshake
} from 'lucide-react';

export default function OCRPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdNeed, setCreatedNeed] = useState(null);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setCreatedNeed(null);
      setError(null);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setCreatedNeed(null);
      setError(null);
    }
  }

  // Step 1: Extract only (preview before creating)
  async function handleExtract() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await ocr.extract(file);
      setResult(res);
      // Check if extraction actually failed
      if (!res.raw_text && res.confidence === 0) {
        setError('AI could not extract text. This may be due to API rate limits or image quality. Try again in a minute.');
      }
    } catch (err) {
      const msg = err.message || 'Unknown error';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        setError('API rate limit reached. Wait 1-2 minutes and try again.');
      } else {
        setError('OCR failed: ' + msg);
      }
    }
    setLoading(false);
  }

  // Step 2: One-click Extract + Create Need with auto-geocoding
  async function handleExtractAndCreate() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setCreatedNeed(null);
    try {
      const res = await ocr.extractAndCreate(file, 0, 0); // 0,0 = let backend geocode
      setCreatedNeed(res);
    } catch (err) {
      const msg = err.message || 'Unknown error';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
        setError('API rate limit reached. Wait 1-2 minutes and try again.');
      } else {
        setError('Extract & Create failed: ' + msg);
      }
    }
    setLoading(false);
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setCreatedNeed(null);
    setError(null);
  }

  const catIcons = { medical: Stethoscope, food: Utensils, shelter: Home, water: Droplets, rescue: Siren, education: BookOpen, clothing: Shirt, sanitation: Trash2, other: ClipboardList };

  return (
    <>
      <div className="page-header">
        <div>
          <h2><Camera size={22} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'text-bottom' }}/> OCR Scanner</h2>
          <div className="subtitle">Upload paper surveys → AI extracts data → Auto-creates need with location</div>
        </div>
        {(result || createdNeed || error) && (
          <button className="btn btn-outline" onClick={reset}>
            <RefreshCw size={16} /> Scan Another
          </button>
        )}
      </div>

      <div className="page-body">
        {/* Error Banner */}
        {error && (
          <div style={{
            padding: '14px 20px', marginBottom: '20px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#EF4444', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {/* Success Banner */}
        {createdNeed && (
          <div style={{
            padding: '16px 20px', marginBottom: '20px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
            color: '#10B981',
          }}>
            <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} /> Need Created Successfully!
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
              <div><strong>Title:</strong> {createdNeed.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <strong>Category:</strong> 
                {(() => {
                  const CatIcon = catIcons[createdNeed.category] || ClipboardList;
                  return <><CatIcon size={14} /> {createdNeed.category}</>;
                })()}
              </div>
              {createdNeed.ocr_raw_text && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><strong>Source:</strong> <Globe size={14} /> Multilingual OCR → English</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <strong>Urgency:</strong> 
                <span style={{ display: 'inline-flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <span key={v} style={{ width: '8px', height: '8px', borderRadius: '50%', background: v <= createdNeed.urgency ? '#EF4444' : 'var(--border-color)' }}></span>
                  ))}
                </span>
                ({createdNeed.urgency}/5)
              </div>
              <div><strong>People:</strong> {createdNeed.people_affected}</div>
              <div><strong>Address:</strong> {createdNeed.address || '—'}</div>
              <div><strong>Location:</strong> {createdNeed.latitude?.toFixed(4)}, {createdNeed.longitude?.toFixed(4)}</div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              View it in Need Tracker or Live Map →
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Upload Zone */}
          <div>
            <div className="upload-zone"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
              onDragLeave={e => e.currentTarget.classList.remove('dragover')}
              onDrop={handleDrop}
              onClick={() => document.getElementById('ocr-file-input').click()}>
              <input type="file" id="ocr-file-input" accept="image/*" hidden onChange={handleFile} />
              {preview ? (
                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
              ) : (
                <>
                  <div className="upload-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}><FileImage size={48} /></div>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>Drop an image here or click to upload</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Supports: JPG, PNG, WebP (max 10MB)</p>
                </>
              )}
            </div>

            {file && !createdNeed && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="btn btn-outline btn-lg" onClick={handleExtract} disabled={loading}
                  style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? <><RefreshCw size={18} className="spin" /> Processing...</> : <><Eye size={18} /> Preview Extract</>}
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleExtractAndCreate} disabled={loading}
                  style={{ flex: 1, justifyContent: 'center' }}>
                  {loading ? <><RefreshCw size={18} className="spin" /> Processing...</> : <><Rocket size={18} /> Extract & Create</>}
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          <div>
            {result && (
              <>
                {/* Confidence */}
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: result.confidence >= 0.8 ? 'rgba(16,185,129,0.1)' : result.confidence >= 0.5 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: result.confidence >= 0.8 ? '#10B981' : result.confidence >= 0.5 ? '#F59E0B' : '#EF4444' }}>
                      {result.confidence >= 0.8 ? <CheckCircle2 size={24} /> : result.confidence >= 0.5 ? <AlertTriangle size={24} /> : <XCircle size={24} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>Confidence: {Math.round(result.confidence * 100)}%</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {result.confidence >= 0.8 ? 'High quality extraction' :
                         result.confidence >= 0.5 ? 'Moderate — review data' :
                         result.confidence > 0 ? 'Low confidence — verify carefully' :
                         'Extraction failed — API limit or poor image quality'}
                      </div>
                    </div>
                    {result.original_language && (
                      <div style={{ padding: '6px 12px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '20px', fontSize: '12px', color: '#A855F7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} /> {result.original_language}
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw Text */}
                <div className="card" style={{ marginBottom: '16px' }}>
                  <div className="card-header"><span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Extracted Text</span></div>
                  <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', maxHeight: '200px', overflow: 'auto' }}>
                    {result.raw_text || 'No text extracted — check image quality or API limits'}
                  </pre>
                </div>

                {/* Structured Data */}
                {result.structured_data && (
                  <div className="card" style={{ marginBottom: '16px' }}>
                    <div className="card-header"><span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BrainCircuit size={16} /> AI-Structured Data</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div><strong>Title:</strong> {result.structured_data.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong>Category:</strong> 
                        <span className="badge badge-open" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {(() => {
                            const CatIcon = catIcons[result.structured_data.category] || ClipboardList;
                            return <><CatIcon size={12} /> {result.structured_data.category}</>;
                          })()}
                        </span>
                      </div>
                      <div><strong>Urgency:</strong> {result.structured_data.urgency}/5</div>
                      <div><strong>Location:</strong> {result.structured_data.location_text || '—'}</div>
                      <div><strong>People Affected:</strong> {result.structured_data.people_affected}</div>
                      {result.structured_data.key_issues?.length > 0 && (
                        <div><strong>Key Issues:</strong> {result.structured_data.key_issues.join(', ')}</div>
                      )}
                      <div style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        {result.structured_data.description}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* How it works */}
            {!result && !createdNeed && (
              <div className="card">
                <div className="card-header"><span className="card-title">How It Works</span></div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--accent)', background: 'var(--bg-input)', padding: '8px', borderRadius: '8px' }}><FileImage size={18} /></div>
                    <div><strong>Upload</strong> — Take a photo of a paper survey or field report</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--accent)', background: 'var(--bg-input)', padding: '8px', borderRadius: '8px' }}><BrainCircuit size={18} /></div>
                    <div><strong>AI Extract</strong> — Gemini Vision reads handwriting and extracts data</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--accent)', background: 'var(--bg-input)', padding: '8px', borderRadius: '8px' }}><Globe size={18} /></div>
                    <div><strong>Auto-Locate</strong> — Location text is auto-geocoded to coordinates</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--accent)', background: 'var(--bg-input)', padding: '8px', borderRadius: '8px' }}><MapPin size={18} /></div>
                    <div><strong>Map Pin</strong> — Need appears on the Live Map at the correct location</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: 'var(--accent)', background: 'var(--bg-input)', padding: '8px', borderRadius: '8px' }}><Handshake size={18} /></div>
                    <div><strong>Match</strong> — Smart Matching finds nearby volunteers</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
