interface BasalDoseType {
    id: string,
    date: string | Date,
    timeOfDayInMinutes: number,
    basalDoseValue: number,
  }

export default BasalDoseType