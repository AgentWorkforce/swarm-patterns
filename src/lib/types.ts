export type Stage = 'queue' | 'socket' | 'pty' | 'verification';

export type RelayEvent = {
  id: string;
  stage: Stage;
  actor: string;
  message: string;
  status: 'pending' | 'ok' | 'fail';
  latency: number;
  ts: number;
};

export type Metric = {
  label: string;
  value: string;
  delta?: string;
  tone?: 'good' | 'warn' | 'bad';
};
