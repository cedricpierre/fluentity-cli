# Fluentity CLI

A command-line interface tool for generating Fluentity models. This tool helps streamline the process of creating and managing Fluentity models in your project.

## Installation

```bash
# Using npm
npm install -g @fluentity/cli

# Using pnpm
pnpm add -g @fluentity/cli

# Using yarn
yarn global add @fluentity/cli
```

## Usage

The CLI provides a simple interface for generating Fluentity models:

```bash
# Generate a new model
fluentity generate:model [name]

# Generate a model with specific options
fluentity generate:model [name] --path ./custom/path --force
```

### Commands

#### `generate:model`

Generates a new Fluentity model with the specified name.

**Arguments:**
- `[name]` - Name of the model to generate (optional)

**Options:**
- `-p, --path <path>` - Path where the model should be generated (default: './src/models')
- `-f, --force` - Overwrite existing model file if it exists

## Development

### Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm 8.0.0 or later

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Available Scripts

- `pnpm build` - Build the project
- `pnpm start` - Run the CLI locally
- `pnpm dev` - Build and watch for changes
- `pnpm test` - Run tests
- `pnpm test:coverage` - Run tests with coverage
- `pnpm test:ui` - Run tests with UI

## License

MIT © Cedric Pierre

## Author

- Cedric Pierre (jirotoh@gmail.com) 