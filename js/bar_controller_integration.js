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
let margin = ({top: 50, right: 6, bottom: 6, left: 0});


function produceCarrierAnnualMapAveMin(data) {
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
            generateMap.set(carrier, sumFlightsFromArrayOfObject(carrier_data));
        }
        return generateMap;
    }
}

// provided key frames for animation and static bar charts
function processKeyFrames(data, isPercent = true){
    // ========================== data processing ================================
    const yearMap = d3.groups(data, d=>d.year).map(([year, data])=>[createDate(year), data]);
    let datevalues = []
    if (isPercent) {
        // fill this in 
    } else {
        datevalues = yearMap.map(([year, data]) =>
        [year,produceCarrierAnnualMapAveMin(data)]).sort(
            (a,b) => {return a[0].getFullYear()-b[0].getFullYear()});
    }
    console.log(datevalues);
    // ======================== keyframes ==================================
    const names = new Set(data.map(data => data.carrier_name)) // 20 names in total
    console.log(names);
    const n = 5;
    function rank(value) {
        const data = Array.from(names, name => ({name, value: value(name)}));
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
        return data;
    }

    const keyframes = [];
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

}

async function createCarrierRankBarAveMin(data, isAutoPlay = -1) {
    // ========================== data processing ================================
    const yearMap = d3.groups(data, d=>d.year).map(([year, data])=>[createDate(year), data]);
    const datevalues = yearMap.map(([year, data]) =>
     [year,produceCarrierAnnualMapAveMin(data)]).sort(
         (a,b) => {return a[0].getFullYear()-b[0].getFullYear()});
    console.log(datevalues);
    // ======================== keyframes ==================================
    const names = new Set(data.map(data => data.carrier_name)) // 20 names in total
    console.log(names);
    const n = 5;
    const xAxisMax = 30; //??
    function rank(value) {
        const data = Array.from(names, name => ({name, value: value(name)}));
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
        return data;
    }

    const keyframes = [];
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
    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
    const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));

    console.log("The next")
    console.log(keyframes);
    // createStaticBarAveMin(keyframes, 2016);
    // return;
    // ============================== drawing functions ========================
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
            .attr("text-anchor", "end")
          .selectAll("text");
      
        return ([date, data], transition) => label = label
          .data(data.slice(0, n), d => d.name)
          .join(
            enter => enter.append("text")
              .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
              .attr("y", y.bandwidth() / 2)
              .attr("x", -6)
              .attr("dy", "-0.25em")
              .text(d => d.name)
              .call(text => text.append("tspan")
                .attr("fill-opacity", 0.7)
                .attr("font-weight", "normal")
                .attr("x", -6)
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
            .attr("transform", `translate(0,${margin.top})`);

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
            .attr("y", margin.top + barSize * (n - 0.45))
            // .attr("dy", "0.32em")
            .text(formatDate(keyframes[0][0]));
      
        return ([date], transition) => {
          transition.end().then(() => now.text(formatDate(date)));
        };
      }

    // ================== final step drawing the graphs ====================
    let barSize = 48;
    let duration = 1000;
    const height = margin.top + barSize * n + margin.bottom;
    const width = 900;
    console.log(height);

    let x = d3.scaleLinear([0, xAxisMax], [margin.left, width - margin.right])
    let y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
    .padding(0.1) 

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height + 10]) // changes here 
    .attr("class", "dynamic-bar-content dynamic-bar")
    .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    svg.append('g').attr('class','dynamic-bar-title').append('text')
    .attr("y", 25)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .text('Top 5 Carriers with longest average delays by minutes from 2016 - present')
    .attr("text-anchor", "middle")

    document.getElementById("vis").appendChild(svg.node());

    const updateBars = bars(svg);
    const updateAxis = axis(svg);
    const updateLabels = labels(svg);
    const updateTicker = ticker(svg);

    if (isAutoPlay == -1) {
        for (const keyframe of keyframes) {
            const transition = svg.transition()
                .duration(duration)
                .ease(d3.easeLinear);
        
            // // Extract the top bar’s value.
        
            updateBars(keyframe, transition);
            updateAxis(keyframe, transition);
            updateLabels(keyframe, transition);
            updateTicker(keyframe, transition);

            await transition.end();
            await sleep(2000);
        }
    } else {
        const keyframe = keyframes[isAutoPlay - 2016]
        const transition = svg.transition()
                .duration(0);            
        updateBars(keyframe, transition);
        updateAxis(keyframe, transition);
        updateLabels(keyframe, transition);
        updateTicker(keyframe, transition);
    }
}

// arrays of [time, datamap]
// data map is carrier = > desired data
function datedDataMapPercentDelayed(data, isCustomizable, selectedCarriers){
    const yearMap = d3.groups(data, d=>d.year).map(([year, data])=>[createDate(year), data]);
    const datevalues = yearMap.map(([year, data]) =>
     [year,produceCarrierAnnualMapPercentDelayed(data, isCustomizable, selectedCarriers)]).sort(
         (a,b) => {return a[0].getFullYear()-b[0].getFullYear()});
    return datevalues

    function produceCarrierAnnualMapPercentDelayed(data, isCustomizable, selectedCarriers) {
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
                if (selectedCarriers.includes(carrier) || !isCustomizable){
                    generateMap.set(carrier, sumFlightsFromArrayOfObject(carrier_data));
                }
            }
            return generateMap;
        }
    }
}

// add when is something that is unavailable
async function createCarrierRankBarPercentDelayed(data, isCustomizable=false, selectedCarriers=[], isAutoPlay = true) {
    const datevalues = datedDataMapPercentDelayed(data, isCustomizable,selectedCarriers);
    // selectedCarriers = ["JetBlue Airways", "United Air Lines Inc.", "Delta Air Lines Inc.", "Hawaiian Airlines Inc.",
    // "Spirit Air Lines", "Mesa Airlines Inc."]
    // isCustomizable = true;
    // const datevalues = datedDataMapPercentDelayed(data, isCustomizable, selectedCarriers);
    console.log(datevalues);
    const n = isCustomizable? selectedCarriers.length: 5;// 5 is default value

    const names = new Set(data.map(data => data.carrier_name)) // 20 names in total, some has nun 
    const xAxisMax = 30;
    function rank(value) {
        const data = Array.from(names, name => ({name, value: value(name)}));
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
        return data;
    }

    const keyframes = [];
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
    keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
    const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));
    // ============================== drawing functions ========================
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
            .attr("text-anchor", "end")
            .selectAll("text");
      
        return ([date, data], transition) => label = label
          .data(data.slice(0, n), d => d.name)
          .join(
            enter => enter.append("text")
              .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
              .attr("y", y.bandwidth() / 2)
                .attr("x", -5)

              .attr("dy", "-0.25em")
              .text(d => d.name)
              .call(text => text.append("tspan")
                .attr("fill-opacity", 0.7)
                .attr("font-weight", "normal")
                .attr("x", -5)

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
            .attr("transform", `translate(0,${margin.top})`);

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
            .attr("y", margin.top + barSize * (n - 0.45))
            // .attr("dy", "0.32em")
            .text(formatDate(keyframes[0][0]));
      
        return ([date], transition) => {
          transition.end().then(() => now.text(formatDate(date)));
        };
      }

    // ================== final step drawing the graphs ====================
    let barSize = 48;
    let duration = 1000;
    const height = margin.top + barSize * n + margin.bottom;
    const width = 900;

    let x = d3.scaleLinear([0, xAxisMax], [margin.left, width - margin.right])
    let y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
    .padding(0.1) 

    const svg = d3.create("svg")
    .style("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("class", "dynamic-bar-content dynamic-bar")
    .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    svg.append('g').attr('class','dynamic-bar-title').append('text')
    .attr("y", 25)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .text('Top '+n+' Carriers with highest percentage of delayed flights from 2016 - present')
    .attr("text-anchor", "middle")

    document.getElementById("vis").appendChild(svg.node());

    const updateBars = bars(svg);
    const updateAxis = axis(svg);
    const updateLabels = labels(svg);
    const updateTicker = ticker(svg);

    for (const keyframe of keyframes) {
        const transition = svg.transition()
        .duration(duration)
        .ease(d3.easeLinear);

       updateLabels(keyframe, transition);
        updateBars(keyframe, transition);
        updateAxis(keyframe, transition);
        updateTicker(keyframe, transition);
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
    formatNumber = d3.format(",d");

    const i = d3.interpolateNumber(a, b);
    return function(t) {
        this.textContent = formatNumber(i(t))+"%";
    };
}

function textTweenMin(a, b) {
    formatNumber = d3.format(",d");

    const i = d3.interpolateNumber(a, b);
    return function(t) {
        this.textContent = formatNumber(i(t))+"min";
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

function createFinalGraph(data){
    const keyframes = processKeyFrames(data);
    createCarrierRankBarAveMin(keyframes);
    createSlider(keyframes);

}


// slider class: dynamic-bar
// content class: dynamic-bar-content
function createSlider(keyframes,default_year = 2016){
    // d3.selectAll(".dynamic-bar").remove();
    console.log("Calling create slider")
    const dataTime = d3.range(0, 5).map(function(d) {
        return new Date(default_year + d, 10, 3); });
    
    const sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(400)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(default_year, 10, 3))
        .on('onchange', val => {
            console.log("Detected on change! "+ val);
            console.log(keyframes);
            d3.select('.dynamic-bar-content').remove();

            createStaticBarAveMin(keyframes, val.getFullYear())
        });

    const width = 500;
    const height = 100;
    let gTime = d3.select("#vis").append('svg')
        .attr("class", 'dynamic-bar-slider dynamic-bar')
        .attr('x',30).attr('y', 800)
        .attr("viewBox", [0, 0, width, height]) // changes here 
        .style('width', width)
        .style('height', height)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);
}

// intake mapData of a certain year
// key: carrier_name 
function createStaticBarAveMin(dateMapData, selectedYear,  n =5){
    console.log(dateMapData);
    console.log(selectedYear);
    const xAxisMax = 30;
    // ================== final step drawing the graphs ====================
    let margin = ({top: 50, right: 6, bottom: 6, left: 0});
    let barSize = 48;
    let duration = 1000;
    const height = margin.top + barSize * n + margin.bottom;
    const width = 900;

    let x = d3.scaleLinear([0, xAxisMax], [margin.left, width - margin.right])
    let y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
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
    .text('Top 5 Carriers with longest average delays by minutes in '+selectedYear)
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


    console.log(selectedYearData)
    function formatText(t) {
        let formatNumber = d3.format(",d");
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
        // .call(text => text.append("tspan"))
        .attr("fill-opacity", 0.7)
        .attr("font-weight", "normal")
        .attr("x", 45)
        .attr("dy", "1.0em")
        // .call( d => textTweenMin(d.value))

    // const g = svg.append("g")
    //         .attr("transform", `translate(0,${margin.top})`);

    // const axis = d3.axisTop(x)
    //     .ticks(width / 160)
    //     .tickSizeOuter(0)
    //     .tickSizeInner(-barSize * (n + y.padding()));
    // g.select(".tick:first-of-type text").remove();
    // g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    // g.select(".domain").remove();

    const g = svg.append("g")
        .attr("transform", `translate(0,${margin.top})`);

    const axis = d3.axisTop(x)
        .ticks(width / 160)
        .tickSizeOuter(0)
        .tickSizeInner(-barSize * (n + y.padding()));
    g.call(axis)
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();


    //     return (_, transition) => {
    //         g.transition(transition).call(axis);
    //         g.select(".tick:first-of-type text").remove();
    //         g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    //         g.select(".domain").remove();
    //     };



    //     return (_, transition) => {
    //         g.transition(transition).call(axis);
    //         g.select(".tick:first-of-type text").remove();
    //         g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    //         g.select(".domain").remove();
    //     };

    // function ticker(svg) {
    //     formatDate = d3.utcFormat("%Y")
    //     const now = svg.append("text")
    //         .attr('class', 'ticker-text')
    //         .style("font", `bold ${barSize}px var(--sans-serif)`)
    //         .style("font-variant-numeric", "tabular-nums")
    //         .attr("text-anchor", "end")
    //         .style('font-size', "30px")
    //         .attr("x", width - 80)
    //         .attr("y", margin.top + barSize * (n - 0.45))
    //         // .attr("dy", "0.32em")
    //         .text(formatDate(keyframes[0][0]));
      
    //     return ([date], transition) => {
    //       transition.end().then(() => now.text(formatDate(date)));
    //     };
    //   }

    


}