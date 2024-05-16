import Subject from '@/types/Subject'
import SubjectFromAPI from '@/types/SubjectFromAPI'
import SubjectGraphable from '@/types/SubjectGraphable'
import QuantileGraphable from '@/types/QuantileGraphable'
import TiRType from '@/types/TiRType'
import { flattenDeep } from 'lodash'
import {
    type UserSupervisedByGroupBySuperviseeType,
    type Supervisee,
    type Supervisor,
    type USBGFrontendSortType,
} from "@/types/UserSupervisedByTypes";

export function supervisorToSupervisee(supervisor: Supervisor): Supervisee {
    return {
        supervisee_username: supervisor.supervisor_username,
        supervisee_id: supervisor.supervisor_id,
        supervisee_role_name: supervisor.supervisor_role_name,
        active: supervisor.active,
        site_id: supervisor.supervisor_site_id,
        site_name: supervisor.supervisor_site_name,
      } as Supervisee
}

export function superviseeToSupervisor(supervisee: Supervisee): Supervisor {
    return {
        supervisor_username: supervisee.supervisee_username,
        supervisor_id: supervisee.supervisee_id,
        supervisor_role_name: supervisee.supervisee_role_name,
        active: supervisee.active,
        supervisor_site_id: supervisee.site_id,
        supervisor_site_name: supervisee.site_name,
    } as Supervisor
}

// https://www.newline.co/@bespoyasov/how-to-use-fetch-with-typescript--a81ac257
// Make the `request` function generic
// to specify the return data type
// usage:
// Handling errors outside:
// (async () => {
//     try {
//       const user = await request<User>('/api/users/42');
//     }
//     catch (error) {
//       // Handle any error happened.
//     }
//   })()

export async function request<TResponse>(
    url: string,
    // `RequestInit` is a type for configuring 
    // a `fetch` request. By default, an empty object.
    config: RequestInit = {}

    // This function is async, it will return a Promise:
): Promise<TResponse> {

    // Inside, we call the `fetch` function with 
    // a URL and config given:
    // const response = await fetch(url, config)
    // return await response.json()
    // https://stackoverflow.com/questions/71514377/how-could-i-save-data-from-get-response-in-typescript-and-access-them
    return await fetch(url, config).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        return response.json()
    })
}

// predefining get and post
// usage:
// const user = await api.get<User>('/api/users/42');
export const api = {
    get: <TResponse>(url: string) =>
        request<TResponse>(url),

    getAuth: <TResponse>(url: string, token: string) =>
        request<TResponse>(url, {
            headers: new Headers({
                'Content-Type': 'application/json',
                // 'Accept': 'application/json',
                // 'Access-Control-Allow-Headers': 'Content-Type',
                'Authorization': token,
            })
        }),

    // API Key auth
    getAPIKeyAuth: <TResponse>(url: string, apiKey: string) =>
        request<TResponse>(url, {
            headers: new Headers({
                'Content-Type': 'application/json',
                // 'Accept': 'application/json',
                // 'Access-Control-Allow-Headers': 'Content-Type',
                'x-api-key': apiKey,
            })
        }),

    // Using `extends` to set a type constraint:
    post: <TBody extends BodyInit, TResponse>(url: string, body: TBody) =>
        request<TResponse>(url, { method: 'POST', body: body }),

    postAuth: <TBody extends BodyInit, TResponse>(url: string, token: string, body: TBody) =>
        request<TResponse>(url, {
            method: 'POST', body: body,
            headers: new Headers({
                'Content-Type': 'application/json',
                'Authorization': token,
            })
        }),
}

// helper function to convert dumb return value describing
// subjects to the Subject type we defined.
// mainly we're just extracting values from arrays.
export function subject_convert(s: SubjectFromAPI): Subject {
    const ret_s: Subject = {
        id: s.id[0],
        username: s.username[0],
        email: s.email[0],
        status: s.status[0],
        group: s.group[0],
        phaseName: s.phaseName[0],
        phase: s.phase[0],
        startDate: s.startDate[0],
        t_status: s.t_status[0],
        lastI_BAM: s.lastI_BAM,
        lastI_PAM: s.lastI_PAM,
        lastRec: s.lastRec,
        lastGMI: s.lastGMI,
        lastIdentNE: s.lastIdentNE,
        lastBWeeklyOpt: s.lastBWeeklyOpt,
        t_not: s.t_not[0],
        nWeeksSD: s.nWeeksSD[0],
        nWeeksP: s.nWeeksP[0],
        tControl: s.tControl,
        lastLog: s.lastLog
    }
    return ret_s
}

// date string repr conversion
// incoming dates from API are MM/DD/YYYY, 
// min and max HTML attrs are YYYY-MM-DD (ISO 8601)
// https://stackoverflow.com/questions/28246788/convert-yyyy-mm-dd-to-mm-dd-yyyy-in-javascript
export function dateConvertToISO(input: string): string {
    const pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
    if (!input || !input.match(pattern)) {
        return input;
    }
    return input.replace(pattern, '$3-$1-$2');
}

// just match year, month, day for titration2week control
export function dateMatch(d1: Date, d2: Date) {
    // console.log(`comparing ${d1} and ${d2}`)

    // console.log(d1.getDate, d2.getDate)
    // console.log(d1.getDate === d2.getDate)
    // console.log(d1.getMonth, d2.getMonth)
    // console.log(d1.getMonth === d2.getMonth)
    // console.log(d1.getFullYear, d2.getFullYear)
    // console.log(d1.getFullYear === d2.getFullYear)
    const retBool = d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()

    // if (retBool) {console.log(`${d1} and ${d2} match!`)}
    return retBool
}
// basically ".includes" but using dateMatch for equality check
export function dateInDateArr(d1: Date, dA: Date[]) {
    let retBool = false
    for (const d2 of dA) {
        retBool ||= dateMatch(d1, d2)
    }
    return retBool
}

// TiR that flattens 2d array and ignores nulls
export function calcTiR(glucArr: (number | null)[] | (number | null)[][]) {
    const fullVals = flattenDeep(glucArr).filter(function (value, index) { return typeof (value) === 'number' })
    const total = fullVals.length

    const vlow = fullVals.filter(function (value, index) { return (value as number) < 54 })
    const low = fullVals.filter(function (value, index) { return (value as number) >= 54 && (value as number) < 70 })
    const target = fullVals.filter(function (value, index) { return (value as number) >= 70 && (value as number) <= 180 })
    const high = fullVals.filter(function (value, index) { return (value as number) > 180 && (value as number) <= 250 })
    const vhigh = fullVals.filter(function (value, index) { return (value as number) > 250 })

    const vlowP = Math.round(vlow.length / total * 100 * 100) / 100
    const lowP = Math.round(low.length / total * 100 * 100) / 100
    const targetP = Math.round(target.length / total * 100 * 100) / 100
    const highP = Math.round(high.length / total * 100 * 100) / 100
    const vhighP = Math.round(vhigh.length / total * 100 * 100) / 100

    return {
        lt54: vlowP,
        bt5470: lowP,
        bt70180: targetP,
        bt180250: highP,
        gt250: vhighP
    } as TiRType
}