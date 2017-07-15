// BBCode like Grammar (replace '[]' with '<>')
// ==========================
//

Expression
  = Node+

Node
  = content:TagNode / content:TextNode {
    return content
  }

TagNode
  = head:TagHead children:Node* tail:TagTail &{ return head[0] === tail } {
      return {
      	tagName: head[0],
        value: head[1],
        nodeType: 'tag',
        children,
      }
    }

TagHead
  = '<' tagName:TagName '=' value:TagValue '>' {
    return [tagName.join(''), value]; 
  }
  / '<' tagName:TagName '>' {
    return [tagName.join('')]; 
  }
TagTail
  = '</' tagName:TagName '>' { return tagName.join(''); }

TagName
  = [^</>=]+
  
TagValue
  = Number / Boolean / String

TextNode
  = String {
    return {
        nodeType: 'text',
        content: text(),
      }
  }

String
  = [^<>]+ {
    return text()
  }

Number
  = ('0x'? [0-9]+) & '>'{
    return parseInt(text())
  }

Boolean
  = ('true'i / 'false'i) & '>' {
    return text().toLowerCase() === 'true'
  }