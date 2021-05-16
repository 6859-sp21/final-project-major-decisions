const barIndividualWidth = 900;
const barIndividualHeight = 300;

function overviewBar(data) {
    const minPromise = d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/rank_ave_min.csv");
    const percentPromise = d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/rank_ave_percent.csv");
    return Promise.all([percentPromise, minPromise]).then(([percentData,minData]) => {
        createOverviewChart(data, percentData, minData);
      });
}

const individualBarGraphMargin = ({top: 4, right: 40, bottom: 70, left: 10});

function createOverviewChart(data, percentData, minData){
    createOverviewBarPercent(data, percentData);
    createOverviewBarMin(data,minData);

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
        data[i].ave_percent = parseFloat(data[i].ave_percent); //Seara
    }
    return data
}

function processOverviewDataMin(data) {
    for (let i = 0; i < data.length; i++) {
        data[i].ave_min = parseFloat(data[i].ave_min); //Seara
    }
    return data
}

function createOverviewBarPercent(data, percentData) {
    IS_PERCENT = true;
    percentData = processOverviewDataPercent(percentData);
    percentData = (percentData.sort((a, b)=>  d3.descending(a.ave_percent, b.ave_percent)));
    console.log(percentData);

    let x = d3.scaleBand()
    .domain(d3.range(percentData.length))
    .range([individualBarGraphMargin.left, barIndividualWidth - individualBarGraphMargin.right])
    .padding(0.2)

    let y = d3.scaleLinear()
    .domain([0, d3.max(percentData, d => d.ave_percent)+5]).nice()
    .range([barIndividualHeight - individualBarGraphMargin.bottom, individualBarGraphMargin.top])

    let yAxis = g => g
    .attr("transform", `translate(${individualBarGraphMargin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, percentData.format))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -individualBarGraphMargin.left)
        .attr("y", 10)
        .attr("fill", "blue")
        .attr("text-anchor", "start")
        .text(percentData.y)
        );

    let xAxis = g => g
    .attr("transform", `translate(0,${barIndividualHeight - individualBarGraphMargin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(i => percentData[i].carrier_name).tickSizeOuter(0))

    const svg = d3.create("svg")
    .attr('width', barIndividualWidth).attr('height', barIndividualHeight)
    .attr('class', 'overview-bar overview-bar-percent')
    .attr("viewBox", [0, 0, barIndividualWidth, barIndividualHeight + 10]) // changes here 
    svg.append('g')
    .attr('opacity', 1)
    .selectAll("rect")
    .data(percentData)
    .enter().append('rect')
    .attr("x", (d, i) => x(i))
    .attr("y", d => y(d.ave_percent))
    .attr("height", d => y(0) - y(d.ave_percent))
    .attr("width", x.bandwidth())
    .attr('fill', d => colorScaleBar(d.carrier_name))
    .on("mouseover", function(event, d) {
        d3.select(".percent-label-"+getOverviewClassMapping(d.carrier_name))
          .attr("opacity", "100%");
        d3.select(this)
          .attr("stroke", colorScaleBar(d.carrier_name))
          .attr("stroke-width", "3px");

    })
    .on("mouseleave", function(event, d) {
        d3.select(this)
          .attr("stroke", colorScaleBar(d.carrier_name))
          .attr("stroke-width", "0px");
        d3.select(".percent-label-"+getOverviewClassMapping(d.carrier_name))
          .attr("opacity", "0%");
    })

    // const svg = d3.create("svg")
    // .attr('width', barIndividualWidth).attr('height', barIndividualHeight)
    // .attr('class', 'overview-bar overview-bar-percent')
    // .attr("viewBox", [0, 0, barIndividualWidth, barIndividualHeight + 10]) // changes here 
    // svg.append('g')
    // .attr('opacity', 1)
    // .selectAll("rect")
    // .data(percentData)
    //     .enter().append('rect')
    //     .attr("x", (d, i) => x(i))
    //     .attr("y", d => y(d.ave_percent))
    //     .attr("height", d => y(0) - y(d.ave_percent))
    //     .attr("width", x.bandwidth())
    //     .attr('fill', "white")
    //     .attr('stroke', "gray")
    //     .attr("stroke-width", "3px")
    //     .on("mouseover", function(event, d) {
    //         d3.select(this).style("fill", colorScaleBar(d.carrier_name))
    //     })
    //     .on("mouseleave", function(event, d) {d3.select(this).style("fill", "white");})


    // carrier name labels
    svg.append("g")
    .call(xAxis)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", "15px")
    .attr("dx", "-10px")
    .attr("transform", "rotate(30)")
    .style("text-anchor", "start")
    .style("font-size", "13px")

    // on top labels
    svg.selectAll(".text")        
    .data(percentData)
    .enter()
    .append("text")
    .attr("class", (d, i) => "overview-bar-label "+ "percent-label-"+getOverviewClassMapping(d.carrier_name))
    .attr('opacity', "0%")
    .attr("x",(d, i) => x(i))
    .attr("y", function(d) { return y(d.ave_percent); })
    .attr("dy", "-3px")
    .attr("dx", "2px")
    .text(function(d) { return formatText(d.ave_percent); });      

    // y axis
    svg.append("g").call(yAxis);

    // 16.8 is the reference line
    const referenceVal = 16.8;
    svg.append("line")
    .attr("class", "percent-reference-line")
    .style("stroke", "black")
    .style("stroke-opacity", "10%")
    .style("stroke-width", '2.5px')
    .style("stroke-dasharray", "15,15" )
    .attr("x1", individualBarGraphMargin.left + 6)
    .attr("y1", y(referenceVal))
    .attr("x2", barIndividualWidth -individualBarGraphMargin.right)
    .attr("y2", y(referenceVal));

    svg.append("line")
    .style("stroke", "black")
    .style("stroke-opacity", "0%")
    .style("stroke-width", '10px')
    .attr("x1", individualBarGraphMargin.left + 5)
    .attr("y1", y(referenceVal))
    .attr("x2", barIndividualWidth -individualBarGraphMargin.right)
    .attr("y2", y(referenceVal))
    .on("mouseover", function(event, d) {
        d3.selectAll(".percent-reference-line").style("stroke-opacity", "100%").style('fill-opacity', "100%");
    })
    .on("mouseleave", function(event, d) {
        d3.selectAll(".percent-reference-line").style("stroke-opacity", "10%").style('fill-opacity', "10%");
    })

    // Text on average line
    svg.append('text')
    .attr("class", "percent-reference-line")
    .style("fill-opacity", "10%")
    .text('average delayed flights ratio: '+ formatText(referenceVal))
    .attr("x", barIndividualWidth -individualBarGraphMargin.right- 200)
    .attr("y",  y(referenceVal)- 8)
    .on("mouseover", function(event, d) {
        d3.selectAll(".percent-reference-line").style("stroke-opacity", "100%").style('fill-opacity', "100%");
    })
    .on("mouseleave", function(event, d) {
        d3.selectAll(".percent-reference-line").style("stroke-opacity", "10%").style('fill-opacity', "10%");
    })

    // creating title 
    svg.append('g').attr('class','overview-bar-percent-title')
    .append('text')
    .attr("y", 25)
    .attr("x", barIndividualWidth/2)
    .attr("text-anchor", "middle")
    .text("Percentage of delayed flights throughout out 2016-present")
    .style("font-size", "25px");
    
    document.getElementById("vis").appendChild(svg.node());
    return svg.node();    
}

function createOverviewBarMin(data, minData) {
    IS_PERCENT = false;
    minData = processOverviewDataMin(minData);
    minData = (minData.sort((a, b)=>  d3.descending(a.ave_min, b.ave_min)));
    console.log(minData);

    let x = d3.scaleBand()
    .domain(d3.range(minData.length))
    .range([individualBarGraphMargin.left, barIndividualWidth - individualBarGraphMargin.right])
    .padding(0.2)

    let y = d3.scaleLinear()
    .domain([0, d3.max(minData, d => d.ave_min)+5]).nice()
    .range([barIndividualHeight - individualBarGraphMargin.bottom, individualBarGraphMargin.top])

    let yAxis = g => g
    .attr("transform", `translate(${individualBarGraphMargin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, minData.format))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -individualBarGraphMargin.left)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .text(minData.y)
        );

    let xAxis = g => g
    .attr("transform", `translate(0,${barIndividualHeight - individualBarGraphMargin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(i => minData[i].carrier_name).tickSizeOuter(0))

    const svg = d3.create("svg")
    .attr('width', barIndividualWidth).attr('height', barIndividualHeight)
    .attr('class', 'overview-bar overview-bar-min')
    .attr("viewBox", [0, 0, barIndividualWidth, barIndividualHeight + 10]) // changes here 
    svg.append('g')
    .attr('opacity', 1)
    .selectAll("rect")
    .data(minData)
    .enter().append('rect')
    .attr("x", (d, i) => x(i))
    .attr("y", d => y(d.ave_min))
    .attr("height", d => y(0) - y(d.ave_min))
    .attr("width", x.bandwidth())
    .attr('fill', d => colorScaleBar(d.carrier_name))
    .on("mouseover", function(event, d) {
        d3.select(".min-label-"+getOverviewClassMapping(d.carrier_name))
          .attr("opacity", "100%");
        d3.select(this)
          .attr("stroke", colorScaleBar(d.carrier_name))
          .attr("stroke-width", "3px");

    })
    .on("mouseleave", function(event, d) {
        d3.select(this)
        //   .attr("stroke", colorScaleBar(d.carrier_name))
          .attr("stroke-width", "0px");
        d3.select(".min-label-"+getOverviewClassMapping(d.carrier_name))
          .attr("opacity", "0%");
    })

    // carrier name labels
    svg.append("g")
    .call(xAxis)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", "15px")
    .attr("dx", "-10px")
    .attr("transform", "rotate(30)")
    .style("text-anchor", "start")
    .style("font-size", "13px")

    // on top labels
    svg.selectAll(".text")        
    .data(minData)
    .enter()
    .append("text")
    .attr("class", (d, i) => "overview-bar-label "+ "min-label-"+getOverviewClassMapping(d.carrier_name))
    .attr('opacity', "0%")
    .attr("x",(d, i) => x(i))
    .attr("y", function(d) { return y(d.ave_min); })
    .attr("dy", "-4px")
    .attr("dx", "-3px")
    .text(function(d) { return formatText(d.ave_min); });      

    // y axis
    svg.append("g").call(yAxis);

    // 11.62 is the reference line for min
    const referenceVal = 11.6
    svg.append("line")
    .attr("class", "min-reference-line")
    .style("stroke", "black")
    .style("stroke-opacity", "10%")
    .style("stroke-width", '2.5px')
    .style("stroke-dasharray", "15,15" )
    .attr("x1", individualBarGraphMargin.left + 6)
    .attr("y1", y(referenceVal))
    .attr("x2", barIndividualWidth -individualBarGraphMargin.right)
    .attr("y2", y(referenceVal));

    // Text on average line
    svg.append('text')
    .attr("class", "min-reference-line")
    .style("fill-opacity", "10%")
    .text('average delay time '+ formatText(referenceVal))
    .attr("x", barIndividualWidth -individualBarGraphMargin.right- 150)
    .attr("y",  y(referenceVal)- 8)

    svg.append("line")
    .style("stroke", "black")
    .style("stroke-opacity", "0%")
    .style("stroke-width", '10px')
    .attr("x1", individualBarGraphMargin.left + 5)
    .attr("y1", y(referenceVal))
    .attr("x2", barIndividualWidth -individualBarGraphMargin.right)
    .attr("y2", y(referenceVal))
    .on("mouseover", function(event, d) {
        d3.selectAll(".min-reference-line").style("stroke-opacity", "100%")
        .style("fill-opacity", "100%");
    })
    .on("mouseleave", function(event, d) {
        d3.selectAll(".min-reference-line").style("stroke-opacity", "10%")
        .style("fill-opacity", "10%");
    })


    // creating title 
    svg.append('g').attr('class','overview-bar-min-title')
    .append('text')
    .attr("y", 25)
    .attr("x", barIndividualWidth/2)
    .attr("text-anchor", "middle")
    .text("Average delay duration flights throughout out 2016-present")
    .style("font-size", "25px");
    
    document.getElementById("vis").appendChild(svg.node());


return svg.node();
// create the average refernce 
    
}


function formatText(t) {
    let formatNumber = d3.format(".1f");
    if (t ==0){
        return "n/a";
    }
    return IS_PERCENT? formatNumber(t)+"%" : formatNumber(t)+"m";
}

function getOverviewClassMapping(nameString){
    return nameString.replaceAll(' ', '-').replaceAll('.', '');
}
