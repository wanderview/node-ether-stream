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

module.exports.reduce = function(test) {
  test.expect(104);

  var frame = new EtherFrame();
  var size = 100 + frame.length;
  var buf = new Buffer(size);
  frame.toBuffer(buf);
  for (var i = frame.length; i < size; ++i) {
    buf[i] = i;
  }

  var estream = new EtherStream();
  estream.on('readable', function() {
    var msg = estream.read();
    if (msg) {
      test.equals(frame.src, msg.ether.src);
      test.equals(frame.dst, msg.ether.dst);
      test.equals(frame.type, msg.ether.type);
      test.equals(frame.length, msg.offset);
      for (var i = msg.offset; i < size; ++i) {
        test.equals(buf[i], msg.data[i]);
      }

      test.done();
    }
  });
  estream.read(0);

  estream.write(buf);
};

module.exports.grow = function(test) {
  test.expect(7);

  var buf = new Buffer(5);
  for (var i = 0; i < buf.length; ++i) {
    buf.writeUInt8(i, i);
  }

  test.deepEqual(buf, EtherStream.prototype._grow(buf, 2, 2));

  var out = EtherStream.prototype._grow(buf, 5, 10);
  test.equal(15, out.length);
  for (var i = 0; i < buf.length; ++i) {
    test.equal(buf.readUInt8(i), out.readUInt8(i), 'byte [' + i + ']');
  }

  test.done()
};

module.exports.expand = function(test) {
  test.expect(3);

  var msg = {
    ether: new EtherFrame({
      src: '12:34:56:65:43:21',
      dst: '76:54:32:23:45:67'
    }),
    data: new Buffer(1)
  }

  var estream = new EtherStream();
  estream.on('readable', function() {
    var out = estream.read();

    test.ok(out.data.length >= msg.ether.length);
    test.equal(msg.ether.length, out.offset);

    var parsed = new EtherFrame(out.data, out.offset - msg.ether.length);

    test.deepEqual(msg.ether, parsed);

    test.done();
  });

  estream.on('end', function() {
    test.done();
  });

  estream.read(0);

  estream.write(msg);
};

module.exports.expandDefault = function(test) {
  test.expect(3);

  var ether = new EtherFrame({
    src: '12:34:56:65:43:21',
    dst: '76:54:32:23:45:67'
  });

  var msg = {
    data: new Buffer(1)
  }

  var estream = new EtherStream({ether: ether});
  estream.on('readable', function() {
    var out = estream.read();

    test.ok(out.data.length >= ether.length);
    test.equal(ether.length, out.offset);

    var parsed = new EtherFrame(out.data, out.offset - ether.length);

    test.deepEqual(ether, parsed);

    test.done();
  });

  estream.on('end', function() {
    test.done();
  });

  estream.read(0);

  estream.write(msg);
};
