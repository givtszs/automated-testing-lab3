const { assert } = require("chai");
const sinon = require("sinon");
const fs = require("fs");
const { read_input, read_golden, gauss_forward, gauss_backward, gauss, check_input, write_in_file } = require("../gauss_js/gauss_functions");
const matrix = require("../gauss_js/matrix");

describe("gauss_functions", () => {
    describe("reading from files", () => {
        let fsStub;

        beforeEach(() => {
            fsStub = sinon.stub(fs, "readFileSync");
        });

        afterEach(() => {
            fsStub.restore();
        });

        it("read_input should read a file, parse the matrix and return it as the matrix object", () => {
            const inputFile = "2\n1 2 3\n4 5 6\n";
            fsStub.withArgs("input.txt", "utf8").returns(inputFile);
            const matrix = read_input();
            console.log(matrix);
            assert.equal(matrix.get_rows(), 2);
            assert.equal(matrix.get_cols(), 3);
        });

        it("read_golden should read a file with correct answers and return it as a list", () => {
            const inputFile = "-1 2";
            fsStub.withArgs("golden.txt", "utf8").returns(inputFile);
            const golden_list = read_golden();
            assert.deepEqual(golden_list, ["-1", "2"]);
        });
    });

    describe("gauss_forward", () => {
        it("performs gauss forward elimination", () => {
            const matrix = {
                get_rows: function () {},
                get_cols: function () {},
                get: function () {},
                mull_add: function () {},
                swap_with_nonzero_row: function () {},
            };
            const matrixMock = sinon.mock(matrix);
        
            matrixMock.expects('get_rows').once().returns(2); // 2 rows
            matrixMock.expects('get_cols').once().returns(3); // 3 columns
        
            matrixMock.expects('get').withArgs(0, 0).atLeast(1).returns(1);
            matrixMock.expects('get').withArgs(1, 0).returns(4);
        
            matrixMock.expects('mull_add').withArgs(1, 0, -4 / 1).once();
        
            matrixMock.expects('swap_with_nonzero_row').never();
        
            gauss_forward(matrix);
        
            matrixMock.verify();
        });
    });

    describe("gauss_backward", () => {
        it("performs gauss backward elimintaion", () => {
            const matrix = {
                get_rows: function () {},
                get_cols: function () {},
                get: function () {},
            };


            const matrixMock = sinon.mock(matrix);
        
            // Expectations for rows and columns
            matrixMock.expects('get_rows').once().returns(2); // 2 rows
            matrixMock.expects('get_cols').once().returns(3); // 3 columns
        
            matrixMock.expects('get').withArgs(0, 0).returns(1);
            matrixMock.expects('get').withArgs(0, 1).returns(2);
            matrixMock.expects('get').withArgs(0, 2).returns(3);
            matrixMock.expects('get').withArgs(1, 1).returns(5);
            matrixMock.expects('get').withArgs(1, 2).returns(6);

            let result = gauss_backward(matrix);

            assert.equal(result.length, 2); // equals the number of rows
            assert.isArray(result);
            assert.isNotEmpty(result);
            matrixMock.verify();
        });
    });

    describe("gauss", () => {
        it("performs gauss elimination", () => {
            const matrix = {
                get_rows: function () {},
                get_cols: function () {},
                get: function () {},
                mull_add: function () {},
                swap_with_nonzero_row: function () {},
                exists_wrong_row: function () {},
                exists_zero_row: function () {}
            };
            const matrixMock = sinon.mock(matrix);

            let result = gauss(matrix);

            assert.isEmpty(result);
            matrixMock.verify();
        });

        it('should return null when there exists wrong row', () => {
           const matrix = {
                get_rows: function () {},
                get_cols: function () {},
                get: function () {},
                mull_add: function () {},
                swap_with_nonzero_row: function () {},
                exists_wrong_row: function () {},
                exists_zero_row: function () {}
            };

            const matrixMock = sinon.mock(matrix);
            matrixMock.expects('exists_wrong_row').returns(true).once();
            matrixMock.expects('exists_zero_row').returns(false).once();

            const result = gauss(matrix);
            
            assert.strictEqual(result, null);
        });

        it('should return null when there exists zero row', () => {
           const matrix = {
                get_rows: function () {},
                get_cols: function () {},
                get: function () {},
                mull_add: function () {},
                swap_with_nonzero_row: function () {},
                exists_wrong_row: function () {},
                exists_zero_row: function () {}
            };

            const matrixMock = sinon.mock(matrix);
            matrixMock.expects('exists_wrong_row').returns(false).once();
            matrixMock.expects('exists_zero_row').returns(true).once();

            const result = gauss(matrix);
            
            assert.strictEqual(result, null);
        });
    });

    describe('writing to files', () => {
        let writeFileSyncStub, appendFileSyncStub, readFileSyncStub;

        beforeEach(function () {
            // Stub fs.writeFileSync, fs.appendFileSync, and fs.readFileSync
            writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
            appendFileSyncStub = sinon.stub(fs, 'appendFileSync');
            readFileSyncStub = sinon.stub(fs, 'readFileSync');
        });

        afterEach(function () {
            // Restore the original functions after each test
            sinon.restore();
        });

        it('should append the list values to the file when list_name is valid', function () {
            readFileSyncStub.returns("2\n1 2 3\n4 5 6\n");
            const list_name = [1.0, 2.0, 3.0];
    
            write_in_file(list_name);
    
            // Verify that appendFileSync was called with each formatted number
            sinon.assert.calledWithExactly(appendFileSyncStub, "output.txt", "1 ");
            sinon.assert.calledWithExactly(appendFileSyncStub, "output.txt", "2 ");
            sinon.assert.calledWithExactly(appendFileSyncStub, "output.txt", "3 ");
        });

        it('should write "no solution" to the file when parameter is null', function () {
            // Mock fs.readFileSync to return valid content for check_input
            readFileSyncStub.returns("2\n1 2 3\n4 5 6\n");

            write_in_file(null);  // Call function with null list_name

            // Verify that writeFileSync was called with "no solution"
            sinon.assert.calledOnceWithExactly(writeFileSyncStub, "output.txt", "no solution");
            sinon.assert.notCalled(appendFileSyncStub);  // appendFileSync should not be called
        });

        it('should write "wrong input" to the file when check_input returns false', function () {
            readFileSyncStub.returns("1 2 3\n4 5 6\n");
    
            write_in_file([1, 2, 3]);
    
            // Verify that writeFileSync was called with "wrong input"
            sinon.assert.calledOnceWithExactly(writeFileSyncStub, "output.txt", "wrong imput");
            sinon.assert.notCalled(appendFileSyncStub);  // appendFileSync should not be called
        });
    });
});
