 var scrollVis = function (data) {
    // size of te 
    var width = 960;
    var height = 650;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };
  
    // Keep track of which visualization
    // we are on and which was the last
    // index activated. When user scrolls
    // quickly, we want to call all the
    // activate functions that they pass.
    var lastIndex = -1;
    var activeIndex = 0;
  
    // main svg used for visualization
    var svg = null;
  
    // d3 selection that will be used
    // for displaying visualizations
    let g = null;
    
    // When scrolling to a new section
    // the activation function for that
    // section is called.
    let activateFunctions = [];
    // If a section has an update function
    // then it is called while scrolling
    // through the section with the current
    // progress through the section.
    var updateFunctions = [];
  
    /**
     * chart
     *
     * @param selection - the current d3 selection(s)
     *  to draw the visualization in. For this
     *  example, we will be drawing it in #vis
     */
    var chart = function (selection) {
      selection.each(function (rawData) {
        // create svg and give it a width and height
        svg = d3.select(this).selectAll('svg').data(rawData);
  
        setupVis(data);
  
        setupSections();
      });
    };
  
  
    // initial elements for allsections of the visualization. Hide everything first.
    var setupVis = function (data) {
        console.log("Calling setupVis")
     
        const vis = d3.select("#vis").append("svg").attr('width', 10).attr('height', 10)
        
        // step 1
        create_airline_rank_bar(data);
        vis.append("g")
        .append("text").text("lets go on a adventure")
        .attr('class', 'one-project-title')
        .attr('x', width / 2)
        .attr('y', height / 3)
        .attr('fill', 'black')
        .attr('opacity', 0);
    };
  
    /**
     * setupSections - each section is activated
     * by a separate function. Here we associate
     * these functions to the sections based on
     * the section's index.
     *
     */
    var setupSections = function () {
      // activateFunctions are called each
      // time the active section changes
      activateFunctions[0] = showTitle;
      activateFunctions[1] = showStepTwo;
      activateFunctions[2] = showStepThree;

      
      // updateFunctions are called while
      // in a particular section to update
      // the scroll progress in that section.
      // Most sections do not need to be updated
      // for all scrolling and so are set to
      // no-op functions.
      for (var i = 0; i < 9; i++) {
        updateFunctions[i] = function () {}; // insert appropriate update functions
      }
    };
  
    /**
      ACTIVATE FUNCTIONS
     */
    const transitionTime = 600;
    // STEP 1
    function showTitle() {
      console.log("Step 1: Calling show title");
      d3.select("#total_map").remove();
      d3.select("#total_tooltip").remove();
      d3.select("#delay_map").remove();
      d3.select("#delay_tooltip").remove();

      d3.select('.one-project-title')
        .transition()
        .duration(transitionTime)
        .attr('opacity', 1);
  
        d3.select('.two-step')
        .transition() // this need to be left in as a hack for fast scrolling
        .duration(0)
        .attr('opacity', 0);
    }
  
    // STEP 2
    function showStepTwo() {
      console.log("Step 2: calling show filler title");

      d3.select("#delay_map").remove();
      d3.select("#delay_tooltip").remove();
      generateMapTotal()

      d3.select('.one-project-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

      d3.select('.two-step')
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1);

      d3.select('.three-step')
      .transition()
      .duration(0)
      .attr('opacity', 0);
    }

    // STEP 3
    function showStepThree() {
      console.log("Step 3: calling step 3");
      generateMap('arr_del15')

      d3.select("#total_map").remove();
      d3.select("#total_tooltip").remove();

      d3.select('.two-step')
      .transition()
      .duration(0)
      .attr('opacity', 0);

      d3.select('.three-step')
      .transition()
      .duration(transitionTime)
      .attr('opacity', 1);

    }
  
    /**
     * activate 
     *
     * @param index - index of the activated section
     */
    chart.activate = function (index) {
      console.log("Activate functions");
      activeIndex = index;
      var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
      var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
      scrolledSections.forEach(function (i) {
        activateFunctions[i]();
      });
      lastIndex = activeIndex;
    };
  
    /**
     * update
     *
     * @param index
     * @param progress
     */
    chart.update = function (index, progress) {
      updateFunctions[index](progress);
    };
  
    // return chart function
    return chart;
  };
  
  
  /**
   * display - called once data
   * has been loaded.
   * sets up the scroller and
   * displays the visualization.
   *
   * @param data - loaded tsv data
   */
  function display(data) {
    // create a new plot and
    // display it
    var plot = scrollVis(data);
    d3.select('#vis')
      .datum(data)
      .call(plot);
  
    // setup scroll functionality
    var scroll = scroller()
      .container(d3.select('#graphic'));
  
    // pass in .step selection as the steps
    scroll(d3.selectAll('.step'));
  
    // setup event handling
    scroll.on('active', function (index) {
      // highlight current step text
      d3.selectAll('.step')
        .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });
  
      // activate current section
      plot.activate(index);
    });
  
    scroll.on('progress', function (index, progress) {
      plot.update(index, progress);
    });
  }
  
  // load data and display, the entrance point to the whole flow
  d3.csv('https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines.csv').then((data)=>{display(data)});
  