const Netmask = require('netmask').Netmask

let blocks = []
let usedBlocks = []

// blocks.push(new Netmask('10.187.254.0/23'))
// blocks.push(new Netmask('10.184.0.0/19'))
// blocks.push(new Netmask('10.185.32.0/21'))
// blocks.push(new Netmask('10.185.40.0/22'))
// blocks.push(new Netmask('10.185.54.0/23'))
// blocks.push(new Netmask('10.185.56.0/24'))
// blocks.push(new Netmask('10.185.64.0/22'))
// blocks.push(new Netmask('10.185.68.0/23'))
// blocks.push(new Netmask('10.185.224.0/19'))
blocks.push(new Netmask('59.206.48.0/20'))

let unusedBlocks = [...blocks]

function ipInBlocks(ip, array) {
  /**
   * 找到了返回数组index
   * 没找到返回-1
   */
  return array.findIndex(i => i.contains(ip))
}

function blockToHalf(block) {
  /**
   * 将一段IP分成两段，返回数据
   */

  // console.log(`${block.base}/${block.bitmask + 1}`)
  let b1 = new Netmask(`${block.base}/${block.bitmask + 1}`)
  let b2 = b1.next()
  return [b1, b2]
}

function addRestToUnusedBlocks(newBlock, removedBlock) {
  /**
   * 将新增加的IP段去处，剩下没有用的IP段放到未使用数组中
   */
  // console.log(removedBlock)

  if (newBlock.bitmask === removedBlock.bitmask) {
    return
  }

  let twoBlock = blockToHalf(removedBlock)
  let index = ipInBlocks(newBlock, twoBlock)
  for(let i = 0; i < 2; i++) {
    if (i === index) {
      if(twoBlock[i].bitmask < newBlock.bitmask) {
        addRestToUnusedBlocks(newBlock, twoBlock[i])
      }
    } else {
      unusedBlocks.push(twoBlock[i])
    }
  }
}

function add(ip) {
  /**
   * 新增IP段放到 usedblocks中
   * 未使用的IP段放到 unusedBlacks中
   */
  let unusedIndex = ipInBlocks(ip, unusedBlocks)
  // console.log(ip, '在unusedblock里的', unusedIndex)
  if (unusedIndex !== -1) {
    let newBlock = new Netmask(ip)
    usedBlocks.push(newBlock)
    // console.log(unusedBlocks)
    let removedBlock = unusedBlocks.splice(unusedIndex,1)[0]
    // console.log(unusedBlocks)
    // console.log(removed)
    addRestToUnusedBlocks(newBlock, removedBlock)
  } else {
    console.log('未添加IP:', ip)
  }
}

add('59.206.49.0/28')
add('59.206.49.16/28')
// console.log('使用的：',usedBlocks)
// console.log('未使用的：', unusedBlocks)
