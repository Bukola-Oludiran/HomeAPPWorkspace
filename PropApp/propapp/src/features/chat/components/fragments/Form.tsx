import { useState } from 'react';
import type { FormProps } from '../../types';

interface Props {
    props: FormProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function Form({ props, onAction }: Props) {
    const [values, setValues] = useState<Record<string, unknown>>(() => {
        const init: Record<string, unknown> = {};
        for (const f of props.fields) {
            if (f.type === 'checkbox') init[f.id] = false;
        }
        return init;
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    function setField(id: string, value: unknown) {
        setValues((v) => ({ ...v, [id]: value }));
        if (errors[id]) setErrors((e) => ({ ...e, [id]: '' }));
    }

    function submit() {
        const nextErrors: Record<string, string> = {};
        for (const f of props.fields) {
            if (f.required) {
                const v = values[f.id];
                if (v === undefined || v === null || v === '') {
                    nextErrors[f.id] = 'Required';
                }
            }
            if (f.type === 'number' && values[f.id] !== undefined && values[f.id] !== '') {
                const n = Number(values[f.id]);
                if (Number.isNaN(n)) nextErrors[f.id] = 'Must be a number';
                else {
                    if (f.min !== undefined && n < f.min) nextErrors[f.id] = `Min ${f.min}`;
                    if (f.max !== undefined && n > f.max) nextErrors[f.id] = `Max ${f.max}`;
                }
            }
        }
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }
        onAction(props.submitAction.id, values);
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
            <header>
                <h3 className="text-base font-semibold">{props.title}</h3>
                {props.description ? (
                    <p className="text-sm text-slate-500">{props.description}</p>
                ) : null}
            </header>
            {props.fields.map((f) => {
                const err = errors[f.id];
                const baseInput =
                    'w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm focus:outline-none ';
                const errBorder = err ? 'border-red-400' : 'border-slate-200 focus:border-slate-400';
                return (
                    <label key={f.id} className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-700">
                            {f.label}
                            {f.required ? <span className="text-red-500"> *</span> : null}
                        </span>
                        {f.type === 'textarea' ? (
                            <textarea
                                value={String(values[f.id] ?? '')}
                                onChange={(e) => setField(f.id, e.target.value)}
                                placeholder={f.placeholder}
                                rows={3}
                                className={`${baseInput} ${errBorder}`}
                            />
                        ) : f.type === 'select' ? (
                            <select
                                value={String(values[f.id] ?? '')}
                                onChange={(e) => setField(f.id, e.target.value)}
                                className={`${baseInput} ${errBorder}`}
                            >
                                <option value="">Choose…</option>
                                {(f.options ?? []).map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        ) : f.type === 'checkbox' ? (
                            <input
                                type="checkbox"
                                checked={Boolean(values[f.id])}
                                onChange={(e) => setField(f.id, e.target.checked)}
                                className="mr-2"
                            />
                        ) : (
                            <input
                                type={f.type}
                                value={String(values[f.id] ?? '')}
                                onChange={(e) =>
                                    setField(
                                        f.id,
                                        f.type === 'number' ? e.target.valueAsNumber : e.target.value
                                    )
                                }
                                placeholder={f.placeholder}
                                min={f.min}
                                max={f.max}
                                className={`${baseInput} ${errBorder}`}
                            />
                        )}
                        {err ? <span className="mt-1 block text-xs text-red-600">{err}</span> : null}
                    </label>
                );
            })}
            <div className="flex justify-end gap-2 pt-2">
                {props.cancelAction ? (
                    <button
                        type="button"
                        onClick={() => onAction(props.cancelAction!.id)}
                        className="rounded-full px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900"
                    >
                        {props.cancelAction.label}
                    </button>
                ) : null}
                <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                >
                    {props.submitAction.label}
                </button>
            </div>
        </form>
    );
}
