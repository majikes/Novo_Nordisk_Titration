interface QuantileGraphable {
    id?: string,
    traceGroups: {
        type: string,
        traces: {
            label: string,
            trace: number[],
        }[],
        colors?: {
            inner: string,
            outer?: string,
            trace?: string
        }
    }[]
}

export default QuantileGraphable