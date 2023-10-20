interface TitrateInfoType {
    rec_dose_TS: number | null,
    rec_dose_value: number | null,
    rec_dose_problems: string[],
    dose_TS: number | null,
    dose_value: number | null,
    dose_problems: string[],
    loading: boolean,
  }

export default TitrateInfoType