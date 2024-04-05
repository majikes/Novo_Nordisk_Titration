interface CGMDataAvail5MinType {
  baseTime: number;
  egvPresent: boolean;
  egvMultiple: boolean;
  egvCount: number;
}

interface CGMDataAvail5MinDiasType extends CGMDataAvail5MinType {
  diasPresent?: boolean;
  diasMultiple?: boolean;
  diasCount?: number;
  awsPresent?: boolean;
  awsMultiple?: boolean;
  awsCount?: number;
}

interface SubjectCardFromAPIType {
  subject_id?: string;
  active?: boolean;
  cgm_availability?: CGMDataAvail5MinDiasType[];
  message: string;
}

interface SubjectCardFrontendType extends SubjectCardFromAPIType {
  loading: boolean;
  empty: boolean;
}

export {
  type SubjectCardFromAPIType,
  type SubjectCardFrontendType,
  type CGMDataAvail5MinType,
};
