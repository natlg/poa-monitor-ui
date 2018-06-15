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

class App extends Component {
    state = {
        network: "Sokol",
        lastSeconds: 7200,
        passed: "All",
        test: 0,

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

        // todo tests all, some
    };

    handleSubmit(event) {
        console.log('handleSubmit');
        event.preventDefault();
        const data = new FormData(event.target);

        let network = data.get('network');
        let lastSeconds = data.get('lastSeconds');
        let passed = data.get("passed");
        let test = data.get("test");
        console.log('network: ' + network + ", lastSeconds: " + lastSeconds + ", passed: " + passed + ", test: " + test);
        const newState = Object.assign({}, this.state, {
            network: network,
            lastSeconds: lastSeconds,
            passed: passed,
            test: test
        });
        this.setState(newState);
        let url = "http://poatest.westus.cloudapp.azure.com:3000/" + network + "/api/" + passed + "?lastseconds=" + lastSeconds;
        console.log('url: ' + url);
        this.getResults(url);
    }

    getResults(url) {
        axios
            .get(url)
            .then(response => {
                const newMissingRoundsRuns = response.data.missingRoundCheck.runs.map(r => {
                    r.key = r.id;
                    return r;
                });
                const newMissingTxsRuns = response.data.missingTxsCheck.runs.map(r => {
                    r.key = r.id;
                    return r;
                });
                const newRewardRuns = response.data.miningRewardCheck.runs.map(r => {
                    r.key = r.id;
                    return r;
                });

                const newTxsPublicRpcRuns = response.data.txsViaPublicRpcCheck.runs.map(r => {
                    r.key = r.id;
                    return r;
                });

                const newReorgs = response.data.reorgsCheck.reorgs.map(r => {
                    r.key = r.id;
                    return r;
                });

                const newState = Object.assign({}, this.state, {
                    missingRoundsRuns: newMissingRoundsRuns,
                    missingTxsRuns: newMissingTxsRuns,
                    rewardRuns: newRewardRuns,
                    txsPublicRpcRuns: newTxsPublicRpcRuns,
                    reorgs: newReorgs
                });
                console.log("newState: " + newState);
                // store the new state object in the component's state
                this.setState(newState);
            })
            .catch(error => console.log(error));
    }

    // todo order

    componentDidMount() {
        console.log('componentDidMount');
        let url = "http://poatest.westus.cloudapp.azure.com:3000/" + this.state.network + "/api/" + this.state.passed + "?lastseconds=" + this.state.lastSeconds;
        console.log('url: ' + url);
        this.getResults(url);
    }

    render() {
        console.log('In Render, this.state.test: ' + this.state.test);
        let testElements = [
            <div><Test description={this.state.missingRoundsDescription}/>
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
                <ReorgsList reorgs={this.state.reorgs}/>`,
            </div>,
            <div>
                <Test description={this.state.missingRoundsDescription}/>
                <MissingRoundList missingRoundsRuns={this.state.missingRoundsRuns}/>
                <br/>
            </div>,

            <div><Test description={this.state.missingTxsCheckDescription}/>
                <MissingTxsList missingTxsRuns={this.state.missingTxsRuns}/>
                <br/>
            </div>,
            <div><Test description={this.state.rewardDescription}/>
                <RewardList rewardRuns={this.state.rewardRuns}/>
            </div>,
            <div><Test description={this.state.txsPublicRpcDescription}/>
                <TxsPublicRpcList txsPublicRpcRuns={this.state.txsPublicRpcRuns}/>
            </div>,
            <div><Test description={this.state.reorgsDescription}/>
                <ReorgsList reorgs={this.state.reorgs}/>
            </div>
        ];

        let testToShow = testElements[this.state.test];

        return (<div>
                <div className="App">
                    <Form onSubmit={(e) => this.handleSubmit(e)} inline>
                        <FormGroup className="formGroup" tag="fieldset">
                            <FormGroup className="formGroup" check>
                                <Label check>
                                    <Input type="radio" name="network" value="Sokol"
                                           defaultChecked={this.state.network === "Sokol"}/>{' '}
                                    Sokol
                                </Label>
                            </FormGroup>
                            <FormGroup className="formGroup" check>
                                <Label check>
                                    <Input type="radio" name="network" value="Core"
                                           defaultChecked={this.state.network === "Core"}/>{' '}
                                    Core
                                </Label>
                            </FormGroup>
                        </FormGroup>
                        <FormGroup className="formGroup">
                            <Label for="exampleText" className="formGroup">Last seconds</Label>
                            <Input type="number" name="lastSeconds" id="exampleText"
                                   defaultValue={this.state.lastSeconds}/>
                        </FormGroup>

                        <FormGroup className="formGroup" tag="fieldset">
                            <FormGroup className="formGroup" check>
                                <Label check>
                                    <Input type="radio" name="passed" value="all"
                                           defaultChecked={this.state.passed === "All"}/>{' '}
                                    All
                                </Label>
                            </FormGroup>
                            <FormGroup className="formGroup" check>
                                <Label check>
                                    <Input type="radio" name="passed" value="failed"
                                           defaultChecked={this.state.passed === "Failed"}/>{' '}
                                    Failed
                                </Label>
                            </FormGroup>
                        </FormGroup>

                        <FormGroup className="formGroup">
                            <Label for="tests" className="formGroup">Tests</Label>
                            <Input type="select" name="test" id="tests">
                                <option value={0}>All</option>
                                <option value={1}>Missing rounds</option>
                                <option value={2}>Sending txs</option>
                                <option value={3}>Reward check</option>
                                <option value={4}>Sending txs via public rpc</option>
                                <option value={5}>Reorgs</option>
                            </Input>
                        </FormGroup>

                        <Button className="mb-2 mr-sm-2 mb-sm-0">Submit</Button>
                    </Form>

                    {testToShow}

                </div>
            </div>
        );
    }
}

export default App;
