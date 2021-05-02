fetch('https://api.covid19india.org/states_daily.json')
.then(res => res.json())
.then(data=> {
    const totalCovidDataState = data.states_daily 
    const groupedData = processData(totalCovidDataState); 
    plotChart(groupedData)
})

function plotChart(data) {
    const svg = d3.select("#chart")
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    const dateList = Array.from(data.keys()) 
    const presentDate = dateList[0]

    const presentData = processEachDateData(data.get(presentDate).get("Confirmed")[0])
            
    const widthScale = d3.scaleLinear()
                      .domain([0, d3.max(Object.values(presentData), d => parseInt(d.value))])
                      .range([0, width])

    const container = svg.append("g")
                          .classed("container", true)
    const rectProperties = {height: 20, padding: 10}
    
    container.selectAll("rect")
              .data(presentData)
              .enter()
              .append("rect")
              .attr("x", 10)
              .attr("y", (d,i) => i * (rectProperties.height + rectProperties.gap))
              .attr("width", d => widthScale(parseInt(d.value)))
              .attr("height", rectProperties.height)
}

function processData(data) { 
   return d3.group(data, d => d.date, e => e.status);
}

function processEachDateData(data) {
   //remove status and date
   delete data.date
   delete data.status

   return Object.keys(data)
                .map(key => ({key, value: data[key]}))
                .sort((a,b) => b.value-a.value) 
}