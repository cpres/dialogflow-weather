var { template } = require('./index.js')

let res;
let resSet;
let resStatus;
let resJson;

function setUpExpressMocks () {
        resJson = jest.fn();
        resStatus = jest.fn();
        resSet = jest.fn();
        res = {
                set: resSet,
                setHeader: resSet,
                status: resStatus,
                end: resStatus,
                json: resJson,
                send: resJson,
        };
        resJson.mockImplementation(() => res);
        resStatus.mockImplementation(() => res);
        resSet.mockImplementation(() => res);
}
// Basic Auth Authorization helper URL:
// https://www.blitter.se/utils/basic-authentication-header-generator/


/// HTTP
describe('template HTTP tests', () => {

  beforeAll(setUpExpressMocks);
  beforeEach(() => {
    jest.setTimeout(5000);
  });
  
  test('it fails without proper param', async (done) => {
    const req = { 
      body: {} ,
      headers: {},
      method: "POST"
    };
    res.send = (payload) => {
      expect(payload).toBe('Missing required POST parameters');
      done()
    }
    try {
      template(req, res);
    } catch (err) {
      console.log("template test error: ", err)
    }
  });

});