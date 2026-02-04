import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ProgressBar, parseFfmpegProgress } from '../src/progress.js';

describe('ProgressBar', () => {
  it('initializes with default options', () => {
    const pb = new ProgressBar();
    assert.equal(pb.total, 0);
    assert.equal(pb.current, 0);
    assert.equal(pb.label, 'Progress');
    assert.equal(pb.width, 40);
  });

  it('accepts custom options', () => {
    const pb = new ProgressBar({
      total: 100,
      label: 'Download',
      width: 20,
      showBytes: true,
      showSpeed: true,
    });
    assert.equal(pb.total, 100);
    assert.equal(pb.label, 'Download');
    assert.equal(pb.width, 20);
    assert.equal(pb.showBytes, true);
    assert.equal(pb.showSpeed, true);
  });

  it('updates current progress', () => {
    const pb = new ProgressBar({ total: 100 });
    pb.update(50);
    assert.equal(pb.current, 50);
  });

  it('calculates progress ratio correctly', () => {
    const pb = new ProgressBar({ total: 200 });
    pb.update(50);
    // 50/200 = 25%
    assert.equal(pb.current / pb.total, 0.25);
  });
});

describe('parseFfmpegProgress', () => {
  it('initializes with default options', () => {
    const p = parseFfmpegProgress('');
    assert.equal(typeof p, 'object');
  });
});
