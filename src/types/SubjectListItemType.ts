import TitrateInfoType from "./TitrateInfoType";

interface SubjectListItemType extends TitrateInfoType {
    id: string,
    active: number,
    interventionArm: number,
    startDate: string,
    modifiableByRequestor: boolean,
  }

export { type SubjectListItemType }