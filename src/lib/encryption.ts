import TweetNaCl from 'tweetnacl';
import TweetNaClUtil from 'tweetnacl-util';

const { secretbox, randomBytes } = TweetNaCl;
const { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } = TweetNaClUtil;

export { secretbox, randomBytes, encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 };
