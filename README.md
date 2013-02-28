# ether-stream

Ethernet frame serialization object stream.

[![Build Status](https://travis-ci.org/wanderview/node-ether-stream.png)](https://travis-ci.org/wanderview/node-ether-stream)

## Examples

### Reading

```javascript
var EtherStream = require('ether-stream');
var PcapStream = require('pcap-stream');

var pstream = new PcapStream(PCAP_FILE);
var estream = new EtherStream();

pstream.pipe(estream).on('readable', function() {
  var msg = estream.read();
  msg.ether.src === '12:34:56:65:43:21';  // ether frame available as .ether
  msg.ether.dst === '98:76:54:32:10:01';
  msg.ether.type === 'ip';
  var iph = new IpHeader(msg.data);       // extract payload available at .data
});
estream.read(0);
```

### Writing

```javascript
// optional constructor arg allows you to set a default ether frame to write
var defaultFrame = new EtherFrame({src: '01:23:45:54:32:10'});
var estream = new EtherStream({ether: defaultFrame});

//
// provide a data buffer to write to
//
var in1 = { data: new Buffer(8*1024) };
estream.write(in1);
var out1 = estream.read();
deepEqual(defaultFrame, out1.ether);     // frame written at .ether
deepEqual(in1.data, out1.data);          // wrote to provided buffer
out1.offset === defaultFrame.length;     // offset updated with length written

//
// or, ether frame can be provided on each message
//
var in2 = {
  ether: new EtherFrame({src: '11:22:33:44:55:66'}),
  data: new Buffer(8*1024)
};
estream.write(in2);
var out2 = estream.read();
deepEqual(in2.ether, new EtherFrame(out2.ether)); // wrote per-msg frame

//
// buffer is automatically expanded if necessary (expensive copy, though)
//
var in3 = { data: new Buffer(1) };
estream.write(in3);
var out3 = estream.read();
out3.data.length === defaultFrame.length;         // buffer expanded
```
