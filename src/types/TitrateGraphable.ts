import SubjectGraphable from "./SubjectGraphable"

interface TitrateGraphable {
    night?: number[],
    quantNominal?: SubjectGraphable,
    quantOptimal: SubjectGraphable,
    tirNominal?: number[],
    tirOptimal: number[]
}

export default TitrateGraphable