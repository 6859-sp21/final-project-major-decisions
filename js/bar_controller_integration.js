
//d3.csv('https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines.csv').then((data)=>{create_airline_rank_bar(data)});

function produceCarrierAnnualMapPercentDelayed(data) {
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
            generateMap.set(carrier, sumFlightsFromArrayOfObject(carrier_data));
        }
        return generateMap;
    }
}

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

async function createCarrierRankBarAveMin(data) {
    // ========================== data processing ================================
    const yearMap = d3.groups(data, d=>d.year).map(([year, data])=>[createDate(year), data]);
    const datevalues = yearMap.map(([year, data]) =>
     [year,produceCarrierAnnualMapAveMin(data)]).sort(
         (a,b) => {return a[0].getFullYear()-b[0].getFullYear()});
    console.log(datevalues);
    // ======================== keyframes ==================================
    const names = new Set(data.map(data => data.carrier_name)) // 20 names in total, some has nun 
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

    keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
    const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));
    console.log(nameframes);
    // ============================== drawing functions ========================
    function bars(svg) {
        let bar = svg.append("g")
            .attr("fill-opacity", 0.8)
            .selectAll("rect");

        const colorScale = d3.scaleOrdinal(d3v4.schemeCategory20)
        .domain(names);

        return ([date, data], transition) => bar = bar
            .data(data.slice(0, n), d => d.name)
            .join(
            enter => enter.append("rect")
                .attr("fill", d => colorScale(d.name))
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
    .attr("viewBox", [0, 0, width, height])
    .attr("class", "dynamic-bar")
    .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    svg.append('g').attr('class','dynamic-bar').append('text')
    .attr("y", 25)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .text('Top 5 Carriers with longest average delays by minutes from 2016 - present')
    .attr("text-anchor", "middle")

    document.getElementById("vis").appendChild(svg.node());

    const updateBars = bars(svg);
    const updateLabels = labels(svg);
    const updateAxis = axis(svg);
    const updateTicker = ticker(svg);


    for (const keyframe of keyframes) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);
    
        // // Extract the top bar’s value.
      
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateAxis(keyframe, transition);
        updateTicker(keyframe, transition);

        await transition.end();
        await sleep(2000);
      }
}

// arrays of [time, datamap]
// data map is carrier = > desired data
function datedDataMapPercentDelayed(data){
    const yearMap = d3.groups(data, d=>d.year).map(([year, data])=>[createDate(year), data]);
    const datevalues = yearMap.map(([year, data]) =>
     [year,produceCarrierAnnualMapPercentDelayed(data)]).sort(
         (a,b) => {return a[0].getFullYear()-b[0].getFullYear()});
    return datevalues
}

async function createCarrierRankBarPercentDelayed(data) {
    const datevalues = datedDataMapPercentDelayed(data);
    console.log(datevalues);
    const n = 5;

    // // ===================== Seara's experiment ==============================
    // const selectedCarriers = ["JetBlue Airways", "United Air Lines Inc.", "Spirit Air Lines"]
    // const n = selectedCarriers.length;

    // // ===================================================
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

        const colorScale = d3.scaleOrdinal(d3v4.schemeCategory20)
        .domain(names);

        return ([date, data], transition) => bar = bar
            .data(data.slice(0, n), d => d.name)
            .join(
            enter => enter.append("rect")
                .attr("fill", d => colorScale(d.name))
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
    .attr("viewBox", [0, 0, width, height])
    .attr("class", "dynamic-bar")
    .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    svg.append('g').attr('class','dynamic-bar').append('text')
    .attr("y", 25)
    .attr("x", width/2)
    .attr("text-anchor", "middle")
    .text('Top 5 Carriers with highest percentage of delayed flights from 2016 - present')
    .attr("text-anchor", "middle")

    document.getElementById("vis").appendChild(svg.node());

    const updateBars = bars(svg);
    const updateLabels = labels(svg);
    const updateAxis = axis(svg);
    const updateTicker = ticker(svg);


    for (const keyframe of keyframes) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);
          
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateAxis(keyframe, transition);
        updateTicker(keyframe, transition);

        await transition.end();
        await sleep(2000);
      }
}

// async function createAnimatedBarsWithSelectedCarriers(data, selectedCarriers) {
//     const datevalues = datedDataMapPercentDelayed(data);
//     const n = selectedCarriers.length 
//     const xAxis = 30 // needs a way to dynamically select that 5 + the maximum value? 


// }

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