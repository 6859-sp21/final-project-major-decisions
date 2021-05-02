
d3.csv('https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines.csv').then((data)=>{create_airline_rank_bar(data)});



function create_airline_rank_bar(data) {
    const width = 600;
    const duration = 250;
    const margin = ({top: 30, right: 0, bottom: 10, left: 10});
    const barHeight = 25
    const color = "steelblue"
    const height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom

    // ========================== data processing ================================
    const datevalues = Array.from(d3.rollup(data, ([d]) => calculatedPercentageDelay(d), d => d.year, d => d.carrier_name))
    .map(([date, data]) => dateMapper([date, data]))
    .sort(([a], [b]) => d3.ascending(a, b));

    const carrier_map_2016 = datevalues[0][1] // 1 is always constant
    carrier_data_2016 =[]
    for (const [key, value] of carrier_map_2016){
        carrier_data_2016.push({"carrier_name": key, "delay_pct": value})
    }
    carrier_data_2016 =carrier_data_2016.sort(
        (a,b) =>d3.ascending(a.delay_pct, b.delay_pct)
    );
    console.log(carrier_data_2016)
    // ==========================================================
    yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat(i => data[i].name).tickSizeOuter(0))

    xAxis = g => g
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(width / 80, data.format))
    .call(g => g.select(".domain").remove())

    y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height - margin.bottom, margin.top])
    
    x = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([margin.left, width - margin.right])
    .padding(0.1)

    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

    svg.append("g")
        .attr("fill", color)
        .selectAll("rect")
        .data(carrier_data_2016)
        .join("rect")
        .attr("x", (d) => x(0))
        .attr("y", d => y(d.delay_pct))
        .attr("height", d => y(0) - y(d.delay_pct))
        .attr("width", x.bandwidth());

    document.getElementById("vis").appendChild(svg.node());
  

   

    
    console.log("End of create function")
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
    return Math.round(parseInt(d.arr_del15)/parseInt(d.arr_flights)*100);
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

function createDate(date_tuple) {   
    const newDate = new Date();
    newDate.setFullYear(parseInt(date_tuple[0]))
    newDate.setMonth(parseInt(date_tuple[1]));
    return newDate;
}

