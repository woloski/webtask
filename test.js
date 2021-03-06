import request from 'superagent';
import sinon from 'sinon';
import {expect} from 'chai';
import webtask from './index.js';


const HOST_MOCK = 'rules.auth0.com';
const CONTAINER_MOCK = 'fake-container';
const WEBTASK_MOCK = 'hello';
const RESPONSE_MOCK = {ok: true, body: 'hello'};

describe('Webtask Runner', function() {
    let send;
    before(function(done){

        send = sinon.stub();
        send.returns({
            end: cb => cb(null, RESPONSE_MOCK)
        })

        sinon.stub(request, 'post', function postStub(url) {
                return { send };
            })

        done();
    });

    after(function(done){
        request.post.restore();
        done();
    });

    it('makes the request to the correct url and return the right value', function(done){
        let runner = webtask(CONTAINER_MOCK, HOST_MOCK);
        let helloWt = runner(WEBTASK_MOCK);
        let params = { param1: true };

        helloWt(params)
            .catch((err) => {
                console.log(`the mocked https request failed with err: ${err}`);
                done();
            })
            .then((res) => {
                expect(request.post.getCall(0).args[0]).to.equal(`https://${HOST_MOCK}/api/run/${CONTAINER_MOCK}/${WEBTASK_MOCK}`);
                expect(send.getCall(0).args[0]).to.equal(params);
                expect(res).to.equal(RESPONSE_MOCK.body);
                done();
            })
            .catch((err) => {
                console.log('Something went wrong', err);
            });
    });
});


