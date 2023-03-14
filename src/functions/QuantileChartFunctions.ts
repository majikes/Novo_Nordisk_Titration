/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QUANTILE CHART
// 
// SETUP:
//
// wherever scripts are being loaded in HTML, the following lines must be added BEFORE importing this file:
//      <script src="https://cdn.jsdelivr.net/npm/chart.js@^3"></script>
//      <script src="https://cdn.jsdelivr.net/npm/luxon@^2"></script>
//      <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@^1"></script>
//      <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
//
// the chart itself needs to live in a <canvas> element, like the following:
//      <canvas class='canvas-nomargin' id="areaQuantile"></canvas>
// so an element like that needs to be created in the HTML before using this code.
//
// (also, probably not necessary, but this has been primarily tested with these bootstrap imports:)
//      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet" 
//          integrity="sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx" crossorigin="anonymous">
//      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
//      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.bundle.min.js" 
//          integrity="sha384-A3rJD856KowSb7dwlZdYEkO39Gagi7vIsF0jrRAoQmDKKtQBHUuLZ9AsSv4jD4Xa" 
//          crossorigin="anonymous"></script>
//
// USAGE:
//
// to use this to map quantiles of glucose data, we need to first create the graph, then populate it.
//
// to create the graph, we invoke createQuantChart. createQuantChart accepts a canvas DOM element as 
// an argument. in javascript, binding that to a variable we can use would look something like this:
//      const quantile_container = document.getElementById("areaQuantile");
// we then create the chart and bind it to a variable, like so:
//      const quant_chart = createQuantChart(quantile_container);
//
// to populate the graph, we need data in the correct format, which we then need to reformat and
// label properly with the help of genChartDataset. genChartDataset takes three arguments:
//      - the data we want to map (a single quantile)
//          - this data MUST be a list of 288 numbers
//      - the label to apply to that dataset
//      - the 'fill' boolean, which should just be true if the quantile > 50th, otherwise it can be 
//        omitted
// the following is an example of how that code would look:
//      glucose05th = genChartDataset(quant_data["glucose05th"], '05th Percentile')
//      glucose25th = genChartDataset(quant_data["glucose25th"], '25th Percentile')
//      glucose50th = genChartDataset(quant_data["glucose50th"], 'Median')
//      glucose75th = genChartDataset(quant_data["glucose75th"], '75th Percentile', true)
//      glucose95th = genChartDataset(quant_data["glucose95th"], '95th Percentile', true)
//
// finally, we need to invoke areaChartModifier to actually push new data to the chart and update it. 
// areaChartModifier takes two arguments:
//      - the chart to modify / update
//      - the data to display on the chart, in the form of list of chart.js datasets
// that final invocation would look something like this:
//      areaChartModifier(quant_chart, [glucose05th,glucose25th,glucose50th,glucose75th,glucose95th])
// 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// setup data
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { cloneDeep } from 'lodash'
//import { quantile_container as quantile_container } from './agp'
// import { Chart, ChartData, ChartType, TimeScale, registerables } from 'chart.js';
// Chart.register(...registerables);
// import 'chartjs-adapter-moment';
import 'chartjs-adapter-luxon'

console.log("---Import done---")

export const SUBJECT_GLUCOSE_CHART_DATASET_DEFAULTS = {
    max_normal_range: {
        label: '180 mg/dl',
        data: [{
            x: new Date(2019, 0, 1, 0, 0, 0, 0),
            y: 180.0
        }, {
            x: new Date(2019, 0, 2, 0, 0, 0, 0),
            y: 180.0
        }
        ],
        spanGaps: false,
        borderColor: 'rgba(117,219,153,1)',
        backgroundColor: 'rgba(117,219,153,1)',
        type: 'line',
        fill: false,
        order: 0,
    },
    min_normal_range: {
        label: '70 mg/dl',
        data: [{
            x: new Date(2019, 0, 1, 0, 0, 0, 0),
            y: 70.0
        }, {
            x: new Date(2019, 0, 2, 0, 0, 0, 0),
            y: 70.0
        }
        ],
        spanGaps: false,
        borderColor: 'rgba(117,219,153,1)',
        backgroundColor: 'rgba(117,219,153,1)',
        type: 'line',
        fill: false,
        order: 0,
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// types
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Point {
    x: Date,
    y: number
}

export interface DataSet {
    label?: string,
    data: Point[],
    spanGaps?: boolean,
    borderColor?: string,
    borderDash?: number[],
    borderWidth?: number,
    backgroundColor?: string,
    type?: string,
    fill?: any,
    order?: number,
    cubicInterpolationMode?: string,
    tension?: number,
    border_lower_bound?: number,
    border_upper_bound?: number
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// funcs
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function findIntersect(x1_date: Date, y1: number, x2_date: Date, y2: number, ybound: number) {
    // console.log(x1, y1, x2, y2);
    // console.log(ybound);
    // let x1_date = new Date(x1_str);
    // let x2_date = new Date(x2_str);
    const x1 = x1_date.getTime();
    const x2 = x2_date.getTime();
    // console.log(typeof(x1), typeof(x2))
    const m = (y2 - y1) / (x2 - x1);
    // console.log(m);
    // let xbound = x1;
    const xbound = (((ybound - y1) / m) + x1);
    // if (isNaN(xbound) || xbound > 3000000000000) {
    //     console.log('invalid date')
    //     console.log('inputs',x1, y1, x2, y2)
    //     console.log('run',x1-x2)
    //     console.log('rise',y1-y2)  
    //     console.log('slope',m)
    //     console.log('bound',ybound)
    //     console.log('intersect',xbound)
    //     // console.log('xdiff',xdiff)
    //     console.log('intersect date',new Date(xbound))
    // }
    return new Date(xbound);
}

function fixBoundaryPoints(point: Point, point_before: Point, point_after: Point, bound: number, bound_type: string) {
    // js doesn't error if we index out of bounds so we just check
    // if point neighbors are undefined, if they are return (point.x, bound)
    // or whatever, in object form
    const point_intersect = cloneDeep(point);
    // no matter what our y value is getting set to bound
    point_intersect.y = bound;
    if (!(point_before == undefined || point_after == undefined)) {
        // we are only changing the x-value, "out of bound" points 
        // will ALWAYS have their y-values changed to bound
        if (bound_type == 'upper') {
            if (point_before.y < bound) {
                point_intersect.x = findIntersect(point_before.x, point_before.y, point.x, point.y, bound);
            } else if (point_after.y < bound) {
                point_intersect.x = findIntersect(point.x, point.y, point_after.x, point_after.y, bound);
            }
        } else if (bound_type == 'lower') {
            if (point_before.y > bound) {
                point_intersect.x = findIntersect(point_before.x, point_before.y, point.x, point.y, bound);
            } else if (point_after.y > bound) {
                point_intersect.x = findIntersect(point.x, point.y, point_after.x, point_after.y, bound);
            }
        }
    }
    // console.log(point_intersect);
    return point_intersect;
}

export function splitAndColorize(datasets: DataSet[]) {
    console.log('colorizing');
    // expecting the quantile datasets
    // breakpoints are 250, 180, 70, and 54
    // colors:
    const vhigh_orange_inner = '#f5a000';
    const vhigh_orange_outer = '#f8d153';
    const high_orange_inner = '#fadc7f';
    const high_orange_outer = '#fceebf';
    const target_green_inner = '#75db99';
    const target_green_outer = '#a3e6ba';
    const low_red_inner = '#d59792';
    const low_red_outer = '#eacbc8';
    const vlow_red_inner = '#ab3025';
    const vlow_red_outer = '#c46e66';

    const vhighs = [] as DataSet[]
    for (let i = 0; i < datasets.length; ++i) {
        const temp_dataset = cloneDeep(datasets[i]);
        // console.log(temp_dataset)
        for (let j = 0; j < temp_dataset.data.length; ++j) {
            if (temp_dataset.data[j].y < 250) {
                // temp_dataset.data[j].y = 250 
                // TODO replace this with the fixBoundPoints
                temp_dataset.data[j] = fixBoundaryPoints(
                    temp_dataset.data[j],
                    temp_dataset.data[j - 1],
                    temp_dataset.data[j + 1],
                    250,
                    'lower'
                );
            }
        }
        if ((temp_dataset.label == '05th Percentile') || (temp_dataset.label == '75th Percentile')) {
            temp_dataset.fill = {
                target: '+1',
                below: vhigh_orange_outer
            }
        } else if ((temp_dataset.label == '25th Percentile') || (temp_dataset.label == 'Median')) {
            temp_dataset.fill = {
                target: '+1',
                below: vhigh_orange_inner
            }
        }
        // temp_dataset.borderColor = function(context, options) {
        //     console.log(context, options);
        //     return 'black';
        // };
        temp_dataset.border_lower_bound = 250;
        vhighs.push(cloneDeep(temp_dataset))
    }

    const highs = [] as DataSet[]
    for (let i = 0; i < datasets.length; ++i) {
        const temp_dataset = cloneDeep(datasets[i]);
        // console.log(temp_dataset)
        for (let j = 0; j < temp_dataset.data.length; ++j) {
            if (temp_dataset.data[j].y > 250) {
                // temp_dataset.data[j].y = 250; 
                temp_dataset.data[j] = fixBoundaryPoints(
                    temp_dataset.data[j],
                    temp_dataset.data[j - 1],
                    temp_dataset.data[j + 1],
                    250,
                    'upper'
                );
            } else if (temp_dataset.data[j].y < 180) {
                // temp_dataset.data[j].y = 180;
                temp_dataset.data[j] = fixBoundaryPoints(
                    temp_dataset.data[j],
                    temp_dataset.data[j - 1],
                    temp_dataset.data[j + 1],
                    180,
                    'lower'
                );
            }
        }
        if ((temp_dataset.label == '05th Percentile') || (temp_dataset.label == '75th Percentile')) {
            temp_dataset.fill = {
                target: '+1',
                below: high_orange_outer
            }
        } else if ((temp_dataset.label == '25th Percentile') || (temp_dataset.label == 'Median')) {
            temp_dataset.fill = {
                target: '+1',
                below: high_orange_inner
            }
        }
        temp_dataset.border_upper_bound = 250;
        temp_dataset.border_lower_bound = 180;
        highs.push(cloneDeep(temp_dataset))
    }

    const targets = [] as DataSet[]
    for (let i = 0; i < datasets.length; ++i) {
        const temp_dataset = cloneDeep(datasets[i]);
        // console.log(temp_dataset)
        for (let j = 0; j < temp_dataset.data.length; ++j) {
            if (temp_dataset.data[j].y > 180) {
                // temp_dataset.data[j].y = 180; 
                temp_dataset.data[j] = fixBoundaryPoints(
                    temp_dataset.data[j],
                    temp_dataset.data[j - 1],
                    temp_dataset.data[j + 1],
                    180,
                    'upper'
                );
            } else if (temp_dataset.data[j].y < 70) {
                // temp_dataset.data[j].y = 70;
                temp_dataset.data[j] = fixBoundaryPoints(
                    temp_dataset.data[j],
                    temp_dataset.data[j - 1],
                    temp_dataset.data[j + 1],
                    70,
                    'lower'
                );
            }
        }
        if ((temp_dataset.label == '05th Percentile') || (temp_dataset.label == '75th Percentile')) {
            temp_dataset.fill = {
                target: '+1',
                below: target_green_outer
            }
        } else if ((temp_dataset.label == '25th Percentile') || (temp_dataset.label == 'Median')) {
            temp_dataset.fill = {
                target: '+1',
                below: target_green_inner
            }
        }
        temp_dataset.border_upper_bound = 180;
        temp_dataset.border_lower_bound = 70;
        targets.push(cloneDeep(temp_dataset))
    }

    const lows = [] as DataSet[]
    for (let i = 0; i < datasets.length; ++i) {
        const temp_dataset = cloneDeep(datasets[i]);
        // console.log(temp_dataset)
        for (let j = 0; j < temp_dataset.data.length; ++j) {
            if (temp_dataset.data[j].y > 70) {
                // temp_dataset.data[j].y = 70; 
                temp_dataset.data[j] = fixBoundaryPoints(
                    temp_dataset.data[j],
                    temp_dataset.data[j - 1],
                    temp_dataset.data[j + 1],
                    70,
                    'upper'
                );
            } else if (temp_dataset.data[j].y < 54) {
                // temp_dataset.data[j].y = 54;
                temp_dataset.data[j] = fixBoundaryPoints(
                    temp_dataset.data[j],
                    temp_dataset.data[j - 1],
                    temp_dataset.data[j + 1],
                    54,
                    'lower'
                );
            }
        }
        if ((temp_dataset.label == '05th Percentile') || (temp_dataset.label == '75th Percentile')) {
            temp_dataset.fill = {
                target: '+1',
                below: low_red_outer
            }
        } else if ((temp_dataset.label == '25th Percentile') || (temp_dataset.label == 'Median')) {
            temp_dataset.fill = {
                target: '+1',
                below: low_red_inner
            }
        }
        temp_dataset.border_upper_bound = 70;
        temp_dataset.border_lower_bound = 54;
        lows.push(cloneDeep(temp_dataset))
    }

    const vlows = [] as DataSet[]
    for (let i = 0; i < datasets.length; ++i) {
        const temp_dataset = cloneDeep(datasets[i]);
        // console.log(temp_dataset)
        for (let j = 0; j < temp_dataset.data.length; ++j) {
            if (temp_dataset.data[j].y > 54) {
                // temp_dataset.data[j].y = 54; 
                temp_dataset.data[j] = fixBoundaryPoints(
                    temp_dataset.data[j],
                    temp_dataset.data[j - 1],
                    temp_dataset.data[j + 1],
                    54,
                    'upper'
                );
            }
        }
        if ((temp_dataset.label == '05th Percentile') || (temp_dataset.label == '75th Percentile')) {
            temp_dataset.fill = {
                target: '+1',
                below: vlow_red_outer
            }
        } else if ((temp_dataset.label == '25th Percentile') || (temp_dataset.label == 'Median')) {
            temp_dataset.fill = {
                target: '+1',
                below: vlow_red_inner
            }
        }
        temp_dataset.border_upper_bound = 54;
        vlows.push(cloneDeep(temp_dataset))
    }
    const return_datasets = ([] as DataSet[]).concat(vhighs, highs, targets, lows, vlows)
    for (const temp_dataset of return_datasets) {
        temp_dataset.borderColor = 'rgb(0,0,0,0)'
    }
    return return_datasets
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// push change in data to the graph and update
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function areaChartModifier(chart: any, datasets: DataSet[]) {
    const colorized_data = splitAndColorize(datasets);
    const breakpoints = [54, 70, 180, 250]
    // const breakpoint_line = (ctx:any, value:string) => breakpoints.includes(ctx.p0.parsed.y) && breakpoints.includes(ctx.p1.parsed.y) && ctx.p0.parsed.y == ctx.p1.parsed.y ? value : undefined;
    // const breakpoint_line = (ctx, value) => breakpoints.includes(ctx.p0.parsed.y) || breakpoints.includes(ctx.p1.parsed.y) ? value : undefined;
    const breakpoint_line = (function (ctx: any, value: string) {
        let includes_ctx_p0_parsed_y = false;
        let includes_ctx_p1_parsed_y = false;
        for (let i = 0; i < breakpoints.length; i++) {
            if (breakpoints[i] == ctx.p0.parsed.y) {
                includes_ctx_p0_parsed_y = true;
            } else if (breakpoints[i] == ctx.p1.parsed.y) {
                includes_ctx_p1_parsed_y = true;
            }
        }

        return includes_ctx_p0_parsed_y && includes_ctx_p1_parsed_y && ctx.p0.parsed.y == ctx.p1.parsed.y ? value : undefined;
    });

    console.log(colorized_data);
    chart.data.datasets = [];
    // chart.data.datasets = [SUBJECT_GLUCOSE_CHART_DATASET_DEFAULTS.max_normal_range,
    //                        SUBJECT_GLUCOSE_CHART_DATASET_DEFAULTS.min_normal_range]
    //                       .concat(data);
    // this is gross but it should be consistent
    // fillspan = -(data.length-1)
    chart.data.datasets = colorized_data;
    for (let i = 0; i < chart.data.datasets.length; ++i) {
        const d = chart.data.datasets[i];
        // fill 
        // if (i > 2) {
        //     d.fill = "-1";
        // }
        // Dashed lines
        if ((d.label == '05th Percentile') || (d.label == '95th Percentile')) {
            d.borderDash = [2, 2];
            d.borderWidth = 1;
        }
        // Solid lines
        if ((d.label == '25th Percentile') || (d.label == '75th Percentile')) {
            d.borderWidth = 1;
        }
        // Bold line
        if (d.label == 'Median') {
            d.borderWidth = 2;
        }

        // Black border color
        if ((d.label == '05th Percentile') || (d.label == '25th Percentile') || (d.label == 'Median') || (d.label == '75th Percentile') || (d.label == '95th Percentile')) {
            d.borderColor = 'black';
            d.segment = { borderColor: (ctx: any) => breakpoint_line(ctx, 'rgb(0,0,0,0)') };
            d.order = 2;
        }

    }
    // chart.data.datasets[chart.data.datasets.length-1].fill = `${fillspan}`;
    // console.log(chart.data.datasets);
    chart.update();
}

export function recModifier(datasets: DataSet[]) {
    const newDatasets = cloneDeep(datasets)
    for (const d of newDatasets) {
        d.borderWidth = 1
        if (d.label?.includes('Trace')) {
            d.borderColor = 'black'
        } else {
            d.borderColor = 'rgba(0,0,0,0)'
        }

        if (d.label?.includes('RecUpper')) {
            d.fill = {
                target: '-1',
                below: 'rgba(90,90,90,0.5)'
            }
        }
    }
    return newDatasets
}

export function traceModifier(datasets: DataSet[], trace?: string) {
    const newDatasets = cloneDeep(datasets)
    for (const d of newDatasets) {
        if (d.label?.includes('Trace')) {
            d.borderColor = 'black'
            if (typeof(trace) !== 'undefined') { d.borderColor = trace }
            if ((d.label.includes('05th')) || (d.label.includes('95th'))) {
                d.borderDash = [2, 2]
                d.borderWidth = 1
            }
            // Solid lines
            if ((d.label.includes('25th')) || (d.label.includes('75th'))) {
                d.borderWidth = 1
            }
            // Bold line
            if (d.label.includes('Median')) {
                d.borderWidth = 2
            }
        }
    }
    return newDatasets
}

export function generalColorizer(datasets: DataSet[], innerColor?: string, outerColor?: string) {
    const newDatasets = cloneDeep(datasets)
    const outer = typeof(outerColor) !== 'undefined' ? outerColor : 'rgba(61, 173, 217, 0.7)'
    const inner = typeof(innerColor) !== 'undefined' ? innerColor : 'rgba(44, 93, 133, 0.7)'
    for (const d of newDatasets) {
        d.borderColor = 'rgb(0,0,0,0)'
        if (d.label?.includes('95th') || d.label?.includes('25th')) {
            d.fill = {
                target: '-1',
                above: outer
            }
        }
        if (d.label?.includes('75th')) {
            d.fill = {
                target: '-2',
                above: inner
            }
        }
    }
    return newDatasets
}

export function insDatasetModifier(datasets: DataSet[]) {
    const newDatasets = cloneDeep(datasets)
    for (const d of newDatasets) {
        if (d.label?.includes('Trace')) {
            d.borderColor = 'black'
            if ((d.label.includes('05th')) || (d.label.includes('95th'))) {
                d.borderDash = [2, 2];
                d.borderWidth = 1;
            }
            // Solid lines
            if ((d.label.includes('25th')) || (d.label.includes('75th'))) {
                d.borderWidth = 1;
            }
            // Bold line
            if (d.label.includes('Median')) {
                d.borderWidth = 2;
            }

            // Black border color
            // if ((d.label == '05th Percentile') || (d.label == '25th Percentile') || (d.label == 'Median') || (d.label == '75th Percentile') || (d.label == '95th Percentile')) {
            //     d.borderColor = 'black';
            //     d.segment = { borderColor: (ctx:any) => breakpoint_line(ctx, 'rgb(0,0,0,0)') };
            //     d.order = 2;
            // }
        }
        else {
            d.borderColor = 'rgb(0,0,0,0)'
            if (d.label?.includes('95th') || d.label?.includes('25th')) {
                d.fill = {
                    target: '-1',
                    above: 'rgba(61, 173, 217, 0.7)'
                    // 'rgba(61, 173, 217, 0.2)'
                    // 'rgba(44, 117, 133, 0.5)''
                }
            }
            if (d.label?.includes('75th')) {
                d.fill = {
                    target: '-2',
                    above: 'rgba(44, 93, 133, 0.7)'
                    // 'rgba(61, 173, 217, 0.2)'
                    // 'rgba(44, 117, 133, 0.5)''
                }
            }

        }
    }
    return newDatasets
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// just a helper function that slices datasets - integer arguments, same as json ".slice(start, end)"
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function sliceChartDataset(datasets, slice_start, slice_end) {
//     new_datasets = []
//     for (const dataset of datasets) {
//         var new_dataset = cloneDeep(dataset);
//         new_dataset.data = new_dataset.data.slice(slice_start, slice_end);
//         new_datasets.push(new_dataset);
//     }
//     // chart.data.datasets[chart.data.datasets.length-1].fill = `${fillspan}`;
//     // console.log(chart.data.datasets);

//     return new_datasets;
// }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// generate chart.js-specific object that defines graph
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function genChartDataset(data: number[], label: string, nanBound?: number) {
    const timeVec_5min = timeGenerator(5, data.length);
    let realNaNBound = 0
    if (typeof nanBound !== 'undefined') {
        // console.log(nanBound)
        realNaNBound = nanBound
    }
    const time_aligned_data = timeDataProc(data, timeVec_5min, realNaNBound);
    // always going to plot percentiles    
    const dataset = {} as DataSet
    // if (label == 'Median') {
    //     dataset.borderColor = drp1_trace_color
    //     dataset.backgroundColor = drp1_trace_color
    // }
    dataset.label = label;
    dataset.fill = false;
    // if (arguments.length >= 3) {
    //     dataset.fill = '-2';
    // }

    dataset.cubicInterpolationMode = 'monotone';
    dataset.tension = 0.4;

    dataset.data = time_aligned_data;
    return dataset;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Generate time series data from an array of data and an array of times.
// returns array of objects that chart.js understands, namely
//  {x: val, y: val}
// valN is the "no data" value
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function timeDataProc(data: number[], timeVec: Date[], valN: number) {
    const dataV = [] as Point[];
    for (let i = 0; i < data.length; i++) {
        let dataAux = {} as Point
        if (data[i] == valN) {
            dataAux = {
                x: timeVec[i],
                y: NaN
            }
        } else {
            dataAux = {
                x: timeVec[i],
                y: data[i]
            }
        }
        dataV.push(dataAux);

    }
    return dataV;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Generates a 24-hour vector with x-min sampling time 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export function timeGenerator(samplingTime: number, tLength: number) {
    const timePivot = new Date(2019, 0, 1, 0, 0, 0, 0);
    const timeVec = [timePivot];

    for (let i = 0; i < tLength; i++) {
        const timePivotMod = new Date(timePivot.getTime() + (i + 1) * samplingTime * 60000);
        timeVec.push(timePivotMod);
    }
    return timeVec
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Generates and returns a Quantile line graph 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// export function createQuantChart(location: any, datasets: any) {
//     console.log("Creating quant chart...");
//     const quantile_container = document.getElementById("areaQuantile");
//     let tick_div = 2;
//     if (location == quantile_container) {
//         tick_div = 6;
//     }

//     let full_datasets = [] as DataSet[]
//     full_datasets = [SUBJECT_GLUCOSE_CHART_DATASET_DEFAULTS.max_normal_range,
//     SUBJECT_GLUCOSE_CHART_DATASET_DEFAULTS.min_normal_range];
//     if (datasets != null) {
//         const colorized_data = splitAndColorize(datasets);
//         full_datasets = colorized_data.concat(full_datasets);
//     }


//     const myChart = new Chart(location, {
//         type: 'line',
//         data: {
//             datasets: [] //full_datasets

//             // [{
//             //     label: "Sales",
//             //     data: [{
//             //         x: new Date(2010, 0, 1, 0, 0, 0, 0),
//             //         y: 80.0
//             //     }, {
//             //         x: new Date(2010, 0, 2, 0, 0, 0, 0),
//             //         y: 80.0
//             //     }],
//             //     backgroundColor: 'blue',
//             //     spanGaps: false,
//             //     borderColor: 'rgba(117,219,153,1)',
//             //     type: 'line',
//             //     fill: false,
//             //     order: 0,
//             //   },
//             //   {
//             //     label: "Profit",
//             //     data: [{
//             //         x: new Date(2020, 0, 1, 0, 0, 0, 0),
//             //         y: 100.0
//             //     }, {
//             //         x: new Date(2020, 0, 2, 0, 0, 0, 0),
//             //         y: 100.0
//             //     }],
//             //     backgroundColor: 'red',
//             //     spanGaps: false,
//             //     borderColor: 'rgba(117,219,153,1)',
//             //     type: 'line',
//             //     fill: false,
//             //     order: 0,
//             //   }] 
//         },
//         options: {
//             animation: false,
//             responsive: true,
//             scales: {
//                 x: {
//                     type: 'time',
//                     time: {
//                         unit: 'hour'
//                     },

//                     ticks: {
//                         autoSkip: false,
//                         align: 'inner',
//                         color: 'black',
//                         maxRotation: 0,
//                         minRotation: 0,
//                         font: function (context: any) {
//                             const height = context.chart.height;
//                             if (height < 300) {
//                                 const size = Math.round(height / 20);
//                                 return {
//                                     weight: 'bold',
//                                     size: size,
//                                 }
//                             }
//                             return {
//                                 weight: 'bold',
//                                 size: 14,
//                             }
//                         },
//                         callback: function (item: string | number, index: number, ticks: any) {
//                             if (index % tick_div == 0) {
//                                 return item;
//                             }
//                             return "";
//                         },
//                         ///tickLength: 16,
//                         // afterFit: (scale) => {
//                         //     scale.paddingRight = 3 // seems to be valid value - ChartJS has it hard-coded to 3 for left padding
//                         //     scale._labelItems = scale._computeLabelItems(scale.chart.chartArea) // this is important - to recalculate label positions.
//                         //   },


//                     },
//                     grid: {
//                         display: true,
//                         drawOnChartArea: false,
//                     },
//                 },
//                 y: {
//                     beginAtZero: true,
//                     max: 400,
//                     grid: {
//                         display: true,
//                         ///drawBorder: false,  
//                         color: (context: any) => {
//                             if ((context.tick.value == 70) || (context.tick.value == 180)) {
//                                 return '#47ce76'
//                             } else {
//                                 return 'rgba(0, 0, 0, 0.1)'
//                             }
//                         },
//                         lineWidth: (context: any) => {
//                             if ((context.tick.value == 70) || (context.tick.value == 180)) {
//                                 return 3
//                             } else {
//                                 return 1
//                             }
//                         }
//                     },
//                     ticks: {
//                         color: 'black',
//                         font: function (context: any) {
//                             const height = context.chart.height;
//                             if (height < 300) {
//                                 const size = Math.round(height / 20);
//                                 return {
//                                     weight: 'bold',
//                                     size: size,
//                                 }
//                             }
//                             return {
//                                 weight: 'bold',
//                                 size: 14,
//                             }
//                         },
//                         stepSize: 1,
//                         autoSkip: true,
//                         callback: function (item: string | number, index: number, ticks: any) {
//                             if ((index == 54) || (index == 70) || (index == 180) || (index == 250) || (index == 350)) {
//                                 return item + ' ';
//                             }
//                             // else if (index == 350) {
//                             //     return item + ' mg/dL '
//                             // }

//                         }
//                     },
//                 }
//             },
//             plugins: {
//                 legend: {
//                     display: false,
//                     position: 'top',
//                 },
//                 tooltip: {
//                     enabled: false,
//                     // mode: 'nearest',
//                     // interset: false,
//                     // position: 'nearest',
//                     // callbacks: {
//                     //     title: function(context) {
//                     //         context[0].label = '';
//                     //         return context[0].label;
//                     //     },
//                     //     label: function(context) {
//                     //         let label = context.dataset.label || '';
//                     //         if (label) {
//                     //             label += ': ';
//                     //         }
//                     //         if (context.parsed.y !== null) {
//                     //             label += Math.round(new Intl.NumberFormat('en-US').format(context.parsed.y));
//                     //             label += ' mg/dL';
//                     //         }
//                     //         return label;
//                     //     }
//                     // }
//                 },
//             },
//             maintainAspectRatio: false,
//             elements: {
//                 point: {
//                     radius: 0
//                 }
//             }
//         }
//     });

//     return myChart;
// }