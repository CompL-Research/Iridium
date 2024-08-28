// 
// Expected usage...
// 
// 
// node test262runner.js artifactResults.txt
// 
// 
// 1. allTests = Get tests based on input argument and get test262 File Objects
// 2. filteredTests = Filter tests based on tests that are known to work (use the babel artifact result file)
// 
// 3. Get a clean test262 directory : `git stash -a`
// 
// 4. ? Compile all those fixtures in-place : `find test262/test/language/ -type f -name "*_FIXTURE.js"`
//    -- If any fixture fails, exit
// 
// 5. TOTAL=0, SUCCESS=0, JS3ERR=0, SEMANTICERR=0
// 6. for t of filteredTests: [parallelize in a thread pool]
//    a. oldResult = Execute test and get result
//    b. Compile JS3 inplace
//       -- If compilation error, JS3Error++
//    c. newResult = Execute test and get result 
//    d. oldResult == newResult
//       -- SUCCESS++
//       -- SEMANTICERR++
// 
// 7. Generate Test summary 
// 
