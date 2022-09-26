import { Command, flags } from '@oclif/command';
import { LCDClient } from '@terra-money/terra.js';
import { loadConfig, loadConnections } from '../../config';
import { storeCode } from '../../lib/deployment';
import { getSigner } from '../../lib/signer';
import * as flag from '../../lib/flag';

export default class CodeStore extends Command {
  static description = 'Store code on chain.';

  static flags = {
    signer: flag.signer,
    network: flag.network,
    'no-rebuild': flag.noRebuild,
    'code-id': flags.integer({}),
    ...flag.terrainPaths,
  };

  static args = [{ name: 'contract', required: true }];

  async run() {
    const { args, flags } = this.parse(CodeStore);

    const connections = loadConnections(flags['config-path']);
    const config = loadConfig(flags['config-path']);
    const conf = config(flags.network, args.contract);

    const lcd = new LCDClient(connections(flags.network));
    const signer = await getSigner({
      network: flags.network,
      signerId: flags.signer,
      keysPath: flags['keys-path'],
      lcd,
    });

    await storeCode({
      conf,
      noRebuild: flags['no-rebuild'],
      contract: args.contract,
      signer,
      network: flags.network,
      refsPath: flags['refs-path'],
      lcd,
      codeId: flags['code-id'],
    });
  }
}
