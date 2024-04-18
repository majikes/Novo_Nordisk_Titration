interface HypoFromAPIType {
  eventSubmittedUnixTime: number,
  hypoDate: string,
  hypoTime: number,
  hypoValue: number,
  id: number,
  // selectedDate: string,
  selectedUnixTime: number,
  receivedUnixTime: number,
  symptomsReported: number,
  src_id: number,
  subject_id: number,
}

export default HypoFromAPIType