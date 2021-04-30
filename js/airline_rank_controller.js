d3.csv('https://raw.githubusercontent.com/6859-sp21/final-project-major-decisions/main/data/airlines.csv').then((data)=>{create_airline_rank_bar(data)});

function create_airline_rank_bar(data) {
    const vis = d3.select("#vis");
    d3.group(data, d => d.carrier_name);

    n = 5
    carrier = new Set(data.map(d => d.carrier_name));

    const datevalues = Array.from(d3.rollup(data, ([d]) => d.arr_flights, d => [d.month], d => d.carrier_name))
    .map(([date_tuple, data]) => [createDate(date_tuple), data])
    .sort(([a], [b]) => d3.ascending(a, b));

    console.log(datevalues);
}

function createDate(date_tuple) {    
    return new Date().setFullYear(date_tuple[0], date_tuple[1]);
}
