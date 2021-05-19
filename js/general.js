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


    document.getElementById("vis").appendChild(svg.node());

}

function generateDataIntro() {
    const height = 400;
    const vis = d3.select("#vis")
    const iconVis = vis.append("svg").attr('class', 'data-intro-icon').attr('width', 950).attr('height', 600)
    .attr('opacity', 0).attr('display', 'none')
    
    iconVis.append("svg:image")
    .attr('x', 10)
    .attr('y', 10)
    .attr('width', 120).attr('height', height)
    .attr("xlink:href", "assets/airline.png");

        
    iconVis.append("svg:image")
    .attr('x', 200)
    .attr('y', 10)
    .attr('width', 150).attr('height', height)
    .attr("xlink:href", "assets/weather.png");

    iconVis.append("svg:image")
    .attr('x', 400)
    .attr('y', 10)
    .attr('width', 150).attr('height', height)
    .attr("xlink:href", "assets/radar.png");

    iconVis.append("svg:image")
    .attr('x', 600)
    .attr('y', 10)
    .attr('width', 150).attr('height', height)
    .attr("xlink:href", "assets/airplane_hour.png");

    iconVis.append("svg:image")
    .attr('x', 800)
    .attr('y', 10)
    .attr('width', 150).attr('height', height)
    .attr("xlink:href", "assets/security.png");
 
 


}