import * as d3 from 'd3';
import _ from 'lodash';
import chinaData from './geo/chinaGeo';
import worldData from './geo/worldGeo';
import usStateData from './geo/usStateGeo';
//验证是否是中文
var pattern = new RegExp("[\u4E00-\u9FA5]+");


const getData = (rawData, encoding) => {
    let obj = {
        isEN: true
    }
    let values = [];
    for (let i = 0; i < rawData.length; i++) {
        if (encoding.color) { //有数值
            if (i === 0) {  //一次就可以判断出中英文
                if (pattern.test(rawData[i][encoding.area.field])) { //中文
                    obj.isEN = false
                }
            }
            if(rawData[i][encoding.area.field] in values) {
                // values[rawData[i][encoding.area.field]] += parseInt(rawData[i][encoding.color.field]) //索引号为各省的名称
                values[rawData[i][encoding.area.field]].push( parseInt(rawData[i][encoding.color.field])) //索引号为各省的名称
            } else {
                values[rawData[i][encoding.area.field]] = [parseInt(rawData[i][encoding.color.field])]//索引号为各省的名称
            }
        } else { //只有国家，没有数值（0）
            values[rawData[i][encoding.area.field]] = 0
        }
    }
    if (encoding.color.field ===  "COUNT") {
        for(const key in values) {
            values[key] = values[key].length
        }
    }
    else if (encoding.color) {
        if(encoding.color.aggregation === 'sum') {
            for(const key in values) {
                values[key] = _.sum(values[key])
            }
        } else if (encoding.color.aggregation === 'avg') {
            for(const key in values) {
                values[key] = Math.round(_.mean(values[key]))
            }
        } else if (encoding.color.aggregation === 'min') {
            for(const key in values) {
                values[key] = _.min(values[key])
            }
        } else { // max none
            for(const key in values) {
                values[key] = _.max(values[key])
            }
        } 
    }
    
    // console.log(values)
    obj.values = values;
    return obj
}


const getMapType = (rawData, encoding) => {
    if (!encoding.area) return null;

    let firstColumnValue = rawData[0][encoding.area.field];
    //console.log("rawData[0]",encoding.area.field,firstColumnValue,rawData[0])
    if (pattern.test(firstColumnValue)) { //中文
        if (isInChinaMap(firstColumnValue, 0)) { //0表示匹配name字段对应国家数值
            return "ChinaMap"
        } else if (isInWorldMap(firstColumnValue, 0)) {
            return "WorldMap"
        }
    } else { //英文
        if (isInChinaMap(firstColumnValue, 1)) { //1表示匹配enName字段对应国家数值
            return "ChinaMap"
        } else if (isInWorldMap(firstColumnValue, 1)) {
            return "WorldMap"
        } else if (isInUsStateMap(firstColumnValue)) {
            return "USMap"
        }
    }
    return null
}
const isInChinaMap = (value, language) => {
    let chinaCountryNameList = chinaData.features;
    if (language === 0) {
        for (let i = 0; i < chinaCountryNameList.length; i++) {
            if (value !== chinaCountryNameList[i].properties.name) {
                continue;
            }
            //匹配到
            return true;
        }
        return false;
    } else if (language === 1) {
        for (let i = 0; i < chinaCountryNameList.length; i++) {
            if (value !== chinaCountryNameList[i].properties.enName) {
                continue;
            }
            //匹配到
            //console.log("匹配到...")
            return true;
        }
        return false
    }
}

const isInWorldMap = (value, language) => {
    let worldCountryNameList = worldData.features;
    if (language === 0) {
        for (let i = 0; i < worldCountryNameList.length; i++) {
            if (value !== worldCountryNameList[i].properties.name) {
                continue;
            }
            //匹配到
            return true;
        }
        return false;
    } else if (language === 1) {
        for (let i = 0; i < worldCountryNameList.length; i++) {
            if (value !== worldCountryNameList[i].properties.enName) {
                //console.log("value", value, worldCountryNameList[i].properties.enName)
                continue;
            }
            //匹配到
            //console.log("匹配到...")
            return true;
        }
        //console.log("isInWorldMap    NOT.....")
        return false;
    }

}
const isInUsStateMap = (value) => {
    let usStateNameList = usStateData.features;
    for (let i = 0; i < usStateNameList.length; i++) {
        if (value !== usStateNameList[i].properties.name) {
            //console.log("value", value, usStateNameList[i].properties.name)
            continue;
        }
        //匹配到
        //console.log("匹配到...")
        return true;
    }
    //console.log("isInUSMap    NOT.....")
    return false;

}
const getCategories = (rawData, encoding) => {
    let dataCategories = {}
    for (let i = 0; i < rawData.length; i++) {
        if (dataCategories[rawData[i][encoding.x.field]]) {
            dataCategories[rawData[i][encoding.x.field]].push(rawData[i]);
        }
        else {
            dataCategories[rawData[i][encoding.x.field]] = [rawData[i]];
        }
    }
    return dataCategories;
}

const getSeries = (rawData, encoding) => {
    let dataSeries = {}
    for (let i = 0; i < rawData.length; i++) {
        if (dataSeries[rawData[i][encoding.color.field]]) {
            dataSeries[rawData[i][encoding.color.field]].push(rawData[i]);
        }
        else {
            dataSeries[rawData[i][encoding.color.field]] = [rawData[i]];
        }
    }
    return dataSeries;
}
const getSeriesValue = (rawData, encoding) => {
    if (('color' in encoding) && !_.isEmpty(encoding.color)) {
        return Array.from(new Set(rawData.map(d => d[encoding.color.field])));
    }
    else return [];
}

const getAreaData = (rawData, encoding) => {
    if (!('area' in encoding)) {
        return []
    }

    let areaData = {}
    for (let i = 0; i < rawData.length; i++) {
        if (areaData[rawData[i][encoding.area.field]]) {
            areaData[rawData[i][encoding.area.field]].push(rawData[i]);
        }
        else {
            areaData[rawData[i][encoding.color.field]] = [rawData[i]];
        }
    }
    return areaData;

}

const getStackedData = (rawData, encoding) => {
    if (!('color' in encoding)) {
        return []
    }
    let dataCategories = getCategories(rawData, encoding);
    let categories = Object.keys(dataCategories);
    let dataSeries = getSeries(rawData, encoding);
    let series = Object.keys(dataSeries);
    let dataSeriesCategories = {};
    for (const s in dataSeries) {
        dataSeriesCategories[s] = {};
        dataSeries[s] = getAggregatedRows(dataSeries[s], encoding);
        for (let index = 0; index < dataSeries[s].length; index++) {
            const rowData = dataSeries[s][index];
            dataSeriesCategories[s][rowData[encoding.x.field]] = rowData[encoding.y.field]
        }
    }

    let preparedData = series.map((s) => {
        let sData = [];
        categories.forEach(c => {
            sData.push({
                x: c,
                y: dataSeriesCategories[s][c] ? dataSeriesCategories[s][c] : 0,
                y0: 0,
            })
        });
        return sData;
    })
    let reducedData = preparedData[0].map((d) => {
        let z = { x: d.x };
        z[series[0]] = d.y;
        return z;
    });
    for (let i = 1; i < preparedData.length; i++) {
        let s = series[i]
        for (let j = 0; j < categories.length; j++) {
            // const element = array[index];
            reducedData[j][s] = preparedData[i][j].y
        }

    }
    let stackedData = d3.stack().keys(series)(reducedData);
    return stackedData;

}
const getMinRows = (rawData, encoding) => {
    let calculateData = d3.nest().key(d => d[encoding.x.field]).entries(rawData);
    let data = calculateData.map(function (d) {
        let index = d3.scan(d.values, function (a, b) {
            if (a[encoding.y.field] && b[encoding.y.field])
                return a[encoding.y.field] - b[encoding.y.field];
        });
        if (index >= 0) return d.values[index]
        // index === 'undefined'
        else {
            return d.values[0]
        }
    });
    return data;
}

const getMaxRows = (rawData, encoding) => {
    let calculateData = d3.nest().key(d => d[encoding.x.field]).entries(rawData);
    let data = calculateData.map(function (d, i) {
        let index = d3.scan(d.values, function (a, b) {
            if (a[encoding.y.field] && b[encoding.y.field])
                return b[encoding.y.field] - a[encoding.y.field];
        });
        if (index >= 0) return d.values[index]
        // index === 'undefined'
        else {
            return d.values[0];
        }
    });
    return data;
}

const getSumRows = (rawData, encoding) => {
    let calculateData = d3.nest().key(d => d[encoding.x.field]).entries(rawData);
    let sumData = new Array(calculateData.length).fill(0);
    let data = calculateData.map(function (d, i) {
        d.values.forEach(d => {
            sumData[i] += d[encoding.y.field]
        })
        let sumRows = Object.assign({}, d.values[0])
        sumRows[encoding.y.field] = sumData[i]
        return sumRows
    });
    return data;
}

const getAverageRows = (rawData, encoding) => {
    let calculateData = d3.nest().key(d => d[encoding.x.field]).entries(rawData);
    let sumData = new Array(calculateData.length).fill(0);
    let data = calculateData.map(function (d, i) {
        d.values.forEach(d => {
            sumData[i] += d[encoding.y.field]
        })
        let sumRows = Object.assign({}, d.values[0])
        sumRows[encoding.y.field] = sumData[i] / d.values.length;
        return sumRows;
    });
    return data;
}

const getAggregatedRows = (rawData, encoding) => {
    let data;
    switch (encoding.y.aggregation) {
        case 'sum':
            data = getSumRows(rawData, encoding);
            break;
        case 'average':
            data = getAverageRows(rawData, encoding);
            break;
        case 'max':
            data = getMaxRows(rawData, encoding);
            break;
        case 'min':
            data = getMinRows(rawData, encoding);
            break;

        default:
            data = getMaxRows(rawData, encoding);
            break;
    }
    return data;
}

export { getCategories, getSeries, getAreaData, getStackedData, getAggregatedRows, getMaxRows, getSeriesValue, getData, getMapType }