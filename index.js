import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const myRoot = document.getElementById('root');
const rateLimitRequest = "https://api.github.com/rate_limit";
const rateSearchAPI = "https://developer.github.com/v3/rate_limit/";
//
// Below hardcoded error info should be gathered dynmically from the
// returned failure msg, but no time to figure out how to do it! -djb
//
const apiDocURL = "https://developer.github.com/v3/#rate-limiting";

//const apiError = "API rate limit exceeded for [your ip here]. But here's the good news: Authenticated requests get a higher rate limit. ";

//const apiErrorTmp = "You have exceeded the API rate limit (10 per minute). Please wait a moment before trying again. Thank you!";

function handleErrors(response) {
    if (!response.ok) {
        console.log("handleErrors caught one! " + response.ok);
        throw Error(response.statusText);
    }
//    else {
//        this.setState({ errorMessage: ""});
//        console.log("handleErrors says all clear! " + response.ok.value);
//    }
    return response;
}
/*
*/

class L04Proj3GitHubReposForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
              repos: []
            , errorMessage: null
            , statusText: null
            , searchForm: ""
            , btnSearch: ""
            , limit: 0
            , remaining: 0
            , remainColor: ""
            , resetSecs: null
            , resetMsecs: null
            , resetDate: ""
            , timeRemaining: 0
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({ btnSearch: e.target.value });
        console.log("handleChange 'e'.value is: " + e.target.value);
    }

    handleSubmit(e) {
        e.preventDefault();
        if (!this.state.btnSearch.length) {
            return;
        }

        this.setState({ searchForm: this.state.btnSearch});
        let mytemp = this.state.btnSearch;
        //this.setState( search: this.state.btnSearch);

        console.log("mytemp is " + mytemp);
        console.log("btnSearch is " + this.state.btnSearch);
        console.log("state.searchForm is " + this.state.searchForm);
        //this.setState(prevState => ({
        //    L04Proj3Search: ''
        //}));

        fetch(rateLimitRequest)
            .then(response => response.json())
            .then(responseJson => {
                this.setState({ limit: responseJson.resources.search.limit });
                this.setState({ remaining: responseJson.resources.search.remaining });
                if (this.state.remaining > 5 ) this.setState ({ remainColor: "black" });
                if (this.state.remaining < 6 && this.state.remaining > 2) this.setState ({ remainColor: "orange" });
                if (this.state.remaining < 3) this.setState ({ remainColor: "red" });
                this.setState({ resetSecs: responseJson.resources.search.reset });
                this.setState({ resetMsecs: this.state.resetSecs * 1000});
                this.setState({ resetDate: new Date(this.state.resetMsecs).toString()});
                this.setState({ timeRemaining: this.state.resetSecs - parseInt(Date.now()/1000, 10) });
            });

        fetch(
            'https://api.github.com/search/repositories?q=' + this.state.btnSearch + '&type=Repositories&sort=stars&per_page=10'
        ) 
            .then(handleErrors)
            .then(response => response.json())
            .then(responseJson => {
                this.setState({ repos: responseJson.items });
                this.setState({ errorMessage: null });
                console.log("how many time through? " );
            })
            .catch(error => { console.log('ERROR: request failed', error);
                this.setState({ errorMessage: error.message });
                console.log("Caught this error: " + this.state.errorMessage);
            });
    }

    render() { let myTmp = null; 
        if (!this.state.errorMessage) {
//            if ( this.state.repos.length ) {
            myTmp = this.state.repos.map((repo) => <li key={repo.id}><a href={"https://github.com/" + repo.owner.login} target="_blank"><img className="repoItems" src={repo.owner.avatar_url} alt=" no img available"/></a>  <span className="repoOwner"> Owner:</span> {repo.owner.login}, <span className="repoOwner">Repo Name:</span> {repo.name}</li>);
            //this.setState({errorMessage: null});
//            }
//            else {
//                console.log("repos array length is: " + this.state.repos.length);
//                myTmp = React.createElement("p", null, "Sorry, you got nothing! Please try a different search.");
//            }
        } else {

        //let myTMp = React.createElement( "span", null, apiErrorTmp); 
        myTmp = React.createElement("a", {href:apiDocURL, target:'_blank'}, "Sorry, you have exceeded the GitHub search Rate_Limit of 10 per minute. Please click here for more details or wait the " + this.state.timeRemaining + " seconds until reset and try again.");
            //this.setState({errorMessage: null});
}
        return (
          <div>
            <h4>Enter Github Repo Search Argument Below:</h4>
            <form onSubmit={this.handleSubmit}>
                <input type="text" onChange={this.handleChange}/>
                <button> Search for:  {this.state.btnSearch}</button>
            </form>
            <br/>
            <li>Performing 10 searches quickly will exceed GitHubs Rate_Limit threshold and search will fail.</li>
            <li>Clicking on the owner avatar will send you to their GitHub profile page.</li>
            <h5>Current GitHub Rate Limits for Search: <a href={rateSearchAPI} target="_blank"> (read about it here)</a> </h5>
            <ul>
                <li>Max Search Limit: {this.state.limit}</li>
                <li style={{color:this.state.remainColor}}>Number of Searches Remaining: {this.state.remaining}</li>
                <li>Search ResetDate: { this.state.resetDate }</li>
                <li>Seconds until reset: { this.state.timeRemaining } seconds</li>
            </ul>
            <div>
                <h4>Top 10 Repos that contain search argument-> {this.state.searchForm}</h4>
                <hr />
                {myTmp}
            </div>
          </div>
        );
    }
}

ReactDOM.render(<L04Proj3GitHubReposForm />, myRoot);
