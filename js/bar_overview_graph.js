function createOverviewBarMin(data) {
    const barIndividualWidth = 900;
    const barIndividualHeight = 400;

    const svg = d3.create("svg")
    .attr("viewBox", [0, 0, barIndividualWidth, barIndividualHeight + 10]) // changes here 
    .attr("class", "overview-bar overview-min")
    .attr('display', 'block')
    .attr('opacity', 1);

      // creating title 
    svg.append('g').attr('class','dynamic-bar-title').append('g').append('text').text("hellow");
    document.getElementById("vis").appendChild(svg.node());
}

function createOverviewBarPercent(data) {
    
}