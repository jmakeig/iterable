/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Copyright 2016 MarkLogic Corp.                                             *
 *                                                                            *
 * Licensed under the Apache License, Version 2.0 (the "License");            *
 * you may not use this file except in compliance with the License.           *
 * You may obtain a copy of the License at                                    *
 *                                                                            *
 *     http://www.apache.org/licenses/LICENSE-2.0                             *
 *                                                                            *
 * Unless required by applicable law or agreed to in writing, software        *
 * distributed under the License is distributed on an "AS IS" BASIS,          *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   *
 * See the License for the specific language governing permissions and        *
 * limitations under the License.                                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
'use strict';
const test = require('/mltap/test');

const Iterant = require('../iterant');
const IterantSequence = require('../iterant-sequence');

function seqEqual(actual, expected, msg) {
  this.deepEqual(
    Array.from(actual),
    Array.from(expected),
    msg
  ); // eslint-disable-line no-invalid-this
}

test('IterantSequence factory', assert => {
  const seq = Sequence.from(['a', 'b', 'c']);
  const iterable = IterantSequence(seq);
  assert.notEqual(iterable, undefined, 'Factory constructor');
  assert.true(
    iterable instanceof IterantSequence,
    'instanceof IterantSequence'
  );
  assert.true(iterable instanceof Iterant, 'instanceof Iterable');
  assert.equal(typeof iterable.xpath, 'function', 'xpath method is a function');
  assert.equal(
    Object.prototype.toString.call(iterable),
    '[object IterantSequence]'
  );
  assert.equal(iterable[Symbol.species], IterantSequence, 'species');
  assert.equal(typeof iterable[Symbol.iterator], 'function', 'iterator');
  assert.end();
});

test('IterantSequence.prototype.slice', assert => {
  assert.seqEqual = seqEqual;
  const seq = Sequence.from(['a', 'b', 'c', 'd', 'e', 'f']);
  const iterable = IterantSequence(seq);
  assert.notEqual(iterable.slice(), iterable, 'slice() returns a new instance');
  assert.true(
    iterable.slice() instanceof IterantSequence,
    'instanceof IterantSequence'
  );
  assert.seqEqual(
    iterable.slice(),
    IterantSequence(Sequence.from(['a', 'b', 'c', 'd', 'e', 'f']))
  );
  assert.seqEqual(
    iterable.slice(1),
    ['b', 'c', 'd', 'e', 'f'],
    'only begin param'
  );
  assert.seqEqual(iterable.slice(3, 5), ['d', 'e'], 'begin and end');
  assert.seqEqual(iterable.slice(3, 3), [], 'begin equals end');
  assert.seqEqual(
    iterable.slice(3, 1000),
    ['d', 'e', 'f'],
    'end is larger than rest'
  );

  assert.throws(
    () => {
      iterable.slice('a');
    },
    TypeError,
    'non-number begin'
  );
  assert.throws(
    () => {
      iterable.slice(-1);
    },
    TypeError,
    'negative begin'
  );
  assert.throws(
    () => {
      iterable.slice(44.44);
    },
    TypeError,
    'non-integer begin'
  );

  assert.throws(
    () => {
      iterable.slice(1, 'a');
    },
    TypeError,
    'non-number end'
  );
  assert.throws(
    () => {
      iterable.slice(1, -1);
    },
    TypeError,
    'negative end'
  );
  assert.throws(
    () => {
      iterable.slice(1, 44.44);
    },
    TypeError,
    'non-integer end'
  );
  assert.throws(
    () => {
      iterable.slice(11, 10);
    },
    TypeError,
    'end < begin'
  );

  assert.end();
});

test('IterantSequence.prototype.sort', assert => {
  assert.seqEqual = seqEqual;
  const seq = Sequence.from(['b', 'a', 'f', 'd', 'c', 'e']);
  const iterable = IterantSequence(seq);
  assert.seqEqual(
    iterable.sort(),
    ['a', 'b', 'c', 'd', 'e', 'f'],
    'default sort'
  );
  assert.seqEqual(
    iterable.sort((a, b) => a < b),
    ['f', 'e', 'd', 'c', 'b', 'a'],
    'custom comparator'
  );
  assert.notEqual(iterable.sort(), iterable, 'returns a new instance');
  assert.equal(
    Object.prototype.toString.call(iterable.sort()),
    '[object IterantArray]',
    'explict IterantArray return'
  );
  assert.end();
});

/**
 * For each argument, if it's Iterable add its items, otherwise just add it
 */
test('IterantSequence.prototype.concat', assert => {
  assert.seqEqual = seqEqual;
  const seq = Sequence.from(['a', 'b', 'c', 'd', 'e', 'f']);
  const iterable = IterantSequence(seq);
  assert.notEqual(iterable.concat(), iterable, 'returns a copy');
  assert.seqEqual(
    iterable.concat(['g', 'h', 'i']),
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
    'flat concat'
  );
  assert.seqEqual(
    iterable.concat(['g', 'h', ['i']]),
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', ['i']],
    'keep nested concat'
  );
  assert.seqEqual(
    iterable.concat(),
    ['a', 'b', 'c', 'd', 'e', 'f'],
    'undefined concat'
  );
  assert.seqEqual(
    iterable.concat(1, new Sequence(2, 3, 4)),
    ['a', 'b', 'c', 'd', 'e', 'f', 1, 2, 3, 4],
    'mixed iterables and non-iterables'
  );
  assert.seqEqual(
    iterable.concat(1, 2, 3, 4),
    ['a', 'b', 'c', 'd', 'e', 'f', 1, 2, 3, 4],
    'non-iterables'
  );
  assert.seqEqual(
    iterable.concat([1, 2], new Sequence(3, 4)),
    ['a', 'b', 'c', 'd', 'e', 'f', 1, 2, 3, 4],
    'iterables'
  );
  assert.notEqual(iterable.concat(), iterable, 'creates new instance');
  assert.end();
});
