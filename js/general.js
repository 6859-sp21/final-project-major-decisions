function generateProcessStep(){
    console.log("generateProcessStep");


    const width = 960;
    const height = 600;
    const svg = d3.create("svg")
    .attr('width', 960).attr('height', height)
    .attr('class', 'process-text')
    .attr('opacity', 0).attr("display", "none")
    .attr("viewBox", [0, 0, width, height + 10]) // changes here 
    //.style("background-color", "green")
    
    const textGroup = svg.append('g').attr('class', 'process-text-group')   
    .style('font-size', "40px")
    .style('font-weight', 'bold')
    .attr('width', 960).attr('height', 600)

    textGroup.append('text').text('I. Airport')
    .attr('x', 100).attr('y', 100)
 
    textGroup.append('text').text('II. Time Series')
    .attr('x', 100).attr('y', 200)
 
    textGroup.append('text').text('III. Airlines')
    .attr('x', 100).attr('y', 300)
 

    // 'II. Time Series'
    // 'III. Airlines'

    document.getElementById("vis").appendChild(svg.node());


    

}

function generateDataIntro() {
    const vis = d3.select("#vis")

    // step 1 Title image
    vis.append("svg").attr('class', 'bts-intro').attr('width', width).attr('height', height)
    .attr('opacity', 0)
    .append("svg:image")
    .attr('x', -9)
    .attr('y', -12)
    .attr('width', width).attr('height', height)
    .attr("xlink:href", "assets/bts.png");

    // step 2 raw data image
    vis.append("svg").attr('class', 'data-intro').attr('width', width).attr('height', height)
    .attr('opacity', 0)
    .append("svg:image")
    .attr('x', -9)
    .attr('y', -12)
    .attr('width', width).attr('height', height)
    .attr("xlink:href", "assets/raw_data.png");

}