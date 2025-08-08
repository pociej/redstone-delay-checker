# Redstone Data Feed Monitor

A tool for monitoring and analyzing Redstone oracle data feeds, comparing on-chain and off-chain data, and detecting price deviations.

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
