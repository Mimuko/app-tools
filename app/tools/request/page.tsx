'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { AppHeader, AppFooter, ThemeToggle } from '@shared/components';
import type { EngineConfig, FieldDef, FieldSetRow, State0Values } from '@/lib/state-engine';
import {
  STATE0_FIELD_IDS,
  evaluateRules,
  validateState0,
  buildInvestigationOutput,
  buildImplementationOutput,
} from '@/lib/state-engine';
import type { RouteResult } from '@/lib/state-engine/rules';

const initialState0: State0Values = {
  request_intent: '',
  origin: '',
  target_url: '',
  device: '',
  phenomenon: [],
  phenomenon_note: '',
  compare: [],
  compare_when: '',
  compare_url: '',
  ask_type: [],
  deadline: '',
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
  const [state0, setState0] = useState<State0Values>(initialState0);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [stopMissing, setStopMissing] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [state1Values, setState1Values] = useState<FormValues>({});
  const [state2Values, setState2Values] = useState<FormValues>({});
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    fetch(`${base}/engine-config.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setConfig(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
    setState0(initialState0);
    setRouteResult(null);
    setStopMissing([]);
    setState1Values({});
    setState2Values({});
    setGeneratedText('');
  }, []);

  const state0Fields = useMemo(() => {
    if (!config) return [];
    return STATE0_FIELD_IDS.map((id) => config.fieldsById[id]).filter(Boolean);
  }, [config]);

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
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AppHeader
          title="実装依頼 生成ツール"
          subtitle="依頼整理から原因確認・修正依頼文を生成します"
          useTailwind={true}
        >
          <ThemeToggle useTailwind={true} />
        </AppHeader>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            まず「依頼整理」を入力して送信し、表示されたフォームで依頼文を生成できます。
          </p>
          <button onClick={resetAll} className="btn-secondary">
            リセット
          </button>
        </div>

        <div id="form-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* STATE0: 依頼整理（必須） */}
            <div className="card border-2 border-primary-200 dark:border-primary-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                依頼整理（必須）
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                対象・依頼の種類・依頼内容を入力し、送信してください。
              </p>
              <div className="space-y-4">
                {state0Fields.map((def) => (
                  <FieldRender
                    key={def.field_id}
                    def={def}
                    value={
                      (def.input_type === 'checkbox' || def.input_type === 'checkbox_multiple')
                        ? (state0[def.field_id as keyof State0Values] as string[] ?? [])
                        : (state0[def.field_id as keyof State0Values] as string) ?? ''
                    }
                    required={def.required}
                    onChange={(v) => updateState0(def.field_id as keyof State0Values, v)}
                  />
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

            {/* STOP: 入力不足 */}
            {routeResult?.route === 'STOP' && (
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
            {routeResult?.route === 'STATE1' && (
              <div className="card border-2 border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-900/10">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  まず原因を確認する
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  仕様か不具合かを確認し、正しい状態を揃えます
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
            {routeResult?.route === 'STATE2' && (
              <div className="card border-2 border-step2-300 dark:border-step2-700 bg-step2-50/50 dark:bg-step2-900/10">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  そのまま修正できる
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {config.fieldsById['phase']?.options?.find((o) => o.value === 'implementation')?.label ??
                    '修正内容と完了の条件が決まっている状態です'}
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
            {(routeResult?.route === 'STATE1' || routeResult?.route === 'STATE2') ? (
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
                  依頼整理を送信すると、ここに原因確認依頼文または修正依頼文が表示されます。
                </p>
              </div>
            )}
          </div>
        </div>

        <AppFooter useTailwind={true} className="mt-12">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            本ツールは、依頼整理と状態分岐に基づいて実装依頼内容を効率的に生成することを目的としています
          </p>
        </AppFooter>
      </div>
    </main>
  );
}
