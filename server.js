const fastify = require('fastify')({ logger: true })
const path = require('path')
const Netmask = require('netmask').Netmask

let blocks = []
let usedBlocks = []
let unusedBlocks = []

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
  if (unusedIndex !== -1) {
    let newBlock = new Netmask(ip)
    usedBlocks.push(newBlock)
    let removedBlock = unusedBlocks.splice(unusedIndex,1)[0]
    // console.log(removed)
    addRestToUnusedBlocks(newBlock, removedBlock)
  } else {
    console.log('未添加IP:', ip)
  }
}

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/'
})

fastify.get('/', function (req, reply) {
  return reply.sendFile('index.html')
})

fastify.post('/api/blocks', async (req, reply) => {
  // console.log(req.body)
  const { ip, usedIp } = req.body
  try {
    // console.log(ip, usedIp)
    blocks = ip.map(i => new Netmask(i))
    unusedBlocks = [...blocks]
    usedBlocks = []
    usedIp.map(i => {
      add(i)
    })
  } catch (e) {
    throw new Error(e.message)
  }
  // console.log(unusedBlocks)
  // 对 unusedBlocks.netLong 进行排序
  unusedBlocks.sort((b1, b2) => b1.netLong - b2.netLong)
  return {
    unusedIp: unusedBlocks.map(i => i.base + '/' + i.bitmask)
  }
})

fastify.listen(3000, '0.0.0.0', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})