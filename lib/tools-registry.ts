export type ToolCategory =
  | 'Calculators'
  | 'Converters'
  | 'Smart Contract Tools'
  | 'Security Tools'
  | 'Developer Tools'
  | 'Utility Tools'

export interface Tool {
  id: number
  name: string
  slug: string
  description: string
  category: ToolCategory
  icon: string      // lucide icon name
  tags: string[]
  isNew?: boolean
  isPopular?: boolean
}

export const TOOLS: Tool[] = [
  // Calculators
  { id: 1,  name: 'Gas Fee Calculator',          slug: 'gas-fee-calculator',         category: 'Calculators',        icon: 'Fuel',           description: 'Estimate Ethereum transaction gas fees in USD, ETH, and Gwei.', tags: ['gas', 'ethereum', 'fees'], isPopular: true },
  { id: 2,  name: 'Transaction Fee Estimator',   slug: 'transaction-fee-estimator',  category: 'Calculators',        icon: 'ArrowRightLeft', description: 'Estimate total transaction costs across different gas scenarios.', tags: ['transaction', 'fees'] },
  { id: 3,  name: 'Token Price Calculator',      slug: 'token-price-calculator',     category: 'Calculators',        icon: 'DollarSign',     description: 'Calculate token value from supply and market cap data.', tags: ['token', 'price'] },
  { id: 4,  name: 'Token Supply Calculator',     slug: 'token-supply-calculator',    category: 'Calculators',        icon: 'Coins',          description: 'Compute circulating, total, and max supply metrics.', tags: ['token', 'supply'] },
  { id: 5,  name: 'Market Cap Calculator',       slug: 'market-cap-calculator',      category: 'Calculators',        icon: 'TrendingUp',     description: 'Calculate market cap from price and circulating supply.', tags: ['marketcap', 'defi'], isPopular: true },
  { id: 6,  name: 'FDV Calculator',              slug: 'fdv-calculator',             category: 'Calculators',        icon: 'ChartBar',       description: 'Compute fully diluted valuation from token price and max supply.', tags: ['fdv', 'valuation'] },
  { id: 7,  name: 'ROI Calculator',              slug: 'roi-calculator',             category: 'Calculators',        icon: 'Percent',        description: 'Calculate return on investment for any crypto position.', tags: ['roi', 'profit'] },
  { id: 8,  name: 'APY Calculator',              slug: 'apy-calculator',             category: 'Calculators',        icon: 'RefreshCw',      description: 'Convert APR to APY with compounding frequency options.', tags: ['apy', 'defi', 'yield'] },
  { id: 9,  name: 'APR to APY Converter',        slug: 'apr-to-apy-converter',       category: 'Calculators',        icon: 'ArrowUpDown',    description: 'Precisely convert APR to APY for any compounding interval.', tags: ['apr', 'apy', 'yield'] },
  { id: 10, name: 'Impermanent Loss Calculator', slug: 'impermanent-loss-calculator',category: 'Calculators',        icon: 'TrendingDown',   description: 'Calculate impermanent loss for liquidity pool positions.', tags: ['impermanent loss', 'defi', 'lp'], isPopular: true },
  { id: 11, name: 'Staking Rewards Calculator',  slug: 'staking-rewards-calculator', category: 'Calculators',        icon: 'Lock',           description: 'Estimate staking rewards over time with compounding.', tags: ['staking', 'rewards'] },
  { id: 12, name: 'Yield Farming Calculator',    slug: 'yield-farming-calculator',   category: 'Calculators',        icon: 'Sprout',         description: 'Model yield farming returns including gas costs.', tags: ['yield', 'farming', 'defi'] },
  { id: 13, name: 'Break-even Calculator',       slug: 'break-even-calculator',      category: 'Calculators',        icon: 'Target',         description: 'Find the break-even price for any crypto trade.', tags: ['break-even', 'trading'] },
  { id: 14, name: 'Slippage Calculator',         slug: 'slippage-calculator',        category: 'Calculators',        icon: 'Sliders',        description: 'Estimate slippage impact on large trades and swaps.', tags: ['slippage', 'dex'] },
  { id: 15, name: 'Token Allocation Calculator', slug: 'token-allocation-calculator',category: 'Calculators',        icon: 'PieChart',       description: 'Model token distribution across stakeholder categories.', tags: ['allocation', 'tokenomics'] },
  { id: 16, name: 'Vesting Schedule Calculator', slug: 'vesting-schedule-calculator',category: 'Calculators',        icon: 'Calendar',       description: 'Generate and visualize token vesting schedules.', tags: ['vesting', 'tokenomics'] },
  { id: 17, name: 'Liquidity Pool Share',        slug: 'liquidity-pool-share',       category: 'Calculators',        icon: 'Droplets',       description: 'Calculate your share of a liquidity pool and expected fees.', tags: ['liquidity', 'pool', 'defi'] },
  { id: 18, name: 'NFT Profit Calculator',       slug: 'nft-profit-calculator',      category: 'Calculators',        icon: 'Image',          description: 'Calculate NFT trading profit after royalties and gas.', tags: ['nft', 'profit'] },
  { id: 19, name: 'Crypto Tax Calculator',       slug: 'crypto-tax-calculator',      category: 'Calculators',        icon: 'Receipt',        description: 'Estimate capital gains tax on crypto trades.', tags: ['tax', 'crypto'] },
  { id: 20, name: 'Portfolio Allocation',        slug: 'portfolio-allocation',       category: 'Calculators',        icon: 'LayoutGrid',     description: 'Calculate optimal portfolio allocation by risk profile.', tags: ['portfolio', 'allocation'] },

  // Converters
  { id: 21, name: 'ETH to Wei Converter',        slug: 'eth-to-wei-converter',       category: 'Converters',         icon: 'ArrowLeftRight', description: 'Convert between ETH, Gwei, and Wei denominations instantly.', tags: ['eth', 'wei', 'gwei'], isPopular: true },
  { id: 22, name: 'Gwei to ETH Converter',       slug: 'gwei-to-eth-converter',      category: 'Converters',         icon: 'Zap',            description: 'Convert Gwei values to ETH and USD equivalents.', tags: ['gwei', 'eth'] },
  { id: 23, name: 'Token Decimal Converter',     slug: 'token-decimal-converter',    category: 'Converters',         icon: 'Hash',           description: 'Convert token amounts across different decimal precisions.', tags: ['decimal', 'token'] },
  { id: 24, name: 'Hex to Decimal Converter',    slug: 'hex-to-decimal-converter',   category: 'Converters',         icon: 'Binary',         description: 'Bi-directional hex and decimal conversion for blockchain data.', tags: ['hex', 'decimal'] },
  { id: 25, name: 'Address Checksum Converter',  slug: 'address-checksum-converter', category: 'Converters',         icon: 'CheckCircle',    description: 'Convert Ethereum addresses to EIP-55 checksummed format.', tags: ['address', 'checksum', 'eip-55'] },
  { id: 26, name: 'Base64 Encoder/Decoder',      slug: 'base64-encoder-decoder',     category: 'Converters',         icon: 'Code2',          description: 'Encode and decode Base64 strings for on-chain data.', tags: ['base64', 'encode', 'decode'] },
  { id: 27, name: 'UTF-8 to Hex Converter',      slug: 'utf8-to-hex-converter',      category: 'Converters',         icon: 'Type',           description: 'Convert UTF-8 strings to hexadecimal and vice versa.', tags: ['utf8', 'hex', 'string'] },
  { id: 28, name: 'JSON to String Converter',    slug: 'json-to-string-converter',   category: 'Converters',         icon: 'Braces',         description: 'Convert JSON objects to escaped strings and back.', tags: ['json', 'string'] },
  { id: 29, name: 'ABI Encoder',                 slug: 'abi-encoder',                category: 'Converters',         icon: 'FileCode',       description: 'ABI-encode function parameters for smart contract calls.', tags: ['abi', 'encode', 'solidity'] },
  { id: 30, name: 'ABI Decoder',                 slug: 'abi-decoder',                category: 'Converters',         icon: 'FileSearch',     description: 'Decode ABI-encoded data from transaction inputs.', tags: ['abi', 'decode', 'solidity'] },
  { id: 31, name: 'Bytes32 Converter',           slug: 'bytes32-converter',          category: 'Converters',         icon: 'Box',            description: 'Convert strings to/from bytes32 Solidity type.', tags: ['bytes32', 'solidity'] },
  { id: 32, name: 'String to Bytes Converter',   slug: 'string-to-bytes-converter',  category: 'Converters',         icon: 'AlignLeft',      description: 'Convert strings to byte arrays for smart contracts.', tags: ['string', 'bytes'] },
  { id: 33, name: 'Timestamp Converter',         slug: 'timestamp-converter',        category: 'Converters',         icon: 'Clock',          description: 'Convert Unix timestamps to human-readable dates and back.', tags: ['timestamp', 'date', 'unix'] },
  { id: 34, name: 'Block Time Estimator',        slug: 'block-time-estimator',       category: 'Converters',         icon: 'Timer',          description: 'Estimate future block numbers and timestamps.', tags: ['block', 'time', 'ethereum'] },
  { id: 35, name: 'Keccak256 Hash Generator',    slug: 'keccak256-hash-generator',   category: 'Converters',         icon: 'Fingerprint',    description: 'Generate Keccak-256 hashes for any input data.', tags: ['keccak256', 'hash'], isPopular: true },
  { id: 36, name: 'SHA256 Hash Generator',       slug: 'sha256-hash-generator',      category: 'Converters',         icon: 'Shield',         description: 'Generate SHA-256 hashes for strings and hex data.', tags: ['sha256', 'hash'] },
  { id: 37, name: 'Merkle Root Generator',       slug: 'merkle-root-generator',      category: 'Converters',         icon: 'GitBranch',      description: 'Generate Merkle tree roots from a list of leaf values.', tags: ['merkle', 'hash', 'tree'] },
  { id: 38, name: 'Private Key to Address',      slug: 'private-key-to-address',     category: 'Converters',         icon: 'Key',            description: 'Derive public address from private key (educational only).', tags: ['private key', 'address', 'wallet'] },
  { id: 39, name: 'Wallet Address Formatter',    slug: 'wallet-address-formatter',   category: 'Converters',         icon: 'Wallet',         description: 'Format and validate wallet addresses across chains.', tags: ['wallet', 'address', 'format'] },
  { id: 40, name: 'ENS Formatter',               slug: 'ens-formatter',              category: 'Converters',         icon: 'AtSign',         description: 'Validate and format ENS names and namehash values.', tags: ['ens', 'ethereum', 'name'] },

  // Smart Contract Tools
  { id: 41, name: 'Solidity Formatter',          slug: 'solidity-formatter',         category: 'Smart Contract Tools', icon: 'FileCode2',     description: 'Format and prettify Solidity smart contract code.', tags: ['solidity', 'format', 'code'] },
  { id: 42, name: 'Gas Optimization Checker',    slug: 'gas-optimization-checker',   category: 'Smart Contract Tools', icon: 'Gauge',         description: 'Analyze Solidity patterns for gas optimization opportunities.', tags: ['gas', 'optimization', 'solidity'] },
  { id: 43, name: 'Contract Size Estimator',     slug: 'contract-size-estimator',    category: 'Smart Contract Tools', icon: 'HardDrive',     description: 'Estimate bytecode size to avoid the 24KB contract limit.', tags: ['contract', 'size', 'bytecode'] },
  { id: 44, name: 'Event Log Decoder',           slug: 'event-log-decoder',          category: 'Smart Contract Tools', icon: 'List',          description: 'Decode raw Ethereum event logs using ABI definitions.', tags: ['event', 'log', 'decode'] },
  { id: 45, name: 'Function Selector Generator', slug: 'function-selector-generator',category: 'Smart Contract Tools', icon: 'Hash',          description: 'Generate 4-byte function selectors from signatures.', tags: ['selector', 'function', 'solidity'], isPopular: true },
  { id: 46, name: 'ABI Viewer',                  slug: 'abi-viewer',                 category: 'Smart Contract Tools', icon: 'Eye',           description: 'Visualize and explore ABI definitions in a readable format.', tags: ['abi', 'viewer', 'solidity'] },
  { id: 47, name: 'Revert Reason Decoder',       slug: 'revert-reason-decoder',      category: 'Smart Contract Tools', icon: 'AlertTriangle', description: 'Decode hex-encoded revert reasons from failed transactions.', tags: ['revert', 'decode', 'debug'] },
  { id: 48, name: 'Solidity Version Checker',    slug: 'solidity-version-checker',   category: 'Smart Contract Tools', icon: 'GitCommit',     description: 'Check Solidity pragma compatibility and version ranges.', tags: ['solidity', 'version', 'pragma'] },
  { id: 49, name: 'Function Visibility Analyzer',slug: 'function-visibility-analyzer',category: 'Smart Contract Tools',icon: 'EyeOff',        description: 'Analyze function visibility patterns in Solidity contracts.', tags: ['visibility', 'function', 'solidity'] },
  { id: 50, name: 'Modifier Analyzer',           slug: 'modifier-analyzer',          category: 'Smart Contract Tools', icon: 'Filter',        description: 'Extract and analyze modifiers from Solidity contracts.', tags: ['modifier', 'solidity', 'analyze'] },
  { id: 51, name: 'Storage Slot Calculator',     slug: 'storage-slot-calculator',    category: 'Smart Contract Tools', icon: 'Database',      description: 'Calculate storage slot positions for Solidity state variables.', tags: ['storage', 'slot', 'solidity'] },
  { id: 52, name: 'Mapping Slot Calculator',     slug: 'mapping-slot-calculator',    category: 'Smart Contract Tools', icon: 'Map',           description: 'Compute storage slots for Solidity mapping entries.', tags: ['mapping', 'slot', 'storage'] },
  { id: 53, name: 'Struct Layout Visualizer',    slug: 'struct-layout-visualizer',   category: 'Smart Contract Tools', icon: 'Layers',        description: 'Visualize Solidity struct memory layout and packing.', tags: ['struct', 'layout', 'solidity'] },
  { id: 54, name: 'Proxy Pattern Checker',       slug: 'proxy-pattern-checker',      category: 'Smart Contract Tools', icon: 'ArrowUpRight',  description: 'Identify and validate proxy patterns in contract ABIs.', tags: ['proxy', 'pattern', 'upgradeable'] },
  { id: 55, name: 'Upgrade Safety Tool',         slug: 'upgrade-safety-tool',        category: 'Smart Contract Tools', icon: 'ShieldCheck',   description: 'Check storage layout compatibility for contract upgrades.', tags: ['upgrade', 'safety', 'proxy'] },
  { id: 56, name: 'Deployment Checklist',        slug: 'deployment-checklist',       category: 'Smart Contract Tools', icon: 'ClipboardCheck',description: 'Interactive checklist for safe smart contract deployments.', tags: ['deployment', 'checklist'] },
  { id: 57, name: 'Security Checklist',          slug: 'security-checklist',         category: 'Smart Contract Tools', icon: 'ShieldAlert',   description: 'Comprehensive security checklist for smart contracts.', tags: ['security', 'checklist', 'audit'] },
  { id: 58, name: 'Access Control Analyzer',     slug: 'access-control-analyzer',    category: 'Smart Contract Tools', icon: 'UserCheck',     description: 'Analyze access control patterns in Solidity code.', tags: ['access control', 'roles', 'solidity'] },
  { id: 59, name: 'Vulnerability Checklist',     slug: 'vulnerability-checklist',    category: 'Smart Contract Tools', icon: 'Bug',           description: 'Check contracts against common vulnerability patterns.', tags: ['vulnerability', 'security', 'audit'] },
  { id: 60, name: 'Contract Simulator',          slug: 'contract-simulator',         category: 'Smart Contract Tools', icon: 'Play',          description: 'Simulate basic smart contract interactions and outcomes.', tags: ['simulate', 'contract', 'test'] },

  // Security Tools
  { id: 61, name: 'Reentrancy Detector',         slug: 'reentrancy-detector',        category: 'Security Tools',     icon: 'RotateCw',      description: 'Detect reentrancy vulnerabilities in Solidity code.', tags: ['reentrancy', 'security', 'solidity'] },
  { id: 62, name: 'Overflow Checker',            slug: 'overflow-checker',           category: 'Security Tools',     icon: 'Maximize2',     description: 'Check for integer overflow/underflow in Solidity operations.', tags: ['overflow', 'underflow', 'security'] },
  { id: 63, name: 'Tx.origin Checker',           slug: 'tx-origin-checker',          category: 'Security Tools',     icon: 'User',          description: 'Find dangerous tx.origin usage patterns in Solidity.', tags: ['tx.origin', 'security', 'phishing'] },
  { id: 64, name: 'Unchecked Call Checker',      slug: 'unchecked-call-checker',     category: 'Security Tools',     icon: 'PhoneOff',      description: 'Find unchecked low-level calls in Solidity contracts.', tags: ['unchecked', 'call', 'security'] },
  { id: 65, name: 'Front-running Risk Tool',     slug: 'front-running-risk-tool',    category: 'Security Tools',     icon: 'FastForward',   description: 'Assess front-running risk in DeFi transactions and contracts.', tags: ['front-running', 'mev', 'security'] },
  { id: 66, name: 'Flash Loan Risk Tool',        slug: 'flash-loan-risk-tool',       category: 'Security Tools',     icon: 'Bolt',          description: 'Analyze flash loan attack vectors in protocol designs.', tags: ['flash loan', 'attack', 'defi'] },
  { id: 67, name: 'Slippage Risk Tool',          slug: 'slippage-risk-tool',         category: 'Security Tools',     icon: 'AlertOctagon',  description: 'Evaluate slippage-related risks for DeFi protocols.', tags: ['slippage', 'risk', 'defi'] },
  { id: 68, name: 'Rug Pull Checklist',          slug: 'rug-pull-checklist',         category: 'Security Tools',     icon: 'Scissors',      description: 'Evaluate tokens against known rug pull red flags.', tags: ['rug pull', 'scam', 'token'] },
  { id: 69, name: 'Token Risk Analyzer',         slug: 'token-risk-analyzer',        category: 'Security Tools',     icon: 'AlertCircle',   description: 'Analyze token contract risk factors before investing.', tags: ['token', 'risk', 'security'] },
  { id: 70, name: 'Wallet Security Tool',        slug: 'wallet-security-tool',       category: 'Security Tools',     icon: 'ShieldOff',     description: 'Audit your wallet security practices and settings.', tags: ['wallet', 'security', 'audit'] },
  { id: 71, name: 'Seed Phrase Safety Tool',     slug: 'seed-phrase-safety-tool',    category: 'Security Tools',     icon: 'Key',           description: 'Best practices and safety checks for seed phrase management.', tags: ['seed phrase', 'mnemonic', 'security'] },
  { id: 72, name: 'Phishing URL Checker',        slug: 'phishing-url-checker',       category: 'Security Tools',     icon: 'Link2Off',      description: 'Analyze URLs for common crypto phishing patterns.', tags: ['phishing', 'url', 'security'] },
  { id: 73, name: 'Signature Decoder',           slug: 'signature-decoder',          category: 'Security Tools',     icon: 'PenTool',       description: 'Decode and analyze Ethereum message signatures.', tags: ['signature', 'decode', 'ethereum'] },
  { id: 74, name: 'Message Signing Tool',        slug: 'message-signing-tool',       category: 'Security Tools',     icon: 'Edit3',         description: 'Sign arbitrary messages with Ethereum wallets (EIP-191).', tags: ['sign', 'message', 'ethereum'] },
  { id: 75, name: 'Signature Verifier',          slug: 'signature-verifier',         category: 'Security Tools',     icon: 'CheckSquare',   description: 'Verify Ethereum message signatures and recover signers.', tags: ['verify', 'signature', 'ethereum'] },

  // Developer Tools
  { id: 76, name: 'JSON Formatter',              slug: 'json-formatter',             category: 'Developer Tools',    icon: 'Braces',        description: 'Format, validate, and minify JSON data for Web3 use.', tags: ['json', 'format', 'developer'], isPopular: true },
  { id: 77, name: 'RPC Formatter',               slug: 'rpc-formatter',              category: 'Developer Tools',    icon: 'Network',       description: 'Build and format JSON-RPC requests for Ethereum nodes.', tags: ['rpc', 'json-rpc', 'ethereum'] },
  { id: 78, name: 'Chain ID Finder',             slug: 'chain-id-finder',            category: 'Developer Tools',    icon: 'Link',          description: 'Find chain IDs for 100+ EVM-compatible networks.', tags: ['chain id', 'network', 'evm'] },
  { id: 79, name: 'Network Config Generator',    slug: 'network-config-generator',   category: 'Developer Tools',    icon: 'Settings',      description: 'Generate RPC network configs for any EVM chain.', tags: ['network', 'config', 'rpc'] },
  { id: 80, name: 'Hardhat Config Generator',    slug: 'hardhat-config-generator',   category: 'Developer Tools',    icon: 'Terminal',      description: 'Generate hardhat.config.ts for any EVM deployment setup.', tags: ['hardhat', 'config', 'solidity'] },
  { id: 81, name: 'Foundry Config Generator',    slug: 'foundry-config-generator',   category: 'Developer Tools',    icon: 'Hammer',        description: 'Generate foundry.toml config for Foundry projects.', tags: ['foundry', 'forge', 'solidity'] },
  { id: 82, name: 'ENV Generator',               slug: 'env-generator',              category: 'Developer Tools',    icon: 'FileKey',       description: 'Generate .env templates for Web3 development projects.', tags: ['env', 'environment', 'config'] },
  { id: 83, name: 'Address Book',                slug: 'address-book',               category: 'Developer Tools',    icon: 'BookOpen',      description: 'Save and organize contract addresses per network (local storage).', tags: ['address', 'book', 'contracts'] },
  { id: 84, name: 'API Builder',                 slug: 'api-builder',                category: 'Developer Tools',    icon: 'Plug',          description: 'Build Web3 API call templates for Etherscan, Alchemy, and more.', tags: ['api', 'builder', 'web3'] },
  { id: 85, name: 'Curl to Fetch Converter',     slug: 'curl-to-fetch-converter',    category: 'Developer Tools',    icon: 'RefreshCcw',    description: 'Convert cURL commands to JavaScript fetch/axios calls.', tags: ['curl', 'fetch', 'api'] },
  { id: 86, name: 'Gas Logger',                  slug: 'gas-logger',                 category: 'Developer Tools',    icon: 'ClipboardList', description: 'Log and compare gas usage across contract interactions.', tags: ['gas', 'log', 'debug'] },
  { id: 87, name: 'Event Signature Finder',      slug: 'event-signature-finder',     category: 'Developer Tools',    icon: 'Search',        description: 'Find and decode event topic signatures for common contracts.', tags: ['event', 'signature', 'topic'] },
  { id: 88, name: 'Solidity Snippet Generator',  slug: 'solidity-snippet-generator', category: 'Developer Tools',    icon: 'Sparkles',      description: 'Generate common Solidity code patterns and snippets.', tags: ['solidity', 'snippet', 'code'] },
  { id: 89, name: 'ABI Diff Checker',            slug: 'abi-diff-checker',           category: 'Developer Tools',    icon: 'GitCompare',    description: 'Compare two ABIs to find breaking changes and differences.', tags: ['abi', 'diff', 'compare'] },
  { id: 90, name: 'Contract Template Generator', slug: 'contract-template-generator',category: 'Developer Tools',    icon: 'FilePlus',      description: 'Generate Solidity contract templates for common patterns.', tags: ['template', 'solidity', 'contract'] },

  // Utility Tools
  { id: 91, name: 'Token Distribution Viz',      slug: 'token-distribution-viz',     category: 'Utility Tools',      icon: 'PieChart',      description: 'Visualize token distribution across holder categories.', tags: ['token', 'distribution', 'chart'] },
  { id: 92, name: 'Wallet Balance Tracker',      slug: 'wallet-balance-tracker',     category: 'Utility Tools',      icon: 'Wallet',        description: 'Track and compare wallet balances over time.', tags: ['wallet', 'balance', 'tracker'] },
  { id: 93, name: 'Transaction Visualizer',      slug: 'transaction-visualizer',     category: 'Utility Tools',      icon: 'Activity',      description: 'Visualize transaction flow and call graphs.', tags: ['transaction', 'visualize', 'trace'] },
  { id: 94, name: 'Gas Visualizer',              slug: 'gas-visualizer',             category: 'Utility Tools',      icon: 'BarChart2',     description: 'Chart historical gas prices and trend analysis.', tags: ['gas', 'chart', 'history'] },
  { id: 95, name: 'DAO Voting Power Calculator', slug: 'dao-voting-power-calculator',category: 'Utility Tools',      icon: 'Vote',          description: 'Calculate voting power and quorum thresholds for DAOs.', tags: ['dao', 'voting', 'governance'] },
  { id: 96, name: 'NFT Rarity Calculator',       slug: 'nft-rarity-calculator',      category: 'Utility Tools',      icon: 'Star',          description: 'Calculate NFT rarity scores from trait distributions.', tags: ['nft', 'rarity', 'traits'] },
  { id: 97, name: 'Airdrop Checker',             slug: 'airdrop-checker',            category: 'Utility Tools',      icon: 'Gift',          description: 'Check addresses against airdrop eligibility criteria.', tags: ['airdrop', 'eligibility', 'wallet'] },
  { id: 98, name: 'Vesting Visualizer',          slug: 'vesting-visualizer',         category: 'Utility Tools',      icon: 'TrendingUp',    description: 'Visualize token vesting schedules on an interactive timeline.', tags: ['vesting', 'schedule', 'chart'] },
  { id: 99, name: 'DeFi Strategy Planner',       slug: 'defi-strategy-planner',      category: 'Utility Tools',      icon: 'Map',           description: 'Plan and model DeFi yield strategies with risk/reward.', tags: ['defi', 'strategy', 'yield'] },
  { id: 100,name: 'Risk Score Calculator',       slug: 'risk-score-calculator',      category: 'Utility Tools',      icon: 'AlertTriangle', description: 'Calculate composite risk scores for DeFi positions.', tags: ['risk', 'score', 'defi'] },
]

export const CATEGORIES: ToolCategory[] = [
  'Calculators',
  'Converters',
  'Smart Contract Tools',
  'Security Tools',
  'Developer Tools',
  'Utility Tools',
]

export const CATEGORY_ICONS: Record<ToolCategory, string> = {
  'Calculators':         'Calculator',
  'Converters':          'ArrowLeftRight',
  'Smart Contract Tools':'FileCode',
  'Security Tools':      'Shield',
  'Developer Tools':     'Terminal',
  'Utility Tools':       'LayoutGrid',
}

export const CATEGORY_DESCRIPTIONS: Record<ToolCategory, string> = {
  'Calculators':         'Compute fees, yields, ROI, and financial metrics',
  'Converters':          'Convert between units, formats, and encodings',
  'Smart Contract Tools':'Analyze, format, and debug Solidity contracts',
  'Security Tools':      'Detect vulnerabilities and assess risks',
  'Developer Tools':     'Configs, formatters, and utilities for builders',
  'Utility Tools':       'Visualizers, trackers, and planners',
}

export function getToolsByCategory(category: ToolCategory) {
  return TOOLS.filter(t => t.category === category)
}

export function getToolBySlug(slug: string) {
  return TOOLS.find(t => t.slug === slug)
}

export function searchTools(query: string) {
  const q = query.toLowerCase()
  return TOOLS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q))
  )
}