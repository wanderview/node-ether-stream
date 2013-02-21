# ether-stream

Object stream transform that parses ethernet frame headers.

[![Build Status](https://travis-ci.org/wanderview/node-ether-stream.png)](https://travis-ci.org/wanderview/node-ether-stream)

## Example

```javascript
var EtherStream = require('ether-stream');
var pcap = require('pcap-parser');

var estream = new EtherStream();

var parser = pcap.parse(PCAP_FILE);
parser.on('packetData', function(payload) {
  var flushed = estream.write({data: payload});
  if (!flushed) {
    parser.stream.pause();
    estream.once('drained', parser.stream.resume.bind(parser.stream));
  }
});

estream.on('readable', function() {
  var msg = estream.read();
  msg.ether.src === '12:34:56:65:43:21';  // ether frame available as .ether
  msg.ether.dst === '98:76:54:32:10:01';
  msg.ether.type === 'ip';
  var iph = new IpHeader(msg.data);       // extract payload available at .data
});
estream.read(0);
```
