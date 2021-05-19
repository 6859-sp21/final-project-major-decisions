# Flight Delays in the U.S.

## Project Information
Team Members: Seara Chen, Julia Fiksinski, Maggie Wang

Abstract:
The onset of the COVID-19 pandemic rapidly brought the air transportation sector to a standstill in the spring of 2020. However, with vaccination rates rising, the number of flights nationwide for post-quarantine travel stands to grow as well. We sought to examine the air transportation sector's recent performance. We acquired data (dated from January 2016 to March 2021) regarding United States airline and airport on-time statistics and delay causes from the United States Department of Transportation's Bureau of Transportation Statistics website. The primary features we examined were geographic airport data, time-based flight delay data, and airline-based delay data. We created a scrollytelling presentation with numerous interactive visualizations and static charts to present these facets in a manner that encourages user exploration.

![alt text](https://github.com/6859-sp21/final-project-major-decisions/raw/main/assets/delay-map.png)

Paper: [Flight Delays in the United States](https://github.com/6859-sp21/final-project-major-decisions/blob/e44f8a4e2c7bd3a14a9964ad13abec05eb56491f/final/FinalPaper.pdf)

Video: [Video Teaser](https://www.youtube.com/watch?v=JbTbQIui0QI)


## Project Process
This project was created over a timeline of a month. Work began with an ideation phase where we worked on deciding on our dataset and what within the dataset we were interested in visualizing. During this stage, we made use of a design doc and Google Jamboards to sketch out designs and ideas. Eventually, we settled on three main sections of the dataset we wanted to give the user the ability to explore. First, geographic airport data. Second, time-based flight delay. data. Finally, airline-based delay data. Since the project can be roughly split into three sections, each of the three members of our team took charge of one of them and met 2-3 times a week to discuss updates, changes, and next steps. This process progressed until all three sections were in good working states, when we each took on additional responsibilities. Seara took charge of stitching together the three sections in a scrollytelling format, and Maggie and Julia took charge of the various documents included in the deliverables.


## Individual Contributions
### Maggie
Maggie worked on section one of three, geographic airport data. This section consists of three visualizations: two interactive maps and a donut chart. The interactive bubble maps are the core of this section, and as such they were created first. These maps contain several features, such as bubbles that scale in size with number of arrivals, on hover tool-tips that display more detailed information about each airport, and zooming and panning for each state. The second bubble map of the two also includes delay-cause color coding and each cause is displayed on the side as a combination list of selection buttons and legend. After these were finalized, a color coded donut chart was added to provide some more context towards the overall amalgamated dataset. These took the majority of the project to complete, so remaining time was put toward writing various parts of the paper and readme that were both relevant to her specific work as well as some of the shared sections. 


### Julia
Julia worked on section two of three, time-based flight delays. This section consists of one interactive visualization, a GIF, and a static line chart. After examining the dataset, the key design decisions for this visualization were to 1) choose a chart type that would let users compare the proportions of different delay causes over time (hence the choice of stacked areas for the delay causes instead of a line for each cause); 2) scale the data to better account for a wide range in the data values; and 3) create an interactive element to let users explore the temporal data in greater detail.  She first worked on creating a stacked area chart that allowed for brushing and zooming to provide this interaction. This feature, on-hover highlighting, and filtering by airline were completed for the MVP. After receiving peer critiques for the MVP, Julia added the following features: 1) a vertical cursor line with tooltips to show the number of delays per cause; 2) on-click interactions to show individual area plots for each delay cause; 3) a context view under the chart to show user which time period they had zoomed into; and 4) y-axis resizing to make area plots with much lower delay counts more easily visible. These additional features based on peer critiques and team brainstorming helped to create a more robust visualization for users to explore.

Aside from polishing the interactivity for her core visualization and creating the related GIF and still image using this visualization, she spent the last week of the project timeline writing various parts of the paper and readme (summary of individual work and some shared sections in the paper).

### Seara
Seara worked on the last section of three, airline comparison, as well as setting up and maintaining the structure of the strolling visualization as the team added more visualizations. This section consists of three visualizations: two interactive and animated bar charts, and an interactive summary bar graph.  She first thought about how she wanted to process data and the data analysis through which one can best compare between airlines. After deciding on calculating the percentage of flights delayed and the expected duration of delay time, the team thought it would be particularly interesting to see how the ranking changes throughout the year. To emphasize the change in ranking, she developed the method of the autoplay animated bar chart that swaps positions when one airline takes over another. Then the slider and selection buttons were developed to allow users to pause on various years and to select the airline of their interests. The last visualization in the section is also the visualization last developed. She wanted to give a summary of airlines’ performance related to delays in the past ~ 5 years.

With regards to building the structure of the scrolling visualization, Seara started off by building a simple skeleton that allows an area of visualization to always be present on the right with text on the left. She then added in structure so that the user can scroll to different sections’ text up with the corresponding visualization updated. Then she set out slots in the visualization where the rest of the team could plug their visualizations in. As the project progressed, she tested and fixed the scrolling interactions extensively to catch any bugs and unexpected behaviours.


## Sources
- Racing bar chart: https://github.com/johnwalley/d3-simple-slider
- Slider on the timeline: https://observablehq.com/@d3/bar-chart-race-explained
- Bubble map for location data: https://www.d3-graph-gallery.com/bubblemap
- Zoom to bounding box: https://observablehq.com/@d3/zoom-to-bounding-box?collection=@d3/d3-zoom
- D3 time-series line chart: https://bl.ocks.org/robyngit/89327a78e22d138cff19c6de7288c1cf
- Focus + context (context view underneath area): https://observablehq.com/@d3/focus-context
- Zoomable area chart with time axis: https://observablehq.com/@d3/zoomable-area-chart
- Stacked area chart with hover interaction: https://www.d3-graph-gallery.com/graph/stackedarea_template.html
- Brush to zoom: https://www.d3-graph-gallery.com/graph/area_brushZoom.html
- Filter view by airline using dropdown: https://www.d3-graph-gallery.com/graph/line_filter.html
- Brush to zoom: https://www.d3-graph-gallery.com/graph/interactivity_zoom.html
- Multiple tooltips: https://stackoverflow.com/questions/38366067/unable-to-show-the-tooltip-values-for-stacked-area-chart-in-a-single-tooltip 
- Line graph: https://www.d3-graph-gallery.com/graph/line_several_group.html 
