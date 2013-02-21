// Copyright (c) 2013, Benjamin J. Kelly ("Author")
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict';

var EtherStream = require('../stream');

var EtherFrame = require('ether-frame');

module.exports.stream = function(test) {
  test.expect(103);

  var frame = new EtherFrame();
  var buf = new Buffer(100 + frame.length);
  frame.toBuffer(buf);
  for (var i = frame.length; i < 100; ++i) {
    buf[i] = i;
  }

  var estream = new EtherStream();
  estream.on('readable', function() {
    var msg = estream.read();
    if (msg) {
      test.equals(frame.src, msg.ether.src);
      test.equals(frame.dst, msg.ether.dst);
      test.equals(frame.type, msg.ether.type);
      for (var i = 0; i < 100; ++i) {
        test.equals(buf[i + frame.length], msg.data[i]);
      }

      test.done();
    }
  });
  estream.read(0);

  estream.write(buf);
};
