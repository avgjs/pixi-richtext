const expect = require('chai').expect;
const fs = require('fs');

const peg = require("pegjs");
const parse = peg.generate(fs.readFileSync('./lib/parser/dsl.pegjs', 'utf8')).parse;

describe('DSL Parser', () => {
  it('parse plain text', () => {
    expect(parse('hello world!')).to
      .eql([
        {
          "nodeType": "text",
          "content": "hello world!"
        }
      ]);
  });
  it('parse plain text (non-ascii)', () => {
    expect(parse('hello 世界！')).to
      .eql([
        {
          "nodeType": "text",
          "content": "hello 世界！"
        }
      ]);
  });
  it('parse tag node', () => {
    expect(parse('<b>test</b>')).to
      .eql([
        {
          "tagName": "b",
          "value": undefined,
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        }
      ]);
  });
  it('parse tag node with value', () => {
    expect(parse('<b=aaa>test</b>')).to
      .eql([
        {
          "tagName": "b",
          "value": 'aaa',
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        }
      ]);
  });
  it('parse tag node with value (non-ascii)', () => {
    expect(parse('<橙子=Touko>好吃</橙子>')).to
      .eql([
        {
          "tagName": "橙子",
          "value": 'Touko',
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "好吃"
            }
          ]
        }
      ]);
  });
  it('parse tag node (empty content)', () => {
    expect(parse('<b></b>')).to
      .eql([
        {
          "tagName": "b",
          "value": undefined,
          "nodeType": "tag",
          "children": []
        }
      ]);
  });
  it('parse number value', () => {
    expect(parse('<b=123>test</b>')).to
      .eql([
        {
          "tagName": "b",
          "value": 123,
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        }
      ]);
  });
  it('parse boolean value', () => {
    expect(parse('<b=true>test</b>')).to
      .eql([
        {
          "tagName": "b",
          "value": true,
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        }
      ]);
    expect(parse('<b=false>test</b>')).to
      .eql([
        {
          "tagName": "b",
          "value": false,
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        }
      ]);
  });
  it('parse string value', () => {
    expect(parse('<b=value>test</b>')).to
      .eql([
        {
          "tagName": "b",
          "value": 'value',
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        }
      ]);
    expect(parse('<b=123a>test</b>')).to
      .eql([
        {
          "tagName": "b",
          "value": '123a',
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        }
      ]);
    expect(parse('<b=false0>test</b>')).to
      .eql([
        {
          "tagName": "b",
          "value": 'false0',
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        }
      ]);
  });
  it('parse mixed nodes', () => {
    expect(parse('head<b=123>test</b><b></b>middle<b>test</b>foot')).to
      .eql([
        {
          "nodeType": "text",
          "content": "head"
        },
        {
          "tagName": "b",
          "value": 123,
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        },
        {
          "tagName": "b",
          "value": undefined,
          "nodeType": "tag",
          "children": []
        },
        {
          "nodeType": "text",
          "content": "middle"
        },
        {
          "tagName": "b",
          "value": undefined,
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            }
          ]
        },
        {
          "nodeType": "text",
          "content": "foot"
        }
      ]);
  });
  it('parse nested nodes', () => {
    expect(parse('head<b>test<size=24><i>large</i> words</size>x</b>')).to
      .eql([
        {
          "nodeType": "text",
          "content": "head"
        },
        {
          "tagName": "b",
          "value": undefined,
          "nodeType": "tag",
          "children": [
            {
              "nodeType": "text",
              "content": "test"
            },
            {
              "tagName": "size",
              "value": 24,
              "nodeType": "tag",
              "children": [
                {
                  "tagName": "i",
                  "value": undefined,
                  "nodeType": "tag",
                  "children": [
                    {
                      "nodeType": "text",
                      "content": "large"
                    }
                  ]
                },
                {
                  "nodeType": "text",
                  "content": " words"
                }
              ]
            },
            {
              "nodeType": "text",
              "content": "x"
            }
          ]
        }
      ]);
  });
  it('throw error when tag doesn\'t match', () => {
    expect(() => parse('<a>test</b>')).to.throw(/Expected \[\^<\/>=\] but ">" found\./)
  });
})
