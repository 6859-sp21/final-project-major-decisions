// data unavailable for all zero
const names = ["Envoy Air", "Spirit Air Lines","PSA Airlines Inc."
,"SkyWest Airlines Inc."
,"United Air Lines Inc."
, "Southwest Airlines Co."
,"Mesa Airlines Inc."
,"Republic Airline"
, "Endeavor Air Inc."
, "American Airlines Inc."
, "Alaska Airlines Inc."
, "JetBlue Airways"
, "Delta Air Lines Inc."
, "ExpressJet Airlines Inc."
, "Frontier Airlines Inc."
, "Allegiant Air"
, "Hawaiian Airlines Inc."
, "ExpressJet Airlines LLC"
, "Horizon Air", "Virgin America"] // 20 names in total, some has nun 
const colorScaleBar = d3.scaleOrdinal(d3v4.schemeCategory20).domain(names);
const marginBarGraph = ({top: 50, right: 60, bottom: 6, left: 0});
const barSize = 36;

let SELECTED_YEAR = 2016
let IS_AUTOPLAY = true;
let SELECTED_AIRLINES = new Set(); // remove it after
let IS_PERCENT = false;
let IS_CUSTOMIZABLE = false;
let DATA =[];

function produceCarrierAnnualMapPercentDelayed(data, isCustomizable, selectedCarriers = SELECTED_AIRLINES) {
    const carrierMap= generateMap(d3.groups(data, d=>d.carrier_name));
    return carrierMap;
    // from an array of objects like this: 0: {year: "2017", month: "8", carrier: "B6", carrier_name: "JetBlue Airways", airport: "PSE", …}
    // To [delay_flights, total_flights]
    function sumFlightsFromArrayOfObject(entryList) {
        let delay_flights = 0;
        let total_flights = 0;
        for (const entry of entryList) {
            
            delay_flights = delay_flights + nonNaNParseFloat(entry.arr_del15);
            total_flights = total_flights + nonNaNParseFloat(entry.arr_flights);
        }
        const result = (delay_flights/total_flights)*100;
        return result;
    }

    function generateMap(carrierList) {
        let generateMap = new Map();
        for (const [carrier, carrier_data] of carrierList) {
            // only add if it is included in filter or is the default map which should includes everything
            if ((SELECTED_AIRLINES.has(carrier) && IS_CUSTOMIZABLE) || !IS_CUSTOMIZABLE){
                generateMap.set(carrier, sumFlightsFromArrayOfObject(carrier_data));
            }
        }
        return generateMap;
    }
}

function produceCarrierAnnualMapAveMin(data, isCustomizable = false, selectedCarriers = SELECTED_AIRLINES) {
    const carrierMap= generateMap(d3.groups(data, d=>d.carrier_name));
    return carrierMap;
    // from an array of objects like this: 0: {year: "2017", month: "8", carrier: "B6", carrier_name: "JetBlue Airways", airport: "PSE", …}
    // To [delay_flights_total_min, total_flights]
    function sumFlightsFromArrayOfObject(entryList) {
        let delay_flights = 0;
        let total_flights = 0;
        for (const entry of entryList) {
            delay_flights = delay_flights + nonNaNParseFloat(entry.arr_delay);
            total_flights = total_flights + nonNaNParseFloat(entry.arr_flights);
        }
        const result = (delay_flights/total_flights);
        return result;
    }

    function generateMap(carrierList) {
        let generateMap = new Map();
        for (const [carrier, carrier_data] of carrierList) {
            if ((SELECTED_AIRLINES.has(carrier) && IS_CUSTOMIZABLE) || !IS_CUSTOMIZABLE) {
                generateMap.set(carrier, sumFlightsFromArrayOfObject(carrier_data));
            }
        }
        return generateMap;
    }
}

// provided key frames for animation and static bar charts, one frame per year
// data is the intial raw data
function processKeyFrames(data, isPercent = true, isCustomizable = false){
    // ========================== data processing ================================
    const n= 5;
    const yearMap = d3.groups(data, d=>d.year).map(([year, data])=>[createDate(year), data]);
    let datevalues = []
    if (IS_PERCENT) {
        datevalues = yearMap.map(([year, data]) =>
        [year,produceCarrierAnnualMapPercentDelayed(data)]).sort(
            (a,b) => {return a[0].getFullYear()-b[0].getFullYear()});
    } else {
        datevalues = yearMap.map(([year, data]) =>
        [year,produceCarrierAnnualMapAveMin(data)]).sort(
            (a,b) => {return a[0].getFullYear()-b[0].getFullYear()});
    }
    // ======================== keyframes ==================================
    function rank(value) {
        if (!IS_CUSTOMIZABLE) {
            const data = Array.from(names, name => ({name, value: value(name)}));
            data.sort((a, b) => d3.descending(a.value, b.value));
            for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
            return data;
        } else { // not custamizable
            const data = Array.from(SELECTED_AIRLINES, name => ({name, value: value(name)}));
            data.sort((a, b) => d3.descending(a.value, b.value));
            for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(SELECTED_AIRLINES.size, i);
            return data;
        }
    }

    let keyframes = [];
    const k = 1;
    const fillerValue = 0; // the value we fill NaN with
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
        const t = i / k;
        keyframes.push([
            new Date(ka * (1 - t) + kb * t),
            rank(name => (a.get(name) || fillerValue) * (1 - t) + (b.get(name) || fillerValue) * t)
        ]);
        }
    }

    keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]); // one frame per year
    console.log(keyframes);
    return keyframes;

}

async function createCarrierRankBarAveMin(data) {
    d3.selectAll('dynamic-bar-content').remove();
    IS_AUTOPLAY = true;
    const n = IS_CUSTOMIZABLE ? SELECTED_AIRLINES.size : 5;
    const keyframes = processKeyFrames(data, false);
    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
    const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));

    // ============================== drawing functions ========================
    const xAxisMax = 30; //??
    function bars(svg) {
        let bar = svg.append("g")
            .attr("fill-opacity", 0.8)
            .selectAll("rect");

        return ([date, data], transition) => bar = bar
            .data(data.slice(0, n), d => d.name)
            .join(
            enter => enter.append("rect")
                .attr("fill", d => colorScaleBar(d.name))
                .attr("height", y.bandwidth())
                .attr("x", x(0))
                .attr("y", d => y((prev.get(d) || d).rank))
                .attr("width", d => x((prev.get(d) || d).value) - x(0)),
             
            update => update,
            exit => exit.transition(transition).remove()
                .attr("y", d => y((next.get(d) || d).rank))
                .attr("width", d => x((next.get(d) || d).value) - x(0))
            )
            .call(bar => bar.transition(transition)
            .attr("y", d => y(d.rank))
            .attr("width", d => x(d.value) - x(0)));
    }

    function labels(svg) {
        let label = svg.append("g")
            .style("font", "bold 12px var(--sans-serif)")
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "start")
            .style('font-size', "13px")

          .selectAll("text");
      
        return ([date, data], transition) => label = label
          .data(data.slice(0, n), d => d.name)
          .join(
            enter => enter.append("text")
              .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
              .attr("y", y.bandwidth() / 2)
              .attr("x", 5)
              .attr("dy", "-0.25em")
              .text(d => d.name)
              .call(text => text.append("tspan")
                .attr("fill-opacity", 0.7)
                .attr("x", 5)
                .attr("dy", "1.15em")),
            update => update,
            exit => exit.transition(transition).remove()
              .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
              .call(g => g.select("tspan").tween("text", d => textTweenMin(d.value, (next.get(d) || d).value)))
          )
          .call(bar => bar.transition(transition)
            .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
            .call(g => g.select("tspan").tween("text", d => textTweenMin((prev.get(d) || d).value, d.value)))
            )
    }

    function axis(svg) {
        const g = svg.append("g")
            .attr("transform", `translate(0,${marginBarGraph.top})`);

        const axis = d3.axisTop(x)
            .ticks(width / 160)
            .tickSizeOuter(0)
            .tickSizeInner(-barSize * (n + y.padding()));

        return (_, transition) => {
            g.transition(transition).call(axis);
            g.select(".tick:first-of-type text").remove();
            g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
            g.select(".domain").remove();
        };
    }

    function ticker(svg) {
        formatDate = d3.utcFormat("%Y")
        const now = svg.append("text")
            .attr('class', 'ticker-text')
            .style("font", `bold ${barSize}px var(--sans-serif)`)
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "end")
            .style('font-size', "30px")
            .attr("x", width - 80)
            .attr("y", marginBarGraph.top + barSize * (n - 0.45))
            // .attr("dy", "0.32em")
            .text(formatDate(keyframes[0][0]));
      
        return ([date], transition) => {
          transition.end().then(() => now.text(formatDate(date)));
        };
      }

    // ================== final step drawing the graphs ====================
    let duration = 1000;
    const height = marginBarGraph.top + barSize * n + marginBarGraph.bottom;
    const width = 700;

    let x = d3.scaleLinear([0, xAxisMax], [marginBarGraph.left, width - marginBarGraph.right])
    let y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([marginBarGraph.top, marginBarGraph.top + barSize * (n + 1 + 0.1)])
    .padding(0.1) 

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]) // changes here 
    .attr("class", "dynamic-bar-content dynamic-bar")
    .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    svg.append('g').attr('class','dynamic-bar-title').append('text')
    .attr("y", 25)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .text(graphTitle())

    document.getElementById("vis").appendChild(svg.node());

    const updateBars = bars(svg);
    const updateAxis = axis(svg);
    const updateLabels = labels(svg);
    const updateTicker = ticker(svg);

    for (const keyframe of keyframes) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);
                
        updateBars(keyframe, transition);
        updateAxis(keyframe, transition);
        updateLabels(keyframe, transition);
        updateTicker(keyframe, transition);

        await transition.end();
        await sleep(2000);
    }

}

// add when is something that is unavailable
async function createCarrierRankBarPercentDelayed(data) {
    d3.selectAll('dynamic-bar-content').remove();
    IS_AUTOPLAY = true;
    const n = IS_CUSTOMIZABLE ? SELECTED_AIRLINES.size : 5;
    const keyframes = processKeyFrames(data,true);

    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
    const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));

    const xAxisMax = 30;
    function bars(svg) {
        let bar = svg.append("g")
            .attr("fill-opacity", 0.8)
            .selectAll("rect");

        return ([date, data], transition) => bar = bar
            .data(data.slice(0, n), d => d.name)
            .join(
            enter => enter.append("rect")
                .attr("fill", d => colorScaleBar(d.name))
                .attr("height", y.bandwidth())
                .attr("x", x(0))
                .attr("y", d => y((prev.get(d) || d).rank))
                .attr("width", d => x((prev.get(d) || d).value) - x(0)),
             
            update => update,
            exit => exit.transition(transition).remove()
                .attr("y", d => y((next.get(d) || d).rank))
                .attr("width", d => x((next.get(d) || d).value) - x(0))
            )
            .call(bar => bar.transition(transition)
            .attr("y", d => y(d.rank))
            .attr("width", d => x(d.value) - x(0)));
    }

    function labels(svg) {
        let label = svg.append("g")
            .style("font", "bold 12px var(--sans-serif)")
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "start")
            .selectAll("text");
      
        return ([date, data], transition) => label = label
          .data(data.slice(0, n), d => d.name)
          .join(
            enter => enter.append("text")
              .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
              .attr("y", y.bandwidth() / 2)
              .attr("x", 5)
              .attr("dy", "-0.25em")
              .text(d => d.name)
              .style('font-size', "13px")
              .call(text => text.append("tspan")
                .attr("fill-opacity", 0.7)
                .attr("font-weight", "normal")
                .attr("x", 5)
                .attr("dy", "1.15em")),
            update => update,
            exit => exit.transition(transition).remove()
              .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
              .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
          )
          .call(bar => bar.transition(transition)
            .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
            .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value)))
            )
    }

    function axis(svg) {
        const g = svg.append("g")
            .attr("transform", `translate(0,${marginBarGraph.top})`);

        const axis = d3.axisTop(x)
            .ticks(width / 160)
            .tickSizeOuter(0)
            .tickSizeInner(-barSize * (n + y.padding()));

        return (_, transition) => {
            g.transition(transition).call(axis);
            g.select(".tick:first-of-type text").remove();
            g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
            g.select(".domain").remove();
        };
    }

    function ticker(svg) {
        formatDate = d3.utcFormat("%Y")
        const now = svg.append("text")
            .attr('class', 'ticker-text')
            .style("font", `bold ${barSize}px var(--sans-serif)`)
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "end")
            .style('font-size', "30px")
            .attr("x", width - 80)
            .attr("y", marginBarGraph.top + barSize * (n - 0.45))
            // .attr("dy", "0.32em")
            .text(formatDate(keyframes[0][0]));
      
        return ([date], transition) => {
          transition.end().then(() => now.text(formatDate(date)));
        };
      }

    // ================== final step drawing the graphs ====================
    let duration = 1000;
    const height = marginBarGraph.top + barSize * n + marginBarGraph.bottom;
    const width = 700;

    let x = d3.scaleLinear([0, xAxisMax], [marginBarGraph.left, width - marginBarGraph.right])
    let y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([marginBarGraph.top, marginBarGraph.top + barSize * (n + 1 + 0.1)])
    .padding(0.1) 

    const svg = d3.create("svg")
    // .style("height", height)  // this is the line that makes it fucked up
    .attr("viewBox", [0, 0, width, height+10])
    .attr("class", "dynamic-bar-content dynamic-bar")
    .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    svg.append('g').attr('class','dynamic-bar-title').append('text')
    .attr("y", 25)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .text(graphTitle())
    .attr("text-anchor", "middle")

    document.getElementById("vis").appendChild(svg.node());

    const updateBars = bars(svg);
    const updateAxis = axis(svg);
    const updateLabels = labels(svg);
    const updateTicker = ticker(svg);

    for (let i =0; i<keyframes.length; i++) {
        const keyframe = keyframes[i];
        const transition = svg.transition()
        .duration(duration)
        .ease(d3.easeLinear);

       updateLabels(keyframe, transition);
        updateBars(keyframe, transition);
        updateAxis(keyframe, transition);
        updateTicker(keyframe, transition);
        createSlider(2016+i);
        // updateLabels(keyframe, transition);

        await transition.end();
        await sleep(2000);
      }
}

function dateMapper([date, data]){
    const result= [parseInt(date), data];
    return result;
}

function textTween(a, b) {
    formatNumber = d3.format(".1f");

    const i = d3.interpolateNumber(a, b);
    return function(t) {
        this.textContent = formatNumber(i(t))+"%";
        if ( this.textContent === "0.0%") {
            this.textContent = "n/a";
        }
    };
}

function textTweenMin(a, b) {
    formatNumber = d3.format(".1f");

    const i = d3.interpolateNumber(a, b);
    return function(t) {
            this.textContent = formatNumber(i(t))+"min";
            if ( this.textContent === "0.0min") {
                this.textContent = "n/a";
            }
    };

}

function rank(value) {
    const data = Array.from(names, name => ({name, value: value(name)}));
    data.sort((a, b) => d3.descending(a.value, b.value));
    for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
    return data;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function graphTitle(year="") {
    let title ="";
    if (IS_CUSTOMIZABLE) {
        if (IS_PERCENT){
            title = "Percentage of flights delayed of selected airlines";
        } else {
            title = "Expected duration of delay(min) of aelected airlines";
        }
    } else {
        if (IS_PERCENT){
            title = "Top 5 airlines with highest % of flights delayed";
        } else {
            title = "Top 5 airlines with longest expected duration of delay(min)"
        }
    }

    if (IS_AUTOPLAY) {
        return title + " 2016-present";
    } else {
        return title + " in " + year;
    }
}
function createDate(year, month) {   
    const newDate = new Date(parseInt(year),1, 1);
    return newDate;
}

function nonNaNParseFloat(numberString){
    let result = parseFloat(numberString);
    if (isNaN(result)){
        return 0;
    } else {
        return result;
    }
}

function createAveMinBarGroup(data){
    SELECTED_AIRLINES = new Set();
    DATA = data;
    IS_PERCENT = false;
    IS_CUSTOMIZABLE = false;
    createSlider();
    createStaticBarAveMin();
    createAutoplayButton();
    d3.selectAll('.replay-button').on('click', () => autoPlay(data));
    for (const carrier of names) {
        d3.select(getClassMapping(carrier)).style('border-color', colorScaleBar(carrier)).style("background", "white").style("color", "black");

            d3.select(getClassMapping(carrier)).on('mouseover', function (){
                d3.select(getClassMapping(carrier)).style('background-color', colorScaleBar(carrier)).style('color', 'white');
            }).on('mouseout', function (d, i) {
                if (!SELECTED_AIRLINES.has(carrier)){
                d3.select(getClassMapping(carrier)).style('background-color', "white").style('color', 'black');
            }
            });
    }
}

function createPercentBarGroup(data){
    SELECTED_AIRLINES = new Set();
    DATA = data;
    IS_PERCENT = true;
    IS_CUSTOMIZABLE = false;
    createSlider();
    createStaticBarPercent();
    createAutoplayButton();
    d3.selectAll('.replay-button').on('click', () => autoPlay(data));
    for (const carrier of names) {
        d3.select(getClassMapping(carrier)).style('border-color', colorScaleBar(carrier)).style("background", "white").style("color", "black");

            d3.select(getClassMapping(carrier)).on('mouseover', function (){
                d3.select(getClassMapping(carrier)).style('background-color', colorScaleBar(carrier)).style('color', 'white');
            }).on('mouseout', function (d, i) {
                if (!SELECTED_AIRLINES.has(carrier)){
                d3.select(getClassMapping(carrier)).style('background-color', "white").style('color', 'black');
            }
            });
    }
}

// slider class: dynamic-bar
// content class: dynamic-bar-content
function createSlider(default_year = 2016){
    d3.selectAll(".dynamic-bar-slider").remove();
    const keyframes = processKeyFrames(DATA);
    const dataTime = d3.range(0, 6).map(function(d) {
        return new Date(2016 + d, 10, 3); });
    
    const width = 750;
    const height = 100;
    const sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(width)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(default_year, 10, 3))
        .on('onchange', val => {
            d3.select('.dynamic-bar-content').remove();
            if (IS_PERCENT) {
                createStaticBarPercent(val.getFullYear());
            } else {
                createStaticBarAveMin(val.getFullYear());
            }
        });

    let gTime = d3.select("#vis-bar-slider").append('svg')
        .attr("class", 'dynamic-bar-slider dynamic-bar')
        .attr('x',30).attr('y', width)
        .attr("viewBox", [0, 0, width+width/10, height]) // changes here 
        .style('width', width+width/10)
        .style('height', height)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);
}

function createAutoplayButton() {
    d3.select("#replay-button-container")
    .append('button')
    .attr("type","button")
    .attr("class","dynamic-bar replay-button")
    .append("div")
    .attr("class","label")
    .text("autoplay")
}

function autoPlay(data) {
    IS_AUTOPLAY = true;
    d3.select(".dynamic-bar-content").remove();
    if (IS_PERCENT) {
        createCarrierRankBarPercentDelayed(data);
    } else {
        createCarrierRankBarAveMin(data);
    }
}

function updateSelectedCarrier(clickedCarrier){
    d3.selectAll('.dynamic-bar-content').remove()
    IS_CUSTOMIZABLE = true;
    if (SELECTED_AIRLINES.has(clickedCarrier)){ // mean to remove
        deselectElement((clickedCarrier));
        SELECTED_AIRLINES.delete(clickedCarrier);
    } else {
        selectElements((clickedCarrier));
        deselectElement(('top-5'));
        SELECTED_AIRLINES.add(clickedCarrier);
    }

    if (IS_PERCENT) {
        createStaticBarPercent();
    } else {
        createStaticBarAveMin();
    }
    createSlider(2016);
}

function setTop5(){
    console.log("Top 5 detected");
    d3.selectAll('.dynamic-bar-content').remove();
    IS_CUSTOMIZABLE = false;
    SELECTED_AIRLINES= new Set();
    selectElements(('top-5'));
    deselectElement(('carrier'));
    if (IS_PERCENT) {
        createStaticBarPercent();
    } else {
        createStaticBarAveMin();
    }
    createSlider(2016);
}

function getClassMapping(nameString){
    let result = "";
    if (nameString == "top-5" || nameString == 'carrier'){
        result = IS_PERCENT?  ".percent-"+nameString : '.min-'+nameString;
    } else {
        let suffix = nameString.replaceAll(' ', '-').replaceAll('.', '');
        result= IS_PERCENT? ".percent-"+suffix : ".min-"+suffix;
    }
    return result;
    
}

function selectElements(elementOriginalString) {
    let element = d3.selectAll(getClassMapping(elementOriginalString));
    if (elementOriginalString == 'top-5') {
        element.style('background-color', "grey").style('color', "white");
    } else {
        element.style('background-color', colorScaleBar(elementOriginalString)).style('color', "white");
    }
}

function deselectElement(elementOriginalString) {
    d3.selectAll(getClassMapping(elementOriginalString)).style('background-color', "white").style('color', "black");
}

// intake mapData of a certain year
// key: carrier_name 
function createStaticBarAveMin(selectedYear=2016){
    IS_AUTOPLAY = false;
    let dateMapData = processKeyFrames(DATA)

    const n = IS_CUSTOMIZABLE ? SELECTED_AIRLINES.size : 5;

    const xAxisMax = 30;
    // ================== final step drawing the graphs ====================
    const height = marginBarGraph.top + barSize * n + marginBarGraph.bottom;
    const width = 700;

    let x = d3.scaleLinear([0, xAxisMax], [marginBarGraph.left, width - marginBarGraph.right])
    let y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([marginBarGraph.top, marginBarGraph.top + barSize * (n + 1 + 0.1)])
    .padding(0.1) 

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height + 10]) // changes here 
    .attr("class", "dynamic-bar-content dynamic-bar dynamic-bar-static")
    .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    svg.append('g').attr('class','dynamic-bar-title').append('text')
    .attr("y", 25)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .text(graphTitle(selectedYear))
    .attr("text-anchor", "middle")

    document.getElementById("vis").appendChild(svg.node());

    const selectedYearData = dateMapData[selectedYear-2016][1]
    svg.append("g")
    .attr("fill-opacity", 0.8)
    .selectAll("rect")
    .data(selectedYearData.slice(0, n))
    .enter().append('rect')
    .attr("fill", d => colorScaleBar(d.name))
    .attr("x", x(0))
    .attr("y", d => y(d.rank)) // is this correct?
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.value) - x(0))

    const g = svg.append("g")
    .attr("transform", `translate(0,${marginBarGraph.top})`);

    const axis = d3.axisTop(x)
        .ticks(width / 160)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()));
    g.call(axis)
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();

    function formatText(t) {
        let formatNumber = d3.format(",d");
        if (t ==0){
            return "n/a";
        }
        return  formatNumber(t)+"min";
    }

    svg.append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "start")
        .selectAll("text")
        .data(selectedYearData.slice(0, n))
        .enter().append('text')
        .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
        .attr("y", y.bandwidth() / 2)
        .attr("x", 5)
        .attr("dy", "-0.25em")
        .text(d => d.name)
        .call(text => text.append("tspan"))
        .attr("fill-opacity", 0.7)
        .attr("font-weight", "normal")
        .style('font-size', "13px")


    svg.append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .selectAll("text")
        .data(selectedYearData.slice(0, n))
        .enter().append('text')
        .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
        .attr("y", y.bandwidth() / 2)
        .text(d => formatText(d.value))
        .attr("fill-opacity", 0.7)
        .attr("font-weight", "normal")
        .attr("x", 37)
        .attr("dy", "1.0em")
        .style('font-size', "13px")

}

// intake mapData of a certain year
// key: carrier_name 
function createStaticBarPercent(selectedYear=2016){
    d3.selectAll('dynamic-bar-content').remove();
    IS_AUTOPLAY = false;
    let dateMapData = processKeyFrames(DATA);
    const n = IS_CUSTOMIZABLE ? SELECTED_AIRLINES.size : 5;
    const xAxisMax = 30;
    // ================== final step drawing the graphs ====================
    const height = marginBarGraph.top + barSize * n + marginBarGraph.bottom;
    const width = 700;

    let x = d3.scaleLinear([0, xAxisMax], [marginBarGraph.left, width - marginBarGraph.right])
    let y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([marginBarGraph.top, marginBarGraph.top + barSize * (n + 1 + 0.1)])
    .padding(0.1) 

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height + 10]) // changes here 
    .attr("class", "dynamic-bar-content dynamic-bar dynamic-bar-static")
    .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    svg.append('g').attr('class','dynamic-bar-title').append('text')
    .attr("y", 25)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .text(graphTitle(selectedYear))
    .attr("text-anchor", "middle")

    document.getElementById("vis").appendChild(svg.node());

    const selectedYearData = dateMapData[selectedYear-2016][1]
    svg.append("g")
    .attr("fill-opacity", 0.8)
    .selectAll("rect")
    .data(selectedYearData.slice(0, n))
    .enter().append('rect')
    .attr("fill", d => colorScaleBar(d.name))
    .attr("x", x(0))
    .attr("y", d => y(d.rank)) // is this correct?
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.value) - x(0))

    const g = svg.append("g")
    .attr("transform", `translate(0,${marginBarGraph.top})`);

    const axis = d3.axisTop(x)
        .ticks(width / 160)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()));
    g.call(axis)
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();

    function formatText(t) {
        let formatNumber = d3.format(".1f");
        if (t ==0){
            return "n/a";
        }
        return IS_PERCENT? formatNumber(t)+"%" : formatNumber(t)+"min";
    }

    svg.append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "start")
        .selectAll("text")
        .data(selectedYearData.slice(0, n))
        .enter().append('text')
        .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
        .attr("y", y.bandwidth() / 2)
        .attr("x", 5)
        .attr("dy", "-0.25em")
        .text(d => d.name)
        .style('font-size', "13px")
        .call(text => text.append("tspan"))
        .attr("fill-opacity", 0.7)
        .attr("font-weight", "normal")


    svg.append("g")
        .style("font", "bold 9px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .selectAll("text")
        .data(selectedYearData.slice(0, n))
        .enter().append('text')
        .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
        .attr("y", y.bandwidth() / 2)
        .text(d => formatText(d.value))
        .attr("fill-opacity", 0.7)
        .attr("font-weight", "normal")
        .style('font-size', "13px")
        .attr("x", 38)
        .attr("dy", "1.0em")
}