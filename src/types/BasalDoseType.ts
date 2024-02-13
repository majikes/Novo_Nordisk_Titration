interface BasalDoseType {
    id: string,
    date: string | Date,
    basalDoseTimeOfDayInMinutes: number,
    basalDoseValue: number,
    src_id: string,
    time: number, 
    formattedTime: string,
  }

export default BasalDoseType