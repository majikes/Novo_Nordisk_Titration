import TitrateInfoType from "./TitrateInfoType";

interface SubjectListItemType extends TitrateInfoType {
    id: string,
    active: number,
    interventionArm: number,
  }

export { type SubjectListItemType }