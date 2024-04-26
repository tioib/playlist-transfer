function calculatePoints(search,points,which)
{
    for(let i = 0; i < search.length; i++)
    {
        let result = search[i].hola;
        if(result > points[which].points)
        {
            points[which].points = result;
            points[which].id = search[i].chau;
        }  
    }
    return points;
}


const sEp = [
    {hola:21,chau:12},
    {hola:6,chau:23},
    {hola:7,chau:3},
    {hola:5,chau:4}
], sT = [
    {hola:2,chau:12},
    {hola:3,chau:23},
    {hola:1,chau:3},
    {hola:43,chau:4}
],
search = {tracks:sT,episodes:sEp};

console.log(calculatePoints(search.tracks,{track: {id:"",points:0}, episode: {id:"",points:0}},"track"));
console.log(calculatePoints(search.episodes,{track: {id:"",points:0}, episode: {id:"",points:0}},"episode"));