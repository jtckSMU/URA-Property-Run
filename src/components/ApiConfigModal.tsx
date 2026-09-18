import React, { useState } from 'react';
import {
  X,
  Server,
  Key,
  Globe,
  Code,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Clock,
} from 'lucide-react';
import { ApiConfig, PropertyTransaction } from '../types';
import { propertyApi } from '../services/propertyApi';
import { SAMPLE_API_RESPONSE_PAYLOAD, OPENAPI_SPEC_YAML } from '../services/apiSchemaDocs';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiConfig;
  onSaveConfig: (updated: ApiConfig) => void;
  onSimulateData: (sample: PropertyTransaction[]) => void;
  onClearData: () => void;
  totalLoaded: number;
  initialTab?: 'config' | 'schema' | 'tester';
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  apiConfig,
  onSaveConfig,
  onSimulateData,
  onClearData,
  totalLoaded,
  initialTab = 'config',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'tester'>(initialTab);
  const [baseUrl, setBaseUrl] = useState(apiConfig.baseUrl);
  const [apiKey, setApiKey] = useState(apiConfig.apiKey);
  const [authHeaderName, setAuthHeaderName] = useState(apiConfig.authHeaderName);
  const [timeoutMs, setTimeoutMs] = useState(apiConfig.timeoutMs);
  const [dataFormat, setDataFormat] = useState(apiConfig.dataFormat);

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
  }>({
    tested: false,
    success: false,
    message: '',
  });

  // Custom JSON injection state
  const [customJson, setCustomJson] = useState(
    JSON.stringify(SAMPLE_API_RESPONSE_PAYLOAD.data, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestResult({ tested: false, success: false, message: '' });

    try {
      propertyApi.updateConfig({ baseUrl, apiKey, authHeaderName, timeoutMs });
      const result = await propertyApi.testPing(baseUrl);
      setTestResult({
        tested: true,
        success: result.success,
        message: result.message,
        latencyMs: result.latencyMs,
      });
    } catch (err: unknown) {
      setTestResult({
        tested: true,
        success: false,
        message: err instanceof Error ? err.message : 'Ping test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const updated: ApiConfig = {
      ...apiConfig,
      baseUrl,
      apiKey,
      authHeaderName,
      timeoutMs,
      dataFormat,
    };
    propertyApi.updateConfig(updated);
    onSaveConfig(updated);
    onClose();
  };

  const handleApplyCustomJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(customJson);
      const items = Array.isArray(parsed)
        ? parsed
        : parsed.data && Array.isArray(parsed.data)
        ? parsed.data
        : null;

      if (!items || items.length === 0) {
        setJsonError('JSON must be an array of PropertyTransaction items or { data: [...] }');
        return;
      }

      onSimulateData(items as PropertyTransaction[]);
      onClose();
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                API Integration & Backend Placeholders
              </h2>
              <p className="text-xs text-stone-400">
                Connect your Singapore property data backend service
              </p>
            </div>
          </div>
          <button
            id="modal-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-800 bg-stone-950/40 text-xs">
          <button
            id="modal-tab-config"
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Endpoint Configuration
          </button>
          <button
            id="modal-tab-schema"
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`pb-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            JSON Contract & Schemas
          </button>
          <button
            id="modal-tab-tester"
            type="button"
            onClick={() => setActiveTab('tester')}
            className={`pb-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'tester'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Payload Simulator & Tester
            {totalLoaded > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                {totalLoaded}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs max-h-[70vh] overflow-y-auto">
          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Developer Note: Placeholder Architecture
                </p>
                <p className="mt-1 text-stone-300 text-[11px]">
                  The application is configured to call{' '}
                  <code className="px-1 py-0.5 rounded bg-stone-900 font-mono text-amber-300">
                    GET {baseUrl}/transactions
                  </code>
                  . You can point this to your local backend, cloud service, or proxy to Singapore
                  URA Realis.
                </p>
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="block font-medium text-stone-300 mb-1">
                  API Base URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="config-base-url-input"
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="e.g. /api/properties or https://api.yourdomain.com/v1"
                    className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Default placeholder route: <span className="font-mono">/api/properties</span>
                </p>
              </div>

              {/* Authentication */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-300 mb-1">
                    Auth Header Name
                  </label>
                  <input
                    id="config-auth-header-input"
                    type="text"
                    value={authHeaderName}
                    onChange={(e) => setAuthHeaderName(e.target.value)}
                    placeholder="Authorization or X-API-Key"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-300 mb-1">
                    API Key / Token (Optional)
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="config-api-key-input"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="e.g. Bearer token or URA AccessKey"
                      className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Settings Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-300 mb-1">
                    Request Timeout (ms)
                  </label>
                  <input
                    id="config-timeout-input"
                    type="number"
                    value={timeoutMs}
                    onChange={(e) => setTimeoutMs(Number(e.target.value))}
                    min={1000}
                    max={30000}
                    step={1000}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-300 mb-1">
                    Payload Schema Format
                  </label>
                  <select
                    id="config-data-format-select"
                    value={dataFormat}
                    onChange={(e) => setDataFormat(e.target.value as 'REST_STANDARD' | 'URA_REALIS')}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="REST_STANDARD">Standard REST JSON (Recommended)</option>
                    <option value="URA_REALIS">Singapore URA Realis Raw Feed</option>
                  </select>
                </div>
              </div>

              {/* Ping Connection Diagnostic */}
              <div className="pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-stone-200">Backend Connectivity Check</span>
                    <p className="text-[11px] text-stone-500">
                      Pings <code className="font-mono">{baseUrl}/ping</code> or health endpoint
                    </p>
                  </div>
                  <button
                    id="config-test-ping-btn"
                    type="button"
                    onClick={handleTestPing}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    {isTesting ? (
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>

                {testResult.tested && (
                  <div
                    className={`mt-3 p-3 rounded-lg border flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                        : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold">
                        {testResult.success ? 'Backend Reachable' : 'Backend Notice'}
                      </div>
                      <div className="text-[11px] mt-0.5 font-mono">{testResult.message}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMAS & DOCS */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-stone-200 text-sm">
                    Required JSON Response Schema
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Your backend API endpoint should return an array of objects matching this format:
                  </p>
                </div>
                <button
                  id="schema-copy-json-btn"
                  type="button"
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(SAMPLE_API_RESPONSE_PAYLOAD, null, 2),
                      'sample-json'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center gap-1 text-[11px] transition-colors"
                >
                  {copiedCode === 'sample-json' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCode === 'sample-json' ? 'Copied!' : 'Copy Sample JSON'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl font-mono text-[11px] text-amber-200/90 overflow-x-auto max-h-60">
                  {JSON.stringify(SAMPLE_API_RESPONSE_PAYLOAD, null, 2)}
                </pre>
              </div>

              {/* cURL Example */}
              <div className="pt-3 border-t border-stone-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-stone-200">Sample cURL Command</span>
                  <button
                    id="schema-copy-curl-btn"
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `curl -X GET "${baseUrl}/transactions?district=D10&marketSegment=CCR" \\\n  -H "Accept: application/json" \\\n  -H "Authorization: Bearer YOUR_KEY"`,
                        'curl'
                      )
                    }
                    className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] flex items-center gap-1"
                  >
                    {copiedCode === 'curl' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy cURL</span>
                  </button>
                </div>
                <pre className="p-3 bg-stone-950 border border-stone-800 rounded-lg font-mono text-[11px] text-stone-300 overflow-x-auto">
{`curl -X GET "${baseUrl}/transactions?district=D10&marketSegment=CCR" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer YOUR_KEY"`}
                </pre>
              </div>

              {/* OpenAPI spec */}
              <div className="pt-3 border-t border-stone-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-stone-200">OpenAPI 3.0 Contract</span>
                  <button
                    id="schema-copy-openapi-btn"
                    type="button"
                    onClick={() => handleCopy(OPENAPI_SPEC_YAML, 'openapi')}
                    className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] flex items-center gap-1"
                  >
                    {copiedCode === 'openapi' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Copy YAML</span>
                  </button>
                </div>
                <pre className="p-3 bg-stone-950 border border-stone-800 rounded-lg font-mono text-[10px] text-stone-400 overflow-x-auto max-h-40">
                  {OPENAPI_SPEC_YAML}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: PAYLOAD SIMULATOR */}
          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 text-purple-200 text-xs leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Interactive Testing Sandbox
                </p>
                <p className="mt-1 text-stone-300 text-[11px]">
                  You asked not to bundle data as of now. This simulator allows you to temporarily
                  test how the Singapore property UI, metrics, and stamp duty calculators render
                  with sample transactions or custom JSON without modifying any persistent state.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="tester-simulate-btn"
                  type="button"
                  onClick={() => {
                    onSimulateData(SAMPLE_API_RESPONSE_PAYLOAD.data as PropertyTransaction[]);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Simulate Standard Sample (5 SG Properties)
                </button>

                {totalLoaded > 0 && (
                  <button
                    id="tester-clear-btn"
                    type="button"
                    onClick={() => {
                      onClearData();
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Empty State (0 data)
                  </button>
                )}
              </div>

              {/* Custom JSON Paste */}
              <div className="pt-3 border-t border-stone-800">
                <label className="block font-semibold text-stone-200 mb-1">
                  Or Paste Custom JSON Backend Output to Test:
                </label>
                <textarea
                  id="tester-custom-json-textarea"
                  rows={6}
                  value={customJson}
                  onChange={(e) => setCustomJson(e.target.value)}
                  className="w-full p-3 bg-stone-950 border border-stone-800 rounded-lg font-mono text-[11px] text-amber-300 focus:outline-none focus:border-amber-500/50"
                  placeholder="Paste JSON array of transactions..."
                />

                {jsonError && (
                  <p className="text-amber-400 text-[11px] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {jsonError}
                  </p>
                )}

                <div className="mt-2 flex justify-end">
                  <button
                    id="tester-apply-custom-json-btn"
                    type="button"
                    onClick={handleApplyCustomJson}
                    className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium"
                  >
                    Apply Custom JSON to UI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between text-xs">
          <span className="text-stone-500">
            Current Status: <strong className="text-stone-400">{apiConfig.status}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              id="modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium transition-colors"
            >
              Close
            </button>
            <button
              id="modal-save-btn"
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
