# Redstone Data Feed Monitor

A tool for monitoring and analyzing Redstone oracle data feeds, comparing on-chain and off-chain data, and detecting price deviations.

### <span style="color: red;">Important Note</span>

<span style="color: red;"> Due to the API server limitation and fact it frequently goes down on high load
offchain data calls are done sequentially to avoid overloading the server which results in longer processing time.</span>

## Installation

```bash
# Install dependencies
pnpm install
```

## Usage

Run the development server:

```bash
pnpm dev
```

### Output

Script creates `results` directory and stores following files:

- `logsPerFeed.json`: On-chain events logs per feed
- `offChainData.json`: Off-chain data per feed representing all the triggers of onchain data feed changes (changeTimestamp) and onchain appearance block timestamp (propagationTimestamp)
- `statistics.json`: Statistics per feed

### Command Line Options

- `--datafeeds, -d`: List of datafeeds to monitor (default: all) (TODO : consider if its realy needed)
- `--verbose, -v`: Enable verbose output (default: false)
- `--start_offset, -s`: Start offset in hours (default: 168 hours / 7 days)
- `--chain, -c`: Chain to monitor (default: mainnet, options: mainnet, bsc)
- `--allEvents, -a`: Index all events from contract creation block (default: false) look at indexingStrategy.ts for more details

Example:

```bash
# Run for BSC chain for last 24 hours indexing all events from contract creation block
pnpm run dev -s 24 -c bsc -a

```
