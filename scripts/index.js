// import { generateUserFriendlyAnswer } from "./config";
 import { getPosters } from "./config";
import { main } from "./config";
import { supabase } from "./config";
let selectedNewOrClassic = '';  
let selectedMood = '';
let count = 0;



document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('questionPage.html')) {
        initializeQuestionPage()
    }
    else if (window.location.pathname.includes('moviePage.html')) {
        count = 0;
        renderMovies(count)
    }
})

document.addEventListener('click', (e) => {
    if (e.target.id === 'homePageBtn') {
        accessHomePageData()
    }
    else if (e.target.id === 'movie-btn') {
        handlequestionsPage(e.target.id)
    }
    else if (e.target.classList.contains('option')) {
        selectOption(e.target)
       
    }
    else if (e.target.classList.contains('next-movie-btn')) {
        renderNextMovie()
    }
})
async function handlequestionsPage() {
    const TotalPoeple = sessionStorage.getItem('poepleNum') || ''
    const personNum = parseInt(sessionStorage.getItem('currentPerson')) || 1
    const time = sessionStorage.getItem('time')||''
    const qOne = document.getElementById('fav-movie').value;
            const qTwo = selectedNewOrClassic;
            const qThree = selectedMood;
    const qLast = document.getElementById('fav-person').value;
    if (!qOne || !qTwo || !qThree || !qLast) {
        alert('Please fill all fields and select all options!')
        return
    }
    const currentInterests=JSON.parse(sessionStorage.getItem('userInterests'))||[]
    currentInterests.push({
                person:personNum,
                userFavrtMovie: qOne,
                userLikes: qTwo,
                userMood: qThree,
                artistUserLikes: qLast
            })
    sessionStorage.setItem('userInterests', JSON.stringify(currentInterests))
    if (personNum < parseInt(TotalPoeple)) {
        const nextPerson = personNum + 1
        sessionStorage.setItem('currentPerson', nextPerson)
        resetAndReloadForm()
    }
    else {
        console.log('All people data:', currentInterests)
        
        let interestStrings = currentInterests.map(userInterests => {
            return `user's Favourite movie is ${userInterests.userFavrtMovie} and likes ${userInterests.userLikes} and mood is ${userInterests.userMood} and favourite actor/actress is ${userInterests.artistUserLikes}  `;
            
        }).join('.')
        interestStrings += `and time we have is ${time} hours`;
        console.log(interestStrings)
           const embededInterestsArray=await main(interestStrings)
        
        
          const { data, error } = await supabase.rpc('match_movies ', {
            query_embedding:embededInterestsArray.embedding, 
            match_threshold: 0.5,
            match_count:5
          });
        console.log(data);
       
        
        const moviePageArray =await getPosters(data)
        sessionStorage.setItem('moviePageData', JSON.stringify(moviePageArray))
        window.location.href = './moviePage.html'
        
        
        }
    
}
function renderMovies(count=0) {
    let recommendations = JSON.parse(sessionStorage.getItem('moviePageData'))
    const movieContainer = document.querySelector('.movie-container')
    const moviePageBtn = document.querySelector('.movie-btn')
    // count= 0
    let moviePageHtml = ''
    if (recommendations.length === 0) {
        movieContainer.innerHTML = '<div>OOPS!! we got no movie data about this movie 😥.. Try again with relevent keywords</div> '
    }
    else  {
        const data = recommendations[count]
        const posterUrl = data.poster || '../assets/no-poster.png';
         moviePageHtml=`<div class="movie-name">${data.title}</div>
           <img src="${posterUrl}" alt="movie-poster" id='movie-poster'>
           <div class="movie-desc">
            ${data.desc}
           </div>`
        movieContainer.innerHTML = moviePageHtml
        if (recommendations.length === 1|| count===recommendations.length-1) {
                // Only one movie - disable button and show enjoy message
                moviePageBtn.textContent = 'Enjoy 🍿🍿';
                moviePageBtn.disabled = true;
                moviePageBtn.classList.remove('next-movie-btn');
            } else {
                // Multiple movies - show "Next Movie" button
                moviePageBtn.textContent = 'Next Movie';
                moviePageBtn.disabled = false;
                moviePageBtn.classList.add('next-movie-btn');
            }
            
        }
        
       
    }
    
function renderNextMovie() {
     const recommendations = JSON.parse(sessionStorage.getItem('moviePageData'));
    if (count < recommendations.length - 1) {
        count++;
        renderMovies(count);
    }

}

function resetAndReloadForm() {
    selectedNewOrClassic = ''
    selectedMood = ''
    window.location.reload()
}

 
function initializeQuestionPage() {
    const TotalPoeple = sessionStorage.getItem('poepleNum')||''
    const personNum = sessionStorage.getItem('currentPerson')||1
    const button=document.getElementById('movie-btn')
    const pageCount = document.querySelector('.count')
        if (TotalPoeple === '1') {
            pageCount.textContent = '🎐🎐'
            button.textContent = 'GetMovie'
        }
        else {
            pageCount.textContent = `${personNum}`
           button.textContent=personNum<parseInt(TotalPoeple)?'Next Person':'Get Movie'
        }
    }


    function accessHomePageData() {
      const  PoepleNum = document.getElementById('poepleNum').value
       const  time = document.getElementById('time').value
        if (PoepleNum && time) {
            sessionStorage.setItem('poepleNum', PoepleNum)
            sessionStorage.setItem('time', time)
            sessionStorage.setItem('currentPerson', 1)
            sessionStorage.setItem('userInterests', JSON.stringify([]))
            window.location.href='./questionPage.html'
        }
        else {
            window.alert('please fill out every field')
        }
        
    }



    // For question 2 (4 options)

    function selectOption(button) {
        const value = button.getAttribute('data-value')
        const siblings = button.parentNode.querySelectorAll('.option')
        siblings.forEach(sibling => {
            sibling.classList.remove('selected')
        })
        button.classList.add('selected')
    
        if (value === 'new' || value === 'Classic') {
            selectedNewOrClassic = value
            console.log('New/Classic selected:', selectedNewOrClassic)
        }
        else if (['fun', 'serious', 'inspiring', 'scary'].includes(value)) {
            selectedMood = value
            console.log('Mood selected:', selectedMood)
        }
       
    }

    
