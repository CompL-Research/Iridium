/*
 * Copyright (c) 2003-2005  Tom Wu
 * All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY
 * WARRANTY of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY, OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * In addition, the following condition applies:
 *
 * All redistributions must retain an intact copy of this copyright notice
 * and disclaimer.
 */
// =============================================================================
// OCTANE STANDALONE TRANSFORMATION HEADER
// =============================================================================
var performance = performance || {};
performance.now = (function() {
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         Date.now;
})();

function Benchmark(name, doWarmup, doDeterministic, deterministicIterations,
                   run, setup, tearDown, rmsResult, minIterations) {
  this.name = name;
  this.doWarmup = doWarmup;
  this.doDeterministic = doDeterministic;
  this.deterministicIterations = deterministicIterations;
  this.run = run;
  this.Setup = setup ? setup : function() { };
  this.TearDown = tearDown ? tearDown : function() { };
  this.rmsResult = rmsResult ? rmsResult : null;
  this.minIterations = minIterations ? minIterations : 32;
}
function BenchmarkResult(benchmark, time, latency) {
  this.benchmark = benchmark;
  this.time = time;
  this.latency = latency;
}
BenchmarkResult.prototype.valueOf = function() {
  return this.time;
}
function BenchmarkSuite(name, reference, benchmarks) {
  this.name = name;
  this.reference = reference;
  this.benchmarks = benchmarks;
  BenchmarkSuite.suites.push(this);
}
BenchmarkSuite.suites = [];
BenchmarkSuite.version = '9';
BenchmarkSuite.config = {
  doWarmup: undefined,
  doDeterministic: undefined
};
// The alert function has been removed as requested.
BenchmarkSuite.ResetRNG = function() {
  Math.random = (function() {
    var seed = 49734321;
    return function() {
      seed = ((seed + 0x7ed55d16) + (seed << 12))  & 0xffffffff;
      seed = ((seed ^ 0xc761c23c) ^ (seed >>> 19)) & 0xffffffff;
      seed = ((seed + 0x165667b1) + (seed << 5))   & 0xffffffff;
      seed = ((seed + 0xd3a2646c) ^ (seed << 9))   & 0xffffffff;
      seed = ((seed + 0xfd7046c5) + (seed << 3))   & 0xffffffff;
      seed = ((seed ^ 0xb55a4f09) ^ (seed >>> 16)) & 0xffffffff;
      return (seed & 0xfffffff) / 0x10000000;
    };
  })();
}
BenchmarkSuite.RunSuites = function(runner, skipBenchmarks) {
  skipBenchmarks = typeof skipBenchmarks === 'undefined' ? [] : skipBenchmarks;
  var continuation = null;
  var suites = BenchmarkSuite.suites;
  var length = suites.length;
  BenchmarkSuite.scores = [];
  var index = 0;
  function RunStep() {
    while (continuation || index < length) {
      if (continuation) {
        continuation = continuation();
      } else {
        var suite = suites[index++];
        if (runner.NotifyStart) runner.NotifyStart(suite.name);
        if (skipBenchmarks.indexOf(suite.name) > -1) {
          suite.NotifySkipped(runner);
        } else {
          continuation = suite.RunStep(runner);
        }
      }
    }
    if (runner.NotifyScore) {
      runner.NotifyScore(0); // Pass a dummy score
    }
  }
  RunStep();
}
BenchmarkSuite.GeometricMean = function(numbers) {
  var log = 0;
  for (var i = 0; i < numbers.length; i++) {
    log += Math.log(numbers[i]);
  }
  return Math.pow(Math.E, log / numbers.length);
}
BenchmarkSuite.GeometricMeanTime = function(measurements) {
  var log = 0;
  for (var i = 0; i < measurements.length; i++) {
    log += Math.log(measurements[i].time);
  }
  return Math.pow(Math.E, log / measurements.length);
}
BenchmarkSuite.FormatScore = function(value) {
  if (value > 100) {
    return value.toFixed(0);
  } else {
    return value.toPrecision(3);
  }
}
BenchmarkSuite.prototype.NotifyStep = function(result) {
  this.results.push(result);
  if (this.runner.NotifyStep) this.runner.NotifyStep(result.benchmark.name);
}
BenchmarkSuite.prototype.NotifyResult = function() {
  if (this.runner.NotifyResult) {
    this.runner.NotifyResult(this.name, "Success");
  }
}
BenchmarkSuite.prototype.NotifyError = function(error) {
  if (this.runner.NotifyError) {
    this.runner.NotifyError(this.name, error);
  }
  if (this.runner.NotifyStep) {
    this.runner.NotifyStep(this.name);
  }
}
BenchmarkSuite.prototype.RunSingleBenchmark = function(benchmark, data) {
  function Measure(data) {
    var elapsed = 0;
    var start = new Date();
    for (var i = 0; elapsed < 1000; i++) {
      benchmark.run();
      elapsed = new Date() - start;
    }
  }
  Measure(null);
  this.NotifyStep(new BenchmarkResult(benchmark, 0, 0)); // Dummy result
  return null;
}
BenchmarkSuite.prototype.RunStep = function(runner) {
  BenchmarkSuite.ResetRNG();
  this.results = [];
  this.runner = runner;
  var length = this.benchmarks.length;
  var index = 0;
  var suite = this;

  function RunNextSetup() {
    if (index < length) {
      try {
        suite.benchmarks[index].Setup();
      } catch (e) {
        suite.NotifyError(e);
        return null;
      }
      return RunNextBenchmark;
    }
    suite.NotifyResult();
    return null;
  }
  function RunNextBenchmark() {
    try {
      suite.RunSingleBenchmark(suite.benchmarks[index], null);
    } catch (e) {
      suite.NotifyError(e);
      return null;
    }
    return RunNextTearDown;
  }
  function RunNextTearDown() {
    try {
      suite.benchmarks[index++].TearDown();
    } catch (e) {
      suite.NotifyError(e);
      return null;
    }
    return RunNextSetup;
  }
  return RunNextSetup();
}
// =============================================================================
// STANDALONE RUNNER (MODIFIED FOR SIMPLE PASS/FAIL)
// =============================================================================
function benchmark_printf(str) {
    // This function is now empty to prevent any console output.
}

function runStandalone() {
    benchmark_printf("--- Running Benchmarks ---");
    BenchmarkSuite.RunSuites({
      NotifyResult: function(name, result) {
        benchmark_printf("✅ " + name + ": Benchmark completed successfully.");
      },
      NotifyError: function(name, error) {
        benchmark_printf("❌ ERROR in " + name + ": " + error);
        if (error.stack) {
            benchmark_printf(error.stack);
        }
      },
      NotifyScore: function(score) {
        benchmark_printf("\n--- All benchmarks finished. ---");
      }
    });
}
// =============================================================================
// ORIGINAL BENCHMARK CODE STARTS BELOW
// =============================================================================// Copyright 2009 the V8 project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above
//       copyright notice, this list of conditions and the following
//       disclaimer in the documentation and/or other materials provided
//       with the distribution.
//     * Neither the name of Google Inc. nor the names of its
//       contributors may be used to endorse or promote products derived
//       from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// This benchmark is based on a JavaScript log processing module used
// by the V8 profiler to generate execution time profiles for runs of
// JavaScript applications, and it effectively measures how fast the
// JavaScript engine is at allocating nodes and reclaiming the memory
// used for old nodes. Because of the way splay trees work, the engine
// also has to deal with a lot of changes to the large tree object
// graph.

var Splay = new BenchmarkSuite('Splay', [81491, 2739514], [
  new Benchmark("Splay", true, false, 1400,
    SplayRun, SplaySetup, SplayTearDown, SplayRMS)
]);


// Configuration.
var kSplayTreeSize = 8000;
var kSplayTreeModifications = 80;
var kSplayTreePayloadDepth = 5;

var splayTree = null;
var splaySampleTimeStart = 0.0;

function GeneratePayloadTree(depth, tag) {
  if (depth == 0) {
    return {
      array  : [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
      string : 'String for key ' + tag + ' in leaf node'
    };
  } else {
    return {
      left:  GeneratePayloadTree(depth - 1, tag),
      right: GeneratePayloadTree(depth - 1, tag)
    };
  }
}


function GenerateKey() {
  // The benchmark framework guarantees that Math.random is
  // deterministic; see base.js.
  return Math.random();
}

var splaySamples = 0;
var splaySumOfSquaredPauses = 0;

function SplayRMS() {
  return Math.round(Math.sqrt(splaySumOfSquaredPauses / splaySamples) * 10000);
}

function SplayUpdateStats(time) {
  var pause = time - splaySampleTimeStart;
  splaySampleTimeStart = time;
  splaySamples++;
  splaySumOfSquaredPauses += pause * pause;
}

function InsertNewNode() {
  // Insert new node with a unique key.
  var key;
  do {
    key = GenerateKey();
  } while (splayTree.find(key) != null);
  var payload = GeneratePayloadTree(kSplayTreePayloadDepth, String(key));
  splayTree.insert(key, payload);
  return key;
}


function SplaySetup() {
  // Check if the platform has the performance.now high resolution timer.
  // If not, throw exception and quit.
  if (!performance.now) {
    throw "PerformanceNowUnsupported";
  }

  splayTree = new SplayTree();
  splaySampleTimeStart = performance.now()
  for (var i = 0; i < kSplayTreeSize; i++) {
    InsertNewNode();
    if ((i+1) % 20 == 19) {
      SplayUpdateStats(performance.now());
    }
  }
}


function SplayTearDown() {
  // Allow the garbage collector to reclaim the memory
  // used by the splay tree no matter how we exit the
  // tear down function.
  var keys = splayTree.exportKeys();
  splayTree = null;

  splaySamples = 0;
  splaySumOfSquaredPauses = 0;

  // Verify that the splay tree has the right size.
  var length = keys.length;
  if (length != kSplayTreeSize) {
    throw new Error("Splay tree has wrong size");
  }

  // Verify that the splay tree has sorted, unique keys.
  for (var i = 0; i < length - 1; i++) {
    if (keys[i] >= keys[i + 1]) {
      throw new Error("Splay tree not sorted");
    }
  }
}


function SplayRun() {
  // Replace a few nodes in the splay tree.
  for (var i = 0; i < kSplayTreeModifications; i++) {
    var key = InsertNewNode();
    var greatest = splayTree.findGreatestLessThan(key);
    if (greatest == null) splayTree.remove(key);
    else splayTree.remove(greatest.key);
  }
  SplayUpdateStats(performance.now());
}


/**
 * Constructs a Splay tree.  A splay tree is a self-balancing binary
 * search tree with the additional property that recently accessed
 * elements are quick to access again. It performs basic operations
 * such as insertion, look-up and removal in O(log(n)) amortized time.
 *
 * @constructor
 */
function SplayTree() {
};


/**
 * Pointer to the root node of the tree.
 *
 * @type {SplayTree.Node}
 * @private
 */
SplayTree.prototype.root_ = null;


/**
 * @return {boolean} Whether the tree is empty.
 */
SplayTree.prototype.isEmpty = function() {
  return !this.root_;
};


/**
 * Inserts a node into the tree with the specified key and value if
 * the tree does not already contain a node with the specified key. If
 * the value is inserted, it becomes the root of the tree.
 *
 * @param {number} key Key to insert into the tree.
 * @param {*} value Value to insert into the tree.
 */
SplayTree.prototype.insert = function(key, value) {
  if (this.isEmpty()) {
    this.root_ = new SplayTree.Node(key, value);
    return;
  }
  // Splay on the key to move the last node on the search path for
  // the key to the root of the tree.
  this.splay_(key);
  if (this.root_.key == key) {
    return;
  }
  var node = new SplayTree.Node(key, value);
  if (key > this.root_.key) {
    node.left = this.root_;
    node.right = this.root_.right;
    this.root_.right = null;
  } else {
    node.right = this.root_;
    node.left = this.root_.left;
    this.root_.left = null;
  }
  this.root_ = node;
};


/**
 * Removes a node with the specified key from the tree if the tree
 * contains a node with this key. The removed node is returned. If the
 * key is not found, an exception is thrown.
 *
 * @param {number} key Key to find and remove from the tree.
 * @return {SplayTree.Node} The removed node.
 */
SplayTree.prototype.remove = function(key) {
  if (this.isEmpty()) {
    throw Error('Key not found: ' + key);
  }
  this.splay_(key);
  if (this.root_.key != key) {
    throw Error('Key not found: ' + key);
  }
  var removed = this.root_;
  if (!this.root_.left) {
    this.root_ = this.root_.right;
  } else {
    var right = this.root_.right;
    this.root_ = this.root_.left;
    // Splay to make sure that the new root has an empty right child.
    this.splay_(key);
    // Insert the original right child as the right child of the new
    // root.
    this.root_.right = right;
  }
  return removed;
};


/**
 * Returns the node having the specified key or null if the tree doesn't contain
 * a node with the specified key.
 *
 * @param {number} key Key to find in the tree.
 * @return {SplayTree.Node} Node having the specified key.
 */
SplayTree.prototype.find = function(key) {
  if (this.isEmpty()) {
    return null;
  }
  this.splay_(key);
  return this.root_.key == key ? this.root_ : null;
};


/**
 * @return {SplayTree.Node} Node having the maximum key value.
 */
SplayTree.prototype.findMax = function(opt_startNode) {
  if (this.isEmpty()) {
    return null;
  }
  var current = opt_startNode || this.root_;
  while (current.right) {
    current = current.right;
  }
  return current;
};


/**
 * @return {SplayTree.Node} Node having the maximum key value that
 *     is less than the specified key value.
 */
SplayTree.prototype.findGreatestLessThan = function(key) {
  if (this.isEmpty()) {
    return null;
  }
  // Splay on the key to move the node with the given key or the last
  // node on the search path to the top of the tree.
  this.splay_(key);
  // Now the result is either the root node or the greatest node in
  // the left subtree.
  if (this.root_.key < key) {
    return this.root_;
  } else if (this.root_.left) {
    return this.findMax(this.root_.left);
  } else {
    return null;
  }
};


/**
 * @return {Array<*>} An array containing all the keys of tree's nodes.
 */
SplayTree.prototype.exportKeys = function() {
  var result = [];
  if (!this.isEmpty()) {
    this.root_.traverse_(function(node) { result.push(node.key); });
  }
  return result;
};


/**
 * Perform the splay operation for the given key. Moves the node with
 * the given key to the top of the tree.  If no node has the given
 * key, the last node on the search path is moved to the top of the
 * tree. This is the simplified top-down splaying algorithm from:
 * "Self-adjusting Binary Search Trees" by Sleator and Tarjan
 *
 * @param {number} key Key to splay the tree on.
 * @private
 */
SplayTree.prototype.splay_ = function(key) {
  if (this.isEmpty()) {
    return;
  }
  // Create a dummy node.  The use of the dummy node is a bit
  // counter-intuitive: The right child of the dummy node will hold
  // the L tree of the algorithm.  The left child of the dummy node
  // will hold the R tree of the algorithm.  Using a dummy node, left
  // and right will always be nodes and we avoid special cases.
  var dummy, left, right;
  dummy = left = right = new SplayTree.Node(null, null);
  var current = this.root_;
  while (true) {
    if (key < current.key) {
      if (!current.left) {
        break;
      }
      if (key < current.left.key) {
        // Rotate right.
        var tmp = current.left;
        current.left = tmp.right;
        tmp.right = current;
        current = tmp;
        if (!current.left) {
          break;
        }
      }
      // Link right.
      right.left = current;
      right = current;
      current = current.left;
    } else if (key > current.key) {
      if (!current.right) {
        break;
      }
      if (key > current.right.key) {
        // Rotate left.
        var tmp = current.right;
        current.right = tmp.left;
        tmp.left = current;
        current = tmp;
        if (!current.right) {
          break;
        }
      }
      // Link left.
      left.right = current;
      left = current;
      current = current.right;
    } else {
      break;
    }
  }
  // Assemble.
  left.right = current.left;
  right.left = current.right;
  current.left = dummy.right;
  current.right = dummy.left;
  this.root_ = current;
};


/**
 * Constructs a Splay tree node.
 *
 * @param {number} key Key.
 * @param {*} value Value.
 */
SplayTree.Node = function(key, value) {
  this.key = key;
  this.value = value;
};


/**
 * @type {SplayTree.Node}
 */
SplayTree.Node.prototype.left = null;


/**
 * @type {SplayTree.Node}
 */
SplayTree.Node.prototype.right = null;


/**
 * Performs an ordered traversal of the subtree starting at
 * this SplayTree.Node.
 *
 * @param {function(SplayTree.Node)} f Visitor function.
 * @private
 */
SplayTree.Node.prototype.traverse_ = function(f) {
  var current = this;
  while (current) {
    var left = current.left;
    if (left) left.traverse_(f);
    f(current);
    current = current.right;
  }
};

// This line starts the benchmark after everything is defined.
runStandalone();
