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

module.exports = EtherStream;

var EtherFrame = require('ether-frame');
var ObjectTransform = require('object-transform');
var util = require('util');

util.inherits(EtherStream, ObjectTransform);

function EtherStream(opts) {
  var self = (this instanceof EtherStream)
           ? this
           : Object.create(EtherStream.prototype);

  opts = opts || {};

  opts.meta = 'ether';

  ObjectTransform.call(self, opts);

  if (self.ether && typeof self.ether.toBuffer !== 'function') {
    throw new Error('Optional ether value must be null or provide ' +
                    'toBuffer() function');
  }

  return self;
}

EtherStream.prototype._reduce = function(msg, output, callback) {
  msg.ether = new EtherFrame(msg.data, msg.offset);
  msg.offset += msg.ether.length;
  output(msg);
  callback();
};

EtherStream.prototype._expand = function(ether, msg, output, callback) {
  msg.data = this._grow(msg.data, msg.offset, ether.length);
  ether.toBuffer(msg.data, msg.offset);
  msg.ether = ether;
  msg.offset += ether.length;
  output(msg);
  callback();
};
