'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { AppHeader, AppFooter, ThemeToggle } from '@shared/components';
import type {
  EngineConfig,
  FieldDef,
  FieldSetRow,
  State0Values,
  OptionItem,
} from '@/lib/state-engine';
import {
  STATE0_FIELD_IDS,
  evaluateRules,
  validateState0,
  buildInvestigationOutput,
  buildImplementationOutput,
  buildRequirementOutput,
  buildProductionOutput,
} from '@/lib/state-engine';
import {
  type RequestType,
  type RequestTypeFormValues,
  REQUEST_TYPE_OPTIONS,
  CLIENT_NEGOTIATION_OPTIONS,
  initialRequestTypeFormValues,
  COMMON_FIELDS,
  REQUIREMENT_FIELDS,
  PRODUCTION_FIELDS,
  REQUIRED_FIELD_IDS,
  validateRequestTypeForm,
} from '@/lib/request-type-form';
import type { RouteResult } from '@/lib/state-engine/rules';

const initialState0: State0Values = {
  consultation_type: '',
  ask_type: '',
  request_intent: '',
  target_url: '',
  current_behavior: '',
  expected_behavior: '',
  repro_steps: '',
  repro_env: '',
  attachments: '',
};

type FormValues = Record<string, string | string[]>;

function getFieldValue(values: FormValues, fieldId: string, inputType: string): string | string[] {
  const v = values[fieldId];
  if (inputType === 'checkbox' || inputType === 'checkbox_multiple') {
    return Array.isArray(v) ? v : v ? [v] : [];
  }
  return typeof v === 'string' ? v : Array.isArray(v) ? v[0] ?? '' : '';
}

function FieldRender({
  def,
  value,
  required,
  onChange,
}: {
  def: FieldDef;
  value: string | string[];
  required: boolean;
  onChange: (v: string | string[]) => void;
}) {
  const id = `field-${def.field_id}`;
  const isCheck = def.input_type === 'checkbox' || def.input_type === 'checkbox_multiple';
  const arr = isCheck ? (Array.isArray(value) ? value : []) : [];

  if (def.input_type === 'output') {
    return null;
  }

  if (def.input_type === 'radio' && def.options.length > 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {def.label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {def.options.map((opt) => (
            <label key={opt.value} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={id}
                value={opt.value}
                checked={(value as string) === opt.value}
                onChange={() => onChange(opt.value)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
        {def.help_text && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{def.help_text}</p>
        )}
      </div>
    );
  }

  if ((def.input_type === 'checkbox' || def.input_type === 'checkbox_multiple') && def.options.length > 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {def.label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-3">
          {def.options.map((opt) => (
            <label key={opt.value} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={opt.value}
                checked={arr.includes(opt.value)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...arr, opt.value]
                    : arr.filter((x) => x !== opt.value);
                  onChange(next);
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
        {def.help_text && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{def.help_text}</p>
        )}
      </div>
    );
  }

  if (def.input_type === 'textarea') {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {def.label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id={id}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
        />
        {def.help_text && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{def.help_text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {def.label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={def.input_type === 'url' ? 'url' : 'text'}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
      />
      {def.help_text && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{def.help_text}</p>
      )}
    </div>
  );
}

export default function RequestTool() {
  const [config, setConfig] = useState<EngineConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requestType, setRequestType] = useState<RequestType | ''>('');
  const [requestTypeFormValues, setRequestTypeFormValues] = useState<RequestTypeFormValues>(
    initialRequestTypeFormValues
  );
  const [state0, setState0] = useState<State0Values>(initialState0);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [stopMissing, setStopMissing] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [state1Values, setState1Values] = useState<FormValues>({});
  const [state2Values, setState2Values] = useState<FormValues>({});
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [requestTypeFormErrors, setRequestTypeFormErrors] = useState<string[]>([]);

  useEffect(() => {
    // 開発時は API から取得、本番の静的デプロイ時は engine-config.json を取得
    const isDev = process.env.NODE_ENV === 'development';
    const appRoot =
      typeof window !== 'undefined'
        ? window.location.pathname.replace(/\/tools\/[^/]+\/?$/, '').replace(/\/$/, '') || ''
        : process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const url = isDev ? '/api/engine-config' : `${appRoot}/engine-config.json`;
    setLoadError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒でタイムアウト

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error(`JSON ではない応答です (Content-Type: ${contentType ?? 'なし'})`);
        }
        return res.json();
      })
      .then((data) => {
        if (data?.error) throw new Error(data.error);
        if (!data?.fieldsById || !data?.fieldSetsBySetId || !data?.rules) {
          throw new Error('設定の形式が正しくありません');
        }
        setConfig(data as EngineConfig);
      })
      .catch((e) => {
        console.error(e);
        if (e.name === 'AbortError') {
          setLoadError('タイムアウト: 設定の取得に時間がかかりすぎています。');
        } else {
          setLoadError(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoading(false);
      });
  }, []);

  const submitState0 = useCallback(() => {
    const validation = validateState0(state0);
    setWarnings(validation.warnings);
    if (!validation.valid) {
      setRouteResult({
        route: 'STOP',
        show_field_set: 'STOP_MIN',
        next_action_label: '入力不足',
        rule_id: 'R_STOP',
      });
      setStopMissing(validation.missing);
      return;
    }
    if (!config) return;
    const result = evaluateRules(config.rules, state0);
    if (result) {
      setRouteResult(result);
      setStopMissing([]);
      if (result.route === 'STATE1') {
        setState1Values((prev) => ({
          ...prev,
          repro_steps: state0.repro_steps,
          repro_env: state0.repro_env,
          current_behavior: state0.current_behavior,
          expected_behavior: state0.expected_behavior,
        }));
      }
    }
  }, [state0, config]);

  const updateState0 = useCallback((fieldId: keyof State0Values, value: string | string[]) => {
    setState0((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const setState1 = useCallback((fieldId: string, value: string | string[]) => {
    setState1Values((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const setState2 = useCallback((fieldId: string, value: string | string[]) => {
    setState2Values((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const generateState1 = useCallback(() => {
    const text = buildInvestigationOutput(state0, state1Values, config?.fieldsById);
    setGeneratedText(text);
  }, [state0, state1Values, config?.fieldsById]);

  const generateState2 = useCallback(() => {
    const text = buildImplementationOutput(state0, state2Values, config?.fieldsById);
    setGeneratedText(text);
  }, [state0, state2Values, config?.fieldsById]);

  const updateRequestTypeForm = useCallback(
    (fieldId: keyof RequestTypeFormValues, value: string) => {
      setRequestTypeFormValues((prev) => ({ ...prev, [fieldId]: value }));
    },
    []
  );

  const generateRequestTypeOutput = useCallback(() => {
    const validation = validateRequestTypeForm(requestTypeFormValues);
    if (!validation.valid) {
      setRequestTypeFormErrors(validation.missing);
      return;
    }
    setRequestTypeFormErrors([]);
    if (requestType === 'requirement') {
      setGeneratedText(buildRequirementOutput(requestTypeFormValues));
    } else if (requestType === 'production') {
      setGeneratedText(buildProductionOutput(requestTypeFormValues));
    }
  }, [requestType, requestTypeFormValues]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [generatedText]);

  const resetAll = useCallback(() => {
    setRequestType('');
    setRequestTypeFormValues(initialRequestTypeFormValues);
    setRequestTypeFormErrors([]);
    setState0(initialState0);
    setRouteResult(null);
    setStopMissing([]);
    setState1Values({});
    setState2Values({});
    setGeneratedText('');
  }, []);

  const state0Fields = useMemo((): FieldDef[] => {
    if (!config) return [];
    let key: string;
    if (!state0.consultation_type) {
      key = 'STATE0';
    } else if (
      state0.consultation_type === 'change_consult' &&
      (state0.ask_type === 'fix_request' || state0.ask_type === 'estimate_fix')
    ) {
      key = 'STATE0_change_consult_fix';
    } else {
      key = `STATE0_${state0.consultation_type}`;
    }
    const state0Set = config.fieldSetsBySetId[key];
    const baseDefs: FieldDef[] = state0Set?.length
      ? state0Set
          .map((row) => {
            const def = config.fieldsById[row.field_id];
            if (!def) return null;
            const required =
              row.required_override !== null && row.required_override !== undefined
                ? row.required_override
                : def.required;
            return { ...def, required };
          })
          .filter((d): d is FieldDef => Boolean(d))
      : STATE0_FIELD_IDS.map((id) => config.fieldsById[id]).filter(
          (d): d is FieldDef => Boolean(d)
        );
    const overrides = config.optionsByConsultation?.[state0.consultation_type || ''];
    if (!overrides) return baseDefs;
    return baseDefs.map((def) => {
      const allowed = overrides[def.field_id];
      if (!allowed?.length || !def.options?.length) return def;
      const filtered: OptionItem[] = allowed
        .map((v) => def.options.find((o) => o.value === v))
        .filter((o): o is OptionItem => Boolean(o));
      return { ...def, options: filtered.length > 0 ? filtered : def.options };
    });
  }, [config, state0.consultation_type, state0.ask_type]);

  useEffect(() => {
    if (state0.consultation_type !== 'change_consult') return;
    const updates: Partial<State0Values> = {};
    if (state0.request_intent === 'bug_fix' || state0.request_intent === 'revert_spec') {
      updates.request_intent = '';
    }
    if (state0.ask_type === 'investigate' || state0.ask_type === 'rollback_check') {
      updates.ask_type = '';
    }
    if (Object.keys(updates).length > 0) {
      setState0((prev) => ({ ...prev, ...updates }));
    }
  }, [state0.consultation_type]);

  const currentSetRows = useMemo((): FieldSetRow[] => {
    if (!config || !routeResult) return [];
    const rows = config.fieldSetsBySetId[routeResult.show_field_set];
    return rows ?? [];
  }, [config, routeResult]);

  const currentSetInputRows = useMemo(() => {
    return currentSetRows.filter((row) => {
      const def = config?.fieldsById[row.field_id];
      return def && def.input_type !== 'output';
    });
  }, [currentSetRows, config]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <p className="text-gray-600 dark:text-gray-400">読み込み中…</p>
        </div>
      </main>
    );
  }

  if (!config) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <p className="text-red-600 dark:text-red-400">設定の読み込みに失敗しました</p>
          {loadError && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
              {loadError}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AppHeader
          title="実装依頼 生成ツール"
          subtitle="依頼内容に応じて、要件整理・制作進行・不具合調査・修正依頼文を生成します"
          useTailwind={true}
        >
          <ThemeToggle useTailwind={true} />
        </AppHeader>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            「依頼内容」を入力して送信すると、依頼文を生成できます。
          </p>
          <button onClick={resetAll} className="btn-secondary">
            リセット
          </button>
        </div>

        <div id="form-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* 依頼内容 */}
            <div className="card border-2 border-primary-200 dark:border-primary-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                依頼内容
              </h2>
              <div className="space-y-2">
                <div className="flex flex-col gap-2">
                  {REQUEST_TYPE_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="inline-flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="request-type"
                        value={opt.value}
                        checked={requestType === opt.value}
                        onChange={() => setRequestType(opt.value)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 要件整理 / 制作進行フォーム */}
            {(requestType === 'requirement' || requestType === 'production') && (
              <div className="card border-2 border-primary-200 dark:border-primary-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {requestType === 'requirement' ? '要件整理 / 要件定義' : '制作進行'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  案件名・対象・依頼内容・期限は必須です。その他は分かる範囲で入力してください。
                </p>
                {requestType === 'requirement' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      クライアント折衝
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {CLIENT_NEGOTIATION_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          className="inline-flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="client-negotiation"
                            value={opt.value}
                            checked={
                              requestTypeFormValues.include_client_negotiation === opt.value
                            }
                            onChange={() =>
                              updateRequestTypeForm('include_client_negotiation', opt.value)
                            }
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  {COMMON_FIELDS.map((f) => (
                    <div key={f.id}>
                      <label
                        htmlFor={`rt-${f.id}`}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {f.label}
                        {REQUIRED_FIELD_IDS.includes(f.id) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {f.helpText && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{f.helpText}</p>
                      )}
                      {f.inputType === 'textarea' ? (
                        <textarea
                          id={`rt-${f.id}`}
                          value={requestTypeFormValues[f.id]}
                          onChange={(e) => updateRequestTypeForm(f.id, e.target.value)}
                          rows={3}
                          placeholder={f.placeholder}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      ) : (
                        <input
                          id={`rt-${f.id}`}
                          type="text"
                          value={requestTypeFormValues[f.id]}
                          onChange={(e) => updateRequestTypeForm(f.id, e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      )}
                    </div>
                  ))}
                  {(requestType === 'requirement' ? REQUIREMENT_FIELDS : PRODUCTION_FIELDS).map(
                    (f) => (
                      <div key={f.id}>
                        <label
                          htmlFor={`rt-${f.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          {f.label}
                        </label>
                        {f.helpText && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{f.helpText}</p>
                        )}
                        {f.inputType === 'textarea' ? (
                          <textarea
                            id={`rt-${f.id}`}
                            value={requestTypeFormValues[f.id]}
                            onChange={(e) => updateRequestTypeForm(f.id, e.target.value)}
                            rows={3}
                            placeholder={f.placeholder}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        ) : (
                          <input
                            id={`rt-${f.id}`}
                            type="text"
                            value={requestTypeFormValues[f.id]}
                            onChange={(e) => updateRequestTypeForm(f.id, e.target.value)}
                            placeholder={f.placeholder}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
                <div className="mt-4">
                  <button onClick={generateRequestTypeOutput} className="btn-primary">
                    送信
                  </button>
                  {requestTypeFormErrors.length > 0 && (
                    <div className="mt-3 p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">以下の必須項目を入力してください</p>
                      <ul className="mt-1 list-disc list-inside">
                        {requestTypeFormErrors.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STATE0: 依頼整理（必須） - 原因確認・修正依頼用 */}
            {requestType === 'legacy' && (
            <div className="card border-2 border-primary-200 dark:border-primary-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                依頼整理（必須）
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                相談タイプ・今欲しい対応・対象などを入力し、送信してください。
              </p>
              <div className="space-y-4">
                {state0Fields.map((def) => (
                  <div key={def.field_id}>
                    <FieldRender
                      def={def}
                      value={
                        (def.input_type === 'checkbox' || def.input_type === 'checkbox_multiple')
                          ? ((state0[def.field_id as keyof State0Values] as unknown) as string[] ?? [])
                          : (state0[def.field_id as keyof State0Values] as string) ?? ''
                      }
                      required={def.required}
                      onChange={(v) => updateState0(def.field_id as keyof State0Values, v)}
                    />
                    {def.field_id === 'ask_type' &&
                      state0.ask_type &&
                      (['investigate', 'confirm_spec', 'rollback_check'].includes(state0.ask_type) ||
                        ['estimate_fix', 'fix_request'].includes(state0.ask_type)) && (
                      <p className="mt-2 text-xs text-primary-600 dark:text-primary-400">
                        {['investigate', 'confirm_spec', 'rollback_check'].includes(state0.ask_type)
                          ? '→ この選択で「原因確認依頼」に進みます'
                          : '→ この選択で「修正依頼」に進みます'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {warnings.length > 0 && (
                <div className="mt-3 p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
                  {warnings.map((w) => (
                    <p key={w}>※ {w}</p>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <button onClick={submitState0} className="btn-primary">
                  送信して次へ
                </button>
              </div>
            </div>
            )}

            {/* STOP: 入力不足 */}
            {requestType === 'legacy' && routeResult?.route === 'STOP' && (
              <div className="card border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                <h3 className="text-base font-semibold text-red-800 dark:text-red-200">
                  入力不足
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  {routeResult.next_action_label}
                </p>
                <ul className="mt-2 list-disc list-inside text-sm text-red-700 dark:text-red-300">
                  {stopMissing.map((m) => (
                    <li key={m}>「{m}」が未入力です</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-red-600 dark:text-red-400">
                  上記を入力してから再度「送信して次へ」を押してください。
                </p>
              </div>
            )}

            {/* STATE1: まず原因を確認する */}
            {requestType === 'legacy' && routeResult?.route === 'STATE1' && (
              <div className="card border-2 border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  まず原因を確認する
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  仕様か不具合かを確認し、正しい状態を揃えます
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  依頼整理で入力した内容が反映されています。必要なら修正し、根拠や影響範囲を追記してください。
                </p>
                <div className="space-y-4">
                  {currentSetInputRows.map((row) => {
                    const def = config.fieldsById[row.field_id];
                    if (!def) return null;
                    const required = row.required_override ?? def.required;
                    const value = getFieldValue(state1Values, row.field_id, def.input_type);
                    return (
                      <FieldRender
                        key={row.field_id}
                        def={def}
                        value={value}
                        required={required}
                        onChange={(v) => setState1(row.field_id, v)}
                      />
                    );
                  })}
                </div>
                <div className="mt-4">
                  <button onClick={generateState1} className="btn-primary">
                    原因確認依頼を作る
                  </button>
                </div>
              </div>
            )}

            {/* STATE2: そのまま修正できる */}
            {requestType === 'legacy' && routeResult?.route === 'STATE2' && (
              <div className="card border-2 border-step2-300 dark:border-step2-700 bg-step2-50/50 dark:bg-step2-900/10">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  そのまま修正できる
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  修正内容と完了の条件が決まっている状態です
                </p>
                <div className="space-y-4">
                  {currentSetInputRows.map((row) => {
                    const def = config.fieldsById[row.field_id];
                    if (!def) return null;
                    const required = row.required_override ?? def.required;
                    const value = getFieldValue(state2Values, row.field_id, def.input_type);
                    return (
                      <FieldRender
                        key={row.field_id}
                        def={def}
                        value={value}
                        required={required}
                        onChange={(v) => setState2(row.field_id, v)}
                      />
                    );
                  })}
                </div>
                <div className="mt-4">
                  <button onClick={generateState2} className="btn-primary">
                    修正依頼を作る
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 右: 生成結果 */}
          <div className="lg:sticky lg:top-4 self-start">
            {requestType === 'requirement' || requestType === 'production' ? (
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {requestType === 'requirement' ? '要件整理 / 要件定義' : '制作進行'} 依頼文
                  </p>
                  <button
                    onClick={handleCopy}
                    disabled={!generatedText}
                    className="btn-primary text-xs disabled:opacity-50"
                  >
                    {copied ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={generatedText}
                  placeholder="左のフォームを入力し「送信」を押すとここに表示されます"
                  className="w-full h-72 p-3 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 resize-none"
                />
              </div>
            ) : (routeResult?.route === 'STATE1' || routeResult?.route === 'STATE2') ? (
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {routeResult.route === 'STATE1' ? '原因確認依頼文' : '修正依頼文'}
                  </p>
                  <button
                    onClick={handleCopy}
                    disabled={!generatedText}
                    className="btn-primary text-xs disabled:opacity-50"
                  >
                    {copied ? 'コピー済み' : 'コピー'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={generatedText}
                  placeholder="左のフォームを入力し「原因確認依頼を作る」または「修正依頼を作る」を押すとここに表示されます"
                  className="w-full h-72 p-3 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 resize-none"
                />
              </div>
            ) : (
              <div className="card border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {requestType === 'legacy'
                    ? '依頼整理を送信すると、ここに原因確認依頼文または修正依頼文が表示されます。'
                    : '依頼タイプを選択し、フォームを入力して送信するとここに依頼文が表示されます。'}
                </p>
              </div>
            )}
          </div>
        </div>

        <AppFooter useTailwind={true} className="mt-12">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            本ツールは、依頼内容に応じて要件整理・制作進行・不具合調査・修正依頼文を効率的に生成することを目的としています
          </p>
        </AppFooter>
      </div>
    </main>
  );
}
