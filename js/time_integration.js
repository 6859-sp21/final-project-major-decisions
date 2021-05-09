function createTimeChart() {
  d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines_time_agg.csv", function (d) {
    return {
      // year: +d.year,
      // month: +d.month,
      date: new Date(+d.year, +d.month),
      carrier: d.carrier,
      carrier_name: d.carrier_name,
      arr_flights: +d.arr_flights,
      // arr_del15: +d.arr_del15,
      carrier_ct: (+d.carrier_ct * 10000) / +d.arr_flights,
      weather_ct: (+d.weather_ct * 10000) / +d.arr_flights,
      nas_ct: (+d.nas_ct * 10000) / +d.arr_flights,
      security_ct: (+d.security_ct * 10000) / +d.arr_flights,
      late_aircraft_ct: (+d.late_aircraft_ct * 10000) / +d.arr_flights,
      // arr_cancelled: +d.arr_cancelled,
      // arr_diverted: +d.arr_diverted,
      // arr_delay: +d.arr_delay,
      // carrier_delay: +d.carrier_delay,
      // weather_delay: +d.weather_delay,
      // nas_delay: +d.nas_delay,
      // security_delay: +d.security_delay,
      // late_aircraft_delay: +d.late_aircraft_delay,
    };
  }).then(function (data) {
    let airData = data;
    generateTimeChart(airData);
  });
}

function generateTimeChart(data) {
  let sortedData = data.sort((x, y) => d3.ascending(x.date, y.date));

  // need to set up
  let aggData = sortedData.filter((d) => d.carrier === "AS");
  let selectedCarrier = "Alaska Airlines Inc.";

  let airlineCarriers = new Set(data.map((d) => d.carrier_name));

  // add the options to the button
  let airlineSelection = d3.select("#selectButton")
    .selectAll("myOptions")
    .data(airlineCarriers)
    .enter()
    .append("option")
    .text(function (d) {
      return d;
    })
    .attr("value", function (d) {
      return d;
    });

  // set the dimensions and margins of the graph
    let fullWidth = 560,
        fullHeight = 500;

    let margin  = {top: 20, right: 30, bottom: 30, left: 60},
      width = fullWidth - margin.left - margin.right,
      height  = fullHeight - margin.top - margin.bottom;

  let previewHeight = 150;

  // append the svg object to the body of the page
  const svg = d3.select("#vis")
    .append("svg")
    .attr("class", "five-step")
    .attr("id", "time_vis")
    // .attr("width", width + margin.left + margin.right)
    .attr("width", width + 5*margin.left) // 800
    .attr("height", height + 2*previewHeight) //margin.top + margin.bottom) // 500
    .attr("style","outline: thin solid red;") // use this to see full size of svg
    .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.bottom})`
      );

  // document.getElementById("vis").appendChild(svg.node());
  // for some reason, using this doesn't actually add it to the DOM?
  // also, lining up axes and areas keeps going outside bounds without append("g") and translate

  // ----- DEFINE STACKED DATA ----- //
  let delayTypes = [
    "carrier_ct",
    "weather_ct",
    "nas_ct",
    "security_ct",
    "late_aircraft_ct",
  ];

  let stackGen = d3.stack().keys(delayTypes);
  let stackedData = stackGen(aggData);


  // ----- AXES SCALES AND LABELS ----- //
  let x = d3
    .scaleTime()
    .domain(d3.extent(sortedData, (d) => d.date))
    .range([0, width])
    .nice();

  let xAxis = d3.axisBottom(x);
  let xAxisGroup = svg
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0,${height-margin.top})`);

  let xAxisLabel = svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width/2 + margin.right)
    .attr("y", height + margin.top)
    .text("Date")

  let y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(sortedData, function (d) {
        return (
          d.carrier_ct +
          d.weather_ct +
          d.nas_ct +
          d.security_ct +
          d.late_aircraft_ct
        );
      }),
    ])
    .range([height, 0])
    .nice();

  let yAxis = d3.axisLeft(y);
  let yAxisGroup = svg
    .append("g")
    .call(yAxis)
    .attr("transform", `translate(0,${-margin.top})`);

  let yAxisLabel = svg.append("text")
    .attr("x", -height*3/4)
    .attr("y", -50)
    .text("No. of Delays per 10,000 Arriving Flights")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "start")


  // ----- COLOR ENCODING ----- //
  let color = d3.scaleOrdinal().domain(delayTypes).range(d3.schemeSet2);


  // ----- DRAW VERTICAL LINE TO SHOW VALUE ON MOUSEOVER ----- //
  let hoverLine = svg.append("line")
    .attr("class", "hoverInfo")
    .attr("class", "x")
    .attr("y1", 0)
    .attr("y2", height - margin.top)// - margin.bottom)
    .style("stroke", "red")
    .style("stroke-dasharray", "3,3")
    .style("opacity", 0);

  let hoverValue = svg.append('g')
    .append('text')
      .attr("class", "hoverInfo")
      .attr("class", "hoverValue")
      .style("opacity", 0)

  // https://stackoverflow.com/questions/38670322/d3-brushing-and-mouse-move-coexist 
  
  
  // ----- CONTEXT VIEW AXES AND SCALES ----- //
  let xContext = d3
    .scaleTime()
    .domain(d3.extent(sortedData, (d) => d.date))
    .range([0, width])
    .nice();

  let xContextAxis = d3.axisBottom(x);
  let xContextAxisGroup = svg
    .append("g")
    .call(xContextAxis)
    .attr("transform", `translate(0,${height + previewHeight + margin.bottom})`);

  let yContext = d3
    .scaleLinear()
    .range([previewHeight, 0])
    .domain(y.domain())


  // ----- ADD CONTEXT COMPONENTS ----- //
  let context = svg.append("g")
    .attr("class", "context")
    .attr("transform", `translate(0,${height + margin.bottom})`)

  let areaContext = d3
    .area()
    .x((d) => x(d.data.date))
    .y0((d) => yContext(d[0]))
    .y1((d) => yContext(d[1]));

  let contextView = context
    .selectAll("contextLayers")
    .data(stackedData)
    .join("path")
    .attr("d", areaContext)
    .attr("fill", "#B2C8EE")

  let contextRect = context.append('rect')
    .attr("class", "contextRect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", previewHeight)
    .attr("stroke", "black")
    .attr("fill", "#d3d3d3")
    .attr("opacity", 0.5)


  // ----- BRUSH TO ZOOM ----- //
  let brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width - margin.right, height],
    ])
    .on("end", brushed);

  var idleTimeout;
  function idled() {
    idleTimeout = null;
  }


  function brushed(event) {
    let s = event.selection;
    if (!s) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
      x.domain([0, 0]);
    } else {
      let newX0 = xContext(x.invert(s[0])),
          newX1 = xContext(x.invert(s[1]));

      x.domain([x.invert(s[0]), x.invert(s[1])]);

      svg.select(".brush").call(brush.move, null);

      xAxisGroup.call(xAxis.scale(x));
      svg.selectAll(".delayLayers").transition().duration(1000).attr("d", area);
      svg.selectAll(".contextRect").transition().duration(1000)
        .attr("x", newX0)
        .attr("width", newX1 - newX0);
    }
  }

  svg.on("dblclick", function () {
    x.domain(d3.extent(data, (d) => d.date)).nice();
    xAxisGroup.call(xAxis);
    svg.selectAll(".delayLayers").transition().duration(1000).attr("d", area);
    svg.selectAll(".contextRect").transition().duration(1000)
      .attr("x", 0)
      .attr("width", width);
  });


  // ----- DRAW AREAS ----- //
  // set up clip area so visualization doesn't go past axes
  let clip = svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height-margin.top)
    .attr("x", 0)
    .attr("y", 0);

  let clipped = svg.append("g").attr("clip-path", "url(#clip)");
  let eventsRect = svg.append("g")
    .attr("class","events")
    .attr("class", "brush");
  eventsRect.call(brush);

  let area = d3
    .area()
    .x((d) => x(d.data.date))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]));

  let layers = clipped
    .selectAll("layers")
    .data(stackedData)
    .join("path")
    .attr("d", area)
    .attr("class", function (d) {
      return "delayLayers " + d.key;
    })
    .attr("fill", (d) => color(d.key));


  // ----- ADD HOVER LINE ----- //

  let bisect = d3.bisector(d => d.date).right;

  eventsRect
    .on("mousemove", (event, d) => {
      let x0 = x.invert(d3.pointer(event)[0]);
      let i = bisect(sortedData, x0);
      let d0 = sortedData[i];
      let d1 = sortedData[i+1];
      let datum = (x0 - d0.date > d1.date - x0) ? d1 : d0;
      let total_ct = datum.carrier_ct + datum.weather_ct + datum.nas_ct + datum.security_ct + datum.late_aircraft_ct;

      svg.select(".x")
        .attr("transform",
          `translate(${x(datum.date)}, 0)`)
        .style("opacity",1)
        .raise();
      svg.select(".hoverValue")
        .attr("transform",
          `translate(${x(datum.date)}, ${y(total_ct)-100})`)
        .text(total_ct.toFixed(2) + '\n' + new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long'}).format(datum.date))
        .style("opacity",1)
        .raise();
    })
    .on("mouseout", (event, d) => {
      svg.select(".x").style("opacity", 0);
      svg.select(".hoverValue").style("opacity", 0);
    })


  // ----- ADD TITLE ----- //
  let chartTitle = svg
    .append("text")
    .attr("id", "timeTitle")
    .attr("x", width/2)
    .attr("y", -margin.top)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text((d) => "Delayed " + selectedCarrier + " Flights")


  // ----- FILTER BY AIRLINE ----- // 
  function updateChart(selectedCarrier, svg) {
    let filteredData = sortedData.filter(
      (d) => d.carrier_name === selectedCarrier
    );
    let filteredStack = stackGen(filteredData);
    svg.selectAll(".delayLayers").remove();

    clipped
      .selectAll("layers")
      .data(filteredStack)
      .join("path")
      .attr("class", function (d) {
        return "delayLayers " + d.key;
      })
      .attr("fill", (d) => color(d.key))
      .attr(
        "d",
        d3
          .area()
          .x((d) => x(d.data.date))
          .y0((d) => y(d[0]))
          .y1((d) => y(d[1]))
      )

    // change data for hover line with tooltip
    eventsRect
      .on("mousemove", (event, d) => {
        let x0 = x.invert(d3.pointer(event)[0]);
        let i = bisect(filteredData, x0);
        let d0 = filteredData[i];
        let d1 = filteredData[i+1];
        let datum = (x0 - d0.date > d1.date - x0) ? d1 : d0;
        let total_ct = datum.carrier_ct + datum.weather_ct + datum.nas_ct + datum.security_ct + datum.late_aircraft_ct;

        svg.select(".x")
          .attr("transform",
            `translate(${x(datum.date)}, 0)`)
          .style("opacity",1)
          .raise();
        svg.select(".hoverValue")
          .attr("transform",
            `translate(${x(datum.date)}, ${y(total_ct)-100})`)
          .text(total_ct.toFixed(2) + '\n' + new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long'}).format(datum.date))
          .style("opacity",1)
          .raise();
      })
      .on("mouseout", (event, d) => {
        svg.select(".x").style("opacity", 0);
      })
  }

  function updateTitle(selectedCarrier) {
    document.getElementById("timeTitle").innerHTML = "Delayed " + selectedCarrier + " Flights";
  }

  d3.select("#selectButton").on("change", function (d) {
    selectedCarrier = this.value;
    updateChart(selectedCarrier, svg);
    updateTitle(selectedCarrier);
  });


  // ----- HOVER ON LEGEND TO HIGHLIGHT DELAY AREA ----- //
  let highlight = function (event, d) {
    d3.selectAll(".delayLayers").style("opacity", 0.2); // lower opacity if not selected
    d3.select("path.delayLayers." + d).style("opacity", 1); // selected should have full opacity
  };

  let noHighlight = function (event, d) {
    d3.selectAll("path.delayLayers").style("opacity", 1);
  };


  // ----- DRAW LEGEND AND LABELS ----- //
  let legendSize = 20;
  let legend = svg
    .selectAll("legend")
    .data(delayTypes)
    .enter()
    .append("rect")
    .attr("x", width)
    .attr("y", function (d, i) {
      return 10 + i * (legendSize + 5);
    })
    .attr("width", legendSize)
    .attr("height", legendSize)
    .style("fill", (d) => color(d))
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight);

  const labelMap = new Map();
  labelMap.set('carrier_ct', 'Carrier Delays')
  labelMap.set('weather_ct', 'Weather Delays');    
  labelMap.set('nas_ct', 'National Air System Delays')
  labelMap.set('security_ct', 'Security Delays')
  labelMap.set('late_aircraft_ct', 'Late Aircraft Delays')

  let labels = svg
    .selectAll("labels")
    .data(delayTypes)
    .enter()
    .append("text")
    .attr("x", width + legendSize * 1.2)
    .attr("y", function (d, i) {
      return 10 + i * (legendSize + 5) + legendSize / 2;
    })
    .style("fill", (d) => color(d))
    .text((d) => labelMap.get(d))
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight);
}
