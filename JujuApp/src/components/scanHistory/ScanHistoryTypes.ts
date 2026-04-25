export type ScanRecordType = 'ticket' | 'invite' | 'payment' | 'qrcode';

export type ScanRecordStatus = 'success' | 'failed' | 'pending';

export interface ScanRecord {
  id: string | number;
  type: ScanRecordType;
  content: string;
  createdAt: string;
  status?: ScanRecordStatus;
}

export interface TypeConfig {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
}

export interface StatusConfig {
  icon: string;
  color: string;
}

export type TypeConfigMap = Record<ScanRecordType | 'default', TypeConfig>;

export type StatusConfigMap = Record<ScanRecordStatus, StatusConfig>;
