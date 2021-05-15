function overviewBar(data) {
    const minPromise = d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/rank_ave_min.csv");
    const percentPromise = d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/rank_ave_percent.csv");
    return Promise.all([percentPromise, minPromise]).then(([percentData,minData]) => {
        createOverviewChart(data, percentData, minData);
        console.log(percentData);
        console.log(minData);

      });
}

const individualBarGraphMargin = ({top: 10, right: 10, bottom: 6, left: 10});

function createOverviewChart(data, percentData, minData){
    createOverviewBarPercent(data, percentData);

}
// function createOverviewBarMin(data, barData) {
//     const barIndividualWidth = 900;
//     const barIndividualHeight = 400;

//     const svg = d3.create("svg")
//     .attr("viewBox", [0, 0, barIndividualWidth, barIndividualHeight + 10]) // changes here 
//     .attr("class", "overview-bar overview-min")
//     .attr('display', 'block')
//     .attr('opacity', 1);

//       // creating title 
//     svg.append('g').attr('class','dynamic-bar-title').append('g').append('text').text("hellow");
//     document.getElementById("vis").appendChild(svg.node());
// }
function processOverviewDataPercent(data) {
    for (let i = 0; i < data.length; i++) {
        data[i].ave_percent = parseFloat(data[i].ave_percent);
    }
    return data
}
function createOverviewBarPercent(data, percentData) {
    percentData = processOverviewDataPercent(percentData.sort((a, b)=>  d3.ascending(a.ave_percent, b.ave_percent)));
    console.log(percentData);
    const barIndividualWidth = 900;
    const barIndividualHeight = 400;

    let x = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([individualBarGraphMargin.left, barIndividualWidth - individualBarGraphMargin.right])
    .padding(0.1)

    let y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.ave_percent)]).nice()
    .range([barIndividualHeight - individualBarGraphMargin.bottom, individualBarGraphMargin.top])

    let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, data.format))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(data.y));

    let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(i => data[i].carrier_name).tickSizeOuter(0))

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, barIndividualWidth, barIndividualHeight + 10]) // changes here 
    .attr("class", "overview-bar overview-min")
    // .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    // svg.append('g').attr('class','dynamic-bar-title').append('g').append('text').text("hellow");
    document.getElementById("vis").appendChild(svg.node());
    
}