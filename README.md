# Redstone Data Feed Monitor

A tool for monitoring and analyzing Redstone oracle data feeds, comparing on-chain and off-chain data, and detecting price deviations.

### <span style="color: red;">Important Note</span>

<span style="color: red;"> Due to the API server limitation and fact it frequently goes down on high load
offchain data calls are done sequentially to avoid overloading the server which results in longer processing time.</span>

## Installation

```bash
# Install dependencies
pnpm install

# Copy environment configuration (optional)
cp .env.example .env
# Edit .env file with your custom settings if needed
```

## Usage

Run the development server:

```bash
pnpm dev
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize as needed:

```bash
cp .env.example .env
```

#### RPC Configuration

- `ETHEREUM_RPC_URL`: Ethereum RPC endpoint (default: https://ethereum-rpc.publicnode.com)
- `BSC_RPC_URL`: BSC RPC endpoint (default: https://bsc-rpc.publicnode.com)
- `RPC_RETRY_COUNT`: Number of retry attempts for failed RPC calls (default: 3)

#### API Configuration

- `REDSTONE_API_BASE_URL`: Redstone off-chain API URL
- `API_RETRY_COUNT`: Number of retry attempts for failed API calls (default: 3)

#### Processing Configuration

- `INDEXING_OFFSET_MULTIPLIER`: buffer multiplier for block estimation (default: 2) (TODO: consider if its really needed)

#### Output Configuration

- `RESULTS_DIR`: Output directory name (default: results)
- `LOGS_PER_FEED_FILENAME`: On-chain events filename (default: logsPerFeed.json)
- `OFFCHAIN_DATA_FILENAME`: Off-chain data filename (default: offChainData.json)
- `STATISTICS_FILENAME`: Statistics filename (default: statistics.json)

### Output

Script creates `RESULTS_DIR` directory and stores following files:

- `LOGS_PER_FEED_FILENAME`: On-chain events logs per feed - cotaining all the events from indexed blocks, not only from
  the period of interest

- `OFFCHAIN_DATA_FILENAME`: Off-chain data per feed representing all the triggers of onchain data feed changes (changeTimestamp) and onchain appearance block timestamp (propagationTimestamp)
- `STATISTICS_FILENAME`: Statistics per feed

### Command Line Options

- `--datafeeds, -d`: List of datafeeds to monitor (default: all) (its not working yet TODO : consider if its realy needed)
- `--verbose, -v`: Enable verbose output (default: false)
- `--start_offset, -s`: Start offset in hours (default: 168 hours / 7 days)
- `--chain, -c`: Chain to monitor (default: mainnet, options: mainnet, bsc)
- `--allEvents, -a`: Index all events from contract creation block (default: false) look at indexingStrategy.ts for more details
- `--manifest_path, -m`: Manifest file (default: manifest.[chain].json)

Example:

```bash
# Run for BSC chain for last 24 hours indexing all events from contract creation block
pnpm run dev -s 24 -c bsc -a

```
