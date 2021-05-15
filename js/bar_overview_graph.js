function overviewBar(data) {
    const minPromise = d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/rank_ave_min.csv");
    const percentPromise = d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/rank_ave_percent.csv");
    Promise.all([percentPromise, minPromise]).then(([percentData,minData]) => {
        createOverviewChart(data, percentData, minData);
        console.log(percentData);
        console.log(minData);

      });
}

const marginBarGraph = ({top: 50, right: 60, bottom: 6, left: 0});
const individualBarGraphMargin = ({top: 10, right: 10, bottom: 6, left: 10});

function createOverviewChart(data, percentData, minData){

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

function createOverviewBarPercent(data, percentData) {
    const barIndividualWidth = 900;
    const barIndividualHeight = 400;

    const x = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([margin.left, width - margin.right])
    .padding(0.1)

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, barIndividualWidth, barIndividualHeight + 10]) // changes here 
    .attr("class", "overview-bar overview-min")
    // .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    // svg.append('g').attr('class','dynamic-bar-title').append('g').append('text').text("hellow");
    document.getElementById("vis").appendChild(svg.node());
    
}