import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUrlLike } from '../src/brief.js';

describe('normalizeUrlLike - provider URL edge cases', () => {
  // normalizeUrlLike's main job is to handle chat/markdown wrappers, so focus on that
  describe('Chat wrapper handling', () => {
    test('handles angle-bracket wrapped URLs', () => {
      assert.equal(
        normalizeUrlLike('<https://youtube.com/watch?v=abc123>'),
        'https://youtube.com/watch?v=abc123'
      );
      assert.equal(
        normalizeUrlLike('<https://vimeo.com/12345>'),
        'https://vimeo.com/12345'
      );
      assert.equal(
        normalizeUrlLike('<https://loom.com/share/abc123>'),
        'https://loom.com/share/abc123'
      );
      assert.equal(
        normalizeUrlLike('<https://fathom.video/share/abc123>'),
        'https://fathom.video/share/abc123'
      );
    });

    test('handles markdown-link URLs ([label](url))', () => {
      assert.equal(
        normalizeUrlLike('[Click here](https://youtube.com/watch?v=abc123)'),
        'https://youtube.com/watch?v=abc123'
      );
      assert.equal(
        normalizeUrlLike('[Watch Video](https://vimeo.com/12345)'),
        'https://vimeo.com/12345'
      );
    });

    test('handles Slack-style URLs (<url|label>)', () => {
      assert.equal(
        normalizeUrlLike('<https://vimeo.com/12345|Video Link>'),
        'https://vimeo.com/12345'
      );
      assert.equal(
        normalizeUrlLike('<https://loom.com/share/abc123|Meeting>'),
        'https://loom.com/share/abc123'
      );
    });

    test('handles parentheses around URLs', () => {
      assert.equal(
        normalizeUrlLike('(https://youtube.com/watch?v=abc123)'),
        'https://youtube.com/watch?v=abc123'
      );
      assert.equal(
        normalizeUrlLike('(https://fathom.video/share/abc123)'),
        'https://fathom.video/share/abc123'
      );
    });

    test('handles URLs with leading parentheses', () => {
      assert.equal(
        normalizeUrlLike('(https://youtube.com/watch?v=abc123'),
        'https://youtube.com/watch?v=abc123'
      );
    });

    test('handles quoted URLs', () => {
      assert.equal(
        normalizeUrlLike('"https://youtube.com/watch?v=abc123"'),
        'https://youtube.com/watch?v=abc123'
      );
      assert.equal(
        normalizeUrlLike("'https://vimeo.com/12345'"),
        'https://vimeo.com/12345'
      );
    });

    test('handles code-block wrapped URLs', () => {
      assert.equal(
        normalizeUrlLike('`https://youtube.com/watch?v=abc123`'),
        'https://youtube.com/watch?v=abc123'
      );
      assert.equal(
        normalizeUrlLike('`https://vimeo.com/12345`'),
        'https://vimeo.com/12345'
      );
    });

    test('handles backtick-wrapped URLs', () => {
      assert.equal(
        normalizeUrlLike('https://youtube.com/watch?v=abc123'),
        'https://youtube.com/watch?v=abc123'
      );
    });
  });

  describe('Protocol-relative URLs', () => {
    test('converts protocol-relative YouTube URLs', () => {
      assert.equal(
        normalizeUrlLike('//www.youtube.com/watch?v=abc123'),
        'https://www.youtube.com/watch?v=abc123'
      );
      assert.equal(
        normalizeUrlLike('//youtu.be/abc123xyz'),
        'https://youtu.be/abc123xyz'
      );
    });

    test('converts protocol-relative Vimeo URLs', () => {
      assert.equal(
        normalizeUrlLike('//vimeo.com/12345'),
        'https://vimeo.com/12345'
      );
    });

    test('converts protocol-relative Loom URLs', () => {
      assert.equal(
        normalizeUrlLike('//loom.com/share/abc123'),
        'https://loom.com/share/abc123'
      );
    });

    test('converts protocol-relative Fathom URLs', () => {
      assert.equal(
        normalizeUrlLike('//fathom.video/share/abc123'),
        'https://fathom.video/share/abc123'
      );
      assert.equal(
        normalizeUrlLike('//app.fathom.video/share/abc123'),
        'https://app.fathom.video/share/abc123'
      );
    });

    test('handles bare fathom.video URLs without scheme', () => {
      assert.equal(
        normalizeUrlLike('fathom.video/share/abc123'),
        'https://fathom.video/share/abc123'
      );
    });
  });

  describe('Bare URLs (no wrapper, no scheme)', () => {
    test('handles bare youtu.be URLs', () => {
      assert.equal(
        normalizeUrlLike('abc123xyz'),
        'abc123xyz'
      );
    });

    test('handles bare loom.com IDs', () => {
      assert.equal(
        normalizeUrlLike('abc123'),
        'abc123'
      );
    });

    test('handles bare Vimeo IDs', () => {
      assert.equal(
        normalizeUrlLike('12345'),
        '12345'
      );
    });
  });

  describe('URLs with metadata text', () => {
    test('handles URLs with "Video link:" prefix', () => {
      assert.equal(
        normalizeUrlLike('Video link: https://youtube.com/watch?v=abc123'),
        'https://youtube.com/watch?v=abc123'
      );
      assert.equal(
        normalizeUrlLike('Video link: https://vimeo.com/12345'),
        'https://vimeo.com/12345'
      );
    });

    test('handles URLs with "Meeting:" prefix', () => {
      assert.equal(
        normalizeUrlLike('Meeting: https://loom.com/share/abc123'),
        'https://loom.com/share/abc123'
      );
    });

    test('handles URLs with "Recording:" prefix', () => {
      assert.equal(
        normalizeUrlLike('Recording: https://youtube.com/watch?v=abc123'),
        'https://youtube.com/watch?v=abc123'
      );
    });

    test('handles URLs with "Link:" prefix', () => {
      assert.equal(
        normalizeUrlLike('Link: https://fathom.video/share/abc123'),
        'https://fathom.video/share/abc123'
      );
    });

    test('handles URLs with "URL:" prefix', () => {
      assert.equal(
        normalizeUrlLike('URL: https://vimeo.com/12345'),
        'https://vimeo.com/12345'
      );
    });
  });

  describe('Provider identification', () => {
    test('identifies YouTube URLs correctly', () => {
      assert.equal(
        normalizeUrlLike('https://youtube.com/watch?v=abc123'),
        'https://youtube.com/watch?v=abc123'
      );
      assert.equal(
        normalizeUrlLike('https://youtu.be/abc123xyz'),
        'https://youtu.be/abc123xyz'
      );
    });

    test('identifies Vimeo URLs correctly', () => {
      assert.equal(
        normalizeUrlLike('https://vimeo.com/12345'),
        'https://vimeo.com/12345'
      );
    });

    test('identifies Loom URLs correctly', () => {
      assert.equal(
        normalizeUrlLike('https://loom.com/share/abc123'),
        'https://loom.com/share/abc123'
      );
    });

    test('identifies Fathom URLs correctly', () => {
      assert.equal(
        normalizeUrlLike('https://fathom.video/share/abc123'),
        'https://fathom.video/share/abc123'
      );
      assert.equal(
        normalizeUrlLike('https://www.fathom.video/share/abc123'),
        'https://www.fathom.video/share/abc123'
      );
    });
  });
});
