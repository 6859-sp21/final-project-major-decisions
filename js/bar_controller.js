
d3.csv('https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines.csv').then((data)=>{create_airline_rank_bar(data)});

function produceCarrierAnnualMap(data) {
    const carrierMap= generateMap(d3.groups(data, d=>d.carrier_name));
    console.log(carrierMap);
    return carrierMap;

    // from an array of objects like this: 0: {year: "2017", month: "8", carrier: "B6", carrier_name: "JetBlue Airways", airport: "PSE", …}
    // To [delay_flights, total_flights]
    function sumFlightsFromArrayOfObject(entryList) {
        let delay_flights = 0;
        let total_flights = 0;
        for (const entry of entryList) {
            delay_flights = delay_flights + parseInt(entry.arr_del15);
            total_flights = total_flights + parseInt(entry.arr_flights);
        }
        return (delay_flights/total_flights)*100;
    }

    function generateMap(carrierList) {
        let generateMap = new Map();
        for (const [carrier, carrier_data] of carrierList) {
            generateMap.set(carrier, sumFlightsFromArrayOfObject(carrier_data));
        }
        return generateMap;
    }
}

async function create_airline_rank_bar(data) {

    // ========================== data processing ================================
    // const datevalues = Array.from(d3.rollup(data, ([d]) => calculatedPercentageDelay(d), d => createDate(d.year, d.month), d => d.carrier_name))
    // .sort(([a], [b]) => d3.ascending(a, b));
    // console.log(datevalues);

    // [[year, data entries]]
    const yearMap = d3.groups(data, d=>d.year).map(([year, data])=>[createDate(year), data]);
    // console.log(yearMap);
    const datevalues = yearMap.map(([year, data]) => [year,produceCarrierAnnualMap(data)])
    console.log(datevalues);

    const carrier_map_2016 = datevalues[0][1] // 1 is always constant
    carrier_data_2016 =[]
    for (const [key, value] of carrier_map_2016){
        carrier_data_2016.push({"carrier_name": key, "delay_pct": value})
    }
    carrier_data_2016 =carrier_data_2016.sort(
        (a,b) =>d3.ascending(a.delay_pct, b.delay_pct)
    );

    // ======================== keyframes ==================================
    const names = new Set(data.map(data => data.carrier_name)) // 20 names in total, some has nun 
    const n = 5;
    const xAxisMax = 50;
    function rank(value) {
        const data = Array.from(names, name => ({name, value: value(name)}));
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
        return data;
    }

    // put NaN value to 101
    function getValue(name){
        const temp = datevalues[0][1].get(name);
        if (temp === undefined | temp === null){
            return 101;
        }
        return temp;
    }
    console.log(rank(name => getValue(name))) // rank test

    const keyframes = [];
    const k = 10;
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
    console.log("keyframes");
    console.log(keyframes)
  
    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
    console.log(nameframes);
    const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
    console.log(prev)
    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));
    // ============================== drawing functions ========================
    function bars(svg) {
        let bar = svg.append("g")
            .attr("fill-opacity", 0.6)
            .selectAll("rect");

        return ([date, data], transition) => bar = bar
            .data(data.slice(0, n), d => d.name)
            .join(
            enter => enter.append("rect")
                //.attr("fill", d=>color(d))
                .attr("fill", 'red')
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
              //.call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
          )
          .call(bar => bar.transition(transition)
            .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
            //.call(g => g.select("tspan").tween("text", d => transition.textTween((prev.get(d) || d).value, d.value)))
            )
    }

    function axis(svg) {
        const g = svg.append("g")
            .attr("transform", `translate(0,${margin.top})`);

        const axis = d3.axisTop(x)
            .ticks(width / 160, tickFormat)
            .tickSizeOuter(0)
            .tickSizeInner(-barSize * (n + y.padding()));

        return (_, transition) => {
            g.transition(transition).call(axis);
            g.select(".tick:first-of-type text").remove();
            g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
            g.select(".domain").remove();
        };
    }


    // =============================== settings functions =========================
    let color = function() {
        const scale = d3.scaleOrdinal(d3.schemeTableau10);
        if (data.some(d => d.category !== undefined)) {
            const categoryByName = new Map(data.map(d => d.carrier_name))
            scale.domain(Array.from(categoryByName.values()));
            return d => scale(categoryByName.get(d.name));
        }
        return d => scale(d.name);
    }

    // ================== final step drawing the graphs ====================
    let margin = ({top: 16, right: 6, bottom: 6, left: 0});
    let barSize = 48;
    let duration = 250;
    const height = margin.top + barSize * n + margin.bottom;
    const width = 1200;

    let x = d3.scaleLinear([0, xAxisMax], [margin.left, width - margin.right])
    console.log(x(50));
    let y = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
    .padding(0.1) 

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]);

    document.getElementById("vis").appendChild(svg.node());




    const updateBars = bars(svg);
    const updateLabels = labels(svg);

    for (const keyframe of keyframes) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);
    
        // Extract the top bar’s value.
        x.domain([0, keyframe[1][0].value]);
      
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);

        await transition.end();
      }

    console.log("End of creation");
}

// function dateMapper([date, data]){
//     const result= [new Date().setFullYear(parseInt(date)), data];
//     return result;
// }

function dateMapper([date, data]){
    const result= [parseInt(date), data];
    return result;
}

function calculatedPercentageDelay(d) {
    return result = (parseInt(d.arr_del15)/parseInt(d.arr_flights)*100);
    if (result) {

    }
}


//  takes a value accessor function
// Seara: is this righ? 
function rank(value) {
    const data = Array.from(names, name => ({name, value: value(name)}));
    data.sort((a, b) => d3.descending(a.value, b.value));
    for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
    return data;
}

function fillInZero(){

}
function createDate(year, month) {   
    const newDate = new Date(parseInt(year),1, 1);
    return newDate;
}

// accepth t
function createToCarrierMap(brandData){
    const newDate = new Date(parseInt(year),parseInt(month), 1);
    return newDate;
}

