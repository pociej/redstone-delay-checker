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

- `--datafeeds, -d`: List of datafeeds to monitor (default: all) (TODO)
- `--verbose, -v`: Enable verbose output (default: false)
- `--delay, -l`: Delay in seconds (works only if verbose is enabled)
- `--start_offset, -s`: Start offset in hours (default: 168 hours / 7 days)

Example:

```bash
# Run for BSC chain for last 24 hours
pnpm run dev -s 24 -c bsc

```
