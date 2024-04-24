interface BasalDoseFromAPIType {
    id: string,
    date: string,
    basalDoseTimeOfDayInMinutes: number,
    basalDoseValue: number,
    src_id: string,
    time: number, 
  }

interface BasalDoseType extends BasalDoseFromAPIType {
    formattedTime: string,
  }

interface BasalDoseRecType {
    id: string,
    date: string,
    basalDoseRecom: number,
    src_id: string,
    time: number, 
  }

interface BasalDoseHistoryFromAPIType {
  basalDoseHistory: BasalDoseFromAPIType[],
  basalDoseRecHistory: BasalDoseRecType[],
}

export {
  type BasalDoseFromAPIType,
  type BasalDoseType,
  type BasalDoseRecType,
  type BasalDoseHistoryFromAPIType,
}