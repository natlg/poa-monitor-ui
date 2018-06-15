import React, {Component} from 'react';
import './App.css';
import Test from "./result/Test";
import MissingRoundList from "./result/MissingRoundList";
import MissingTxsList from "./result/MissingTxsList";
import RewardList from "./result/RewardList";
import TxsPublicRpcList from "./result/TxsPublicRpcList";
import ReorgsList from "./result/ReorgsList";
import axios from "axios";
import {Button, Form, FormGroup, Label, Input} from 'reactstrap';
import logo from './img/poa-icon.png';
import {Card, CardHeader} from 'reactstrap';

class App extends Component {
    state = {
        network: "Sokol",
        lastSeconds: 7200,
        passed: "All",
        test: 0,
        isLocalTime: false,

        missingRoundsDescription: "Check if any validator nodes are missing rounds",
        missingRoundsRuns: [],

        missingTxsCheckDescription: "Check that all validator nodes are able to mine non-empty blocks",
        missingTxsRuns: [],

        rewardDescription: "Check if payout script works properly for all nodes (check mining address balance)",
        rewardRuns: [],

        txsPublicRpcDescription: "Periodically send txs via public rpc endpoint",
        txsPublicRpcRuns: [],

        reorgsDescription: "Check for reorgs",
        reorgs: []
    };

    async handleSubmit(event) {
        console.log('handleSubmit');
        event.preventDefault();
        // todo FormData is not compatible with edge
        const data = new FormData(event.target);
        let network = data.get('network');
        let lastSeconds = data.get('lastSeconds');
        let passed = data.get("passed");
        let test = data.get("test");
        let isLocalTime = !!data.get("timeCheckbox");
        console.log('network: ' + network + ", lastSeconds: " + lastSeconds + ", passed: " + passed + ", test: " + test + ", isLocalTime: " + isLocalTime.toString());
        const newState = Object.assign({}, this.state, {
            network: network,
            lastSeconds: lastSeconds,
            passed: passed,
            test: test,
            isLocalTime: isLocalTime
        });
        await this.setState(newState);
        this.getResults();
    }

    getResults() {
        let url = "http://poatest.westus.cloudapp.azure.com:3000/" + this.state.network + "/api/" + this.state.passed + "?lastseconds=" + this.state.lastSeconds + "&test=" + this.state.test;
        console.log('getResults, url: ' + url);
        axios
            .get(url)
            .then(response => {
                const newMissingRoundsRuns = response.data.missingRoundCheck.runs.map(r => {
                    r.key = r.id;
                    if (this.state.isLocalTime) {
                        r.time = new Date(r.time).toLocaleString();
                    }
                    return r;
                });
                const newMissingTxsRuns = response.data.missingTxsCheck.runs.map(r => {
                    r.key = r.id;
                    if (this.state.isLocalTime) {
                        r.time = new Date(r.time).toLocaleString();
                    }
                    return r;
                });
                const newRewardRuns = response.data.miningRewardCheck.runs.map(r => {
                    r.key = r.id;
                    if (this.state.isLocalTime) {
                        r.time = new Date(r.time).toLocaleString();
                    }
                    return r;
                });

                const newTxsPublicRpcRuns = response.data.txsViaPublicRpcCheck.runs.map(r => {
                    r.key = r.id;
                    if (this.state.isLocalTime) {
                        r.time = new Date(r.time).toLocaleString();
                    }
                    return r;
                });

                const newReorgs = response.data.reorgsCheck.reorgs.map(r => {
                    r.key = r.id;
                    if (this.state.isLocalTime) {
                        r.time = new Date(r.time).toLocaleString();
                    }
                    return r;
                });

                const newState = Object.assign({}, this.state, {
                    missingRoundsRuns: newMissingRoundsRuns.reverse(),
                    missingTxsRuns: newMissingTxsRuns.reverse(),
                    rewardRuns: newRewardRuns.reverse(),
                    txsPublicRpcRuns: newTxsPublicRpcRuns.reverse(),
                    reorgs: newReorgs.reverse()
                });
                console.log("newState: " + newState);
                this.setState(newState);
            })
            .catch(error => console.log(error));
    }

    componentDidMount() {
        console.log('componentDidMount');
        this.getResults();
    }

    render() {
        console.log('In Render, this.state.test: ' + this.state.test);
        let testElements = [
            <div className="table"><Test description={this.state.missingRoundsDescription}/>
                <MissingRoundList missingRoundsRuns={this.state.missingRoundsRuns}/>
                <br/>

                <Test description={this.state.missingTxsCheckDescription}/>
                <MissingTxsList missingTxsRuns={this.state.missingTxsRuns}/>
                <br/>

                <Test description={this.state.rewardDescription}/>
                <RewardList rewardRuns={this.state.rewardRuns}/>
                <br/>

                <Test description={this.state.txsPublicRpcDescription}/>
                <TxsPublicRpcList txsPublicRpcRuns={this.state.txsPublicRpcRuns}/>
                <br/>

                <Test description={this.state.reorgsDescription}/>
                <ReorgsList reorgs={this.state.reorgs}/>
            </div>,
            <div className="table">
                <Test description={this.state.missingRoundsDescription}/>
                <MissingRoundList missingRoundsRuns={this.state.missingRoundsRuns}/>
                <br/>
            </div>,

            <div className="table"><Test description={this.state.missingTxsCheckDescription}/>
                <MissingTxsList missingTxsRuns={this.state.missingTxsRuns}/>
                <br/>
            </div>,
            <div className="table"><Test description={this.state.rewardDescription}/>
                <RewardList rewardRuns={this.state.rewardRuns}/>
            </div>,
            <div className="table"><Test description={this.state.txsPublicRpcDescription}/>
                <TxsPublicRpcList txsPublicRpcRuns={this.state.txsPublicRpcRuns}/>
            </div>,
            <div className="table"><Test description={this.state.reorgsDescription}/>
                <ReorgsList reorgs={this.state.reorgs}/>
            </div>
        ];

        let testToShow = testElements[this.state.test];

        return (
            <div>
                <header className="App-header">
                    <div className="logo">
                        <img src={logo} className="App-logo" alt="logo"/>
                        <div className="logo-element"><h3> Test results </h3></div>
                    </div>

                </header>
                <div className="App">
                    <div className="form-card">
                        <Card body outline>
                            <CardHeader className="form-header">Search parameters:</CardHeader>
                            <Form onSubmit={(e) => this.handleSubmit(e)} inline>
                                <FormGroup className="formElement inline-element" tag="fieldset">
                                    <FormGroup className="formElement inline-element" check>
                                        <Label check>
                                            <Input type="radio" name="network" value="Sokol"
                                                   defaultChecked={this.state.network === "Sokol"}/>{' '}
                                            Sokol
                                        </Label>
                                    </FormGroup>
                                    <FormGroup className="formElement inline-element" check>
                                        <Label check>
                                            <Input type="radio" name="network" value="Core"
                                                   defaultChecked={this.state.network === "Core"}/>{' '}
                                            Core
                                        </Label>
                                    </FormGroup>
                                </FormGroup>
                                <FormGroup className="formElement">
                                    <Label for="exampleText" className="formElement">Last seconds</Label>
                                    <Input type="number" name="lastSeconds" id="exampleText"
                                           defaultValue={this.state.lastSeconds}/>
                                </FormGroup>

                                <FormGroup className="formElement inline-element" tag="fieldset">
                                    <FormGroup className="formElement inline-element" check>
                                        <Label check>
                                            <Input type="radio" name="passed" value="all"
                                                   defaultChecked={this.state.passed === "All"}/>{' '}
                                            All
                                        </Label>
                                    </FormGroup>
                                    <FormGroup className="formElement inline-element" check>
                                        <Label check>
                                            <Input type="radio" name="passed" value="failed"
                                                   defaultChecked={this.state.passed === "Failed"}/>{' '}
                                            Failed
                                        </Label>
                                    </FormGroup>
                                </FormGroup>

                                <FormGroup className="formElement">
                                    <Label for="tests" className="formElement">Tests</Label>
                                    <Input type="select" name="test" id="tests">
                                        <option value={0}>All</option>
                                        <option value={1}>Missing rounds</option>
                                        <option value={2}>Sending txs</option>
                                        <option value={3}>Reward check</option>
                                        <option value={4}>Sending txs via public rpc</option>
                                        <option value={5}>Reorgs</option>
                                    </Input>
                                </FormGroup>

                                <FormGroup check className="formElement">
                                    <Label check>
                                        <Input type="checkbox" className="formElement" name="timeCheckbox"
                                               defaultChecked={this.state.isLocalTime}/>{' '}
                                        Local time
                                    </Label>
                                </FormGroup>

                                <Button className="search-button">Search</Button>
                            </Form>
                        </Card>
                    </div>

                    {testToShow}

                </div>
            </div>
        );
    }
}

export default App;
